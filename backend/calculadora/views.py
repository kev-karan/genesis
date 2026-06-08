from django.shortcuts import get_object_or_404
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .calculos import calcular_conversao, calcular_dose_completa
from .models import ApresentacaoMedicamento, ConversaoMedicamento, DoseReferencia, Medicamento
from .serializers import ConversaoSerializer, MedicamentoDetailSerializer, MedicamentoListSerializer


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def listar_medicamentos(request):
    medicamentos = Medicamento.objects.filter(ativo=True)
    serializer = MedicamentoListSerializer(medicamentos, many=True)
    return Response(serializer.data)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def detalhe_medicamento(request, pk):
    medicamento = get_object_or_404(Medicamento, pk=pk, ativo=True)
    serializer = MedicamentoDetailSerializer(medicamento)
    return Response(serializer.data)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def calcular_api(request):
    peso_kg = request.data.get("peso_kg")
    dose_referencia_id = request.data.get("dose_referencia_id")
    apresentacao_id = request.data.get("apresentacao_id")

    if peso_kg is None or dose_referencia_id is None or apresentacao_id is None:
        return Response(
            {"erro": "Informe peso_kg, dose_referencia_id e apresentacao_id."},
            status=400,
        )

    try:
        peso_kg = float(peso_kg)
    except (TypeError, ValueError):
        return Response({"erro": "peso_kg inválido."}, status=400)

    if peso_kg <= 0:
        return Response({"erro": "peso_kg deve ser maior que zero."}, status=400)

    dose_ref = get_object_or_404(DoseReferencia, id=dose_referencia_id, ativo=True)
    apresentacao = get_object_or_404(
        ApresentacaoMedicamento, id=apresentacao_id, ativo=True
    )

    resultado = calcular_dose_completa(
        peso_kg=peso_kg,
        dose_mg_por_kg=float(dose_ref.dose_mg_por_kg),
        dose_maxima_mg=float(dose_ref.dose_maxima_mg) if dose_ref.dose_maxima_mg else None,
        concentracao_mg_por_ml=float(apresentacao.concentracao_mg_por_ml),
        apresentacao=apresentacao.apresentacao,
        gotas_por_ml=float(apresentacao.gotas_por_ml),
    )

    return Response(resultado)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def listar_conversoes(request):
    conversoes = ConversaoMedicamento.objects.filter(ativo=True).select_related(
        'medicamento_origem', 'medicamento_destino'
    )
    serializer = ConversaoSerializer(conversoes, many=True)
    return Response(serializer.data)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def converter_api(request):
    conversao_id = request.data.get("conversao_id")
    dose = request.data.get("dose")
    peso_kg = request.data.get("peso")

    if conversao_id is None or dose is None:
        return Response({"erro": "Informe conversao_id e dose."}, status=400)

    try:
        dose = float(dose)
    except (TypeError, ValueError):
        return Response({"erro": "dose inválida."}, status=400)

    if dose <= 0:
        return Response({"erro": "dose deve ser maior que zero."}, status=400)

    conversao = get_object_or_404(ConversaoMedicamento, id=conversao_id, ativo=True)

    if conversao.tipo == 'peso':
        if peso_kg is None:
            return Response({"erro": "Esta conversão requer o peso do paciente."}, status=400)
        try:
            peso_kg = float(peso_kg)
        except (TypeError, ValueError):
            return Response({"erro": "peso inválido."}, status=400)
        if peso_kg <= 0:
            return Response({"erro": "peso deve ser maior que zero."}, status=400)

    resultado = calcular_conversao(
        tipo=conversao.tipo,
        dose=dose,
        fator=float(conversao.fator),
        peso_kg=peso_kg,
    )

    return Response({
        "resultado": resultado,
        "unidade_destino": conversao.unidade_destino,
        "unidade_origem": conversao.unidade_origem,
        "medicamento_origem": conversao.medicamento_origem.nome,
        "medicamento_destino": conversao.medicamento_destino.nome,
        "tipo": conversao.tipo,
    })
