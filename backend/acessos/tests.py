from django.test import TestCase, override_settings
from django.contrib.auth.models import User
from rest_framework.test import APIClient
from rest_framework.authtoken.models import Token
from fluxogramas.models import Fluxograma
from acessos.models import AcessoRecente

FAST_PASSWORD_HASHERS = ["django.contrib.auth.hashers.MD5PasswordHasher"]


class AuthenticatedAPITestCase(TestCase):
    def autenticar(self, username='testuser'):
        user = User.objects.create_user(username=username, password='pass123')
        token = Token.objects.create(user=user)
        client = APIClient()
        client.credentials(HTTP_AUTHORIZATION=f'Token {token.key}')
        return client, user


@override_settings(PASSWORD_HASHERS=FAST_PASSWORD_HASHERS)
class AcessoRegistroTestCase(AuthenticatedAPITestCase):
    def setUp(self):
        self.client, self.user = self.autenticar()
        self.fluxo = Fluxograma.objects.create(
            titulo='Protocol A',
            descricao='Description A',
            conteudo={'steps': []}
        )

    def test_registrar_acesso_first_time(self):
        response = self.client.post(f'/api/acessos/registrar/{self.fluxo.id}/')

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['quantidade_de_acessos'], 1)

        acesso = AcessoRecente.objects.get(usuario=self.user, fluxograma=self.fluxo)
        self.assertEqual(acesso.quantidade_de_acessos, 1)

    def test_registrar_acesso_increments(self):
        self.client.post(f'/api/acessos/registrar/{self.fluxo.id}/')
        response = self.client.post(f'/api/acessos/registrar/{self.fluxo.id}/')

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['quantidade_de_acessos'], 2)

        acesso = AcessoRecente.objects.get(usuario=self.user, fluxograma=self.fluxo)
        self.assertEqual(acesso.quantidade_de_acessos, 2)

    def test_registrar_acesso_unauthenticated(self):
        client_unauth = APIClient()

        response = client_unauth.post(f'/api/acessos/registrar/{self.fluxo.id}/')

        self.assertEqual(response.status_code, 401)

    def test_registrar_acesso_nonexistent_fluxograma(self):
        response = self.client.post('/api/acessos/registrar/99999/')

        self.assertEqual(response.status_code, 404)
        self.assertEqual(response.data['erro'], 'Fluxograma não encontrado')


@override_settings(PASSWORD_HASHERS=FAST_PASSWORD_HASHERS)
class AcessosRecentesTestCase(AuthenticatedAPITestCase):
    def setUp(self):
        self.client, self.user = self.autenticar()
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

    def test_listar_acessos_recentes(self):
        AcessoRecente.objects.create(usuario=self.user, fluxograma=self.fluxo1, quantidade_de_acessos=5)
        AcessoRecente.objects.create(usuario=self.user, fluxograma=self.fluxo2, quantidade_de_acessos=3)

        response = self.client.get('/api/acessos/recentes/')

        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 2)
        titulos = {item['titulo'] for item in response.data}
        self.assertEqual(titulos, {'Protocol A', 'Protocol B'})

    def test_listar_acessos_recentes_unauthenticated(self):
        client_unauth = APIClient()

        response = client_unauth.get('/api/acessos/recentes/')

        self.assertEqual(response.status_code, 401)

    def test_listar_acessos_recentes_empty(self):
        response = self.client.get('/api/acessos/recentes/')

        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 0)

    def test_listar_acessos_recentes_max_10(self):
        for i in range(15):
            fluxo = Fluxograma.objects.create(
                titulo=f'Protocol {i}',
                descricao=f'Description {i}',
                conteudo={'steps': []}
            )
            AcessoRecente.objects.create(usuario=self.user, fluxograma=fluxo, quantidade_de_acessos=i)

        response = self.client.get('/api/acessos/recentes/')

        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 10)

    def test_usuario_nao_ve_acessos_de_outro_usuario(self):
        outro_usuario = User.objects.create_user(username='outro', password='pass123')
        AcessoRecente.objects.create(usuario=outro_usuario, fluxograma=self.fluxo1, quantidade_de_acessos=10)

        response = self.client.get('/api/acessos/recentes/')

        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 0)
