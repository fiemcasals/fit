from django.contrib import admin
from .models import Alumno

@admin.register(Alumno)
class AlumnoAdmin(admin.ModelAdmin):
    list_display = ('apellido', 'nombre', 'dni', 'telefono', 'activo', 'created_at')
    list_filter = ('activo', 'clases')
    search_fields = ('nombre', 'apellido', 'dni', 'telefono')
    filter_horizontal = ('clases',)
