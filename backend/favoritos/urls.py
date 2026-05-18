from django.urls import path
from . import views

urlpatterns = [
    path('meus-favoritos/', views.listar_favoritos, name='listar_favoritos'),
    path('favoritar/<int:id_fluxo>/', views.favoritar_fluxograma, name='favoritar_fluxograma'),
    path('remover/<int:id_fluxo>/', views.remover_favorito, name='remover_favorito'),
]
