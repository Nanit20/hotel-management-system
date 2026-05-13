from django.db import models

class Usuario(models.Model):
    nombre = models.CharField(max_length=100)
    email = models.EmailField()
    rol = models.CharField(max_length=50)

class Reserva(models.Model):
    fecha = models.DateField()
    hora = models.TimeField()
    numero_personas = models.IntegerField()

class Inventario(models.Model):
    nombre_producto = models.CharField(max_length=100)
    cantidad = models.IntegerField()