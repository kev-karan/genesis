from django.test import TestCase, override_settings
from django.contrib.auth.models import User
from rest_framework.test import APIClient
from rest_framework.authtoken.models import Token
from fluxogramas.models import Fluxograma
from favoritos.models import Favorito

FAST_PASSWORD_HASHERS = ["django.contrib.auth.hashers.MD5PasswordHasher"]


class AuthenticatedAPITestCase(TestCase):
    def autenticar(self, username='testuser'):
        user = User.objects.create_user(username=username, password='pass123')
        token = Token.objects.create(user=user)
        client = APIClient()
        client.credentials(HTTP_AUTHORIZATION=f'Token {token.key}')
        return client, user

    def criar_fluxograma(self, titulo='Protocol A'):
        return Fluxograma.objects.create(
            titulo=titulo,
            descricao=f'Description for {titulo}',
            conteudo={'steps': []}
        )


@override_settings(PASSWORD_HASHERS=FAST_PASSWORD_HASHERS)
class FavoritoListTestCase(AuthenticatedAPITestCase):
    def setUp(self):
        self.client, self.user = self.autenticar()
        self.fluxo1 = self.criar_fluxograma('Protocol A')
        self.fluxo2 = self.criar_fluxograma('Protocol B')
        Favorito.objects.create(usuario=self.user, fluxograma=self.fluxo1)
        Favorito.objects.create(usuario=self.user, fluxograma=self.fluxo2)

    def test_list_favorites_authenticated(self):
        response = self.client.get('/api/favoritos/meus-favoritos/')

        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.json()), 2)
        self.assertEqual(response.json()[0]['titulo'], 'Protocol A')
        self.assertIn('fluxograma_id', response.json()[0])

    def test_list_favorites_unauthenticated(self):
        response = APIClient().get('/api/favoritos/meus-favoritos/')

        self.assertEqual(response.status_code, 401)

    def test_list_favorites_empty(self):
        client2, _ = self.autenticar(username='user2')

        response = client2.get('/api/favoritos/meus-favoritos/')

        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.json()), 0)

    def test_usuario_nao_ve_favoritos_de_outro_usuario(self):
        client2, _ = self.autenticar(username='user2')

        response = client2.get('/api/favoritos/meus-favoritos/')

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), [])


@override_settings(PASSWORD_HASHERS=FAST_PASSWORD_HASHERS)
class FavoritoCreateTestCase(AuthenticatedAPITestCase):
    def setUp(self):
        self.client, self.user = self.autenticar()
        self.fluxo = self.criar_fluxograma('Protocol A')

    def test_favoritar_success(self):
        response = self.client.post(f'/api/favoritos/favoritar/{self.fluxo.id}/')

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()['fluxograma_titulo'], 'Protocol A')
        self.assertEqual(response.json()['status'], 'favoritado com sucesso')
        self.assertTrue(Favorito.objects.filter(usuario=self.user, fluxograma=self.fluxo).exists())

    def test_favoritar_unauthenticated(self):
        response = APIClient().post(f'/api/favoritos/favoritar/{self.fluxo.id}/')

        self.assertEqual(response.status_code, 401)

    def test_favoritar_nonexistent_fluxograma(self):
        response = self.client.post('/api/favoritos/favoritar/99999/')

        self.assertEqual(response.status_code, 404)

    def test_favoritar_duplicate_does_not_create_two_records(self):
        Favorito.objects.create(usuario=self.user, fluxograma=self.fluxo)

        response = self.client.post(f'/api/favoritos/favoritar/{self.fluxo.id}/')

        self.assertEqual(response.status_code, 200)
        count = Favorito.objects.filter(usuario=self.user, fluxograma=self.fluxo).count()
        self.assertEqual(count, 1)


@override_settings(PASSWORD_HASHERS=FAST_PASSWORD_HASHERS)
class FavoritoDeleteTestCase(AuthenticatedAPITestCase):
    def setUp(self):
        self.client, self.user = self.autenticar()
        self.fluxo = self.criar_fluxograma('Protocol A')
        self.favorito = Favorito.objects.create(usuario=self.user, fluxograma=self.fluxo)

    def test_remover_favorito_success(self):
        response = self.client.delete(f'/api/favoritos/remover/{self.fluxo.id}/')

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()['status'], 'removido com sucesso')
        self.assertFalse(Favorito.objects.filter(usuario=self.user, fluxograma=self.fluxo).exists())

    def test_remover_favorito_unauthenticated(self):
        response = APIClient().delete(f'/api/favoritos/remover/{self.fluxo.id}/')

        self.assertEqual(response.status_code, 401)

    def test_remover_nonexistent_favorito(self):
        fluxo2 = self.criar_fluxograma('Protocol B')

        response = self.client.delete(f'/api/favoritos/remover/{fluxo2.id}/')

        self.assertEqual(response.status_code, 404)
        self.assertEqual(response.json()['erro'], 'Favorito não encontrado')

    def test_remover_fluxograma_inexistente(self):
        response = self.client.delete('/api/favoritos/remover/99999/')

        self.assertEqual(response.status_code, 404)
