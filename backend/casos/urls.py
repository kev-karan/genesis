from django.urls import path
from . import views

urlpatterns = [
    
    path('', views.listar_casos, name='listar_casos'),
    path('<int:id>/', views.detalhe_caso, name='detalhe_caso'),
    path('<int:id>/responder/', views.responder_caso, name='responder_caso'),
    path('<int:id>/raciocinio/', views.raciocinio_caso, name='raciocinio_caso'),
]