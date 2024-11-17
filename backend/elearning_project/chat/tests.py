from model_mommy import mommy

from django.urls import reverse

from core.tests import BaseAPITestCase
from chat.models import ChatGroup, ChatMembership, ChatMessage


class ChatGroupAPITestCase(BaseAPITestCase):

    def setUp(self):
        super(ChatGroupAPITestCase, self).setUp()
        self.course = mommy.make("courses.Course")

    def test_user_can_list_chats(self):
        ChatGroup.objects.all().delete()
        url = reverse("course-chat-list", kwargs={"course_pk": self.course.pk})
        # crreate fake chat group for roger client
        chat_group = ChatGroup.objects.create(
            course=self.course,
            name="Individual Chat Group",
            created_by=self.roger_user,
            admin=self.roger_user,
        )
        ChatGroup.objects.create(course=self.course, name="Other Group Chat")
        ChatMembership.objects.create(user=self.roger_user, chat_group=chat_group)
        ChatMembership.objects.create(user=self.james_user, chat_group=chat_group)
        ChatMessage.objects.create(
            user=self.james_user, chat_group=chat_group, text="Hello"
        )
        ChatMessage.objects.create(
            user=self.james_user, chat_group=chat_group, text="Hello later but first"
        )
        respone = self.roger_client.get(url)
        self.assertEqual(respone.status_code, 200)

    def test_user_can_create_chat_group(self):
        # fake participants
        u1 = mommy.make("accounts.User")
        u2 = mommy.make("accounts.User")
        url = reverse("course-chat-list", kwargs={"course_pk": self.course.pk})
        data = {
            "name": "Group Chat Group",
            "photo": "https://www.google.com/images/branding/googlelogo/2x/googlelogo_color_272x92dp.png",
            "members": [u1.pk, u2.pk],
            "chatType": "group",
        }
        respone = self.roger_client.post(url, data=data, format="json")
        self.assertEqual(respone.status_code, 201)

    def test_user_can_fetch_other_user_chat_group(self):
        # fake course
        course1 = mommy.make("courses.Course")
        course2 = mommy.make("courses.Course")  # noqa
        # fake users
        u1 = mommy.make("accounts.User")
        u2 = mommy.make("accounts.User")
        u3 = mommy.make("accounts.User")
        # fake individual chat groups
        cg1 = mommy.make(
            "chat.ChatGroup",
            course=course1,
            name="Individual Chat Group",
            chat_type="individual",
        )
        cg2 = mommy.make(
            "chat.ChatGroup",
            course=course1,
            name="Other Individual Group Chat",
            chat_type="individual",
        )
        # fake participants
        # for cg1
        cm11 = mommy.make("chat.ChatMembership", user=u1, chat_group=cg1)  # noqa
        cm12 = mommy.make(  # noqa
            "chat.ChatMembership", user=self.roger_user, chat_group=cg1
        )
        # for cg2
        cm21 = mommy.make("chat.ChatMembership", user=u2, chat_group=cg2)  # noqa
        cm22 = mommy.make(  # noqa
            "chat.ChatMembership", user=self.roger_user, chat_group=cg2
        )

        url = reverse(
            "course-chat-individual",
            kwargs={
                "course_pk": course1.pk,
            },
        )
        response = self.roger_client.get(f"{url}?user_id={u1.pk}")
        self.assertEqual(response.status_code, 200)

        response = self.roger_client.get(f"{url}?user_id={u3.pk}")
        self.assertEqual(response.status_code, 200)


class ChatGroupMessagesAPITestCase(BaseAPITestCase):

    def setUp(self):
        super(ChatGroupMessagesAPITestCase, self).setUp()
        self.course = mommy.make("courses.Course")
        self.chat_group = mommy.make("chat.ChatGroup", course=self.course)

    def test_user_can_list_messages(self):
        ChatMessage.objects.all().delete()
        # dummy chat members
        roger = ChatMembership.objects.create(  # noqa
            chat_group=self.chat_group, user=self.roger_user
        )
        james = ChatMembership.objects.create(  # noqa
            chat_group=self.chat_group, user=self.james_user
        )

        msg_1 = ChatMessage.objects.create(  # noqa
            chat_group=self.chat_group, user=self.roger_user, text="Hello"
        )
        msg_2 = ChatMessage.objects.create(  # noqa
            chat_group=self.chat_group,
            user=self.james_user,
            text="Hello later but first",
        )

        url = reverse(
            "chat-message-list",
            kwargs={"course_pk": self.course.pk, "chat_pk": self.chat_group.pk},
        )
        response = self.roger_client.get(url)
        self.assertEqual(response.status_code, 200)
