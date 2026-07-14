import random
import string
from datetime import date, time, timedelta

from django.db import models

from django.utils import timezone
from rest_framework.decorators import api_view
from rest_framework.response import Response

from core.models import CodigoReserva, Inventario, Mensaje, Reserva, Turno, Usuario


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


def get_user_type(request):
    return request.headers.get("X-User-Type", "")


def get_user_from_header(request):
    user_id = request.headers.get("X-User-ID")
    if not user_id:
        return None

    try:
        return Usuario.objects.get(id=user_id)
    except (Usuario.DoesNotExist, ValueError):
        return None


def inventario_to_dict(item):
    return {
        "id": item.id,
        "nombreProducto": item.nombreProducto,
        "cantidad": item.cantidad,
        "estado": item.estado,
    }


def puede_modificar_inventario(request):
    return get_user_type(request) in ["ADMIN", "JEFE"]


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


def generar_codigo_unico():
    caracteres = string.ascii_uppercase + string.digits

    while True:
        codigo = "".join(random.choices(caracteres, k=8))
        if not CodigoReserva.objects.filter(codigoAcceso=codigo).exists():
            return codigo


def codigo_to_dict(codigo):
    return {
        "id": codigo.id,
        "codigoAcceso": codigo.codigoAcceso,
        "expiraEn": codigo.expiraEn,
        "usado": codigo.usado,
    }


def reserva_to_dict(reserva):
    return {
        "id": reserva.id,
        "fecha": reserva.fecha,
        "hora": reserva.hora.strftime("%H:%M"),
        "numeroPersonas": reserva.numeroPersonas,
        "estado": reserva.estado,
        "codigoAcceso": reserva.codigoAcceso,
    }


def puede_generar_codigo(request):
    return get_user_type(request) in ["ADMIN", "JEFE", "EMPLEADO"]


def puede_ver_reservas(request):
    return get_user_type(request) in ["ADMIN", "JEFE"]


@api_view(["POST"])
def generar_codigo_reserva(request):
    if not puede_generar_codigo(request):
        return Response(
            {"error": "No tienes permisos para generar códigos de reserva"},
            status=403,
        )

    codigo = CodigoReserva.objects.create(
        codigoAcceso=generar_codigo_unico(),
        creadoPor=get_user_from_header(request),
        expiraEn=timezone.now() + timedelta(hours=24),
    )

    return Response(codigo_to_dict(codigo), status=201)


@api_view(["POST"])
def validar_codigo_reserva(request):
    codigo_acceso = str(request.data.get("codigoAcceso", "")).strip().upper()

    try:
        codigo = CodigoReserva.objects.get(codigoAcceso=codigo_acceso)
    except CodigoReserva.DoesNotExist:
        return Response({"error": "El código es erróneo o ha expirado"}, status=400)

    if not codigo.esta_activo():
        return Response({"error": "El código es erróneo o ha expirado"}, status=400)

    return Response({"mensaje": "Código válido", "codigoAcceso": codigo.codigoAcceso})


@api_view(["POST"])
def crear_reserva(request):
    codigo_acceso = str(request.data.get("codigoAcceso", "")).strip().upper()
    fecha_valor = request.data.get("fecha")
    hora_valor = request.data.get("hora")
    numero_personas = request.data.get("numeroPersonas")

    try:
        codigo = CodigoReserva.objects.get(codigoAcceso=codigo_acceso)
    except CodigoReserva.DoesNotExist:
        return Response({"error": "El código es erróneo o ha expirado"}, status=400)

    if not codigo.esta_activo():
        return Response({"error": "El código es erróneo o ha expirado"}, status=400)

    try:
        fecha = date.fromisoformat(fecha_valor)
        hora = time.fromisoformat(hora_valor)
        numero_personas = int(numero_personas)
    except (TypeError, ValueError):
        return Response({"error": "Datos de reserva no válidos"}, status=400)

    if numero_personas <= 0:
        return Response({"error": "El número de personas debe ser mayor que cero"}, status=400)

    reserva = Reserva.objects.create(
        fecha=fecha,
        hora=hora,
        numeroPersonas=numero_personas,
        estado="pendiente",
        codigoAcceso=codigo.codigoAcceso,
    )

    codigo.usado = True
    codigo.save()

    return Response(reserva_to_dict(reserva), status=201)


@api_view(["GET"])
def reservas_list(request):
    if not puede_ver_reservas(request):
        return Response(
            {"error": "No tienes permisos para consultar las reservas"},
            status=403,
        )

    reservas = Reserva.objects.all().order_by("fecha", "hora", "id")
    return Response([reserva_to_dict(reserva) for reserva in reservas])


@api_view(["PUT"])
def reserva_update_estado(request, reserva_id):
    if not puede_ver_reservas(request):
        return Response(
            {"error": "No tienes permisos para modificar las reservas"},
            status=403,
        )

    estado = request.data.get("estado")
    if estado not in ["pendiente", "confirmada", "cancelada"]:
        return Response({"error": "Estado de reserva no válido"}, status=400)

    try:
        reserva = Reserva.objects.get(id=reserva_id)
    except Reserva.DoesNotExist:
        return Response({"error": "Reserva no encontrada"}, status=404)

    reserva.estado = estado
    reserva.save()

    return Response(reserva_to_dict(reserva))



def usuario_to_dict(usuario):
    return {
        "id": usuario.id,
        "tipo": usuario.tipo,
        "nombre": usuario.nombre,
        "usuario": usuario.usuario,
    }


def mensaje_to_dict(mensaje):
    return {
        "id": mensaje.id,
        "contenido": mensaje.contenido,
        "fecha": mensaje.fecha,
        "leido": mensaje.leido,
        "idRemitente": mensaje.idRemitente.id,
        "nombreRemitente": mensaje.idRemitente.nombre,
        "tipoRemitente": mensaje.idRemitente.tipo,
        "idDestinatario": mensaje.idDestinatario.id,
        "nombreDestinatario": mensaje.idDestinatario.nombre,
        "tipoDestinatario": mensaje.idDestinatario.tipo,
    }


def es_usuario_interno(request):
    return get_user_type(request) in ["ADMIN", "JEFE", "EMPLEADO"]


@api_view(["GET"])
def usuarios_list(request):
    if not es_usuario_interno(request):
        return Response({"error": "No tienes permisos para consultar usuarios"}, status=403)

    usuarios = Usuario.objects.all().order_by("tipo", "nombre")
    return Response([usuario_to_dict(usuario) for usuario in usuarios])


@api_view(["GET", "POST"])
def mensajes_list_create(request):
    usuario_actual = get_user_from_header(request)

    if not usuario_actual or not es_usuario_interno(request):
        return Response({"error": "No tienes permisos para acceder a la mensajería"}, status=403)

    if request.method == "GET":
        if usuario_actual.tipo == "ADMIN":
            mensajes = Mensaje.objects.all().select_related("idRemitente", "idDestinatario").order_by("-fecha")
        else:
            mensajes = Mensaje.objects.filter(
                models.Q(idRemitente=usuario_actual) | models.Q(idDestinatario=usuario_actual)
            ).select_related("idRemitente", "idDestinatario").order_by("-fecha")

        return Response([mensaje_to_dict(mensaje) for mensaje in mensajes])

    destinatario_id = request.data.get("idDestinatario")
    contenido = str(request.data.get("contenido", "")).strip()

    if not destinatario_id or not contenido:
        return Response({"error": "Destinatario y contenido son obligatorios"}, status=400)

    try:
        destinatario = Usuario.objects.get(id=destinatario_id)
    except (Usuario.DoesNotExist, ValueError):
        return Response({"error": "El destinatario no existe"}, status=404)

    mensaje = Mensaje.objects.create(
        idRemitente=usuario_actual,
        idDestinatario=destinatario,
        contenido=contenido,
    )

    return Response(mensaje_to_dict(mensaje), status=201)


@api_view(["PUT"])
def mensaje_marcar_leido(request, mensaje_id):
    usuario_actual = get_user_from_header(request)

    if not usuario_actual or not es_usuario_interno(request):
        return Response({"error": "No tienes permisos para modificar mensajes"}, status=403)

    try:
        mensaje = Mensaje.objects.get(id=mensaje_id)
    except Mensaje.DoesNotExist:
        return Response({"error": "Mensaje no encontrado"}, status=404)

    if usuario_actual.tipo != "ADMIN" and mensaje.idDestinatario_id != usuario_actual.id:
        return Response({"error": "Solo puedes marcar como leídos tus mensajes recibidos"}, status=403)

    mensaje.marcarLeido()
    return Response(mensaje_to_dict(mensaje))



def turno_to_dict(turno):
    return {
        "id": turno.id,
        "fecha": turno.fecha,
        "horaInicio": turno.horaInicio.strftime("%H:%M"),
        "horaFin": turno.horaFin.strftime("%H:%M"),
        "idEmpleado": turno.idEmpleado.id,
        "nombreEmpleado": turno.idEmpleado.nombre,
        "tipoEmpleado": turno.idEmpleado.tipo,
    }


def puede_modificar_turnos(request):
    return get_user_type(request) in ["ADMIN", "JEFE"]


@api_view(["GET", "POST"])
def turnos_list_create(request):
    if not es_usuario_interno(request):
        return Response({"error": "No tienes permisos para consultar los turnos"}, status=403)

    if request.method == "GET":
        turnos = Turno.objects.all().select_related("idEmpleado").order_by("fecha", "horaInicio", "id")
        return Response([turno_to_dict(turno) for turno in turnos])

    if not puede_modificar_turnos(request):
        return Response({"error": "No tienes permisos para modificar los turnos"}, status=403)

    empleado_id = request.data.get("idEmpleado")
    fecha_valor = request.data.get("fecha")
    hora_inicio_valor = request.data.get("horaInicio")
    hora_fin_valor = request.data.get("horaFin")

    if not empleado_id or not fecha_valor or not hora_inicio_valor or not hora_fin_valor:
        return Response({"error": "Empleado, fecha, hora de inicio y hora de fin son obligatorios"}, status=400)

    try:
        empleado = Usuario.objects.get(id=empleado_id, tipo="EMPLEADO")
    except (Usuario.DoesNotExist, ValueError):
        return Response({"error": "Empleado no válido"}, status=400)

    try:
        fecha = date.fromisoformat(fecha_valor)
        hora_inicio = time.fromisoformat(hora_inicio_valor)
        hora_fin = time.fromisoformat(hora_fin_valor)
    except (TypeError, ValueError):
        return Response({"error": "Fecha u horas no válidas"}, status=400)

    if hora_fin <= hora_inicio:
        return Response({"error": "La hora de fin debe ser posterior a la hora de inicio"}, status=400)

    turno = Turno.objects.create(
        idEmpleado=empleado,
        fecha=fecha,
        horaInicio=hora_inicio,
        horaFin=hora_fin,
    )

    return Response(turno_to_dict(turno), status=201)


@api_view(["PUT", "DELETE"])
def turno_detail(request, turno_id):
    if not puede_modificar_turnos(request):
        return Response({"error": "No tienes permisos para modificar los turnos"}, status=403)

    try:
        turno = Turno.objects.select_related("idEmpleado").get(id=turno_id)
    except Turno.DoesNotExist:
        return Response({"error": "Turno no encontrado"}, status=404)

    if request.method == "DELETE":
        turno.delete()
        return Response({"mensaje": "Turno eliminado correctamente"})

    empleado_id = request.data.get("idEmpleado")
    fecha_valor = request.data.get("fecha")
    hora_inicio_valor = request.data.get("horaInicio")
    hora_fin_valor = request.data.get("horaFin")

    if not empleado_id or not fecha_valor or not hora_inicio_valor or not hora_fin_valor:
        return Response({"error": "Empleado, fecha, hora de inicio y hora de fin son obligatorios"}, status=400)

    try:
        empleado = Usuario.objects.get(id=empleado_id, tipo="EMPLEADO")
    except (Usuario.DoesNotExist, ValueError):
        return Response({"error": "Empleado no válido"}, status=400)

    try:
        fecha = date.fromisoformat(fecha_valor)
        hora_inicio = time.fromisoformat(hora_inicio_valor)
        hora_fin = time.fromisoformat(hora_fin_valor)
    except (TypeError, ValueError):
        return Response({"error": "Fecha u horas no válidas"}, status=400)

    if hora_fin <= hora_inicio:
        return Response({"error": "La hora de fin debe ser posterior a la hora de inicio"}, status=400)

    turno.idEmpleado = empleado
    turno.fecha = fecha
    turno.horaInicio = hora_inicio
    turno.horaFin = hora_fin
    turno.save()

    return Response(turno_to_dict(turno))
