from django.test import TestCase, override_settings
from django.contrib.auth.models import User
from rest_framework.test import APIClient
from rest_framework.authtoken.models import Token

from fluxogramas.models import Fluxograma
from casos.models import (
    CasoClinico,
    Questao,
    OpcaoResposta,
    PassoRaciocinio,
    RespostaUsuario,
)

FAST_PASSWORD_HASHERS = ["django.contrib.auth.hashers.MD5PasswordHasher"]


class AuthenticatedAPITestCase(TestCase):
    def autenticar(self, username='testuser'):
        user = User.objects.create_user(username=username, password='pass')
        token, _ = Token.objects.get_or_create(user=user)
        client = APIClient()
        client.credentials(HTTP_AUTHORIZATION=f'Token {token.key}')
        return client, user


@override_settings(PASSWORD_HASHERS=FAST_PASSWORD_HASHERS)
class CasosListDetailTestCase(AuthenticatedAPITestCase):
    def setUp(self):
        self.client, self.user = self.autenticar()
        self.fluxograma = Fluxograma.objects.create(
            titulo='Dengue',
            descricao='Protocolo de dengue',
            conteudo={'steps': []},
        )
        self.caso = CasoClinico.objects.create(
            titulo='Caso Dengue',
            descricao='Paciente com febre',
            contexto='Contexto clínico',
            nivel='facil',
            fluxograma=self.fluxograma,
            ativo=True,
        )
        self.caso_inativo = CasoClinico.objects.create(
            titulo='Caso Inativo',
            descricao='Não deve aparecer',
            ativo=False,
        )
        self.questao = Questao.objects.create(
            caso_clinico=self.caso,
            enunciado='Qual o diagnóstico?',
            resposta_esperada='Dengue',
            ordem=1,
        )

    def test_listar_casos_autenticado(self):
        response = self.client.get('/api/casos/')

        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['titulo'], 'Caso Dengue')

    def test_listar_casos_sem_autenticacao(self):
        response = APIClient().get('/api/casos/')

        self.assertEqual(response.status_code, 401)

    def test_listar_casos_filtra_por_fluxograma(self):
        outro_fluxograma = Fluxograma.objects.create(
            titulo='Asma',
            descricao='Protocolo de asma',
            conteudo={'steps': []},
        )
        CasoClinico.objects.create(
            titulo='Caso Asma',
            descricao='Paciente com sibilância',
            fluxograma=outro_fluxograma,
            ativo=True,
        )

        response = self.client.get(f'/api/casos/?fluxograma={self.fluxograma.id}')

        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['titulo'], 'Caso Dengue')

    def test_detalhe_caso_autenticado(self):
        response = self.client.get(f'/api/casos/{self.caso.id}/')

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['titulo'], 'Caso Dengue')
        self.assertEqual(len(response.data['questoes']), 1)
        self.assertEqual(response.data['questoes'][0]['enunciado'], 'Qual o diagnóstico?')

    def test_detalhe_caso_sem_autenticacao(self):
        response = APIClient().get(f'/api/casos/{self.caso.id}/')

        self.assertEqual(response.status_code, 401)

    def test_detalhe_caso_inativo_retorna_404(self):
        response = self.client.get(f'/api/casos/{self.caso_inativo.id}/')

        self.assertEqual(response.status_code, 404)

    def test_detalhe_caso_inexistente_retorna_404(self):
        response = self.client.get('/api/casos/99999/')

        self.assertEqual(response.status_code, 404)

    def test_questao_tem_campos_obrigatorios(self):
        questao_mc = Questao.objects.create(
            caso_clinico=self.caso,
            enunciado='Qual o tratamento de escolha?',
            tipo='multipla_escolha',
            ordem=2,
        )
        OpcaoResposta.objects.create(questao=questao_mc, texto='Ibuprofeno', correta=False, ordem=1)
        OpcaoResposta.objects.create(questao=questao_mc, texto='Paracetamol', correta=True, ordem=2)

        response = self.client.get(f'/api/casos/{self.caso.id}/')

        self.assertEqual(response.status_code, 200)
        questao_data = next(q for q in response.data['questoes'] if q['tipo'] == 'multipla_escolha')
        self.assertIn('tipo', questao_data)
        self.assertIn('enunciado', questao_data)
        self.assertIn('opcoes', questao_data)
        self.assertEqual(len(questao_data['opcoes']), 2)


@override_settings(PASSWORD_HASHERS=FAST_PASSWORD_HASHERS)
class ResponderCasoTestCase(AuthenticatedAPITestCase):
    def setUp(self):
        self.client, self.user = self.autenticar()
        self.caso = CasoClinico.objects.create(titulo='Caso Teste', descricao='Desc')
        self.questao = Questao.objects.create(
            caso_clinico=self.caso,
            enunciado='Qual o diagnóstico?',
            resposta_esperada='Dengue',
            ordem=1,
        )

    def test_responder_sem_autenticacao(self):
        response = APIClient().post(f'/api/casos/{self.caso.id}/responder/', {
            'questao_id': self.questao.id,
            'resposta': 'dengue',
        }, format='json')

        self.assertEqual(response.status_code, 401)

    def test_resposta_correta(self):
        response = self.client.post(f'/api/casos/{self.caso.id}/responder/', {
            'questao_id': self.questao.id,
            'resposta': 'dengue',
        }, format='json')

        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.data['correto'])
        self.assertEqual(response.data['resposta_correta'], 'Dengue')

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

        resposta = RespostaUsuario.objects.get(usuario=self.user, questao=self.questao)
        self.assertEqual(resposta.resposta, 'dengue')
        self.assertTrue(resposta.correta)

    def test_resposta_sem_questao_id_retorna_400(self):
        response = self.client.post(f'/api/casos/{self.caso.id}/responder/', {
            'resposta': 'dengue',
        }, format='json')

        self.assertEqual(response.status_code, 400)
        self.assertIn('questao_id', response.data)

    def test_resposta_sem_texto_retorna_400(self):
        response = self.client.post(f'/api/casos/{self.caso.id}/responder/', {
            'questao_id': self.questao.id,
            'resposta': '',
        }, format='json')

        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.data['erro'], 'Campo resposta obrigatório.')

    def test_questao_de_outro_caso_retorna_404(self):
        outro_caso = CasoClinico.objects.create(titulo='Outro Caso', descricao='Desc')
        questao_outro_caso = Questao.objects.create(
            caso_clinico=outro_caso,
            enunciado='Outra questão',
            resposta_esperada='Outra resposta',
            ordem=1,
        )

        response = self.client.post(f'/api/casos/{self.caso.id}/responder/', {
            'questao_id': questao_outro_caso.id,
            'resposta': 'Outra resposta',
        }, format='json')

        self.assertEqual(response.status_code, 404)

    def test_resposta_numerica_correta(self):
        questao_num = Questao.objects.create(
            caso_clinico=self.caso,
            enunciado='Calcule o IMC',
            tipo='numerica',
            resposta_esperada='24.2',
            ordem=2,
        )

        for resposta in ['24.2', '24,2', '24.20', ' 24.2 ']:
            with self.subTest(resposta=resposta):
                response = self.client.post(f'/api/casos/{self.caso.id}/responder/', {
                    'questao_id': questao_num.id,
                    'resposta': resposta,
                }, format='json')
                self.assertEqual(response.status_code, 200)
                self.assertTrue(response.data['correto'])

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

        self.assertEqual(response.status_code, 200)
        self.assertFalse(response.data['correto'])

    def test_resposta_numerica_invalida_retorna_400(self):
        questao_num = Questao.objects.create(
            caso_clinico=self.caso,
            enunciado='Calcule o IMC',
            tipo='numerica',
            resposta_esperada='24.2',
            ordem=2,
        )

        response = self.client.post(f'/api/casos/{self.caso.id}/responder/', {
            'questao_id': questao_num.id,
            'resposta': 'abc',
        }, format='json')

        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.data['erro'], 'Resposta deve ser um número.')

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
        self.assertEqual(response.data['resposta_correta'], 'Paracetamol')

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
        self.assertEqual(response.data['erro'], 'Campo opcao_id obrigatório para questões de múltipla escolha.')

    def test_multipla_escolha_opcao_de_outra_questao_retorna_404(self):
        questao_mc = Questao.objects.create(
            caso_clinico=self.caso,
            enunciado='Qual o tratamento?',
            tipo='multipla_escolha',
            ordem=2,
        )
        outra_questao = Questao.objects.create(
            caso_clinico=self.caso,
            enunciado='Outra pergunta',
            tipo='multipla_escolha',
            ordem=3,
        )
        opcao_outra_questao = OpcaoResposta.objects.create(
            questao=outra_questao,
            texto='Opção externa',
            correta=True,
            ordem=1,
        )

        response = self.client.post(f'/api/casos/{self.caso.id}/responder/', {
            'questao_id': questao_mc.id,
            'opcao_id': opcao_outra_questao.id,
        }, format='json')

        self.assertEqual(response.status_code, 404)

    def test_feedback_contextual_correto(self):
        questao_fb = Questao.objects.create(
            caso_clinico=self.caso,
            enunciado='Diagnóstico?',
            tipo='binaria',
            resposta_esperada='Dengue',
            feedback_correto='Exato! Dengue grave com sinais de alarme.',
            feedback_incorreto='Incorreto. Revise os critérios diagnósticos de Dengue.',
            ordem=2,
        )

        response = self.client.post(f'/api/casos/{self.caso.id}/responder/', {
            'questao_id': questao_fb.id,
            'resposta': 'Dengue',
        }, format='json')

        self.assertEqual(response.data['mensagem'], 'Exato! Dengue grave com sinais de alarme.')

    def test_feedback_contextual_incorreto(self):
        questao_fb = Questao.objects.create(
            caso_clinico=self.caso,
            enunciado='Diagnóstico?',
            tipo='binaria',
            resposta_esperada='Dengue',
            feedback_correto='Exato! Dengue grave com sinais de alarme.',
            feedback_incorreto='Incorreto. Revise os critérios diagnósticos de Dengue.',
            ordem=2,
        )

        response = self.client.post(f'/api/casos/{self.caso.id}/responder/', {
            'questao_id': questao_fb.id,
            'resposta': 'Malária',
        }, format='json')

        self.assertEqual(response.data['mensagem'], 'Incorreto. Revise os critérios diagnósticos de Dengue.')

    def test_feedback_generico_quando_ausente(self):
        response = self.client.post(f'/api/casos/{self.caso.id}/responder/', {
            'questao_id': self.questao.id,
            'resposta': 'errado',
        }, format='json')

        self.assertEqual(response.data['mensagem'], 'Resposta incorreta, tente novamente.')


@override_settings(PASSWORD_HASHERS=FAST_PASSWORD_HASHERS)
class RaciocinioCasoTestCase(AuthenticatedAPITestCase):
    def setUp(self):
        self.client, self.user = self.autenticar()
        self.caso = CasoClinico.objects.create(titulo='Caso Teste', descricao='Desc')
        self.questao = Questao.objects.create(
            caso_clinico=self.caso,
            enunciado='Qual o diagnóstico?',
            resposta_esperada='Dengue',
            ordem=1,
        )
        self.passo1 = PassoRaciocinio.objects.create(
            questao=self.questao,
            titulo='Primeiro passo',
            descricao='Avaliar sinais de alarme',
            ordem=1,
        )

    def test_raciocinio_sem_autenticacao(self):
        response = APIClient().get(f'/api/casos/{self.caso.id}/raciocinio/')

        self.assertEqual(response.status_code, 401)

    def test_raciocinio_bloqueado_sem_resposta(self):
        response = self.client.get(f'/api/casos/{self.caso.id}/raciocinio/')

        self.assertEqual(response.status_code, 403)
        self.assertEqual(response.data['erro'], 'Responda o caso antes de acessar o raciocínio.')

    def test_raciocinio_acessivel_apos_responder(self):
        RespostaUsuario.objects.create(
            usuario=self.user,
            questao=self.questao,
            resposta='dengue',
            correta=True,
        )

        response = self.client.get(f'/api/casos/{self.caso.id}/raciocinio/')

        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['titulo'], 'Primeiro passo')

    def test_raciocinio_passos_ordenados(self):
        PassoRaciocinio.objects.create(questao=self.questao, titulo='Terceiro passo', descricao='C', ordem=3)
        PassoRaciocinio.objects.create(questao=self.questao, titulo='Segundo passo', descricao='B', ordem=2)
        RespostaUsuario.objects.create(usuario=self.user, questao=self.questao, resposta='dengue', correta=True)

        response = self.client.get(f'/api/casos/{self.caso.id}/raciocinio/')

        self.assertEqual(response.status_code, 200)
        ordens = [p['ordem'] for p in response.data]
        self.assertEqual(ordens, sorted(ordens))
