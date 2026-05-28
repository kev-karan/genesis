from django.test import TestCase, override_settings
from django.contrib.auth.models import User
from rest_framework.test import APIClient
from rest_framework.authtoken.models import Token

FAST_PASSWORD_HASHERS = ["django.contrib.auth.hashers.MD5PasswordHasher"]


@override_settings(PASSWORD_HASHERS=FAST_PASSWORD_HASHERS)
class CadastroTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.url = '/api/auth/cadastro/'

    def test_cadastro_success(self):
        response = self.client.post(self.url, {
            'email': 'novo@example.com',
            'password': 'senha123',
            'confirmPassword': 'senha123',
        }, format='json')

        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.data['mensagem'], 'Conta criada com sucesso')
        self.assertEqual(response.data['email'], 'novo@example.com')
        self.assertTrue(User.objects.filter(username='novo@example.com', email='novo@example.com').exists())

    def test_cadastro_missing_fields(self):
        response = self.client.post(self.url, {
            'email': 'novo@example.com',
        }, format='json')

        self.assertEqual(response.status_code, 400)
        self.assertIn('erro', response.data)

    def test_cadastro_password_mismatch(self):
        response = self.client.post(self.url, {
            'email': 'novo@example.com',
            'password': 'senha123',
            'confirmPassword': 'outraSenha',
        }, format='json')

        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.data['erro'], 'As senhas não coincidem')

    def test_cadastro_duplicate_email(self):
        User.objects.create_user(username='existente@example.com', email='existente@example.com', password='senha123')

        response = self.client.post(self.url, {
            'email': 'existente@example.com',
            'password': 'senha123',
            'confirmPassword': 'senha123',
        }, format='json')

        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.data['erro'], 'Já existe uma conta com esse email')

    def test_usuario_cadastrado_consegue_logar(self):
        self.client.post(self.url, {
            'email': 'novo@example.com',
            'password': 'senha123',
            'confirmPassword': 'senha123',
        }, format='json')

        response = self.client.post('/api/auth/login/', {
            'username': 'novo@example.com',
            'password': 'senha123',
        }, format='json')

        self.assertEqual(response.status_code, 200)
        self.assertIn('token', response.data)
        self.assertEqual(response.data['email'], 'novo@example.com')


@override_settings(PASSWORD_HASHERS=FAST_PASSWORD_HASHERS)
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

    def test_login_reuses_existing_token(self):
        token = Token.objects.create(user=self.user)

        response = self.client.post('/api/auth/login/', {
            'username': 'testuser',
            'password': 'password123'
        }, format='json')

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['token'], token.key)
        self.assertEqual(Token.objects.filter(user=self.user).count(), 1)


@override_settings(PASSWORD_HASHERS=FAST_PASSWORD_HASHERS)
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

    def test_logout_unauthenticated(self):
        self.client.credentials()

        response = self.client.post('/api/auth/logout/')

        self.assertEqual(response.status_code, 401)
