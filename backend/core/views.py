from rest_framework.decorators import api_view
from rest_framework.response import Response
from core.models import Usuario

@api_view(["POST"])
def login(request):
    usuario = request.data.get("usuario")
    contraseña = request.data.get("contraseña")

    try:
        user = Usuario.objects.get(usuario=usuario, contraseña=contraseña)

        return Response({
            "id": user.id,
            "tipo": user.tipo,
            "nombre": user.nombre,
            "usuario": user.usuario
        })

    except Usuario.DoesNotExist:
        return Response({"error": "Credenciales inválidas"}, status=400)