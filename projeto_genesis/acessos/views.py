from django.http import JsonResponse
from .services import registrar_acesso


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