from django.urls import path

from . import views

urlpatterns = [
    path("medicamentos/", views.listar_medicamentos, name="listar_medicamentos"),
    path("medicamentos/<int:pk>/", views.detalhe_medicamento, name="detalhe_medicamento"),
    path("calcular/", views.calcular_api, name="calcular_api"),
]
