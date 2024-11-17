from rest_framework import permissions
from .models import Course, CourseMembership


class IsCourseOwner(permissions.BasePermission):
    """
    Custom permission to only allow owners of a course to edit it.
    """

    def has_object_permission(self, request, view, obj):
        # Read permissions are allowed to any request,
        # so we'll always allow GET, HEAD or OPTIONS requests.
        if request.method in permissions.SAFE_METHODS:
            return True

        # check if obj is of type Organisation
        if isinstance(obj, Course):
            # Write permissions are only allowed to the owner of the organisation.
            return obj.owner == request.user
        else:
            return False


class IsCourseAdmin(permissions.BasePermission):
    """
    Custom permission to only allow owners of a course to edit it.
    """

    def has_object_permission(self, request, view, obj):
        # Read permissions are allowed to any request,
        # so we'll always allow GET, HEAD or OPTIONS requests.
        if request.method in permissions.SAFE_METHODS:
            return True

        # check if obj is of type Organisation
        if isinstance(obj, Course):
            # Write permissions are only allowed to the owner of the organisation.
            return obj.owner == request.user
        else:
            return False


class IsCourseAdminOrReadOnly(IsCourseAdmin):
    """
    Custom permission to only allow owners of a course to edit it.
    """

    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return super().has_object_permission(request, view, obj)


class IsCourseMember(permissions.IsAuthenticated):
    message = "You must be a course member to perform this action."

    def has_permission(self, request, view, obj=None):
        try:
            course_pk = view.kwargs["course_pk"]
        except KeyError:
            course_pk = view.kwargs["pk"]
        request.user.courses.filter(id=course_pk).exists()
        if not CourseMembership.objects.filter(
            course=course_pk, user=request.user, is_user_blocked=False
        ).exists():
            return False
        return super().has_permission(request, view)


class IsCourseMemberOrReadOnly(IsCourseMember):
    message = "You must be a course member to perform this action."

    def has_permission(self, request, view, obj=None):
        if request.method in permissions.SAFE_METHODS:
            return True
        return super().has_permission(request, view)
