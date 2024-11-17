from django.contrib import admin

from notifications.models import Notification, NotificationTemplate, NotificationTarget

admin.site.register(Notification)
admin.site.register(NotificationTemplate)
admin.site.register(NotificationTarget)
