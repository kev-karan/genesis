from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.status import HTTP_400_BAD_REQUEST, HTTP_401_UNAUTHORIZED, HTTP_201_CREATED
from rest_framework.authtoken.models import Token


@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
    username = request.data.get('username')
    password = request.data.get('password')

    if not username or not password:
        return Response({'erro': 'Usuário e senha obrigatórios'}, status=HTTP_400_BAD_REQUEST)

    user = authenticate(username=username, password=password)

    if not user:
        return Response({'erro': 'Credenciais inválidas'}, status=HTTP_401_UNAUTHORIZED)

    token, _ = Token.objects.get_or_create(user=user)

    return Response({
        'token': token.key,
        'user_id': user.id,
        'username': user.username,
        'email': user.email
    })


@api_view(['POST'])
def logout(request):
    request.user.auth_token.delete()
    return Response({'status': 'Logout realizado'})


@api_view(['GET'])
def me(request):
    return Response({
        'user_id': request.user.id,
        'username': request.user.username,
        'email': request.user.email,
    })

@api_view(['POST'])
@permission_classes([AllowAny])
def cadastro(request):
    email = request.data.get('email')
    password = request.data.get('password')
    confirm_password = request.data.get('confirmPassword')

    if not email or not password or not confirm_password:
        return Response(
            {'erro': 'Email, senha e confirmação de senha são obrigatórios'},
            status=HTTP_400_BAD_REQUEST
        )

    if password != confirm_password:
        return Response(
            {'erro': 'As senhas não coincidem'},
            status=HTTP_400_BAD_REQUEST
        )

    if User.objects.filter(email=email).exists():
        return Response(
            {'erro': 'Já existe uma conta com esse email'},
            status=HTTP_400_BAD_REQUEST
        )

    user = User.objects.create_user(
        username=email,
        email=email,
        password=password
    )

    return Response(
        {
            'mensagem': 'Conta criada com sucesso',
            'user_id': user.id,
            'username': user.username,
            'email': user.email
        },
        status=HTTP_201_CREATED
    )
