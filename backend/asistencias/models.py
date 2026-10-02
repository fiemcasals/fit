from django.db import models
from actividades.models import Actividad
from alumnos.models import Alumno

class RegistroAsistencia(models.Model):
    """
    Modelo de Asistencia Diaria (RF-03).
    Registra el estado de asistencia (Presente / Ausente) de un alumno
    en una clase y fecha determinada.
    """
    ESTADO_CHOICES = [
        ('presente', 'Presente'),
        ('ausente', 'Ausente'),
    ]

    clase = models.ForeignKey(
        Actividad,
        on_delete=models.CASCADE,
        related_name='asistencias',
        verbose_name="Clase / Actividad"
    )
    alumno = models.ForeignKey(
        Alumno,
        on_delete=models.CASCADE,
        related_name='asistencias',
        verbose_name="Alumno"
    )
    fecha = models.DateField(
        verbose_name="Fecha de la clase"
    )
    estado = models.CharField(
        max_length=20,
        choices=ESTADO_CHOICES,
        default='presente',
        verbose_name="Estado de Asistencia"
    )
    observacion = models.CharField(
        max_length=255,
        blank=True,
        default="",
        verbose_name="Observación particular"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Registro de Asistencia"
        verbose_name_plural = "Registros de Asistencias"
        unique_together = ['clase', 'alumno', 'fecha']
        ordering = ['-fecha', 'alumno__apellido', 'alumno__nombre']

    def __str__(self):
        return f"{self.fecha} - {self.clase.nombre}: {self.alumno.nombre_completo} ({self.estado})"
