from rest_framework import exceptions, serializers

from accounts.validators import RegisterValidateMixin
from accounts.models import (
    User,
    UserProfile,
)
from core.enums import USER_TYPES


class UserMinimalSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = ("id", "email", "first_name", "last_name", "avatar", "bio", "title")


class UserProfileSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(required=False)
    phone = serializers.CharField(required=False)
    is_active = serializers.BooleanField(source="user.is_active", read_only=True)
    is_email_verified = serializers.BooleanField(
        source="user.is_email_verified", read_only=True
    )

    class Meta:
        model = UserProfile
        fields = (
            "id",
            "first_name",
            "last_name",
            "avatar",
            "is_active",
            "is_email_verified",
            "location",
            "email",
            "phone",
            "nationality",
            "country_code",
            "bio",
            "title",
        )
        read_only_fields = (
            "id",
            "is_active",
            "is_email_verified",
        )

    def update(self, instance, validated_data):
        try:
            # do not update email
            if instance.email is not None:
                validated_data.pop("email", None)

            # do not update phone
            if instance.phone is not None:
                validated_data.pop("phone", None)
        except KeyError:
            pass

        instance = super().update(instance, validated_data)

        return instance


class CustomUserSerializer(RegisterValidateMixin, serializers.ModelSerializer):
    email = serializers.EmailField(required=True)
    password = serializers.CharField(write_only=True, required=True)

    class Meta(object):
        model = User
        fields = (
            "id",
            "username",
            "first_name",
            "last_name",
            "email",
            "phone",
            "password",
            "is_active",
            "is_superuser",
            "is_staff",
            "user_type",
            "date_joined",
            "last_login",
        )
        read_only_fields = (
            "id",
            "date_joined",
            "last_login",
            "is_active",
            "is_superuser",
            "user_type",
            "is_staff",
        )
        extra_kwargs = {"password": {"write_only": True}}

    def create(self, validated_data):
        user = super().create(validated_data)
        # default user type
        user.user_type = USER_TYPES.REGULAR_USER
        # set password
        user.set_password(validated_data["password"])
        user.save()
        return user


class ChangePasswordSerializer(serializers.Serializer):
    class Meta(object):
        fields = ("old_password", "new_password")
        extra_kwargs = {
            "old_password": {"write_only": True},
            "new_password": {"write_only": True},
        }

    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True)

    def validate(self, attrs):
        user = self.context["request"].user
        # match password
        old_password = attrs.get("old_password")
        if user.check_password(old_password):
            return attrs
        else:
            raise exceptions.ParseError(detail="Wrong password provided")

    def save(self, **kwargs):
        # save user password
        user = self.context["request"].user
        user.set_password(self.validated_data["new_password"])
        user.save()
        return user
