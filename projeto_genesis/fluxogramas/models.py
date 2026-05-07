from django.db import models

class Fluxograma(models.Model):
    titulo = models.CharField(max_length=200)
    descricao = models.TextField(blank=True, null=True)
    conteudo = models.JSONField(help_text="Estrutura JSON do fluxo")
    
    data_criacao = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.titulo