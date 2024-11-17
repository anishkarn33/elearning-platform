from django.db import models
from .querysets import CourseMembershipQueryset

from core.models import BaseModel


class Course(BaseModel):
    """
    Course Model for storing course related details
    """

    class Meta:
        db_table = "tb_course"
        ordering = ["-created_at"]

    owner = models.ForeignKey(
        "accounts.User", related_name="my_courses", on_delete=models.CASCADE
    )
    instructors = models.ManyToManyField(
        "accounts.User",
        related_name="instructing_courses",
        through="CourseInstructor",
        through_fields=("course", "user"),
    )
    members = models.ManyToManyField(
        "accounts.User",
        related_name="courses",
        through="CourseMembership",
        through_fields=("course", "user"),
    )

    STATUS_CHOICES = (
        ("draft", "Draft"),
        ("published", "Published"),
        ("archived", "Archived"),
    )

    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default="draft")
    title = models.CharField(max_length=255)
    description = models.TextField()
    duration = models.CharField(max_length=255, blank=True, null=True)
    category = models.CharField(max_length=255, blank=True, null=True)
    active = models.BooleanField(default=True)
    cover_url = models.URLField(blank=True, null=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title


class CourseMaterial(BaseModel):
    """
    CourseMaterial model is used to store the materials for courses.
    """

    course = models.ForeignKey(
        Course, related_name="materials", on_delete=models.CASCADE
    )
    duration = models.CharField(max_length=255, blank=True, null=True)
    title = models.CharField(max_length=255)
    description = models.TextField()
    url = models.URLField(blank=True, null=True)
    FILE_TYPE_CHOICES = (
        ("image", "Image"),
        ("video", "Video"),
        ("audio", "Audio"),
        ("document", "Document"),
        ("other", "Other"),
    )
    file_type = models.CharField(
        max_length=10, choices=FILE_TYPE_CHOICES, default="other"
    )
    # Required if file_type is not image or video
    file_name = models.CharField(max_length=200, default="", null=True, blank=True)
    # Required if file_type is video
    thumbnail_url = models.URLField(default="", max_length=2000, null=True, blank=True)

    class Meta:
        db_table = "tb_course_materials"
        ordering = ["-created_at"]

    def __str__(self):
        return self.title


class CourseInstructor(BaseModel):
    """
    CourseInstructor model is used to store the instructors for courses.
    """

    course = models.ForeignKey(
        Course, related_name="course_instructors", on_delete=models.CASCADE
    )
    user = models.ForeignKey(
        "accounts.User",
        related_name="instructor_courses",
        on_delete=models.CASCADE,
    )

    objects = models.Manager()

    class Meta:
        db_table = "tb_course_instructors"
        ordering = ["-created_at"]
        unique_together = ("course", "user")

    def __str__(self) -> str:
        return f"{self.user.email} at {self.course.title}"


class CourseMembership(BaseModel):
    """
    CourseMembership model is used to store the membership to courses for users.
    """

    course = models.ForeignKey(
        Course, related_name="course_memberships", on_delete=models.CASCADE
    )
    user = models.ForeignKey(
        "accounts.User",
        related_name="course_memberships",
        on_delete=models.SET_NULL,
        null=True,
    )

    is_user_blocked = models.BooleanField(default=False)
    is_course_completed = models.BooleanField(default=False)

    objects = CourseMembershipQueryset.as_manager()

    class Meta:
        db_table = "tb_course_memberships"
        ordering = ["-created_at"]
        unique_together = ("course", "user")

    def __str__(self) -> str:
        if self.user:
            return f"{self.user.email} at {self.course.title}"
        else:
            return f"no-USER at {self.course.title}"


class CourseFeedback(BaseModel):
    """
    CourseFeedback model is used to store the feedback for courses.
    """

    course = models.ForeignKey(
        Course, related_name="feedbacks", on_delete=models.CASCADE
    )
    user = models.ForeignKey(
        "accounts.User",
        related_name="course_feedbacks",
        on_delete=models.SET_NULL,
        null=True,
    )
    rating = models.FloatField()
    feedback = models.TextField()

    class Meta:
        db_table = "tb_course_feedbacks"
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return f"{self.user.email} at {self.course.title}"
