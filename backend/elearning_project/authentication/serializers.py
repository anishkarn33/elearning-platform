from django.utils.translation import gettext_lazy as _
from rest_framework_simplejwt.serializers import (
    TokenObtainPairSerializer,
)
from rest_framework_simplejwt.tokens import RefreshToken, TokenError
from rest_framework import serializers


class TokenObtainPairSerializer(TokenObtainPairSerializer):
    def get_token(cls, user):  # noqa
        token = super().get_token(user)

        # Add custom claims
        token["name"] = f"{user.first_name} {user.last_name}".strip()
        token["user_type"] = user.user_type
        if user.is_superuser:
            token["is_admin"] = True

        if user.is_staff:
            token["is_staff"] = True

        return token


class TokenRevokeSerializer(serializers.Serializer):
    refresh = serializers.CharField()

    default_error_messages = {"bad_token": _("Token is invalid or expired")}

    def validate(self, attrs):
        token = attrs.get("refresh")

        if not token:
            raise serializers.ValidationError(
                {"refresh": self.error_messages["no_input"]}, code="no_input"
            )
        self.token = token
        return attrs

    def save(self, **kwargs):
        try:
            refresh = RefreshToken(token=self.token, verify=True)
            refresh.blacklist()
        except TokenError:
            raise serializers.ValidationError(
                {"refresh": self.error_messages["bad_token"]}, code="bad_token"
            )
