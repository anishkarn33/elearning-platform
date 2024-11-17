from rest_framework import serializers

from django.db.models import Avg
from courses.models import Course, CourseMembership, CourseMaterial, CourseFeedback
from accounts.serializers import UserProfileSerializer
from chat.serializers import ChatGroupSerializer


class CourseMemberProfileSerializer(UserProfileSerializer):
    pass


class CourseSerializer(serializers.ModelSerializer):
    chat_group = serializers.SerializerMethodField()
    instructor = UserProfileSerializer(source="owner.profile", read_only=True)
    is_enrolled = serializers.SerializerMethodField()
    members_count = serializers.SerializerMethodField()
    average_rating = serializers.SerializerMethodField()
    total_feedbacks = serializers.SerializerMethodField()

    def get_chat_group(self, obj):
        chat_group = obj.chat_groups.first()
        if chat_group is not None:
            return ChatGroupSerializer(chat_group, context=self.context).data
        return None

    def get_average_rating(self, obj):
        return obj.feedbacks.aggregate(Avg("rating"))["rating__avg"]

    def get_total_feedbacks(self, obj):
        return obj.feedbacks.count()

    def get_is_enrolled(self, obj):
        user = self.context.get("user")
        if user is not None and user.is_authenticated:
            membership = obj.course_memberships.filter(user=user).first()
            return membership is not None
        return False

    def get_members_count(self, obj):
        return obj.members.count()

    class Meta:
        model = Course
        fields = (
            "id",
            "title",
            "status",
            "chat_group",
            "cover_url",
            "average_rating",
            "total_feedbacks",
            "description",
            "instructor",
            "duration",
            "category",
            "created_at",
            "updated_at",
            "active",
            "is_enrolled",
            "members_count",
        )


class CourseDetailSerializer(serializers.ModelSerializer):
    chat_group = serializers.SerializerMethodField()
    instructor = UserProfileSerializer(source="owner.profile", read_only=True)
    is_enrolled = serializers.SerializerMethodField()
    members_count = serializers.SerializerMethodField()
    average_rating = serializers.SerializerMethodField()
    total_feedbacks = serializers.SerializerMethodField()
    materials = serializers.SerializerMethodField()
    feedbacks = serializers.SerializerMethodField()

    def get_chat_group(self, obj):
        chat_group = obj.chat_groups.first()
        if chat_group is not None:
            return ChatGroupSerializer(chat_group, context=self.context).data
        return None

    def get_average_rating(self, obj):
        return obj.feedbacks.aggregate(Avg("rating"))["rating__avg"]

    def get_total_feedbacks(self, obj):
        return obj.feedbacks.count()

    def get_is_enrolled(self, obj):
        user = self.context.get("user")
        if user is not None and user.is_authenticated:
            membership = obj.course_memberships.filter(user=user).first()
            return membership is not None
        return False

    def get_members_count(self, obj):
        return obj.members.count()

    def get_materials(self, obj):
        materials = obj.materials.all()
        return CourseMaterialSerializer(materials, many=True).data

    def get_feedbacks(self, obj):
        feedbacks = obj.feedbacks.all()
        return CourseFeedbackSerializer(feedbacks, many=True).data

    class Meta:
        model = Course
        fields = (
            "id",
            "title",
            "status",
            "chat_group",
            "cover_url",
            "description",
            "average_rating",
            "total_feedbacks",
            "materials",
            "feedbacks",
            "instructor",
            "duration",
            "category",
            "created_at",
            "updated_at",
            "active",
            "is_enrolled",
            "members_count",
        )


class CourseCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Course
        fields = ("title", "description", "duration", "category", "cover_url", "status")
        extra_kwargs = {
            "title": {"required": True},
            "description": {"required": True},
        }

    def create(self, validated_data):
        user = self.context.get("user")
        validated_data["owner"] = user
        return super().create(validated_data)


class CourseMembershipSerializer(serializers.ModelSerializer):
    user = UserProfileSerializer(source="user.profile", read_only=True)

    class Meta:
        model = CourseMembership
        fields = ("course", "user", "is_user_blocked", "is_course_completed")


class CourseMembershipDetailSerializer(serializers.ModelSerializer):
    course = CourseSerializer(read_only=True)

    class Meta:
        model = CourseMembership
        fields = ("course", "user", "is_user_blocked", "is_course_completed")


class CourseMaterialSerializer(serializers.ModelSerializer):
    class Meta:
        model = CourseMaterial
        fields = (
            "id",
            "title",
            "duration",
            "description",
            "url",
            "file_type",
            "file_name",
            "thumbnail_url",
            "created_at",
        )


class CourseMaterialDetailSerializer(serializers.ModelSerializer):
    course = CourseSerializer(read_only=True)

    class Meta:
        model = CourseMaterial
        fields = (
            "course",
            "title",
            "duration",
            "description",
            "url",
            "file_type",
            "file_name",
            "thumbnail_url",
            "created_at",
        )


class CourseMaterialCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = CourseMaterial
        fields = (
            "course_id",
            "title",
            "description",
            "duration",
            "url",
            "file_type",
            "thumbnail_url",
            "file_name",
        )
        extra_kwargs = {
            "title": {"required": True},
            "description": {"required": True},
            "url": {"required": True},
        }

    def create(self, validated_data):
        user = self.context.get("user")
        validated_data["created_by"] = user
        return super().create(validated_data)


class CourseFeedbackSerializer(serializers.ModelSerializer):
    user = UserProfileSerializer(source="user.profile", read_only=True)

    class Meta:
        model = CourseFeedback
        fields = ("course", "user", "rating", "feedback", "created_at")


class CourseFeedbackDetailSerializer(serializers.ModelSerializer):
    course = CourseSerializer(read_only=True)
    user = UserProfileSerializer(source="user.profile", read_only=True)

    class Meta:
        model = CourseFeedback
        fields = ("course", "user", "rating", "feedback", "created_at")


class CourseFeedbackCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = CourseFeedback
        fields = ("course", "rating", "feedback")
        extra_kwargs = {
            "rating": {"required": True},
            "feedback": {"required": True},
        }

    def create(self, validated_data):
        user = self.context.get("user")
        validated_data["user"] = user
        return super().create(validated_data)
