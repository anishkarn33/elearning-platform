from rest_framework import viewsets
from rest_framework import exceptions
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated

from core.utils import success_response
from core.enums import USER_TYPES, COURSE_STATUS
from core.pagination import DefaultResultsSetPagination

from courses.models import Course
from accounts.models import (
    User,
    UserProfile,
)
from accounts.serializers import (
    ChangePasswordSerializer,
    CustomUserSerializer,
    UserProfileSerializer,
)
from courses.serializers import CourseSerializer


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    course_queryset = Course.objects.all()
    serializer_class = CustomUserSerializer
    pagination_class = DefaultResultsSetPagination

    def get_student_course_queryset(self, request):
        return request.user.courses.all().filter(status=COURSE_STATUS.PUBLISHED)

    def get_instructor_course_queryset(self, request):
        return request.user.my_courses.all()

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context["request"] = self.request
        return context

    def create(self, request, *args, **kwargs):
        data = request.data
        # create user
        user_serializer = self.serializer_class(
            data=data, context=self.get_serializer_context()
        )
        user_serializer.is_valid(raise_exception=True)
        user = user_serializer.save()
        # update user profile
        serializer = UserProfileSerializer(
            user.profile, data=request.data, context={"user": user}
        )
        serializer.is_valid(raise_exception=True)
        if serializer.is_valid():
            serializer.save()
        else:
            raise exceptions.ParseError(detail=serializer.errors)

        return success_response(
            detail="User Profile created and verification email has been sent successfully.",
            code=201,
            **serializer.data
        )

    def retrieve(self, request, pk=None, *args, **kwargs):
        instance = User.objects.get(pk=pk)
        if not instance.profile:
            raise exceptions.ParseError(detail="User profile does not exist.")

        try:
            serializer = UserProfileSerializer(instance.profile)
            return success_response(
                detail="User data fetched successfully", **serializer.data
            )
        except UserProfile.DoesNotExist:
            raise exceptions.NotFound(detail="User profile does not exist")

    @action(
        detail=False,
        permission_classes=[IsAuthenticated],
        methods=["get", "put"],
    )
    def me(self, request):  # noqa
        if request.method == "GET":
            try:
                serializer = UserProfileSerializer(request.user.profile)
                return success_response(
                    detail="User data fetched successfully", **serializer.data
                )
            except UserProfile.DoesNotExist:
                raise exceptions.NotFound(detail="User profile does not exist")
        elif request.method == "PUT":
            try:
                serializer = UserProfileSerializer(
                    request.user.profile,
                    data=request.data,
                    context={"user": request.user},
                )
                serializer.is_valid(raise_exception=True)
                serializer.save()
                return success_response(
                    detail="User profile updated successfully", **serializer.data
                )
            except UserProfile.DoesNotExist:
                raise exceptions.NotFound(detail="User profile does not exist")

    @action(detail=True, permission_classes=[IsAuthenticated], methods=["get"])
    def profile(self, request, pk=None):
        instance = User.objects.get(pk=pk)
        serializer = UserProfileSerializer(instance.profile)
        return success_response(
            detail="Profile data fetched successfully", **serializer.data
        )

    @action(
        detail=False,
        permission_classes=[IsAuthenticated],
        methods=["post"],
        serializer_class=ChangePasswordSerializer,
    )
    def change_password(self, request):
        data = request.data
        serializer = ChangePasswordSerializer(data=data, context={"request": request})
        if not serializer.is_valid():
            raise exceptions.ParseError(detail="Please use strong password")
        serializer.save(user=request.user)
        return success_response(detail="Password changed successfully")

    @action(
        detail=False,
        permission_classes=[IsAuthenticated],
        methods=["get"],
    )
    def my_courses(self, request):
        user = request.user
        is_instructor = user.user_type == USER_TYPES.INSTRUCTOR

        if is_instructor:
            queryset = self.get_instructor_course_queryset(request)
        else:
            queryset = self.get_student_course_queryset(request)

        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = CourseSerializer(
                page, many=True, context={"user": user, "request": request}
            )
            return self.paginator.get_paginated_response(
                detail="Fetched all course" if page != [] else "No course found",
                data=serializer.data,
            )
        serializer = CourseSerializer(
            queryset, many=True, context={"user": user, "request": request}
        )
        return success_response(detail="Fetched all course", results=serializer.data)

    @action(
        detail=False,
        permission_classes=[IsAuthenticated],
        methods=["get"],
    )
    def my_course_stats(self, request):
        user = request.user
        is_instructor = user.user_type == USER_TYPES.INSTRUCTOR

        if is_instructor:
            queryset = self.get_instructor_course_queryset(request)
            total_course_count = queryset.count()
            published_course_count = queryset.filter(
                status=COURSE_STATUS.PUBLISHED
            ).count()
            total_students_count = sum([course.members.count() for course in queryset])
            return success_response(
                detail="Fetched all course stats",
                total_course_count=total_course_count,
                published_course_count=published_course_count,
                total_students_count=total_students_count,
            )
        else:
            queryset = self.get_student_course_queryset(request)
            course_count = queryset.count()
            total_completed_courses = queryset.filter(
                course_memberships__is_course_completed=True
            ).count()
            return success_response(
                detail="Fetched all course stats",
                course_count=course_count,
                total_completed_courses=total_completed_courses,
            )
