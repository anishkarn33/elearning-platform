from django.urls import reverse

from core.tests import BaseAPITestCase


class AccountsAPITestCase(BaseAPITestCase):

    def test_user_can_login(self):
        url = reverse("jwt-create")
        payload = {"username": self.roger_user.username, "password": "2424df22"}
        response = self.client.post(url, payload)
        self.assertEqual(response.status_code, 200)
        expected = ["refresh", "access"]
        for key in expected:
            self.assertNotEqual(response.json().get("data").get(key), None)

    def test_user_can_refresh_credentials(self):
        url = reverse("jwt-create")
        payload = {"username": self.roger_user.username, "password": "2424df22"}
        response = self.client.post(url, payload)
        refresh_token = response.json().get("data").get("refresh")

        # Now that we have the token we can refresh.
        url = reverse("jwt-refresh")
        payload = {"refresh": refresh_token}
        response = self.client.post(url, payload)
        self.assertEqual(response.status_code, 200)
        self.assertNotEqual(response.json().get("data").get("access"), None)

    def test_incorrect_credentials(self):
        url = reverse("jwt-create")
        payload = {"username": self.roger_user.username, "password": "WRONGPASSWORD"}
        response = self.client.post(url, payload)
        self.assertEqual(response.status_code, 401)
        self.assertNotEqual(response.json().get("detail"), None)

    def test_user_can_register(self):
        url = reverse("user-list")
        payload = {
            "username": "newuser",
            "password": "somepassword1",
            "firstName": "New",
            "lastName": "User",
            "email": "newuser@asdf.com",
            "nationality": "Nepalese",
            "location": "Kathmandu, Nepal",
            "phone": "9860479861",
            "countryCode": "+977",
        }
        response = self.client.post(url, payload)
        self.assertEqual(response.status_code, 201)
        self.assertNotEqual(response.json().get("data").get("email"), None)
        self.assertEqual(
            response.json().get("data").get("firstName"), payload["firstName"]
        )
        self.assertEqual(
            response.json().get("data").get("lastName"), payload["lastName"]
        )
        self.assertEqual(response.json().get("data").get("email"), payload["email"])
        self.assertEqual(
            response.json().get("data").get("nationality"), payload["nationality"]
        )
        self.assertEqual(
            response.json().get("data").get("location"), payload["location"]
        )

    def test_user_can_update_profile(self):
        url = reverse("user-me")
        payload = {
            "firstName": "Roger",
            "lastName": "Waters",
            "email": "newemail@getnada.com",
            "hideEmail": True,
        }
        response = self.roger_client.put(url, payload)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(
            response.json().get("data").get("firstName"), payload["firstName"]
        )
        self.assertEqual(
            response.json().get("data").get("lastName"), payload["lastName"]
        )
        self.assertEqual(
            response.json().get("data").get("email"), self.roger_user.email
        )

    def test_user_can_get_their_profile(self):
        url = reverse("user-me")
        response = self.roger_client.get(url)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(
            response.json().get("data").get("email"), self.roger_user.email
        )

    def test_user_can_get_other_user_data(self):
        url = reverse("user-detail", args=[self.roger_user.id])
        response = self.sally_client.get(url)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(
            response.json().get("data").get("email"), self.roger_user.email
        )

    def test_user_can_get_other_user_profile(self):
        url = reverse("user-profile", args=[self.roger_user.id])
        response = self.sally_client.get(url)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(
            response.json().get("data").get("email"), self.roger_profile.email
        )

    def test_user_can_change_password(self):
        url = reverse("user-change-password")
        payload = {
            "old_password": "2424df22",
            "new_password": "newpassword",
        }
        response = self.roger_client.post(url, payload)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json().get("detail"), "Password changed successfully")

    def test_user_cannot_change_password_with_incorrect_old_password(self):
        url = reverse("user-change-password")
        payload = {
            "old_password": "WRONGPASSWORD",
            "new_password": "newpassword",
        }
        response = self.roger_client.post(url, payload)
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.json().get("detail"), "Wrong password provided")
