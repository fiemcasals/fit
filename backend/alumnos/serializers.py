from rest_framework import serializers
from .models import Alumno
from actividades.models import Actividad
from actividades.serializers import ActividadSerializer

class AlumnoSerializer(serializers.ModelSerializer):
    """
    Serializer para el modelo Alumno.
    Soporta lista de IDs de clases para escritura (`clases_ids`) y
    lista detallada de objetos para lectura (`clases_detalle`).
    """
    nombre_completo = serializers.ReadOnlyField()
    clases_detalle = ActividadSerializer(source='clases', many=True, read_only=True)
    clases = serializers.PrimaryKeyRelatedField(
        many=True,
        queryset=Actividad.objects.all(),
        required=False
    )

    class Meta:
        model = Alumno
        fields = [
            'id',
            'nombre',
            'apellido',
            'nombre_completo',
            'dni',
            'fecha_nacimiento',
            'telefono',
            'email',
            'observaciones_medicas',
            'clases',
            'clases_detalle',
            'activo',
            'created_at',
            'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def validate_nombre(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError("El nombre del alumno es obligatorio.")
        return value.strip().title()

    def validate_apellido(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError("El apellido del alumno es obligatorio.")
        return value.strip().title()

    def validate_dni(self, value):
        if value:
            value = value.strip().replace('.', '').replace('-', '')
            # Check unique if provided
            qs = Alumno.objects.filter(dni=value)
            if self.instance:
                qs = qs.exclude(id=self.instance.id)
            if qs.exists():
                raise serializers.ValidationError("Ya existe un alumno registrado con ese DNI.")
        return value or None
