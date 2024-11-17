from django.conf import settings
from django.dispatch import receiver
from django.db.models.signals import post_save

from accounts.models import User
from accounts.models import UserProfile


DEBUG = getattr(settings, "DEBUG", True)


__all__ = [
    "create_related_profile",
]


@receiver(post_save, sender=User)
def create_related_profile(sender, instance, created, *args, **kwargs):
    # Notice that we're checking for `created` here. We only want to do this
    # the first time the `User` instance is created. If the save that caused
    # this signal to be run was an update action, we know the user already
    # has a profile.
    if instance and created:
        instance.profile = UserProfile.objects.create(pk=instance.pk, user=instance)
        instance.profile.first_name = instance.first_name
        instance.profile.last_name = instance.last_name
        instance.profile.email = instance.email
        instance.profile.phone = instance.phone
        instance.profile.save()
