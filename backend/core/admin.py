from django.contrib import admin

from .models import CodigoReserva, Inventario, Mensaje, Reserva, Usuario

admin.site.register(Usuario)
admin.site.register(Inventario)
admin.site.register(CodigoReserva)
admin.site.register(Reserva)
admin.site.register(Mensaje)
