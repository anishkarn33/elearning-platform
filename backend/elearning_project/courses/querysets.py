from django.db import models
from django.contrib.auth import get_user_model


class CourseMembershipQueryset(models.QuerySet):
    def course_users(self):
        """Return all enrollments of a course

        Returns:
            Queryset: Queryset of all user objects
        """
        queryset = self
        members_list = queryset.values_list("user", flat=True)
        users = get_user_model().objects.filter(pk__in=members_list)
        return users

    def mine(self, user):
        return self.filter(
            user=user,
        )
