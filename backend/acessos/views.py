from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from fluxogramas.models import Fluxograma
from .services import registrar_acesso
from .models import AcessoRecente


class RegistrarAcessoView(APIView):
    def post(self, request, fluxograma_id):
        try:
            acesso = registrar_acesso(request.user, fluxograma_id)
        except Fluxograma.DoesNotExist:
            return Response({"erro": "Fluxograma não encontrado"}, status=status.HTTP_404_NOT_FOUND)
        return Response({
            "usuario": str(acesso.usuario),
            "fluxograma": str(acesso.fluxograma),
            "quantidade_de_acessos": acesso.quantidade_de_acessos,
            "ultimo_acesso": acesso.ultimo_acesso
        })


class ListarAcessosRecentesView(APIView):
    def get(self, request):
        acessos = AcessoRecente.objects.filter(usuario=request.user).order_by('-ultimo_acesso')[:5]
        dados = [
            {
                "id": acesso.id,
                "fluxograma_id": acesso.fluxograma.id,
                "titulo": acesso.fluxograma.titulo,
                "quantidade_de_acessos": acesso.quantidade_de_acessos,
                "ultimo_acesso": acesso.ultimo_acesso,
            }
            for acesso in acessos
        ]
        return Response(dados)