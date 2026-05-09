from django.urls import path
from . import views

urlpatterns = [
    path('registrar/<int:fluxograma_id>/', views.registrar_acesso_view),
]