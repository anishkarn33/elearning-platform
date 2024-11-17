from django.contrib import admin
from courses.models import (
    Course,
    CourseMembership,
    CourseMaterial,
    CourseFeedback,
    CourseInstructor,
)

admin.site.register(Course)
admin.site.register(CourseMembership)
admin.site.register(CourseMaterial)
admin.site.register(CourseFeedback)
admin.site.register(CourseInstructor)
