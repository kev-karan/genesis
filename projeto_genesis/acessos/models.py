from django.db import models
from django.conf import settings
from django.utils import timezone
from fluxogramas.models import Fluxograma


class AcessoRecente(models.Model):
    usuario = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    fluxograma = models.ForeignKey(Fluxograma, on_delete=models.CASCADE)
    ultimo_acesso = models.DateTimeField(default=timezone.now)
    quantidade_de_acessos = models.BigIntegerField(default=0)

    class Meta:
        unique_together = ('usuario', 'fluxograma')
        ordering = ['-quantidade_de_acessos', '-ultimo_acesso']

    def __str__(self):
        return f"Nome: {self.usuario} - {self.fluxograma}"