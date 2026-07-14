# Generated manually for inventory module

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("core", "0001_initial"),
    ]

    operations = [
        migrations.CreateModel(
            name="Inventario",
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
                ("nombreProducto", models.CharField(max_length=100)),
                ("cantidad", models.IntegerField(default=0)),
                (
                    "estado",
                    models.CharField(
                        choices=[
                            ("disponible", "Disponible"),
                            ("agotado", "Agotado"),
                            ("bajo_stock", "Bajo stock"),
                        ],
                        default="disponible",
                        max_length=20,
                    ),
                ),
            ],
        ),
    ]
