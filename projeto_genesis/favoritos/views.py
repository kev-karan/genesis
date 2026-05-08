from django.http import JsonResponse
from django.shortcuts import get_object_or_404
from .models import Favorito, Fluxograma

def favoritar_fluxograma(request, id_fluxo):
    fluxo = get_object_or_404(Fluxograma, id = id_fluxo)
    
    #impede que o médico favorite duas vezes
    favorito, criado = Favorito.objects.get_or_create(
        usuario = request.user,
        fluxograma = fluxo
    )
    
    dados = {
        "id": favorito.id,
        "usuario": favorito.usuario.username,
        "fluxograma_titulo": favorito.fluxograma.titulo,
        "status": "favoritado com sucessso"
        
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
       
# Create your views here.
