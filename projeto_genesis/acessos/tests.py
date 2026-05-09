from django.test import TestCase, Client
from django.contrib.auth.models import User
from fluxogramas.models import Fluxograma
from acessos.models import AcessoRecente


class AcessoRegistroTestCase(TestCase):
    def setUp(self):
        self.client = Client()
        self.user = User.objects.create_user(username='testuser', password='pass123')
        self.client.force_login(self.user)

        self.fluxo = Fluxograma.objects.create(
            titulo='Protocol A',
            descricao='Description A',
            conteudo={'steps': []}
        )

    def test_registrar_acesso_first_time(self):
        response = self.client.get(f'/api/acessos/registrar/{self.fluxo.id}/')

        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data['quantidade_de_acessos'], 1)

        acesso = AcessoRecente.objects.get(usuario=self.user, fluxograma=self.fluxo)
        self.assertEqual(acesso.quantidade_de_acessos, 1)

    def test_registrar_acesso_increments(self):
        # First access
        self.client.get(f'/api/acessos/registrar/{self.fluxo.id}/')

        # Second access
        response = self.client.get(f'/api/acessos/registrar/{self.fluxo.id}/')

        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data['quantidade_de_acessos'], 2)

        acesso = AcessoRecente.objects.get(usuario=self.user, fluxograma=self.fluxo)
        self.assertEqual(acesso.quantidade_de_acessos, 2)

    def test_registrar_acesso_unauthenticated(self):
        client_unauth = Client()
        response = client_unauth.get(f'/api/acessos/registrar/{self.fluxo.id}/')

        self.assertEqual(response.status_code, 401)

    def test_registrar_acesso_nonexistent_fluxograma(self):
        from fluxogramas.models import Fluxograma
        with self.assertRaises(Fluxograma.DoesNotExist):
            self.client.get('/api/acessos/registrar/99999/')


class AcessoRecientesTestCase(TestCase):
    def setUp(self):
        self.client = Client()
        self.user = User.objects.create_user(username='testuser', password='pass123')
        self.client.force_login(self.user)

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
        self.fluxo3 = Fluxograma.objects.create(
            titulo='Protocol C',
            descricao='Description C',
            conteudo={'steps': []}
        )

    def test_listar_acessos_recentes(self):
        AcessoRecente.objects.create(usuario=self.user, fluxograma=self.fluxo1, quantidade_de_acessos=5)
        AcessoRecente.objects.create(usuario=self.user, fluxograma=self.fluxo2, quantidade_de_acessos=3)

        response = self.client.get('/api/acessos/recentes/')

        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(len(data), 2)

    def test_listar_acessos_recentes_unauthenticated(self):
        client_unauth = Client()
        response = client_unauth.get('/api/acessos/recentes/')

        self.assertEqual(response.status_code, 401)

    def test_listar_acessos_recentes_empty(self):
        response = self.client.get('/api/acessos/recentes/')

        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(len(data), 0)

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
        data = response.json()
        self.assertEqual(len(data), 10)
