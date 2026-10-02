from django.contrib import admin
from .models import RegistroAsistencia, NovedadClase

@admin.register(RegistroAsistencia)
class RegistroAsistenciaAdmin(admin.ModelAdmin):
    list_display = ('fecha', 'clase', 'alumno', 'estado', 'observacion', 'created_at')
    list_filter = ('fecha', 'estado', 'clase')
    search_fields = ('alumno__nombre', 'alumno__apellido', 'alumno__dni', 'clase__nombre')
    date_hierarchy = 'fecha'

@admin.register(NovedadClase)
class NovedadClaseAdmin(admin.ModelAdmin):
    list_display = ('fecha', 'clase', 'estado_clase', 'observaciones', 'created_at')
    list_filter = ('estado_clase', 'fecha', 'clase')
    search_fields = ('clase__nombre', 'observaciones')
    date_hierarchy = 'fecha'
