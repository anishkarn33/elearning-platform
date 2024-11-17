from rest_framework import serializers

from notifications.models import Notification, NotificationTemplate, NotificationTarget


class NotificationTemplateSerializer(serializers.ModelSerializer):
    class Meta:
        model = NotificationTemplate
        fields = [
            "id",
            "name",
            "subject",
            "body",
            "is_active",
            "is_deleted",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "created_at",
            "updated_at",
        ]


class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = [
            "id",
            "notification_template",
            "message",
            "title",
            "link",
            "link_text",
            "icon",
            "created_by",
            "updated_by",
            "language",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "created_at",
            "updated_at",
        ]


class NotificationTargetSerializer(serializers.ModelSerializer):
    class Meta:
        model = NotificationTarget
        fields = [
            "id",
            "notification",
            "user",
            "is_read",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "created_at",
            "updated_at",
        ]
