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