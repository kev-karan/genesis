from django.urls import path
from . import views

urlpatterns = [
    path('registrar/<int:fluxograma_id>/', views.registrar_acesso_view, name='registrar_acesso'),
    path('recentes/', views.listar_acessos_recentes, name='listar_acessos_recentes'),
]