from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils.translation import gettext_lazy as _

from core.models import BaseModel
from core.utils import random_username, UsernameValidator
from core.enums import USER_TYPES
from accounts.managers import AccountManager


class User(AbstractUser):
    """
    Custom User Model
    https://docs.djangoproject.com/en/2.2/topics/auth/customizing/#using-a-custom-user-model-when-starting-a-project
    """

    class Meta:
        db_table = "tb_users"
        ordering = ["id"]
        verbose_name = _("user")
        verbose_name_plural = _("users")

    USER_TYPE_CHOICES = (
        (USER_TYPES.REGULAR_USER, _("Regular User")),
        (USER_TYPES.INSTRUCTOR, _("Instructor")),
        (USER_TYPES.SUPER_ADMIN, _("Super Admin")),
    )
    user_type = models.SmallIntegerField(
        default=USER_TYPES.REGULAR_USER, choices=USER_TYPE_CHOICES
    )

    username_validator = UsernameValidator()

    username = models.CharField(
        _("username"),
        max_length=150,
        unique=True,
        help_text=_("Required. 150 characters or fewer. Letters and digits only."),
        validators=[username_validator],
        default=random_username,
        error_messages={
            "unique": _("A user with that username already exists."),
        },
    )

    phone = models.CharField(
        _("phone"),
        max_length=20,
        blank=True,
        null=True,
    )

    is_email_verified = models.BooleanField(
        _("active"),
        default=False,
        help_text=_(
            "Designates whether this user should be treated as active. "
            "Unselect this instead of deleting accounts."
        ),
    )

    PHONE_FIELD = "phone"

    objects = AccountManager()

    def __str__(self):
        return self.email if self.email else self.username


class UserProfile(BaseModel):
    class Meta:
        db_table = "tb_user_profiles"
        ordering = ["created_at"]

    email = models.EmailField(
        _("email address"),
        max_length=255,
        blank=True,
        null=True,
        error_messages={
            "unique": _("A user with that email already exists."),
        },
    )
    phone = models.CharField(
        _("phone"),
        max_length=20,
        blank=True,
        null=True,
    )

    country_code = models.CharField(
        _("country code"),
        max_length=10,
        blank=True,
        null=True,
    )
    user = models.OneToOneField(
        User, on_delete=models.CASCADE, null=True, related_name="profile"
    )
    title = models.CharField(max_length=255, blank=True, null=True)
    bio = models.TextField(blank=True, null=True)
    avatar = models.URLField(blank=True, null=True)
    first_name = models.CharField(max_length=255, blank=True, null=True)
    last_name = models.CharField(max_length=255, blank=True, null=True)
    location = models.CharField(max_length=255, blank=True, null=True)
    nationality = models.CharField(max_length=255, blank=True, null=True)

    def __str__(self) -> str:
        return f"{self.first_name} {self.last_name}"
