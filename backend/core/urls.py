from django.urls import path

from .views import (
    crear_reserva,
    generar_codigo_reserva,
    inventario_detail,
    inventario_list_create,
    login,
    mensaje_marcar_leido,
    mensajes_list_create,
    reserva_update_estado,
    reservas_list,
    validar_codigo_reserva,
    turno_detail,
    turnos_list_create,
    usuarios_list,
)

urlpatterns = [
    path("login/", login),
    path("inventario/", inventario_list_create),
    path("inventario/<int:item_id>/", inventario_detail),
    path("reservas/generar-codigo/", generar_codigo_reserva),
    path("reservas/validar-codigo/", validar_codigo_reserva),
    path("reservas/crear/", crear_reserva),
    path("reservas/", reservas_list),
    path("reservas/<int:reserva_id>/estado/", reserva_update_estado),
    path("usuarios/", usuarios_list),
    path("mensajes/", mensajes_list_create),
    path("mensajes/<int:mensaje_id>/leido/", mensaje_marcar_leido),
    path("turnos/", turnos_list_create),
    path("turnos/<int:turno_id>/", turno_detail),
]
