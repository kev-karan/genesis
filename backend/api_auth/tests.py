from django.test import TestCase
from django.contrib.auth.models import User
from rest_framework.test import APIClient
from rest_framework.authtoken.models import Token


class LoginTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='password123'
        )

    def test_login_success(self):
        response = self.client.post('/api/auth/login/', {
            'username': 'testuser',
            'password': 'password123'
        }, format='json')

        self.assertEqual(response.status_code, 200)
        self.assertIn('token', response.data)
        self.assertEqual(response.data['username'], 'testuser')
        self.assertEqual(response.data['email'], 'test@example.com')

    def test_login_invalid_credentials(self):
        response = self.client.post('/api/auth/login/', {
            'username': 'testuser',
            'password': 'wrongpassword'
        }, format='json')

        self.assertEqual(response.status_code, 401)
        self.assertIn('erro', response.data)

    def test_login_missing_username(self):
        response = self.client.post('/api/auth/login/', {
            'password': 'password123'
        }, format='json')

        self.assertEqual(response.status_code, 400)
        self.assertIn('erro', response.data)

    def test_login_missing_password(self):
        response = self.client.post('/api/auth/login/', {
            'username': 'testuser'
        }, format='json')

        self.assertEqual(response.status_code, 400)
        self.assertIn('erro', response.data)

    def test_login_creates_token(self):
        response = self.client.post('/api/auth/login/', {
            'username': 'testuser',
            'password': 'password123'
        }, format='json')

        self.assertEqual(response.status_code, 200)
        token = Token.objects.get(user=self.user)
        self.assertEqual(response.data['token'], token.key)


class LogoutTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username='testuser',
            password='password123'
        )
        self.token = Token.objects.create(user=self.user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.token.key}')

    def test_logout_success(self):
        response = self.client.post('/api/auth/logout/')

        self.assertEqual(response.status_code, 200)
        self.assertFalse(Token.objects.filter(user=self.user).exists())

    def test_logout_removes_token(self):
        self.assertTrue(Token.objects.filter(user=self.user).exists())

        self.client.post('/api/auth/logout/')

        self.assertFalse(Token.objects.filter(user=self.user).exists())
