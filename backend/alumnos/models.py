from django.db import models
from actividades.models import Actividad

class Alumno(models.Model):
    """
    Modelo de Alumno para el requerimiento RF-02 (Padrón y Asignación de Alumnos).
    Permite registrar datos personales, contacto y la inscripción a una o más clases.
    """
    nombre = models.CharField(max_length=100, verbose_name="Nombre")
    apellido = models.CharField(max_length=100, verbose_name="Apellido")
    dni = models.CharField(max_length=20, unique=True, blank=True, null=True, verbose_name="DNI / Documento")
    fecha_nacimiento = models.DateField(blank=True, null=True, verbose_name="Fecha de Nacimiento")
    telefono = models.CharField(max_length=50, blank=True, default="", verbose_name="Teléfono / Contacto")
    email = models.EmailField(blank=True, default="", verbose_name="Correo Electrónico")
    observaciones_medicas = models.TextField(
        blank=True,
        default="",
        verbose_name="Observaciones Médicas / Contacto de Emergencia",
        help_text="Apto físico, alergias, teléfono de urgencias"
    )
    clases = models.ManyToManyField(
        Actividad,
        related_name="alumnos",
        blank=True,
        verbose_name="Clases / Actividades Asignadas"
    )
    activo = models.BooleanField(default=True, verbose_name="Alumno Activo")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Fecha de alta")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Última actualización")

    class Meta:
        verbose_name = "Alumno"
        verbose_name_plural = "Alumnos"
        ordering = ['apellido', 'nombre']

    @property
    def nombre_completo(self):
        return f"{self.apellido}, {self.nombre}"

    def __str__(self):
        return self.nombre_completo
