from django.urls import path
from .views import RegistrarAcessoView, ListarAcessosRecentesView

urlpatterns = [
    path('registrar/<int:fluxograma_id>/', RegistrarAcessoView.as_view(), name='registrar_acesso'),
    path('recentes/', ListarAcessosRecentesView.as_view(), name='listar_acessos_recentes'),
]