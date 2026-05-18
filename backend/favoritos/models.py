from django.db import models
from django.contrib.auth.models import User
from fluxogramas.models import Fluxograma

class Favorito(models.Model):
    usuario = models.ForeignKey(User, on_delete = models.CASCADE)
    fluxograma = models.ForeignKey(Fluxograma, on_delete = models.CASCADE)
    
    class Meta:
        #para o usuario nao favoritar o mesmo fluxograma duas vezes
        unique_together = ('usuario', 'fluxograma')
        
    def __str__(self):
        return f"{self.usuario.username} - {self.fluxograma.titulo}"
    
