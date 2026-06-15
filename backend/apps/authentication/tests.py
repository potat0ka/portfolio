import json

from django.contrib.auth import get_user_model
from django.test import TestCase, override_settings


User = get_user_model()


class AuthFlowTests(TestCase):
    @override_settings(AUTH_ALLOW_PUBLIC_REGISTRATION=True)
    def test_register_login_refresh_logout(self):
        reg = self.client.post(
            "/api/auth/register/",
            data=json.dumps(
                {"username": "alice", "email": "alice@example.com", "password": "a-Strong_passw0rd!"}
            ),
            content_type="application/json",
        )
        self.assertEqual(reg.status_code, 201)
        self.assertTrue(User.objects.filter(username="alice").exists())

        login = self.client.post(
            "/api/auth/login/",
            data=json.dumps({"username": "alice", "password": "a-Strong_passw0rd!"}),
            content_type="application/json",
        )
        self.assertEqual(login.status_code, 200)
        self.assertIn("access", login.json())
        self.assertIn("refresh", login.json())

        refresh = self.client.post(
            "/api/auth/refresh/",
            data=json.dumps({"refresh": login.json()["refresh"]}),
            content_type="application/json",
        )
        self.assertEqual(refresh.status_code, 200)
        self.assertIn("access", refresh.json())

        logout = self.client.post(
            "/api/auth/logout/",
            data=json.dumps({"refresh": login.json()["refresh"]}),
            content_type="application/json",
        )
        self.assertEqual(logout.status_code, 204)

    def test_register_disabled_by_default(self):
        resp = self.client.post(
            "/api/auth/register/",
            data=json.dumps(
                {"username": "blocked", "email": "blocked@example.com", "password": "a-Strong_passw0rd!"}
            ),
            content_type="application/json",
        )
        self.assertEqual(resp.status_code, 403)
