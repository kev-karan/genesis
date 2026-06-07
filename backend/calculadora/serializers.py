from rest_framework import serializers

from .models import Medicamento, DoseReferencia, ApresentacaoMedicamento


class DoseReferenciaSerializer(serializers.ModelSerializer):
    class Meta:
        model = DoseReferencia
        fields = [
            "id",
            "dose_mg_por_kg",
            "dose_maxima_mg",
            "intervalo_horas",
            "fonte",
            "observacoes",
        ]


class ApresentacaoMedicamentoSerializer(serializers.ModelSerializer):
    class Meta:
        model = ApresentacaoMedicamento
        fields = [
            "id",
            "nome",
            "concentracao_mg_por_ml",
            "apresentacao",
            "gotas_por_ml",
            "via_administracao",
        ]


class MedicamentoListSerializer(serializers.ModelSerializer):
    class Meta:
        model = Medicamento
        fields = ["id", "nome", "principio_ativo", "categoria"]


class MedicamentoDetailSerializer(serializers.ModelSerializer):
    doses_referencia = serializers.SerializerMethodField()
    apresentacoes = serializers.SerializerMethodField()

    class Meta:
        model = Medicamento
        fields = [
            "id",
            "nome",
            "principio_ativo",
            "categoria",
            "observacoes",
            "doses_referencia",
            "apresentacoes",
        ]

    def get_doses_referencia(self, obj):
        qs = obj.doses_referencia.filter(ativo=True)
        return DoseReferenciaSerializer(qs, many=True).data

    def get_apresentacoes(self, obj):
        qs = obj.apresentacoes.filter(ativo=True)
        return ApresentacaoMedicamentoSerializer(qs, many=True).data
