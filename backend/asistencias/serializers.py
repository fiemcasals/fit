from rest_framework import serializers
from .models import RegistroAsistencia
from alumnos.serializers import AlumnoSerializer
from actividades.serializers import ActividadSerializer

class RegistroAsistenciaSerializer(serializers.ModelSerializer):
    """
    Serializer para el registro de asistencia.
    """
    alumno_detalle = AlumnoSerializer(source='alumno', read_only=True)
    clase_detalle = ActividadSerializer(source='clase', read_only=True)

    class Meta:
        model = RegistroAsistencia
        fields = [
            'id',
            'clase',
            'clase_detalle',
            'alumno',
            'alumno_detalle',
            'fecha',
            'estado',
            'observacion',
            'created_at',
            'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class BulkAsistenciaItemSerializer(serializers.Serializer):
    alumno_id = serializers.IntegerField()
    estado = serializers.ChoiceField(choices=['presente', 'ausente'], default='presente')
    observacion = serializers.CharField(required=False, allow_blank=True, default='')


class BulkAsistenciaSerializer(serializers.Serializer):
    clase_id = serializers.IntegerField()
    fecha = serializers.DateField()
    asistencias = BulkAsistenciaItemSerializer(many=True)


class NovedadClaseSerializer(serializers.ModelSerializer):
    """Serializer para el registro de novedades y suspensiones de jornada de clase."""
    clase_detalle = ActividadSerializer(source='clase', read_only=True)
    estado_display = serializers.CharField(source='get_estado_clase_display', read_only=True)
    es_computable = serializers.BooleanField(read_only=True)

    class Meta:
        from .models import NovedadClase
        model = NovedadClase
        fields = [
            'id',
            'clase',
            'clase_detalle',
            'fecha',
            'estado_clase',
            'estado_display',
            'es_computable',
            'observaciones',
            'created_at',
            'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
