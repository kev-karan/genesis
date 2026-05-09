from django.http import JsonResponse
from .services import registrar_acesso
from .models import AcessoRecente


def registrar_acesso_view(request, fluxograma_id):
    if not request.user.is_authenticated:
        return JsonResponse({
            "erro": "Usuário não autenticado"
        }, status=401)

    usuario = request.user

    acesso = registrar_acesso(usuario, fluxograma_id)

    return JsonResponse({
        "usuario": str(acesso.usuario),
        "fluxograma": str(acesso.fluxograma),
        "quantidade_de_acessos": acesso.quantidade_de_acessos,
        "ultimo_acesso": acesso.ultimo_acesso
    })


def listar_acessos_recentes(request):
    if not request.user.is_authenticated:
        return JsonResponse({
            "erro": "Usuário não autenticado"
        }, status=401)

    acessos = AcessoRecente.objects.filter(usuario=request.user).order_by('-ultimo_acesso')[:10]

    dados = []
    for acesso in acessos:
        dados.append({
            "id": acesso.id,
            "fluxograma_id": acesso.fluxograma.id,
            "titulo": acesso.fluxograma.titulo,
            "quantidade_de_acessos": acesso.quantidade_de_acessos,
            "ultimo_acesso": acesso.ultimo_acesso
        })

    return JsonResponse(dados, safe=False)