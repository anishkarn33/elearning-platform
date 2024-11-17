from django.urls import re_path

from . import views

websocket_urlpatterns = [
    re_path(r"socket/chat/(?P<chat_id>\w+)/$", views.ChatConsumer.as_asgi()),
]
