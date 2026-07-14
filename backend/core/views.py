from rest_framework.decorators import api_view
from rest_framework.response import Response
from core.models import Usuario, Inventario


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


def inventario_to_dict(item):
    return {
        "id": item.id,
        "nombreProducto": item.nombreProducto,
        "cantidad": item.cantidad,
        "estado": item.estado,
    }


def puede_modificar_inventario(request):
    tipo_usuario = request.headers.get("X-User-Type", "")
    return tipo_usuario in ["ADMIN", "JEFE"]


@api_view(["GET", "POST"])
def inventario_list_create(request):
    if request.method == "GET":
        items = Inventario.objects.all().order_by("id")
        return Response([inventario_to_dict(item) for item in items])

    if not puede_modificar_inventario(request):
        return Response(
            {"error": "No tienes permisos para modificar el inventario"},
            status=403,
        )

    nombre_producto = request.data.get("nombreProducto")
    cantidad = request.data.get("cantidad")
    estado = request.data.get("estado")

    if not nombre_producto or cantidad is None or not estado:
        return Response(
            {"error": "Nombre del producto, cantidad y estado son obligatorios"},
            status=400,
        )

    try:
        cantidad = int(cantidad)
    except (TypeError, ValueError):
        return Response({"error": "La cantidad debe ser un número entero"}, status=400)

    if estado not in ["disponible", "agotado", "bajo_stock"]:
        return Response({"error": "Estado no válido"}, status=400)

    item = Inventario.objects.create(
        nombreProducto=nombre_producto,
        cantidad=cantidad,
        estado=estado,
    )

    return Response(inventario_to_dict(item), status=201)


@api_view(["PUT", "DELETE"])
def inventario_detail(request, item_id):
    if not puede_modificar_inventario(request):
        return Response(
            {"error": "No tienes permisos para modificar el inventario"},
            status=403,
        )

    try:
        item = Inventario.objects.get(id=item_id)
    except Inventario.DoesNotExist:
        return Response({"error": "Producto no encontrado"}, status=404)

    if request.method == "DELETE":
        item.delete()
        return Response({"mensaje": "Producto eliminado correctamente"})

    nombre_producto = request.data.get("nombreProducto")
    cantidad = request.data.get("cantidad")
    estado = request.data.get("estado")

    if not nombre_producto or cantidad is None or not estado:
        return Response(
            {"error": "Nombre del producto, cantidad y estado son obligatorios"},
            status=400,
        )

    try:
        cantidad = int(cantidad)
    except (TypeError, ValueError):
        return Response({"error": "La cantidad debe ser un número entero"}, status=400)

    if estado not in ["disponible", "agotado", "bajo_stock"]:
        return Response({"error": "Estado no válido"}, status=400)

    item.nombreProducto = nombre_producto
    item.cantidad = cantidad
    item.estado = estado
    item.save()

    return Response(inventario_to_dict(item))
