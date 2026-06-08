from decimal import Decimal

from django.contrib.auth.models import User
from django.test import SimpleTestCase, TestCase
from django.urls import reverse
from rest_framework.authtoken.models import Token
from rest_framework.test import APIClient

from calculadora.calculos import (
    calcular_dose_completa,
    calcular_dose_mg,
    converter_mg_para_gotas,
    converter_mg_para_ml,
)

from .models import ApresentacaoMedicamento, DoseReferencia, Medicamento


class TestCalculos(SimpleTestCase):
    def test_calcular_dose_mg_inteiros(self):
        self.assertEqual(calcular_dose_mg(20, 10), 200)

    def test_calcular_dose_mg_decimais(self):
        self.assertEqual(calcular_dose_mg(12.5, 4), 50.0)

    def test_calcular_dose_mg_zero(self):
        self.assertEqual(calcular_dose_mg(0, 10), 0)

    def test_converter_mg_para_ml(self):
        self.assertEqual(converter_mg_para_ml(100, 50), 2.0)

    def test_converter_mg_para_ml_decimal(self):
        self.assertEqual(converter_mg_para_ml(75, 30), 2.5)

    def test_converter_mg_para_ml_concentracao_zero(self):
        with self.assertRaises(ValueError):
            converter_mg_para_ml(100, 0)

    def test_converter_mg_para_ml_concentracao_negativa(self):
        with self.assertRaises(ValueError):
            converter_mg_para_ml(100, -10)

    def test_converter_mg_para_gotas(self):
        self.assertEqual(converter_mg_para_gotas(100, 50), 40.0)

    def test_converter_mg_para_gotas_personalizado(self):
        self.assertEqual(converter_mg_para_gotas(100, 50, gotas_por_ml=30), 60.0)

    def test_calcular_dose_completa_sem_limite(self):
        resultado = calcular_dose_completa(
            peso_kg=20,
            dose_mg_por_kg=10,
            dose_maxima_mg=500,
            concentracao_mg_por_ml=100,
            apresentacao="ml",
        )
        self.assertEqual(resultado["dose_calculada_mg"], 200)
        self.assertEqual(resultado["dose_final_mg"], 200)
        self.assertFalse(resultado["dose_limitada"])
        self.assertEqual(resultado["volume"], 2.0)
        self.assertEqual(resultado["unidade_volume"], "ml")

    def test_calcular_dose_completa_com_limite(self):
        resultado = calcular_dose_completa(
            peso_kg=50,
            dose_mg_por_kg=20,
            dose_maxima_mg=500,
            concentracao_mg_por_ml=100,
            apresentacao="ml",
        )
        self.assertEqual(resultado["dose_calculada_mg"], 1000)
        self.assertEqual(resultado["dose_final_mg"], 500)
        self.assertTrue(resultado["dose_limitada"])
        self.assertEqual(resultado["volume"], 5.0)

    def test_calcular_dose_completa_sem_dose_maxima(self):
        resultado = calcular_dose_completa(
            peso_kg=50,
            dose_mg_por_kg=20,
            dose_maxima_mg=None,
            concentracao_mg_por_ml=100,
            apresentacao="ml",
        )
        self.assertEqual(resultado["dose_final_mg"], 1000)
        self.assertFalse(resultado["dose_limitada"])

    def test_calcular_dose_completa_em_gotas(self):
        resultado = calcular_dose_completa(
            peso_kg=20,
            dose_mg_por_kg=10,
            dose_maxima_mg=500,
            concentracao_mg_por_ml=100,
            apresentacao="gotas",
        )
        self.assertEqual(resultado["dose_final_mg"], 200)
        self.assertEqual(resultado["volume"], 40.0)
        self.assertEqual(resultado["unidade_volume"], "gotas")

    def test_calcular_dose_completa_comprimido(self):
        resultado = calcular_dose_completa(
            peso_kg=20,
            dose_mg_por_kg=Decimal("0.1"),
            dose_maxima_mg=None,
            concentracao_mg_por_ml=Decimal("5"),
            apresentacao="comprimido",
        )
        self.assertEqual(resultado["dose_final_mg"], Decimal("2.0"))
        self.assertAlmostEqual(float(resultado["volume"]), 0.4, places=5)
        self.assertEqual(resultado["unidade_volume"], "comprimido")


class TestCalculadoraAPI(TestCase):
    def setUp(self):
        self.client = APIClient()
        usuario = User.objects.create_user(username="teste@test.com", password="senha123")
        token = Token.objects.create(user=usuario)
        self.client.credentials(HTTP_AUTHORIZATION=f"Token {token.key}")

        self.medicamento = Medicamento.objects.create(nome="Paracetamol")
        self.dose_ref = DoseReferencia.objects.create(
            medicamento=self.medicamento,
            dose_mg_por_kg=Decimal("10.000"),
            dose_maxima_mg=Decimal("500.000"),
        )
        self.apresentacao = ApresentacaoMedicamento.objects.create(
            medicamento=self.medicamento,
            concentracao_mg_por_ml=Decimal("100.000"),
            apresentacao="ml",
        )
        self.url = reverse("calcular_api")

    def test_calcular_api_sucesso(self):
        dados = {
            "peso_kg": 20,
            "dose_referencia_id": self.dose_ref.id,
            "apresentacao_id": self.apresentacao.id,
        }
        resposta = self.client.post(self.url, dados, format="json")
        self.assertEqual(resposta.status_code, 200)
        self.assertEqual(resposta.data["dose_final_mg"], 200)
        self.assertFalse(resposta.data["dose_limitada"])

    def test_calcular_api_sem_autenticacao(self):
        client_anonimo = APIClient()
        dados = {
            "peso_kg": 20,
            "dose_referencia_id": self.dose_ref.id,
            "apresentacao_id": self.apresentacao.id,
        }
        resposta = client_anonimo.post(self.url, dados, format="json")
        self.assertEqual(resposta.status_code, 401)

    def test_calcular_api_campos_faltando(self):
        resposta = self.client.post(self.url, {"peso_kg": 20}, format="json")
        self.assertEqual(resposta.status_code, 400)
        self.assertIn("erro", resposta.data)

    def test_calcular_api_peso_invalido(self):
        dados = {
            "peso_kg": "abc",
            "dose_referencia_id": self.dose_ref.id,
            "apresentacao_id": self.apresentacao.id,
        }
        resposta = self.client.post(self.url, dados, format="json")
        self.assertEqual(resposta.status_code, 400)

    def test_calcular_api_peso_zero(self):
        dados = {
            "peso_kg": 0,
            "dose_referencia_id": self.dose_ref.id,
            "apresentacao_id": self.apresentacao.id,
        }
        resposta = self.client.post(self.url, dados, format="json")
        self.assertEqual(resposta.status_code, 400)

    def test_calcular_api_dose_ref_inativa(self):
        self.dose_ref.ativo = False
        self.dose_ref.save()
        dados = {
            "peso_kg": 20,
            "dose_referencia_id": self.dose_ref.id,
            "apresentacao_id": self.apresentacao.id,
        }
        resposta = self.client.post(self.url, dados, format="json")
        self.assertEqual(resposta.status_code, 404)

    def test_calcular_api_dose_limitada(self):
        dados = {
            "peso_kg": 60,
            "dose_referencia_id": self.dose_ref.id,
            "apresentacao_id": self.apresentacao.id,
        }
        resposta = self.client.post(self.url, dados, format="json")
        self.assertEqual(resposta.status_code, 200)
        self.assertTrue(resposta.data["dose_limitada"])
        self.assertEqual(resposta.data["dose_final_mg"], 500)

    def test_calcular_api_comprimido(self):
        apresentacao_comp = ApresentacaoMedicamento.objects.create(
            medicamento=self.medicamento,
            concentracao_mg_por_ml=Decimal("5"),
            apresentacao="comprimido",
        )
        dados = {
            "peso_kg": 20,
            "dose_referencia_id": self.dose_ref.id,
            "apresentacao_id": apresentacao_comp.id,
        }
        resposta = self.client.post(self.url, dados, format="json")
        self.assertEqual(resposta.status_code, 200)
        self.assertEqual(resposta.data["unidade_volume"], "comprimido")


class TestMedicamentosAPI(TestCase):
    def setUp(self):
        self.client = APIClient()
        usuario = User.objects.create_user(username="teste2@test.com", password="senha123")
        token = Token.objects.create(user=usuario)
        self.client.credentials(HTTP_AUTHORIZATION=f"Token {token.key}")

        self.med_ativo = Medicamento.objects.create(nome="Ibuprofeno", ativo=True)
        self.med_inativo = Medicamento.objects.create(nome="Descontinuado", ativo=False)
        DoseReferencia.objects.create(
            medicamento=self.med_ativo,
            dose_mg_por_kg=Decimal("10.000"),
        )

    def test_listar_medicamentos_so_ativos(self):
        resposta = self.client.get(reverse("listar_medicamentos"))
        self.assertEqual(resposta.status_code, 200)
        nomes = [m["nome"] for m in resposta.data]
        self.assertIn("Ibuprofeno", nomes)
        self.assertNotIn("Descontinuado", nomes)

    def test_detalhe_medicamento_com_doses(self):
        resposta = self.client.get(
            reverse("detalhe_medicamento", kwargs={"pk": self.med_ativo.pk})
        )
        self.assertEqual(resposta.status_code, 200)
        self.assertEqual(len(resposta.data["doses_referencia"]), 1)

    def test_detalhe_medicamento_inativo_retorna_404(self):
        resposta = self.client.get(
            reverse("detalhe_medicamento", kwargs={"pk": self.med_inativo.pk})
        )
        self.assertEqual(resposta.status_code, 404)
