from django.db.models.query_utils import Q
from django.contrib.auth.models import AnonymousUser
from rest_framework.generics import get_object_or_404
from rest_framework.permissions import (
    IsAuthenticated,
    IsAuthenticatedOrReadOnly,
)
from rest_framework.viewsets import ModelViewSet
from rest_framework.decorators import action
from rest_framework import exceptions
from core.pagination import DefaultResultsSetPagination
from core.utils import success_response
from core.enums import USER_TYPES, COURSE_STATUS

from chat.models import ChatGroup
from .models import Course, CourseMembership, CourseFeedback, CourseMaterial
from . import serializers
from .filters import CourseFilter
from .permissions import (
    IsCourseMember,
    IsCourseAdmin,
    IsCourseAdminOrReadOnly,
    IsCourseMemberOrReadOnly,
)


class CourseViewSet(ModelViewSet):
    """
    CourseViewSet - feature includes
    - course join
    - list of user courses
    - memeber list
    """

    queryset = Course.objects.all()
    serializer_class = serializers.CourseSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    pagination_class = DefaultResultsSetPagination
    filterset_class = CourseFilter

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context["request"] = self.request
        context["user"] = None
        # put user in context
        if not isinstance(self.request.user, AnonymousUser):
            context["user"] = self.request.user
        return context

    def get_paginated_response(self, data, detail=None):
        """
        Return a paginated style `Response` object for the given output data.
        """
        assert self.paginator is not None
        return self.paginator.get_paginated_response(data=data, detail=detail)

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = serializers.CourseDetailSerializer(
            instance, context={"user": request.user, "request": request}
        )
        return success_response(detail="Fetched course details", **serializer.data)

    def create(self, request, *args, **kwargs):
        serializer = serializers.CourseCreateSerializer(
            data=request.data, context={"user": request.user, "request": request}
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return success_response(
            code=201, detail="Successfully created course", **serializer.data
        )

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        if (
            request.user.user_type == USER_TYPES.REGULAR_USER
            or request.user.is_anonymous
        ):
            queryset = queryset.filter(status=COURSE_STATUS.PUBLISHED)
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.paginator.get_paginated_response(
                detail="Fetched all courses", data=serializer.data
            )

        serializer = self.get_serializer(queryset, many=True)
        return success_response(detail="Fetched all courses", results=serializer.data)

    @action(detail=False, permission_classes=[IsAuthenticated], methods=["get"])
    def mine(self, request, *args, **kwargs):
        """List all user courses"""
        # all courses where user is a member or admin
        member_courses = request.user.courses.all()
        admin_courses = request.user.my_courses.all()
        queryset = (member_courses | admin_courses).distinct()
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.paginator.get_paginated_response(
                detail="Fetched all course" if page != [] else "No course found",
                data=serializer.data,
            )

        serializer = self.get_serializer(queryset, many=True)
        return success_response(detail="Fetched all course", results=serializer.data)

    @action(detail=True, permission_classes=[IsAuthenticated], methods=["post"])
    def enroll(self, request, *args, **kwargs):
        user = request.user
        course = self.get_object()
        # unique together user and communtiy
        try:
            CourseMembership.objects.create(user=user, course=course)
        except Exception:
            raise exceptions.ParseError(
                detail="You have already enrolled in the course"
            )
        serializer = self.get_serializer(course)
        return success_response(
            detail="You have enrolled in the course", **serializer.data
        )

    @action(detail=True, permission_classes=[IsCourseMember], methods=["post"])
    def mark_complete(self, request, *args, **kwargs):
        course = self.get_object()
        membership = get_object_or_404(
            CourseMembership, course=course, user=request.user
        )
        membership.is_course_completed = True
        membership.save()

        return success_response(detail="You have marked the course as complete")

    @action(detail=True, permission_classes=[IsCourseAdmin], methods=["get"])
    def stats(self, request, *args, **kwargs):
        course = self.get_object()
        course_stats = {
            "members": CourseMembership.objects.filter(
                course=course,
            ).count(),
            "materials": course.materials.count(),
        }
        return success_response(
            detail="Successfully fetched course stats", **course_stats
        )

    @action(detail=False, permission_classes=[IsAuthenticated], methods=["get"])
    def chat_groups(self, request, *args, **kwargs):
        if request.user.is_anonymous:
            return success_response(detail="No chat groups found", results=[])
        elif request.user.user_type == USER_TYPES.INSTRUCTOR:
            queryset = ChatGroup.objects.filter(admin=request.user)
        elif request.user.user_type == USER_TYPES.REGULAR_USER:
            queryset = ChatGroup.objects.filter(
                chat_memberships__user=request.user
            ).distinct()
        else:
            queryset = ChatGroup.objects.none()
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = serializers.ChatGroupSerializer(
                page, many=True, context={"request": request}
            )
            return self.paginator.get_paginated_response(
                detail=(
                    "Fetched all chat groups" if page != [] else "No chat groups found"
                ),
                data=serializer.data,
            )

        serializer = serializers.ChatGroupSerializer(queryset, many=True)
        return success_response(
            detail="Fetched all chat groups", results=serializer.data
        )


class MemberViewSet(ModelViewSet):
    """
    MemberViewSet - Features include:
    - members list
    - remove member
    """

    queryset = CourseMembership.objects.all()
    serializer_class = serializers.CourseMemberProfileSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = DefaultResultsSetPagination

    def get_paginated_response(self, data, detail=None):
        """
        Return a paginated style `Response` object for the given output data.
        """
        assert self.paginator is not None
        return self.paginator.get_paginated_response(data=data, detail=detail)

    def filter_queryset(self, queryset):
        return queryset

    def get_queryset(self):
        queryset = self.queryset.filter(course=self.kwargs["course_pk"])
        return queryset

    def get_object(self):
        return self.get_object_queryset().first()

    def get_object_queryset(self):
        queryset = self.filter_queryset(
            self.get_queryset().course_users().user_profiles()
        )
        target_user_pk = self.kwargs[self.lookup_field]
        get_object_or_404(queryset, Q(pk=target_user_pk))
        # TODO - May raise a permission denied
        # self.check_object_permissions(self.request, obj)
        return queryset.filter(Q(pk=target_user_pk))

    def list(self, request, course_pk=None, *args, **kwargs):
        queryset = self.get_queryset().course_users().user_profiles()
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = serializers.CourseMemberProfileSerializer(page, many=True)
            return self.paginator.get_paginated_response(
                detail="Fetched all members" if page != [] else "No members found",
                data=serializer.data,
            )

        serializer = serializers.CourseMemberProfileSerializer(queryset, many=True)
        return success_response(detail="Fetched all members", results=serializer.data)

    @action(detail=False, permission_classes=[IsAuthenticated], methods=["get"])
    def blocked_users(self, request, course_pk=None, *args, **kwargs):
        queryset = (
            self.get_queryset().course_users(is_user_blocked=True).user_profiles()
        )
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = serializers.UserProfileSerializer(page, many=True)
            return self.paginator.get_paginated_response(
                detail=(
                    "Fetched all blocked users"
                    if page != []
                    else "No blocked users found"
                ),
                data=serializer.data,
            )

        serializer = serializers.UserProfileSerializer(queryset, many=True)
        return success_response(
            detail="Fetched all member requests", results=serializer.data
        )

    @action(detail=False, permission_classes=[IsAuthenticated], methods=["get"])
    def completed_users(self, request, course_pk=None, *args, **kwargs):
        queryset = (
            self.get_queryset().course_users(is_course_completed=True).user_profiles()
        )
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = serializers.UserProfileSerializer(page, many=True)
            return self.paginator.get_paginated_response(
                detail=(
                    "Fetched all completed course users"
                    if page != []
                    else "No users found"
                ),
                data=serializer.data,
            )

        serializer = serializers.UserProfileSerializer(queryset, many=True)
        return success_response(detail="Fetched all users", results=serializer.data)

    def retrieve(self, request, *args, **kwargs):
        member = self.get_object_queryset()
        serializer = self.get_serializer(member)
        return success_response(
            detail="Successfully fetched member detail", **serializer.data
        )

    @action(detail=True, permission_classes=[IsAuthenticated], methods=["post"])
    def block_user(self, request, course_pk=None, pk=None, *args, **kwargs):
        """
        Block user
        """
        member_pk = pk
        membership = CourseMembership.objects.filter(
            course_id=course_pk, user_id=member_pk
        ).first()
        if membership is None:
            raise exceptions.NotFound(detail="User not found")
        membership.is_user_blocked = True
        membership.save()
        serializer = serializers.UserProfileSerializer(membership.user.profile)
        return success_response(detail="Blocked user", **serializer.data)

    def destroy(self, request, course_pk=None, pk=None, *args, **kwargs):
        """
        Remove membership
        """
        member_pk = pk
        membership = CourseMembership.objects.filter(
            course_id=course_pk, user_id=member_pk
        ).first()
        if membership is None:
            raise exceptions.NotFound(detail="User not found")
        membership.delete()
        return success_response(
            detail="Successfully removed member",
        )


class CourseMaterialViewSet(ModelViewSet):
    """
    CourseMaterialViewSet - Features include:
    - course material list
    - course material detail
    """

    queryset = CourseMaterial.objects.all()
    serializer_class = serializers.CourseMaterialSerializer
    permission_classes = [IsCourseAdminOrReadOnly]
    pagination_class = DefaultResultsSetPagination

    def get_queryset(self):
        queryset = self.queryset.filter(course=self.kwargs["course_pk"])
        return queryset

    def get_object(self):
        return self.get_object_queryset().first()

    def get_object_queryset(self):
        queryset = self.filter_queryset(self.get_queryset())
        target_material_pk = self.kwargs[self.lookup_field]
        get_object_or_404(queryset, Q(pk=target_material_pk))
        return queryset.filter(Q(pk=target_material_pk))

    def list(self, request, course_pk=None, *args, **kwargs):
        queryset = self.get_queryset()
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.paginator.get_paginated_response(
                detail=(
                    "Fetched all course materials"
                    if page != []
                    else "No materials found"
                ),
                data=serializer.data,
            )

        serializer = self.get_serializer(queryset, many=True)
        return success_response(
            detail="Fetched all course materials", results=serializer.data
        )

    def retrieve(self, request, *args, **kwargs):
        material = self.get_object()
        serializer = self.get_serializer(material)
        return success_response(
            detail="Successfully fetched course material detail", **serializer.data
        )

    def create(self, request, *args, **kwargs):
        course = get_object_or_404(Course, pk=self.kwargs["course_pk"])
        serializer = serializers.CourseMaterialCreateSerializer(
            data=request.data, context={"user": request.user}
        )
        serializer.is_valid(raise_exception=True)
        serializer.save(course=course)
        return success_response(
            code=201, detail="Successfully created course material", **serializer.data
        )

    def update(self, request, *args, **kwargs):
        material = self.get_object_queryset().first()
        serializer = serializers.CourseMaterialCreateSerializer(
            material, data=request.data, partial=True
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return success_response(
            detail="Successfully updated course material", **serializer.data
        )

    def destroy(self, request, *args, **kwargs):
        material = self.get_object_queryset().first()
        material.delete()
        return success_response(detail="Successfully deleted course material")


class CourseFeedbackViewSet(ModelViewSet):
    """
    CourseFeedbackViewSet - Features include:
    - course feedback list
    - course feedback detail
    """

    queryset = CourseFeedback.objects.all()
    serializer_class = serializers.CourseFeedbackSerializer
    permission_classes = [IsCourseAdmin, IsCourseMemberOrReadOnly]
    pagination_class = DefaultResultsSetPagination

    def get_queryset(self):
        queryset = self.queryset.filter(course=self.kwargs["course_pk"])
        return queryset

    def get_object(self):
        return self.get_object_queryset().first()

    def get_object_queryset(self):
        queryset = self.filter_queryset(self.get_queryset())
        target_feedback_pk = self.kwargs[self.lookup_field]
        get_object_or_404(queryset, Q(pk=target_feedback_pk))
        return queryset.filter(Q(pk=target_feedback_pk))

    def list(self, request, course_pk=None, *args, **kwargs):
        queryset = self.get_queryset()
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.paginator.get_paginated_response(
                detail=(
                    "Fetched all course feedbacks"
                    if page != []
                    else "No feedbacks found"
                ),
                data=serializer.data,
            )

        serializer = self.get_serializer(queryset, many=True)
        return success_response(
            detail="Fetched all course feedbacks", results=serializer.data
        )

    def retrieve(self, request, *args, **kwargs):
        feedback = self.get_object()
        serializer = self.get_serializer(feedback)
        return success_response(
            detail="Successfully fetched course feedback detail", **serializer.data
        )

    def create(self, request, *args, **kwargs):
        course = get_object_or_404(Course, pk=self.kwargs["course_pk"])
        serializer = serializers.CourseFeedbackCreateSerializer(
            data=request.data, context={"user": request.user}
        )
        serializer.is_valid(raise_exception=True)
        serializer.save(course=course)
        return success_response(
            code=201, detail="Successfully created course feedback", **serializer.data
        )

    def update(self, request, *args, **kwargs):
        feedback = self.get_object_queryset().first()
        serializer = serializers.CourseFeedbackCreateSerializer(
            feedback, data=request.data, partial=True
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return success_response(
            detail="Successfully updated course feedback", **serializer.data
        )

    def destroy(self, request, *args, **kwargs):
        feedback = self.get_object_queryset().first()
        feedback.delete()
        return success_response(detail="Successfully deleted course feedback")
