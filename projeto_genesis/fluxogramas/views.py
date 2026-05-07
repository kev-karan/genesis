from django.http import JsonResponse
from django.shortcuts import get_object_or_404
from django.db.models import Q
from .models import Fluxograma

def listar_e_buscar_fluxogramas(request):
    termo_busca = request.GET.get('busca', '')

    if termo_busca:
        fluxogramas = Fluxograma.objects.filter(
            Q(titulo__icontains=termo_busca) | Q(descricao__icontains=termo_busca)
        )
    else:
        fluxogramas = Fluxograma.objects.all()

    dados = []
    for fluxo in fluxogramas:
        dados.append({
            'id': fluxo.id,
            'titulo': fluxo.titulo,
            'descricao': fluxo.descricao
        })

    return JsonResponse({'resultados': dados}, safe=False)


def detalhe_fluxograma(request, id):
    fluxo = get_object_or_404(Fluxograma, id=id)

    dados = {
        'id': fluxo.id,
        'titulo': fluxo.titulo,
        'descricao': fluxo.descricao,
        'conteudo': fluxo.conteudo
    }

    return JsonResponse(dados)