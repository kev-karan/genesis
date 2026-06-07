from django.shortcuts import get_object_or_404
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .calculos import calcular_dose_completa
from .models import ApresentacaoMedicamento, DoseReferencia, Medicamento
from .serializers import MedicamentoDetailSerializer, MedicamentoListSerializer


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
