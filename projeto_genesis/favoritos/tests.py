from django.test import TestCase
from django.contrib.auth.models import User
from rest_framework.test import APIClient
from rest_framework.authtoken.models import Token
from fluxogramas.models import Fluxograma
from favoritos.models import Favorito


class FavoritoListTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(username='testuser', password='pass123')
        self.token = Token.objects.create(user=self.user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.token.key}')

        self.fluxo1 = Fluxograma.objects.create(
            titulo='Protocol A',
            descricao='Description A',
            conteudo={'steps': []}
        )
        self.fluxo2 = Fluxograma.objects.create(
            titulo='Protocol B',
            descricao='Description B',
            conteudo={'steps': []}
        )

        Favorito.objects.create(usuario=self.user, fluxograma=self.fluxo1)
        Favorito.objects.create(usuario=self.user, fluxograma=self.fluxo2)

    def test_list_favorites_authenticated(self):
        response = self.client.get('/api/favoritos/meus-favoritos/')

        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(len(data), 2)
        self.assertEqual(data[0]['titulo'], 'Protocol A')

    def test_list_favorites_unauthenticated(self):
        self.client.credentials()
        response = self.client.get('/api/favoritos/meus-favoritos/')

        self.assertEqual(response.status_code, 401)

    def test_list_favorites_empty(self):
        user2 = User.objects.create_user(username='user2', password='pass123')
        token2 = Token.objects.create(user=user2)
        client2 = APIClient()
        client2.credentials(HTTP_AUTHORIZATION=f'Token {token2.key}')

        response = client2.get('/api/favoritos/meus-favoritos/')

        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(len(data), 0)


class FavoritoCreateTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(username='testuser', password='pass123')
        self.token = Token.objects.create(user=self.user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.token.key}')

        self.fluxo = Fluxograma.objects.create(
            titulo='Protocol A',
            descricao='Description A',
            conteudo={'steps': []}
        )

    def test_favoritar_success(self):
        response = self.client.post(f'/api/favoritos/favoritar/{self.fluxo.id}/')

        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data['fluxograma_titulo'], 'Protocol A')
        self.assertTrue(Favorito.objects.filter(usuario=self.user, fluxograma=self.fluxo).exists())

    def test_favoritar_unauthenticated(self):
        self.client.credentials()
        response = self.client.post(f'/api/favoritos/favoritar/{self.fluxo.id}/')

        self.assertEqual(response.status_code, 401)

    def test_favoritar_nonexistent_fluxograma(self):
        response = self.client.post('/api/favoritos/favoritar/99999/')

        self.assertEqual(response.status_code, 404)

    def test_favoritar_duplicate(self):
        Favorito.objects.create(usuario=self.user, fluxograma=self.fluxo)

        response = self.client.post(f'/api/favoritos/favoritar/{self.fluxo.id}/')

        self.assertEqual(response.status_code, 200)
        # Should return the existing favorite, not create a new one
        count = Favorito.objects.filter(usuario=self.user, fluxograma=self.fluxo).count()
        self.assertEqual(count, 1)


class FavoritoDeleteTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(username='testuser', password='pass123')
        self.token = Token.objects.create(user=self.user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.token.key}')

        self.fluxo = Fluxograma.objects.create(
            titulo='Protocol A',
            descricao='Description A',
            conteudo={'steps': []}
        )
        self.favorito = Favorito.objects.create(usuario=self.user, fluxograma=self.fluxo)

    def test_remover_favorito_success(self):
        response = self.client.delete(f'/api/favoritos/remover/{self.fluxo.id}/')

        self.assertEqual(response.status_code, 200)
        self.assertFalse(Favorito.objects.filter(usuario=self.user, fluxograma=self.fluxo).exists())

    def test_remover_favorito_unauthenticated(self):
        self.client.credentials()
        response = self.client.delete(f'/api/favoritos/remover/{self.fluxo.id}/')

        self.assertEqual(response.status_code, 401)

    def test_remover_nonexistent_favorito(self):
        fluxo2 = Fluxograma.objects.create(
            titulo='Protocol B',
            descricao='Description B',
            conteudo={'steps': []}
        )
        response = self.client.delete(f'/api/favoritos/remover/{fluxo2.id}/')

        self.assertEqual(response.status_code, 404)
