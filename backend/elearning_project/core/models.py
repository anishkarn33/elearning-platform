from django.db import models


class BaseModel(models.Model):
    """
    Base model for all models
    """

    created_by = models.ForeignKey(
        "accounts.User",
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="%(class)s_created_by",
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        abstract = True
