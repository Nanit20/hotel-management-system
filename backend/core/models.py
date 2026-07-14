from django.db import models

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
