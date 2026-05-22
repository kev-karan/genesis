from django.test import TestCase
from django.contrib.auth.models import User
from rest_framework.test import APIClient
from rest_framework.authtoken.models import Token

from .models import CasoClinico, Questao, RespostaUsuario


class CasosURLTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(username='testuser', password='pass')
        token, _ = Token.objects.get_or_create(user=self.user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {token.key}')
        self.caso = CasoClinico.objects.create(titulo='Caso Teste', descricao='Desc', ativo=True)

    def test_listar_casos_url(self):
        response = self.client.get('/api/casos/')
        self.assertEqual(response.status_code, 200)

    def test_detalhe_caso_url(self):
        response = self.client.get(f'/api/casos/{self.caso.id}/')
        self.assertEqual(response.status_code, 200)


class ResponderCasoTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(username='testuser', password='pass')
        token, _ = Token.objects.get_or_create(user=self.user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {token.key}')
        self.caso = CasoClinico.objects.create(titulo='Caso Teste', descricao='Desc')
        self.questao = Questao.objects.create(
            caso_clinico=self.caso,
            enunciado='Qual o diagnóstico?',
            resposta_esperada='Dengue',
            ordem=1,
        )

    def test_resposta_correta(self):
        response = self.client.post(f'/api/casos/{self.caso.id}/responder/', {
            'questao_id': self.questao.id,
            'resposta': 'dengue',
        }, format='json')
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.data['correto'])

    def test_resposta_errada(self):
        response = self.client.post(f'/api/casos/{self.caso.id}/responder/', {
            'questao_id': self.questao.id,
            'resposta': 'malaria',
        }, format='json')
        self.assertEqual(response.status_code, 200)
        self.assertFalse(response.data['correto'])

    def test_resposta_salva_no_banco(self):
        self.client.post(f'/api/casos/{self.caso.id}/responder/', {
            'questao_id': self.questao.id,
            'resposta': 'dengue',
        }, format='json')
        self.assertTrue(RespostaUsuario.objects.filter(usuario=self.user, questao=self.questao).exists())

    def test_resposta_esperada_nula(self):
        questao_sem_resposta = Questao.objects.create(
            caso_clinico=self.caso,
            enunciado='Questão aberta',
            resposta_esperada=None,
            ordem=2,
        )
        response = self.client.post(f'/api/casos/{self.caso.id}/responder/', {
            'questao_id': questao_sem_resposta.id,
            'resposta': 'qualquer coisa',
        }, format='json')
        self.assertEqual(response.status_code, 200)
        self.assertIsNone(response.data['correto'])


class RaciocinioCasoTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(username='testuser', password='pass')
        token, _ = Token.objects.get_or_create(user=self.user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {token.key}')
        self.caso = CasoClinico.objects.create(titulo='Caso Teste', descricao='Desc')
        self.questao = Questao.objects.create(
            caso_clinico=self.caso,
            enunciado='Qual o diagnóstico?',
            resposta_esperada='Dengue',
            ordem=1,
        )

    def test_raciocinio_bloqueado_sem_resposta(self):
        response = self.client.get(f'/api/casos/{self.caso.id}/raciocinio/')
        self.assertEqual(response.status_code, 403)

    def test_raciocinio_acessivel_apos_responder(self):
        RespostaUsuario.objects.create(
            usuario=self.user,
            questao=self.questao,
            resposta='dengue',
            correta=True,
        )
        response = self.client.get(f'/api/casos/{self.caso.id}/raciocinio/')
        self.assertEqual(response.status_code, 200)
