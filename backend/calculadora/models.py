from django.db import models


class Medicamento(models.Model):
    nome = models.CharField(max_length=100, help_text="Ex: Dipirona, Ibuprofeno")
    dose_mg_por_kg = models.FloatField(help_text="Dose recomendada por Kg")
    dose_maxima_mg = models.FloatField(help_text="Dose máxima permitida")
    concentracao_mg_por_ml = models.FloatField(help_text="Concentração do remédio")
    apresentacao = models.CharField(
        max_length=20, default="ml", help_text="Ex: ml ou gotas"
    )

    def __str__(self):
        return self.nome
