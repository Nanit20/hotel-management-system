# Generated manually for TFG prototype

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ("core", "0004_mensaje"),
    ]

    operations = [
        migrations.CreateModel(
            name="Turno",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("fecha", models.DateField()),
                ("horaInicio", models.TimeField()),
                ("horaFin", models.TimeField()),
                ("idEmpleado", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="turnos_asignados", to="core.usuario")),
            ],
        ),
    ]
