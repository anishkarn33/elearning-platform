from channels.db import database_sync_to_async
from accounts.models import User
from chat.serializers import ChatMessageSerializer
from accounts.serializers import UserMinimalSerializer
from core.utils import camelize


@database_sync_to_async
def get_user(**kwargs):
    user = User.objects.filter(**kwargs).first()
    return user or None


@database_sync_to_async
def save_message(data):
    user = data["user"]
    chat_membership = user.chat_memberships.filter(
        chat_group=data["chat_group"]
    ).first()
    context = {
        "last_read": chat_membership.last_read if chat_membership else None,
        "user": user,
    }
    data["user"] = user.pk if user else None
    serializer = ChatMessageSerializer(data=data, context=context)
    serializer.is_valid(raise_exception=True)
    # this will create the post
    x = serializer.create(serializer.validated_data)
    # this will return the serialized post data
    return camelize(ChatMessageSerializer(x).data)


@database_sync_to_async
def serialize_user(user):
    return camelize(UserMinimalSerializer(user.profile).data)
