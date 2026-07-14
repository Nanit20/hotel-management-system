# Generated manually for reservation module

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("core", "0002_inventario"),
    ]

    operations = [
        migrations.CreateModel(
            name="CodigoReserva",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                ("codigoAcceso", models.CharField(max_length=12, unique=True)),
                ("creadoEn", models.DateTimeField(auto_now_add=True)),
                ("expiraEn", models.DateTimeField()),
                ("usado", models.BooleanField(default=False)),
                (
                    "creadoPor",
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.SET_NULL,
                        related_name="codigos_reserva",
                        to="core.usuario",
                    ),
                ),
            ],
        ),
        migrations.CreateModel(
            name="Reserva",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                ("fecha", models.DateField()),
                ("hora", models.TimeField()),
                ("numeroPersonas", models.PositiveIntegerField()),
                (
                    "estado",
                    models.CharField(
                        choices=[
                            ("pendiente", "Pendiente"),
                            ("confirmada", "Confirmada"),
                            ("cancelada", "Cancelada"),
                        ],
                        default="pendiente",
                        max_length=20,
                    ),
                ),
                ("codigoAcceso", models.CharField(max_length=12, unique=True)),
            ],
        ),
    ]
