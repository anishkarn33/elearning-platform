from django.urls import re_path, include
from rest_framework_nested.routers import NestedSimpleRouter
from .views import ChatGroupViewSet, MessageViewSet
from courses.urls import course_router

chats_router = NestedSimpleRouter(course_router, r"course", lookup="course")
chats_router.register(r"chat", ChatGroupViewSet, basename="course-chat")

messages_router = NestedSimpleRouter(chats_router, r"chat", lookup="chat")
messages_router.register(r"message", MessageViewSet, basename="chat-message")
urlpatterns = [
    re_path(r"", include(messages_router.urls)),
    re_path(r"", include(chats_router.urls)),
]
