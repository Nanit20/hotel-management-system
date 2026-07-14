from django.urls import path

from .views import (
    crear_reserva,
    generar_codigo_reserva,
    inventario_detail,
    inventario_list_create,
    login,
    reserva_update_estado,
    reservas_list,
    validar_codigo_reserva,
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
]
