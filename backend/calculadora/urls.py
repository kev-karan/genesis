from django.urls import path
from . import views

urlpatterns = [
    path("calcular/", views.calcular_api, name="calcular_api"),
]
