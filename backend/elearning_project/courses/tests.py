from model_mommy import mommy

from django.urls import reverse

from core.tests import BaseAPITestCase
from courses.models import Course, CourseMembership, CourseMaterial, CourseFeedback


class CourseAPITestCase(BaseAPITestCase):
    """
    Course API Tests
    """

    def setUp(self):
        super(CourseAPITestCase, self).setUp()
        self.course = mommy.make(Course, owner=self.sally_user)

    def test_user_cannot_enroll_nonexistent_course(self):
        """
        Test if a user cannot enroll a course
        """
        # join course
        mommy.make(
            CourseMembership,
            course=self.course,
            user=self.roger_user,
        )
        url = reverse("course-enroll", kwargs={"pk": 999})
        response = self.roger_client.post(url)
        self.assertEqual(response.status_code, 404)
        # verify through model
        self.assertFalse(
            CourseMembership.objects.filter(
                user=self.roger_user, course_id=999
            ).exists()
        )

    def test_user_can_enroll_course(self):
        """
        Test if a user can enroll a course
        """
        url = reverse("course-enroll", kwargs={"pk": self.course.id})
        response = self.roger_client.post(url)
        self.assertEqual(response.status_code, 200)
        # verify through model
        self.assertTrue(
            CourseMembership.objects.filter(
                user=self.roger_user, course=self.course
            ).exists()
        )
        self.assertTrue(self.course.members.filter(id=self.roger_user.id).exists())

    def test_user_can_leave_course(self):
        """
        Test if a user can leave a course
        """
        CourseMembership.objects.all().delete()
        CourseMembership.objects.create(user=self.roger_user, course=self.course)
        url = reverse(
            "course-mark-complete",
            kwargs={
                "pk": self.course.id,
            },
        )
        response = self.roger_client.post(url)
        self.assertEqual(response.status_code, 200)
        # verify through model
        self.assertTrue(
            CourseMembership.objects.filter(
                user=self.roger_user, course=self.course, is_course_completed=True
            ).exists()
        )


class CourseMembershipAPITestCase(BaseAPITestCase):
    """
    CourseMembershipAPITestCase
    """

    def setUp(self):
        super(CourseMembershipAPITestCase, self).setUp()
        self.course = mommy.make(Course)

    def test_course_returns_all_members(self):
        """
        Test if a user can get all course members
        """
        CourseMembership.objects.all().delete()
        mommy.make(
            CourseMembership,
            course=self.course,
            user=self.roger_user,
        )
        mommy.make(
            CourseMembership,
            course=self.course,
            user=self.james_user,
        )
        mommy.make(
            CourseMembership,
            course=self.course,
            user=self.sally_user,
        )

        url = reverse("course-members-list", kwargs={"course_pk": self.course.id})
        response = self.roger_client.get(url)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data.get("data").get("results")), 3)

    def test_course_returns_single_member(self):
        """
        Test if a user can fetch a course member
        """
        CourseMembership.objects.all().delete()
        mommy.make(
            CourseMembership,
            course=self.course,
            user=self.roger_user,
        )
        mommy.make(
            CourseMembership,
            course=self.course,
            user=self.james_user,
        )

        url = reverse(
            "course-members-detail",
            kwargs={"course_pk": self.course.id, "pk": self.james_user.id},
        )
        response = self.roger_client.get(url)
        self.assertEqual(response.status_code, 200)

    def test_user_list_all_course(self):
        """
        Test if a user can get all course that user has joined
        """
        course2 = mommy.make(Course)
        mommy.make(
            CourseMembership,
            course=self.course,
            user=self.roger_user,
        )
        mommy.make(
            CourseMembership,
            course=self.course,
            user=self.james_user,
        )
        mommy.make(
            CourseMembership,
            course=course2,
            user=self.roger_user,
        )
        url = reverse("course-mine")
        response = self.roger_client.get(url)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data.get("data").get("results")), 2)

    def test_user_list_empty_course(self):
        """
        Test if user can have zero course
        """
        # clear course
        Course.objects.all().delete()
        url = reverse("course-mine")
        response = self.roger_client.get(url)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data.get("data").get("results")), 0)


class CourseMaterialAPITestCase(BaseAPITestCase):
    """
    CourseMaterialAPITestCase
    """

    def setUp(self):
        super(CourseMaterialAPITestCase, self).setUp()
        self.course = mommy.make(Course)

    def test_course_material_returns_all_materials(self):
        """
        Test if a user can get all course materials
        """
        CourseMaterial.objects.all().delete()
        mommy.make(
            CourseMaterial,
            course=self.course,
            title="Material 1",
        )
        mommy.make(
            CourseMaterial,
            course=self.course,
            title="Material 2",
        )
        mommy.make(
            CourseMaterial,
            course=self.course,
            title="Material 3",
        )

        url = reverse("course-materials-list", kwargs={"course_pk": self.course.id})
        response = self.roger_client.get(url)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data.get("data").get("results")), 3)

    def test_course_material_returns_single_material(self):
        """
        Test if a user can fetch a course material
        """
        CourseMaterial.objects.all().delete()
        material1 = mommy.make(
            CourseMaterial,
            course=self.course,
            title="Material 1",
        )
        mommy.make(
            CourseMaterial,
            course=self.course,
            title="Material 2",
        )

        url = reverse(
            "course-materials-detail",
            kwargs={"course_pk": self.course.id, "pk": material1.id},
        )
        response = self.roger_client.get(url)
        self.assertEqual(response.status_code, 200)


class CourseFeedbackAPITestCase(BaseAPITestCase):
    """
    CourseFeedbackAPITestCase
    """

    def setUp(self):
        super(CourseFeedbackAPITestCase, self).setUp()
        self.course = mommy.make(Course)

    def test_course_feedback_returns_all_feedbacks(self):
        """
        Test if a user can get all course feedbacks
        """
        CourseFeedback.objects.all().delete()
        mommy.make(
            CourseFeedback,
            course=self.course,
            user=self.roger_user,
            rating=4,
        )
        mommy.make(
            CourseFeedback,
            course=self.course,
            user=self.james_user,
            rating=5,
        )
        mommy.make(
            CourseFeedback,
            course=self.course,
            user=self.sally_user,
            rating=3,
        )

        url = reverse("course-feedbacks-list", kwargs={"course_pk": self.course.id})
        response = self.roger_client.get(url)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data.get("data").get("results")), 3)

    def test_course_feedback_returns_single_feedback(self):
        """
        Test if a user can fetch a course feedback
        """
        CourseFeedback.objects.all().delete()
        feedback1 = mommy.make(
            CourseFeedback,
            course=self.course,
            user=self.roger_user,
            rating=4,
        )
        mommy.make(
            CourseFeedback,
            course=self.course,
            user=self.james_user,
            rating=5,
        )

        url = reverse(
            "course-feedbacks-detail",
            kwargs={"course_pk": self.course.id, "pk": feedback1.id},
        )
        response = self.roger_client.get(url)
        self.assertEqual(response.status_code, 200)

    def test_course_member_can_give_feedback(self):
        """
        Test if a course member can give feedback
        """
        CourseFeedback.objects.all().delete()
        CourseMembership.objects.create(user=self.roger_user, course=self.course)
        url = reverse("course-feedbacks-list", kwargs={"course_pk": self.course.id})
        response = self.roger_client.post(
            url,
            data={
                "course": self.course.id,
                "rating": 4,
                "feedback": "Great course",
            },
        )
        self.assertEqual(response.status_code, 201)
        self.assertTrue(
            CourseFeedback.objects.filter(
                course=self.course, user=self.roger_user
            ).exists()
        )

    def test_nonexistent_course_member_cannot_give_feedback(self):
        """
        Test if a non-course member cannot give feedback
        """
        CourseFeedback.objects.all().delete()
        CourseMembership.objects.all().delete()
        url = reverse("course-feedbacks-list", kwargs={"course_pk": 999})
        response = self.roger_client.post(
            url,
            data={
                "course": 999,
                "rating": 4,
                "feedback": "Great course",
            },
        )
        self.assertEqual(response.status_code, 403)
        self.assertFalse(
            CourseFeedback.objects.filter(
                course=self.course, user=self.roger_user
            ).exists()
        )

    def test_non_course_member_cannot_give_feedback(self):
        """
        Test if a non-course member cannot give feedback
        """
        CourseFeedback.objects.all().delete()
        CourseMembership.objects.all().delete()
        url = reverse("course-feedbacks-list", kwargs={"course_pk": self.course.id})
        response = self.roger_client.post(
            url,
            data={
                "course": self.course.id,
                "rating": 4,
                "feedback": "Great course",
            },
        )
        self.assertEqual(response.status_code, 403)
        self.assertFalse(
            CourseFeedback.objects.filter(
                course=self.course, user=self.roger_user
            ).exists()
        )
