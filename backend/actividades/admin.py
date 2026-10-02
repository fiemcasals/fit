from django.contrib import admin
from .models import Actividad

@admin.register(Actividad)
class ActividadAdmin(admin.ModelAdmin):
    list_display = ('nombre', 'polideportivo', 'profesor', 'horario', 'cupo_maximo', 'activa', 'created_at')
    list_filter = ('activa', 'polideportivo', 'horario')
    search_fields = ('nombre', 'profesor', 'polideportivo')
    ordering = ('nombre', 'horario')
