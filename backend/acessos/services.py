from fluxogramas.models import Fluxograma
from .models import AcessoRecente
from django.utils import timezone

def registrar_acesso (usuario, fluxograma_id):
    dado_do_fluxograma = Fluxograma.objects.get(id=fluxograma_id)

    acesso, created = AcessoRecente.objects.get_or_create(
        usuario = usuario,
        fluxograma = dado_do_fluxograma,
        defaults={"quantidade_de_acessos": 1, "ultimo_acesso": timezone.now()}

    )

    if not created:
        acesso.quantidade_de_acessos += 1
        acesso.ultimo_acesso = timezone.now()
        acesso.save()

    return acesso