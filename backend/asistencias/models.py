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


class NovedadClase(models.Model):
    """
    Modelo de Novedades y Suspensiones de Clase (RF-04 / REQ-1790949656976).
    Registra el estado operativo de una clase en una jornada particular
    (normal, suspendida por corte de luz, lluvia/clima, feriado, paro, u otro)
    y las notas/observaciones del docente. Afecta el cómputo de días válidos de clase del mes.
    """
    ESTADO_CLASE_CHOICES = [
        ('normal', 'Dictada Normal'),
        ('suspendida_luz', 'Suspendida por Corte de Luz'),
        ('suspendida_clima', 'Suspendida por Clima / Lluvia'),
        ('feriado', 'Feriado / Sin Actividad'),
        ('paro', 'Medida de Fuerza / Paro'),
        ('otro', 'Otra Causa'),
    ]

    clase = models.ForeignKey(
        Actividad,
        on_delete=models.CASCADE,
        related_name='novedades',
        verbose_name="Clase / Actividad"
    )
    fecha = models.DateField(
        verbose_name="Fecha"
    )
    estado_clase = models.CharField(
        max_length=30,
        choices=ESTADO_CLASE_CHOICES,
        default='normal',
        verbose_name="Estado de la Jornada"
    )
    observaciones = models.TextField(
        blank=True,
        default="",
        verbose_name="Observaciones del Docente"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Novedad de Clase"
        verbose_name_plural = "Novedades de Clases"
        unique_together = ['clase', 'fecha']
        ordering = ['-fecha', 'clase__nombre']

    @property
    def es_computable(self):
        """Indica si el día se computa como clase efectivamente dictada."""
        return self.estado_clase == 'normal'

    def __str__(self):
        return f"{self.fecha} - {self.clase.nombre}: {self.get_estado_clase_display()}"
