from core.models import Usuario

def run():
    usuarios = [
        ( "ADMIN", "Daniel", "Dani", "1234"),
        ( "JEFE", "Jose", "Pelopinto", "1234"),
        ( "JEFE", "Manuel", "Angel", "1234"),
        ( "EMPLEADO", "Francisco", "Paco", "1234"),
        ( "EMPLEADO", "Nicolas", "Niko", "1234"),
    ]

    for tipo, nombre, usuario, password in usuarios:
        Usuario.objects.create(
            tipo=tipo,
            nombre=nombre,
            usuario=usuario,
            contraseña=password
        )

    print("Usuarios creados")