from django.urls import path
from . import views

urlpatterns = [
    path('', views.listar_e_buscar_fluxogramas, name='lista_fluxogramas'),
    
    path('<int:id>/', views.detalhe_fluxograma, name='detalhe_fluxograma'),
]