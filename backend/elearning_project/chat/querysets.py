from django.db import models

from django.db.models import F, Max


class ChatGroupQueryset(models.QuerySet):
    def mine(self, user):
        """Return all chat groups of a user

        Returns:
            Queryset: Queryset of all chat group objects
        """
        queryset = self
        queryset = (
            queryset.filter(
                chat_memberships__user=user,
            )
            .annotate(
                last_message=Max("chat_messages__created_at"),
            )
            .order_by(
                F("last_message").desc(nulls_last=True),
                "-created_at",
            )
        )
        # Order By, nulls last.: https://stackoverflow.com/questions/15121093/django-adding-nulls-last-to-query
        return queryset
