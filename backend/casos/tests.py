from django.test import TestCase
from django.contrib.auth.models import User
from rest_framework.test import APIClient
from rest_framework.authtoken.models import Token

from .models import CasoClinico, Questao, OpcaoResposta, RespostaUsuario


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

    def test_resposta_numerica_correta(self):
        questao_num = Questao.objects.create(
            caso_clinico=self.caso,
            enunciado='Calcule o IMC',
            tipo='numerica',
            resposta_esperada='24.2',
            ordem=2,
        )
        for resposta in ['24.2', '24,2', '24.20', ' 24.2 ']:
            RespostaUsuario.objects.filter(usuario=self.user, questao=questao_num).delete()
            response = self.client.post(f'/api/casos/{self.caso.id}/responder/', {
                'questao_id': questao_num.id,
                'resposta': resposta,
            }, format='json')
            self.assertTrue(response.data['correto'], f"Falhou para '{resposta}'")

    def test_resposta_numerica_errada(self):
        questao_num = Questao.objects.create(
            caso_clinico=self.caso,
            enunciado='Calcule o IMC',
            tipo='numerica',
            resposta_esperada='24.2',
            ordem=2,
        )
        response = self.client.post(f'/api/casos/{self.caso.id}/responder/', {
            'questao_id': questao_num.id,
            'resposta': '30.0',
        }, format='json')
        self.assertFalse(response.data['correto'])

    def test_resposta_esperada_nula(self):
        questao_sem_resposta = Questao.objects.create(
            caso_clinico=self.caso,
            enunciado='Questão sem gabarito',
            tipo='binaria',
            resposta_esperada=None,
            ordem=2,
        )
        response = self.client.post(f'/api/casos/{self.caso.id}/responder/', {
            'questao_id': questao_sem_resposta.id,
            'resposta': 'qualquer coisa',
        }, format='json')
        self.assertEqual(response.status_code, 200)
        self.assertIsNone(response.data['correto'])

    def test_multipla_escolha_correta(self):
        questao_mc = Questao.objects.create(
            caso_clinico=self.caso,
            enunciado='Qual o tratamento?',
            tipo='multipla_escolha',
            ordem=2,
        )
        OpcaoResposta.objects.create(questao=questao_mc, texto='Ibuprofeno', correta=False, ordem=1)
        opcao_certa = OpcaoResposta.objects.create(questao=questao_mc, texto='Paracetamol', correta=True, ordem=2)

        response = self.client.post(f'/api/casos/{self.caso.id}/responder/', {
            'questao_id': questao_mc.id,
            'opcao_id': opcao_certa.id,
        }, format='json')
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.data['correto'])

    def test_multipla_escolha_errada(self):
        questao_mc = Questao.objects.create(
            caso_clinico=self.caso,
            enunciado='Qual o tratamento?',
            tipo='multipla_escolha',
            ordem=2,
        )
        opcao_errada = OpcaoResposta.objects.create(questao=questao_mc, texto='Ibuprofeno', correta=False, ordem=1)
        OpcaoResposta.objects.create(questao=questao_mc, texto='Paracetamol', correta=True, ordem=2)

        response = self.client.post(f'/api/casos/{self.caso.id}/responder/', {
            'questao_id': questao_mc.id,
            'opcao_id': opcao_errada.id,
        }, format='json')
        self.assertEqual(response.status_code, 200)
        self.assertFalse(response.data['correto'])

    def test_multipla_escolha_sem_opcao_id(self):
        questao_mc = Questao.objects.create(
            caso_clinico=self.caso,
            enunciado='Qual o tratamento?',
            tipo='multipla_escolha',
            ordem=2,
        )
        response = self.client.post(f'/api/casos/{self.caso.id}/responder/', {
            'questao_id': questao_mc.id,
            'resposta': 'Paracetamol',
        }, format='json')
        self.assertEqual(response.status_code, 400)


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
