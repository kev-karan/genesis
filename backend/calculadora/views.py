from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from .calculos import calcular_dose_completa


@api_view(["POST"])
@permission_classes([AllowAny])
def calcular_api(request):
    dados = request.data

    try:
        peso = float(dados.get("peso_kg"))
        dose_por_kg = float(dados.get("dose_mg_por_kg"))
        dose_max = float(dados.get("dose_maxima_mg"))
        concentracao = float(dados.get("concentracao_mg_por_ml"))
        apresentacao = dados.get("apresentacao", "ml")

        resultado = calcular_dose_completa(
            peso_kg=peso,
            dose_mg_por_kg=dose_por_kg,
            dose_maxima_mg=dose_max,
            concentracao_mg_por_ml=concentracao,
            apresentacao=apresentacao,
        )

        return Response(resultado, status=200)

    except Exception as e:
        return Response(
            {"erro": "Dados inválidos ou faltando. Verifique os campos."}, status=400
        )
