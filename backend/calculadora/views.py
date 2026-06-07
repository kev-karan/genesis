from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .calculos import calcular_dose_completa
from .models import Medicamento


@api_view(["POST"])
@permission_classes([AllowAny])
def calcular_api(request):
    dados = request.data

    try:
        peso = float(dados.get("peso_kg"))
        medicamento_id = dados.get("medicamento_id")

        if not peso or not medicamento_id:
            return Response(
                {"erro": "Informe o peso_kg e o medicamento_id."}, status=400
            )

        medicamento = get_object_or_404(Medicamento, id=medicamento_id)

        resultado = calcular_dose_completa(
            peso_kg=peso,
            dose_mg_por_kg=medicamento.dose_mg_por_kg,
            dose_maxima_mg=medicamento.dose_maxima_mg,
            concentracao_mg_por_ml=medicamento.concentracao_mg_por_ml,
            apresentacao=medicamento.apresentacao,
        )

        return Response(resultado, status=200)

    except Exception as e:
        return Response(
            {
                "erro": "Erro ao calcular a dose. Verifique os dados enviados.",
                "detalhes": str(e),
            },
            status=400,
        )
