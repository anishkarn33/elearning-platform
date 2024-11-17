from django.db import models
from django.utils.translation import get_language

from core.models import BaseModel


class NotificationTemplate(BaseModel):
    """
    NotificationTemplate Model for storing notification template related details
    """

    name = models.CharField(max_length=100, null=False, blank=False)
    subject = models.TextField(null=True, blank=True)
    body = models.TextField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    is_deleted = models.BooleanField(default=False)
    updated_at = models.DateTimeField(auto_now=True)


class Notification(BaseModel):
    """
    Notification Model for storing notification related details
    """

    class Meta:
        db_table = "tb_notifications"
        ordering = ["-created_at"]

    NOTIFICATION_TYPE_CHOICES = (
        ("NCE", "NEW_COURSE_ENROLLMENT"),
        ("NCM", "NEW_COURSE_MATERIAL"),
    )

    notification_template = models.ForeignKey(
        "NotificationTemplate",
        related_name="notifications",
        on_delete=models.CASCADE,
        null=True,
        blank=True,
    )

    message = models.TextField(null=True, blank=True)
    title = models.TextField(null=True, blank=True)
    link = models.TextField(null=True, blank=True)
    link_text = models.TextField(null=True, blank=True)
    icon = models.TextField(null=True, blank=True)

    created_by = models.ForeignKey(
        "accounts.User",
        related_name="created_by_user_notifications",
        on_delete=models.CASCADE,
    )
    updated_by = models.ForeignKey(
        "accounts.User",
        related_name="updated_by_user_notifications",
        on_delete=models.CASCADE,
    )
    language = models.CharField(max_length=3, default=get_language)

    def __str__(self):
        return "{}".format(self.title)


class NotificationTarget(BaseModel):
    """
    NotificationTarget Model for storing notification target related details
    """

    class Meta:
        db_table = "tb_notification_targets"

    notification = models.ForeignKey(
        "Notification",
        related_name="notification_targets",
        on_delete=models.CASCADE,
        null=True,
        blank=True,
    )
    user = models.ForeignKey(
        "accounts.User",
        related_name="user_notifications",
        on_delete=models.CASCADE,
        null=True,
        blank=True,
    )
    NOTIFICATION_STATUS_CHOICES = (
        ("N", "NEW"),
        ("V", "VIEWED"),
        ("D", "DELETED"),
    )
    notification_status = models.CharField(
        max_length=1, choices=NOTIFICATION_STATUS_CHOICES, default="N"
    )
    is_active = models.BooleanField(default=True)
    is_deleted = models.BooleanField(default=False)
    is_read = models.BooleanField(default=False)

    def __str__(self):
        return "{}".format(self.user)
