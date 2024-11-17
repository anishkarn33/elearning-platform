from django.conf import settings
from django.dispatch import receiver
from django.db.models.signals import post_save

from courses.models import Course, CourseInstructor, CourseMembership
from chat.models import ChatGroup, ChatMembership


DEBUG = getattr(settings, "DEBUG", True)


__all__ = [
    "create_chat_group_and_instructor",
    "add_user_chat_group_on_enroll",
]


@receiver(post_save, sender=Course)
def create_chat_group_and_instructor(sender, instance, created, *args, **kwargs):
    if instance and created:
        CourseInstructor.objects.create(course=instance, user=instance.owner)
        chat_group = ChatGroup.objects.create(
            course=instance,
            admin=instance.owner,
            name=instance.title,
            description=instance.description,
            chat_type="group",
        )
        ChatMembership.objects.create(
            chat_group=chat_group, user=instance.owner, is_admin=True
        )


@receiver(post_save, sender=CourseMembership)
def add_user_chat_group_on_enroll(sender, instance, created, *args, **kwargs):
    if instance and created:
        chat_group = ChatGroup.objects.filter(course=instance.course).first()
        if chat_group:
            ChatMembership.objects.create(chat_group=chat_group, user=instance.user)
