# Generated manually for internal messaging module

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("core", "0003_reservas"),
    ]

    operations = [
        migrations.CreateModel(
            name="Mensaje",
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
                ("contenido", models.TextField()),
                ("fecha", models.DateTimeField(auto_now_add=True)),
                ("leido", models.BooleanField(default=False)),
                (
                    "idDestinatario",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="mensajes_recibidos",
                        to="core.usuario",
                    ),
                ),
                (
                    "idRemitente",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="mensajes_enviados",
                        to="core.usuario",
                    ),
                ),
            ],
        ),
    ]
