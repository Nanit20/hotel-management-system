from django.db import models
from django.utils import timezone

class Usuario(models.Model):
    TIPOS = [
        ("ADMIN", "Administrador"),
        ("JEFE", "Jefe"),
        ("EMPLEADO", "Empleado"),
    ]

    tipo = models.CharField(max_length=20, choices=TIPOS)
    nombre = models.CharField(max_length=100)
    usuario = models.CharField(max_length=50, unique=True)
    contraseña = models.CharField(max_length=100)

    def __str__(self):
        return f"{self.nombre} ({self.tipo})"

class Inventario(models.Model):
    ESTADOS = [
        ("disponible", "Disponible"),
        ("agotado", "Agotado"),
        ("bajo_stock", "Bajo stock"),
    ]

    nombreProducto = models.CharField(max_length=100)
    cantidad = models.IntegerField(default=0)
    estado = models.CharField(max_length=20, choices=ESTADOS, default="disponible")

    def __str__(self):
        return f"{self.nombreProducto} - {self.cantidad} ({self.estado})"

class CodigoReserva(models.Model):
    codigoAcceso = models.CharField(max_length=12, unique=True)
    creadoPor = models.ForeignKey(
        Usuario,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="codigos_reserva",
    )
    creadoEn = models.DateTimeField(auto_now_add=True)
    expiraEn = models.DateTimeField()
    usado = models.BooleanField(default=False)

    def esta_activo(self):
        return not self.usado and self.expiraEn >= timezone.now()

    def __str__(self):
        return f"{self.codigoAcceso} ({'usado' if self.usado else 'activo'})"


class Reserva(models.Model):
    ESTADOS = [
        ("pendiente", "Pendiente"),
        ("confirmada", "Confirmada"),
        ("cancelada", "Cancelada"),
    ]

    fecha = models.DateField()
    hora = models.TimeField()
    numeroPersonas = models.PositiveIntegerField()
    estado = models.CharField(max_length=20, choices=ESTADOS, default="pendiente")
    codigoAcceso = models.CharField(max_length=12, unique=True)

    def confirmar(self):
        self.estado = "confirmada"
        self.save()

    def cancelar(self):
        self.estado = "cancelada"
        self.save()

    def __str__(self):
        return f"Reserva {self.codigoAcceso} - {self.fecha} {self.hora}"
