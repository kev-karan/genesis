from rest_framework import serializers
from .models import CasoClinico, Questao, OpcaoResposta, PassoRaciocinio


class OpcaoRespostaSerializer(serializers.ModelSerializer):
    class Meta:
        model = OpcaoResposta
        fields = ['id', 'texto', 'ordem']


class QuestaoSerializer(serializers.ModelSerializer):
    opcoes = OpcaoRespostaSerializer(many=True, read_only=True)

    class Meta:
        model = Questao
        fields = ['id', 'enunciado', 'tipo', 'ordem', 'opcoes']


class CasoClinicoDetailSerializer(serializers.ModelSerializer):
    questoes = QuestaoSerializer(many=True, read_only=True)

    class Meta:
        model = CasoClinico
        fields = ['id', 'titulo', 'descricao', 'contexto', 'nivel', 'questoes']


class CasoClinicoListSerializer(serializers.ModelSerializer):
    class Meta:
        model = CasoClinico
        fields = ['id', 'titulo', 'descricao', 'nivel']


class PassoRaciocinioSerializer(serializers.ModelSerializer):
    class Meta:
        model = PassoRaciocinio
        fields = ['id', 'titulo', 'descricao', 'ordem']


class ResponderSerializer(serializers.Serializer):
    questao_id = serializers.IntegerField()
    resposta = serializers.CharField(required=False, allow_blank=True)
    opcao_id = serializers.IntegerField(required=False)