from django.urls import re_path, include
from rest_framework_nested.routers import SimpleRouter, NestedSimpleRouter
from courses.views import (
    CourseViewSet,
    MemberViewSet,
    CourseFeedbackViewSet,
    CourseMaterialViewSet,
)


course_router = SimpleRouter()
course_router.register(r"course", CourseViewSet)

members_router = NestedSimpleRouter(course_router, r"course", lookup="course")
members_router.register(r"members", MemberViewSet, basename="course-members")

course_feedback_router = NestedSimpleRouter(course_router, r"course", lookup="course")
course_feedback_router.register(
    r"feedbacks", CourseFeedbackViewSet, basename="course-feedbacks"
)

course_material_router = NestedSimpleRouter(course_router, r"course", lookup="course")
course_material_router.register(
    r"materials", CourseMaterialViewSet, basename="course-materials"
)

urlpatterns = [
    re_path(r"", include(course_router.urls)),
    re_path(r"", include(members_router.urls)),
    re_path(r"", include(course_feedback_router.urls)),
    re_path(r"", include(course_material_router.urls)),
]
