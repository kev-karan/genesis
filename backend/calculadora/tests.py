from django.test import SimpleTestCase

from calculadora.calculos import (
    calcular_dose_mg,
    converter_mg_para_ml,
    converter_mg_para_gotas,
    calcular_dose_completa,
)

class TestCalculos(SimpleTestCase):
    def test_calcular_dose_mg_inteiros(self):
        self.assertEqual(
            calcular_dose_mg(20,10),
            200
        )

    def test_calcular_dose_mg_decimais(self):
        self.assertEqual(
            calcular_dose_mg(12.5,4),
            50.0
        )

    def test_calcular_dose_mg_zero(self):
        self.assertEqual(
            calcular_dose_mg(0,10),
            0
        )

    def test_converter_mg_para_ml(self):
        self.assertEqual(
            converter_mg_para_ml(100,50),
            2.0
        )

    def test_converter_mg_para_ml_decimal(self):
        self.assertEqual(
            converter_mg_para_ml(75,30),
            2.5
        )

    def test_converter_mg_para_ml_concentracao_zero(self):
        with self.assertRaises(ValueError):
            converter_mg_para_ml(100,0)

    def test_converter_mg_para_ml_concentracao_negativa(self):
        with self.assertRaises(ValueError):
            converter_mg_para_ml(100,-10)

    def test_converter_mg_para_gotas(self):
        self.assertEqual(
            converter_mg_para_gotas(100,50),
            40.0
        )
    
    def test_converter_mg_para_gotas_personalizado(self):
        self.assertEqual(
            converter_mg_para_gotas(
                100,50,gotas_por_ml=30
            ),
            60.0
        )

    def test_calcular_dose_completa_sem_limite(self):
        resultado = calcular_dose_completa(
            peso_kg=20,
            dose_mg_por_kg=10,
            dose_maxima_mg=500,
            concentracao_mg_por_ml=100,
            apresentacao='ml'
        )

        self.assertEqual(resultado['dose_calculada_mg'],200)
        self.assertEqual(resultado['dose_final_mg'],200)
        self.assertFalse(resultado['dose_limitada'])
        self.assertEqual(resultado['volume'],2.0)
        self.assertEqual(resultado['unidade_volume'],'ml')

    def test_calcular_dose_completa_com_limites(self):
        resultado = calcular_dose_completa(
            peso_kg=50,
            dose_mg_por_kg=20,
            dose_maxima_mg=500,
            concentracao_mg_por_ml=100,
            apresentacao='ml'
        )

        self.assertEqual(resultado['dose_calculada_mg'],1000)
        self.assertEqual(resultado['dose_final_mg'],500)
        self.assertTrue(resultado['dose_limitada'])
        self.assertEqual(resultado['volume'],5.0)

    def test_calcular_dose_completa_em_gotas(self):
        resultado = calcular_dose_completa(
            peso_kg=20,
            dose_mg_por_kg=10,
            dose_maxima_mg=500,
            concentracao_mg_por_ml=100,
            apresentacao='gotas'
        )

        self.assertEqual(resultado['dose_final_mg'],200)
        self.assertEqual(resultado['volume'],40.0)
        self.assertEqual(resultado['unidade_volume'],'gotas')

