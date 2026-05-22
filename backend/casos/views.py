from django.shortcuts import get_object_or_404
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from .models import CasoClinico, Questao, PassoRaciocinio, RespostaUsuario
from .serializers import (
    CasoClinicoListSerializer,
    CasoClinicoDetailSerializer,
    PassoRaciocinioSerializer,
    ResponderSerializer
)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def listar_casos(request):
    fluxograma_id = request.GET.get('fluxograma')
    casos = CasoClinico.objects.filter(ativo=True)
    if fluxograma_id:
        casos = casos.filter(fluxograma_id=fluxograma_id)
        
    serializer = CasoClinicoListSerializer(casos, many=True)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def detalhe_caso(request, id):
    caso = get_object_or_404(CasoClinico, id=id, ativo=True)
    serializer = CasoClinicoDetailSerializer(caso)
    return Response(serializer.data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def responder_caso(request, id):
    caso = get_object_or_404(CasoClinico, id=id)
    serializer = ResponderSerializer(data=request.data)

    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    questao_id = serializer.validated_data['questao_id']
    resposta_usuario = str(serializer.validated_data['resposta']).strip().lower()

    questao = get_object_or_404(Questao, id=questao_id, caso_clinico=caso)

    if not questao.resposta_esperada:
        return Response({'correto': None, 'mensagem': 'Questão sem resposta esperada definida.'})

    resposta_correta_texto = questao.resposta_esperada.strip().lower()

    try:
        correto = abs(float(resposta_usuario.replace(',', '.')) - float(resposta_correta_texto.replace(',', '.'))) < 0.1
    except ValueError:
        correto = resposta_usuario == resposta_correta_texto

    RespostaUsuario.objects.create(
        usuario=request.user,
        questao=questao,
        resposta=serializer.validated_data['resposta'],
        correta=correto,
    )

    return Response({
        'correto': correto,
        'resposta_correta': questao.resposta_esperada,
        'mensagem': 'Resposta correta!' if correto else 'Resposta incorreta, tente novamente.'
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def raciocinio_caso(request, id):
    if not RespostaUsuario.objects.filter(questao__caso_clinico_id=id, usuario=request.user).exists():
        return Response({'erro': 'Responda o caso antes de acessar o raciocínio.'}, status=status.HTTP_403_FORBIDDEN)

    passos = PassoRaciocinio.objects.filter(questao__caso_clinico_id=id).order_by('ordem')
    serializer = PassoRaciocinioSerializer(passos, many=True)
    return Response(serializer.data)
