from django.http import JsonResponse
from django.shortcuts import get_object_or_404
from .models import Favorito, Fluxograma

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


def remover_favorito(request, id_fluxo):
    fluxo = get_object_or_404(Fluxograma, id=id_fluxo)

    try:
        favorito = Favorito.objects.get(usuario=request.user, fluxograma=fluxo)
        favorito.delete()
        return JsonResponse({"status": "removido com sucesso"})
    except Favorito.DoesNotExist:
        return JsonResponse({"erro": "Favorito não encontrado"}, status=404)
