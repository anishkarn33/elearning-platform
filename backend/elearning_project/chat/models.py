from django.db import models

from core.models import BaseModel
from .querysets import ChatGroupQueryset


class ChatGroup(BaseModel):
    """
    ChatGroup Model for storing chat group related details
    """

    class Meta:
        db_table = "tb_chat_groups"
        ordering = ["-created_at"]

    objects = ChatGroupQueryset.as_manager()

    course = models.ForeignKey(
        "courses.Course",
        on_delete=models.CASCADE,
        related_name="chat_groups",
        null=True,
        blank=True,
    )
    admin = models.ForeignKey(
        "accounts.User",
        on_delete=models.CASCADE,
        related_name="chat_groups_admin",
        null=True,
        blank=True,
    )
    name = models.CharField(max_length=100, null=False, blank=False)
    photo = models.URLField(blank=True, null=True)
    description = models.TextField(null=True, blank=True)
    CHAT_GROUP_TYPE_CHOICES = (
        ("group", "Group"),
        ("individual", "Individual"),
    )
    chat_type = models.CharField(
        max_length=20, choices=CHAT_GROUP_TYPE_CHOICES, default="individual"
    )
    updated_at = models.DateTimeField(auto_now=True)
    removed_at = models.DateTimeField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    is_public = models.BooleanField(default=False)
    is_deleted = models.BooleanField(default=False)
    members = models.ManyToManyField(
        "accounts.User",
        related_name="chat_groups",
        through="ChatMembership",
        through_fields=("chat_group", "user"),
    )

    def __str__(self):
        return self.name


class ChatMembership(BaseModel):
    """
    ChatMembership Model for storing chat group members
    """

    class Meta:
        db_table = "tb_chat_memberships"
        ordering = ["-created_at"]

    chat_group = models.ForeignKey(
        ChatGroup, on_delete=models.CASCADE, related_name="chat_memberships"
    )
    user = models.ForeignKey(
        "accounts.User", on_delete=models.CASCADE, related_name="chat_memberships"
    )
    last_read = models.DateTimeField(blank=True, null=True)
    unread_messages = models.IntegerField(default=0)
    cleared = models.DateTimeField(blank=True, null=True)
    last_date = models.DateTimeField(blank=True, null=True)
    is_active = models.BooleanField(default=False)
    is_blocked = models.BooleanField(default=False)
    is_suspended = models.BooleanField(default=False)
    is_admin = models.BooleanField(default=False)

    def __str__(self):
        return self.user.email


class ChatMessage(BaseModel):
    """
    ChatMessage Model for storing chat message details
    """

    class Meta:
        db_table = "tb_chat_messages"
        ordering = ["-created_at"]

    MESSAGE_TYPE_CHOICES = (
        ("text", "Text"),
        ("image", "Image"),
        ("video", "Video"),
        ("audio", "Audio"),
        ("file", "File"),
        ("location", "Location"),
        ("contact", "Contact"),
        ("sticker", "Sticker"),
        ("document", "Document"),
        ("other", "Other"),
    )
    chat_group = models.ForeignKey(
        ChatGroup,
        related_name="chat_messages",
        on_delete=models.CASCADE,
        null=True,
        blank=True,
    )
    message_type = models.CharField(
        max_length=10, choices=MESSAGE_TYPE_CHOICES, default="text"
    )
    user = models.ForeignKey(
        "accounts.User",
        on_delete=models.SET_NULL,
        related_name="messages",
        null=True,
        blank=True,
    )
    text = models.TextField(null=True, blank=True)
    reads = models.ManyToManyField(
        "accounts.User",
        related_name="read_messages",
        through="ChatMessageRead",
        through_fields=("message", "user"),
    )
    updated_at = models.DateTimeField(auto_now=True)
    removed_at = models.DateTimeField(blank=True, null=True)
    # message deleted by sender
    is_deleted_by_sender = models.BooleanField(default=False)
    # message deleted by admin
    is_deleted_by_admin = models.BooleanField(default=False)

    def __str__(self):
        return (
            self.text if self.text else f"No Text - Message Type: {self.message_type}"
        )


class ChatMessageRead(BaseModel):
    """
    ChatMessageRead Model for storing chat message read details
    """

    class Meta:
        db_table = "tb_chat_message_reads"
        ordering = ["-created_at"]

    message = models.ForeignKey(
        ChatMessage, on_delete=models.CASCADE, related_name="message_reads"
    )
    user = models.ForeignKey(
        "accounts.User", on_delete=models.CASCADE, related_name="message_reads"
    )
    read_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.read_at


class MessageFile(BaseModel):
    """
    ChatMessage Files Model for storing message files
    """

    class Meta:
        db_table = "tb_message_files"
        ordering = ["-created_at"]

    message = models.ForeignKey(
        ChatMessage, related_name="files", on_delete=models.CASCADE
    )
    url = models.URLField(blank=True, null=True)
    FILE_TYPE_CHOICES = (
        ("image", "Image"),
        ("video", "Video"),
        ("audio", "Audio"),
        ("document", "Document"),
        ("other", "Other"),
    )
    file_type = models.CharField(
        max_length=10, choices=FILE_TYPE_CHOICES, default="image"
    )
    # Required if file_type is not image or video
    file_name = models.CharField(max_length=200, default="", null=True, blank=True)
    # Required if file_type is video
    thumbnail_url = models.URLField(default="", max_length=2000, null=True, blank=True)
