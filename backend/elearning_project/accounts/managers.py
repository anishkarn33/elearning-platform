from django.contrib.auth.models import UserManager
from django.db.models import Q
from django.apps import apps
from django.db import models


__all__ = [
    "AccountManager",
]


class AccountQuerySet(models.QuerySet):
    def get_queryset(self):
        return self.filter(Q(user__is_active=True) | Q(user__is_superuser=True))

    def user_profiles(self):
        UserProfile = apps.get_model("accounts", "UserProfile")
        return UserProfile.objects.filter(id__in=self.values_list("id", flat=True))


class AccountManager(UserManager):
    """
    AccountManager
    """

    def get_queryset(self):
        return AccountQuerySet(self.model, using=self._db, hints=self._hints)

    def get_by_natural_key(self, username):
        return self.get(
            Q(**{self.model.USERNAME_FIELD: username})
            | Q(**{self.model.EMAIL_FIELD: username})
            | Q(**{self.model.PHONE_FIELD: username})
        )
