from django.shortcuts import get_object_or_404
from rest_framework.permissions import IsAuthenticated
from rest_framework.viewsets import ModelViewSet
from rest_framework.decorators import action

from core.utils import success_response

from chat.models import ChatGroup, ChatMembership, ChatMessage
from chat.serializers import (
    ChatGroupSerializer,
    ChatMembershipSerializer,
    ChatMessageSerializer,
)


class ChatGroupViewSet(ModelViewSet):
    queryset = ChatGroup.objects.all()
    serializer_class = ChatGroupSerializer
    permission_classes = [IsAuthenticated]

    def retrieve(self, request, course_pk=None, pk=None, *args, **kwargs):
        chat_group = self.get_object()
        serializer = self.get_serializer(chat_group)
        return success_response(detail="Fetched chat details", **serializer.data)

    def create(self, request, course_pk=None, *args, **kwargs):
        data = {**request.data, "course": course_pk}
        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        return success_response(
            detail="Chat group created successfully", code=201, **serializer.data
        )

    @action(detail=True, methods=["get"])
    def members(self, request, course_pk=None, pk=None, *args, **kwargs):
        chat_group = self.get_object()
        chat_members = chat_group.chat_memberships.all()
        serializer = ChatMembershipSerializer(chat_members, many=True)
        return success_response(detail="Fetched all chat members", data=serializer.data)

    @action(detail=False, methods=["get"])
    def individual(self, request, course_pk=None, pk=None, *args, **kwargs):
        # get individual chat group by user id
        user_id = request.GET.get("user_id")
        current_user = request.user
        my_groups = current_user.chat_memberships.filter(
            chat_group__course=course_pk, chat_group__chat_type="individual"
        ).values_list("chat_group", flat=True)
        user_groups = ChatMembership.objects.filter(
            chat_group__course=course_pk,
            user_id=user_id,
            chat_group__chat_type="individual",
        ).values_list("chat_group", flat=True)
        # get common chat groups
        chat_groups = list(set(my_groups) & set(user_groups))
        # create chat group if not found
        if len(chat_groups) == 0:
            data = {
                "name": f"{current_user.first_name} - {user_id}",
                "members": [user_id],
                "chat_type": "individual",
                "course": course_pk,
            }
            serializer = self.get_serializer(data=data)
            serializer.is_valid(raise_exception=True)
            chat_group = self.perform_create(serializer)
            chat_groups.append(chat_group.id)
        chat_group = ChatGroup.objects.filter(id__in=chat_groups).first()
        serializer = self.get_serializer(chat_group)
        return success_response(detail="Fetched all chat groups", **serializer.data)

    def list(self, request, course_pk=None, *args, **kwargs):
        chat_groups = self.get_queryset()

        queryset = self.filter_queryset(chat_groups)

        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(
                detail="Fetched all chats" if page != [] else "No chats found",
                data=serializer.data,
            )

        serializer = self.get_serializer(queryset, many=True)
        return success_response(detail="Fetched all chats", results=serializer.data)

    def perform_create(self, serializer):
        return serializer.save(created_by=self.request.user, admin=self.request.user)

    def perform_update(self, serializer):
        return serializer.save()

    def get_paginated_response(self, data, detail=None):
        """
        Return a paginated style `Response` object for the given output data.
        """
        assert self.paginator is not None
        return self.paginator.get_paginated_response(data=data, detail=detail)

    def get_queryset(self):
        queryset = self.queryset.filter(course=self.kwargs["course_pk"])
        if self.request.user.is_authenticated:
            queryset = queryset.mine(self.request.user)
        return queryset

    def get_object(self):
        queryset = self.filter_queryset(self.get_queryset())
        obj = get_object_or_404(queryset, pk=self.kwargs[self.lookup_field])
        # May raise a permission denied
        self.check_object_permissions(self.request, obj)
        return super().get_object()

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context["request"] = self.request
        context["user"] = self.request.user
        return context


class MessageViewSet(ModelViewSet):
    queryset = ChatMessage.objects.all()
    serializer_class = ChatMessageSerializer
    permission_classes = [IsAuthenticated]

    def create(self, request, course_pk=None, chat_pk=None, *args, **kwargs):
        data = {**request.data, "chat_group": chat_pk}
        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        return success_response(
            detail="Message sent successfully", code=201, **serializer.data
        )

    def list(self, request, course_pk=None, chat_pk=None, *args, **kwargs):
        messages = self.get_queryset()

        queryset = self.filter_queryset(messages)

        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(
                detail="Fetched all messages" if page != [] else "No messages found",
                data=serializer.data,
            )

        serializer = self.get_serializer(queryset, many=True)
        return success_response(detail="Fetched all messages", results=serializer.data)

    def perform_create(self, serializer):
        return serializer.save(created_by=self.request.user, user=self.request.user)

    def perform_update(self, serializer):
        return serializer.save()

    def get_paginated_response(self, data, detail=None):
        """
        Return a paginated style `Response` object for the given output data.
        """
        assert self.paginator is not None
        return self.paginator.get_paginated_response(data=data, detail=detail)

    def get_queryset(self):
        queryset = self.queryset.filter(chat_group=self.kwargs["chat_pk"])
        return queryset

    def get_object(self):
        queryset = self.filter_queryset(self.get_queryset())
        obj = get_object_or_404(queryset, pk=self.kwargs[self.lookup_field])
        # May raise a permission denied
        self.check_object_permissions(self.request, obj)
        return super().get_object()

    def get_serializer_context(self):
        user = self.request.user
        chat_membership = user.chat_memberships.filter(
            chat_group=self.kwargs["chat_pk"]
        ).first()
        context = super().get_serializer_context()
        context["request"] = self.request
        context["last_read"] = chat_membership.last_read if chat_membership else None
        context["user"] = (
            self.request.user if self.request.user.is_authenticated else None
        )
        return context
