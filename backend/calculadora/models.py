from decimal import Decimal

from django.core.validators import MinValueValidator
from django.db import models


class Medicamento(models.Model):
    nome = models.CharField(max_length=120, unique=True)
    principio_ativo = models.CharField(max_length=120, blank=True)
    categoria = models.CharField(max_length=120, blank=True)
    observacoes = models.TextField(blank=True)
    ativo = models.BooleanField(default=True)

    criado_em = models.DateTimeField(auto_now_add=True)
    atualizado_em = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["nome"]
        verbose_name = "Medicamento"
        verbose_name_plural = "Medicamentos"

    def __str__(self):
        return self.nome


class DoseReferencia(models.Model):
    medicamento = models.ForeignKey(
        Medicamento,
        on_delete=models.CASCADE,
        related_name="doses_referencia"
    )

    dose_mg_por_kg = models.DecimalField(
        max_digits=10,
        decimal_places=3,
        validators=[MinValueValidator(Decimal("0.001"))],
        help_text="Dose em mg por kg. Ex: 10 mg/kg."
    )

    dose_maxima_mg = models.DecimalField(
        max_digits=10,
        decimal_places=3,
        null=True,
        blank=True,
        validators=[MinValueValidator(Decimal("0.001"))],
        help_text="Dose máxima total em mg, se existir."
    )

    intervalo_horas = models.PositiveSmallIntegerField(
        null=True,
        blank=True,
        help_text="Intervalo entre doses, em horas."
    )

    fonte = models.CharField(
        max_length=255,
        blank=True,
        help_text="Fonte ou protocolo usado para cadastrar a dose."
    )

    observacoes = models.TextField(blank=True)
    ativo = models.BooleanField(default=True)

    criado_em = models.DateTimeField(auto_now_add=True)
    atualizado_em = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["medicamento__nome"]
        verbose_name = "Dose de referência"
        verbose_name_plural = "Doses de referência"

    def __str__(self):
        return f"{self.medicamento.nome} - {self.dose_mg_por_kg} mg/kg"


class ApresentacaoMedicamento(models.Model):
    APRESENTACAO_CHOICES = [
        ("ml", "mL"),
        ("gotas", "Gotas"),
    ]

    medicamento = models.ForeignKey(
        Medicamento,
        on_delete=models.CASCADE,
        related_name="apresentacoes"
    )

    nome = models.CharField(
        max_length=120,
        blank=True,
        help_text="Nome da apresentação. Ex: suspensão oral, gotas, solução."
    )

    concentracao_mg_por_ml = models.DecimalField(
        max_digits=10,
        decimal_places=3,
        validators=[MinValueValidator(Decimal("0.001"))],
        help_text="Concentração em mg/mL. Ex: 200 mg/mL."
    )

    apresentacao = models.CharField(
        max_length=10,
        choices=APRESENTACAO_CHOICES,
        default="ml",
        help_text="Formato de saída do cálculo."
    )

    gotas_por_ml = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=Decimal("20.00"),
        validators=[MinValueValidator(Decimal("0.01"))],
        help_text="Quantidade de gotas por mL. Padrão comum: 20 gotas/mL."
    )

    via_administracao = models.CharField(
        max_length=80,
        blank=True,
        help_text="Ex: oral, intravenosa, intramuscular."
    )

    observacoes = models.TextField(blank=True)
    ativo = models.BooleanField(default=True)

    criado_em = models.DateTimeField(auto_now_add=True)
    atualizado_em = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["medicamento__nome", "nome"]
        verbose_name = "Apresentação do medicamento"
        verbose_name_plural = "Apresentações dos medicamentos"

    def __str__(self):
        return (
            f"{self.medicamento.nome} - "
            f"{self.concentracao_mg_por_ml} mg/mL"
        )
