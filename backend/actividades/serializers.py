from rest_framework import serializers
from .models import Actividad

class ActividadSerializer(serializers.ModelSerializer):
    """
    Serializer para el modelo Actividad con validaciones completas.
    """
    dias_display = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Actividad
        fields = [
            'id',
            'nombre',
            'polideportivo',
            'profesor',
            'dias_semana',
            'dias_display',
            'horario',
            'cupo_maximo',
            'observaciones',
            'activa',
            'created_at',
            'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_dias_display(self, obj):
        if isinstance(obj.dias_semana, list):
            return ", ".join(obj.dias_semana)
        return str(obj.dias_semana or "")

    def validate_nombre(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError("El nombre de la actividad es requerido.")
        return value.strip()

    def validate_horario(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError("El horario es requerido (ej: 17:00, 18:00, 19:00).")
        return value.strip()

    def validate_dias_semana(self, value):
        if not value:
            raise serializers.ValidationError("Debe seleccionar al menos un día de la semana para la clase.")
        if isinstance(value, list) and len(value) == 0:
            raise serializers.ValidationError("Debe seleccionar al menos un día de la semana para la clase.")
        return value
