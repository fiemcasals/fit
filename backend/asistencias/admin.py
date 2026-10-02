from django.contrib import admin
from .models import RegistroAsistencia

@admin.register(RegistroAsistencia)
class RegistroAsistenciaAdmin(admin.ModelAdmin):
    list_display = ('fecha', 'clase', 'alumno', 'estado', 'observacion', 'created_at')
    list_filter = ('fecha', 'estado', 'clase')
    search_fields = ('alumno__nombre', 'alumno__apellido', 'alumno__dni', 'clase__nombre')
    date_hierarchy = 'fecha'
