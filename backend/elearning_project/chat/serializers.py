from rest_framework import serializers

from .models import ChatGroup, ChatMembership, ChatMessage, MessageFile
from accounts.serializers import UserMinimalSerializer
from core.serializers import CamelCaseSerializerMixin


class MessageFileSerializer(serializers.ModelSerializer):
    class Meta:
        model = MessageFile
        fields = [
            "id",
            "file_name",
            "url",
            "file_type",
            "thumbnail_url",
            "created_at",
        ]
        read_only_fields = (
            "id",
            "created_at",
        )

    def validate(self, data):
        # get message from context
        message = self.context["message"]
        data["message"] = message
        return data


class ChatMessageSerializer(serializers.ModelSerializer, CamelCaseSerializerMixin):
    user = UserMinimalSerializer(read_only=True, source="user.profile")
    files = MessageFileSerializer(many=True, read_only=True)
    is_read = serializers.SerializerMethodField()
    # TODO - message reads

    class Meta:
        model = ChatMessage
        fields = [
            "id",
            "text",
            "message_type",
            "created_at",
            "updated_at",
            "chat_group",
            "user",
            "files",
            "removed_at",
            "is_deleted_by_sender",
            "is_deleted_by_admin",
            "is_read",
        ]
        read_only_fields = [
            "id",
            "user",
            "created_at",
            "updated_at",
            "removed_at",
            "is_deleted_by_sender",
            "is_deleted_by_admin",
            "is_read",
        ]

    def get_is_read(self, obj):
        last_read = self.context.get("last_read")
        if last_read is None:
            return False
        else:
            return obj.created_at < last_read

    def to_internal_value(self, data):
        data = super().to_internal_value(data)
        data["user"] = self.context["user"]
        return data

    def create(self, validated_data):
        # get files form original data
        files = self.initial_data.pop("files", [])
        message = ChatMessage.objects.create(**validated_data)
        file_serializer = MessageFileSerializer(
            data=files, many=True, context={"message": message}
        )
        file_serializer.is_valid(raise_exception=True)
        file_serializer.save()
        return message


class ChatMembershipSerializer(serializers.ModelSerializer):
    user = UserMinimalSerializer(read_only=True, source="user.profile")

    class Meta:
        moddel = ChatMembership
        fields = [
            "id",
            "user",
            "chat_group",
            "is_admin",
            "is_active",
            "is_blocked",
            "is_suspended",
            "is_admin",
            "last_date",
            "cleared",
            "unread_messages",
            "last_read",
        ]
        read_only_fields = ["id", "created_at", "updated_at", "removed_at"]


class ChatGroupSerializer(serializers.ModelSerializer):
    chat_type = serializers.CharField(max_length=10)
    user = serializers.SerializerMethodField()
    last_message = serializers.SerializerMethodField()
    is_admin = serializers.SerializerMethodField()
    blocked = serializers.SerializerMethodField()
    unread = serializers.SerializerMethodField()

    class Meta:
        model = ChatGroup
        fields = [
            "id",
            "name",
            "photo",
            "description",
            "chat_type",
            "updated_at",
            "removed_at",
            "created_at",
            "is_active",
            "is_public",
            "is_deleted",
            "user",
            "unread",
            "blocked",
            "last_message",
            "is_admin",
            "course",
        ]
        read_only_fields = [
            "id",
            "created_at",
            "updated_at",
            "removed_at",
            "is_active",
            "is_public",
            "is_deleted",
            "user",
            "unread",
            "blocked",
            "last_message",
            "is_admin",
        ]

    def update(self, instance, validated_data):
        return super().update(instance, validated_data)

    def create(self, validated_data):
        user = self.context["request"].user
        # get members from original data
        members = self.initial_data.pop("members", [])
        chat_group = ChatGroup.objects.create(**validated_data)
        chat_group.admin = user
        chat_group.save()
        # add current user as admin
        chat_group.chat_memberships.create(user=user, is_admin=True)
        for member in members:
            if validated_data["chat_type"] == "group":
                chat_group.chat_memberships.create(user_id=member, is_admin=False)
            else:
                chat_group.chat_memberships.create(user_id=member, is_admin=True)
        return chat_group

    def get_user(self, obj):
        if obj.chat_type == "group":
            return None
        request = self.context.get("request", None)
        if not request:
            return None
        user = request.user
        # get chat user whose id is not equal to current user id
        chat_user = obj.members.exclude(id=user.id).first()
        if chat_user is None:
            return None
        serializer = UserMinimalSerializer(chat_user.profile, context=self.context)
        return serializer.data

    def get_last_message(self, obj):
        last_message = obj.chat_messages.first()
        if last_message is None:
            return None
        user = self.context["request"].user
        chat_membership = obj.chat_memberships.filter(user=user).first()
        if not chat_membership:
            return None
        if (chat_membership and chat_membership.cleared is not None) and (
            last_message and last_message.created_at < chat_membership.cleared
        ):
            return None
        serializer = ChatMessageSerializer(
            last_message, context={"last_read": chat_membership.last_read}
        )
        return serializer.data

    def get_is_admin(self, obj):
        if obj.chat_type == "individual":
            return True
        else:
            return obj.admin == self.context["request"].user

    def get_blocked(self, obj):
        user = self.context["request"].user
        chat_membership = obj.chat_memberships.filter(user=user).first()
        if chat_membership is None:
            return False
        return chat_membership.is_blocked

    def get_unread(self, obj):
        user = self.context["request"].user
        chat_membership = obj.chat_memberships.filter(user=user).first()
        if chat_membership is None:
            return 0
        return chat_membership.unread_messages
