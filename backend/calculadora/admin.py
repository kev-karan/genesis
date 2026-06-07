from django.contrib import admin

from .models import Medicamento, DoseReferencia, ApresentacaoMedicamento


class DoseReferenciaInline(admin.TabularInline):
    model = DoseReferencia
    extra = 1


class ApresentacaoMedicamentoInline(admin.TabularInline):
    model = ApresentacaoMedicamento
    extra = 1


@admin.register(Medicamento)
class MedicamentoAdmin(admin.ModelAdmin):
    list_display = (
        "nome",
        "principio_ativo",
        "categoria",
        "ativo",
        "criado_em",
    )
    list_filter = ("ativo", "categoria")
    search_fields = ("nome", "principio_ativo", "categoria")
    inlines = [DoseReferenciaInline, ApresentacaoMedicamentoInline]


@admin.register(DoseReferencia)
class DoseReferenciaAdmin(admin.ModelAdmin):
    list_display = (
        "medicamento",
        "dose_mg_por_kg",
        "dose_maxima_mg",
        "intervalo_horas",
        "ativo",
    )
    list_filter = ("ativo",)
    search_fields = ("medicamento__nome", "fonte", "observacoes")


@admin.register(ApresentacaoMedicamento)
class ApresentacaoMedicamentoAdmin(admin.ModelAdmin):
    list_display = (
        "medicamento",
        "nome",
        "concentracao_mg_por_ml",
        "apresentacao",
        "gotas_por_ml",
        "via_administracao",
        "ativo",
    )
    list_filter = ("ativo", "apresentacao", "via_administracao")
    search_fields = ("medicamento__nome", "nome", "via_administracao")
