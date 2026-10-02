from django.db import models

class Actividad(models.Model):
    """
    Modelo representativo de una Actividad / Clase deportiva o taller.
    Cumple con el requerimiento RF-01 (Modelo y ABM de Actividades / Clases):
    - Definición de actividad (nombre, tipo/categoría)
    - Sede / Polideportivo oficial
    - Profesor a cargo
    - Días asignados de la semana (ej: Martes, Jueves, Viernes)
    - Franjas horarias (ej: 17:00, 18:00, 19:00)
    - Cupo máximo y estado activa/inactiva
    """
    DIAS_OPCIONES = [
        ('Lunes', 'Lunes'),
        ('Martes', 'Martes'),
        ('Miércoles', 'Miércoles'),
        ('Jueves', 'Jueves'),
        ('Viernes', 'Viernes'),
        ('Sábado', 'Sábado'),
        ('Domingo', 'Domingo'),
    ]

    nombre = models.CharField(
        max_length=150,
        verbose_name="Nombre de la Actividad / Deporte",
        help_text="Ej: Fútbol Infantil, Gimnasia Artística, Natación"
    )
    polideportivo = models.CharField(
        max_length=150,
        default="Polideportivo Patricios",
        verbose_name="Sede / Polideportivo",
        help_text="Ej: Polideportivo Patricios, Polideportivo Colegiales, etc."
    )
    profesor = models.CharField(
        max_length=150,
        blank=True,
        default="Prof. Mauricio Casals",
        verbose_name="Profesor a cargo"
    )
    dias_semana = models.JSONField(
        default=list,
        verbose_name="Días de la semana",
        help_text="Lista de días de clase. Ej: ['Martes', 'Jueves', 'Viernes']"
    )
    horario = models.CharField(
        max_length=50,
        verbose_name="Franja horaria",
        help_text="Ej: 17:00, 18:00, 19:00"
    )
    cupo_maximo = models.PositiveIntegerField(
        default=30,
        verbose_name="Cupo máximo de alumnos"
    )
    observaciones = models.TextField(
        blank=True,
        default="",
        verbose_name="Observaciones / Notas"
    )
    activa = models.BooleanField(
        default=True,
        verbose_name="Activa"
    )
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Fecha de creación")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Última modificación")

    class Meta:
        verbose_name = "Actividad / Clase"
        verbose_name_plural = "Actividades / Clases"
        ordering = ['nombre', 'horario']

    def __str__(self):
        dias_str = ", ".join(self.dias_semana) if isinstance(self.dias_semana, list) else str(self.dias_semana)
        return f"{self.nombre} - {self.polideportivo} ({dias_str} {self.horario})"
