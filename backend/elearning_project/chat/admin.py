from django.contrib import admin
from chat.models import ChatGroup, ChatMessage, ChatMembership, ChatMessageRead


admin.site.register(ChatGroup)
admin.site.register(ChatMessage)
admin.site.register(ChatMembership)
admin.site.register(ChatMessageRead)
