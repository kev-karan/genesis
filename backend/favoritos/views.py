from django.http import JsonResponse
from django.shortcuts import get_object_or_404
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from rest_framework.authentication import TokenAuthentication
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import api_view, authentication_classes, permission_classes
from .models import Favorito, Fluxograma

@api_view(['POST'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def favoritar_fluxograma(request, id_fluxo):
    fluxo = get_object_or_404(Fluxograma, id = id_fluxo)

    favorito, criado = Favorito.objects.get_or_create(
        usuario = request.user,
        fluxograma = fluxo
    )

    dados = {
        "id": favorito.id,
        "usuario": favorito.usuario.username,
        "fluxograma_titulo": favorito.fluxograma.titulo,
        "status": "favoritado com sucesso"
    }
    return JsonResponse(dados)

@api_view(['GET'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def listar_favoritos(request):
    favoritos = Favorito.objects.filter(usuario = request.user)

    lista_json = []

    for fav in favoritos:
        lista_json.append({
            "id": fav.id,
            "fluxograma_id": fav.fluxograma.id,
            "titulo": fav.fluxograma.titulo,
            "descricao": fav.fluxograma.descricao
        })

    return JsonResponse(lista_json, safe=False)


@api_view(['DELETE'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def remover_favorito(request, id_fluxo):
    fluxo = get_object_or_404(Fluxograma, id=id_fluxo)

    try:
        favorito = Favorito.objects.get(usuario=request.user, fluxograma=fluxo)
        favorito.delete()
        return JsonResponse({"status": "removido com sucesso"})
    except Favorito.DoesNotExist:
        return JsonResponse({"erro": "Favorito não encontrado"}, status=404)


@api_view(['DELETE'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def reset_favoritos(request):
    from django.conf import settings
    if not settings.DEBUG:
        from rest_framework.response import Response
        from rest_framework import status
        return Response(status=status.HTTP_404_NOT_FOUND)
    deleted, _ = Favorito.objects.filter(usuario=request.user).delete()
    return JsonResponse({'deleted': deleted})
