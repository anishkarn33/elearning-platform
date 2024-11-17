import django_filters
from courses.models import Course


class CourseFilter(django_filters.FilterSet):
    title = django_filters.CharFilter(lookup_expr="icontains")

    class Meta:
        model = Course
        fields = [
            "title",
        ]
