from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Alumno
from .serializers import AlumnoSerializer
from actividades.models import Actividad

class AlumnoViewSet(viewsets.ModelViewSet):
    """
    API ViewSet para el ABM de Alumnos y gestión de inscripciones a clases.
    Endpoints:
    - GET /api/alumnos/ -> Listado de alumnos con filtros
    - POST /api/alumnos/ -> Registrar nuevo alumno
    - GET /api/alumnos/{id}/ -> Ficha del alumno
    - PUT / PATCH /api/alumnos/{id}/ -> Actualizar datos del alumno
    - DELETE /api/alumnos/{id}/ -> Eliminar alumno
    - POST /api/alumnos/{id}/inscribir/ -> Inscribir a una clase específica
    - POST /api/alumnos/{id}/desinscribir/ -> Dar de baja de una clase
    - GET /api/alumnos/resumen/ -> Estadísticas del padrón
    """
    queryset = Alumno.objects.prefetch_related('clases').all()
    serializer_class = AlumnoSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['nombre', 'apellido', 'dni', 'telefono', 'email']
    ordering_fields = ['apellido', 'nombre', 'created_at']
    ordering = ['apellido', 'nombre']

    def get_queryset(self):
        queryset = super().get_queryset()

        # Filtro por clase
        clase_id = self.request.query_params.get('clase')
        if clase_id:
            queryset = queryset.filter(clases__id=clase_id)

        # Filtro por estado activo
        activo = self.request.query_params.get('activo')
        if activo is not None:
            queryset = queryset.filter(activo=activo.lower() in ['true', '1', 'yes'])

        # Filtro por sede de las clases que cursa
        sede = self.request.query_params.get('sede')
        if sede:
            queryset = queryset.filter(clases__polideportivo__icontains=sede).distinct()

        return queryset

    @action(detail=True, methods=['post'])
    def inscribir(self, request, pk=None):
        """Inscribe al alumno en una clase específica."""
        alumno = self.get_object()
        clase_id = request.data.get('clase_id')
        if not clase_id:
            return Response({'error': 'El campo clase_id es requerido'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            clase = Actividad.objects.get(id=clase_id)
            alumno.clases.add(clase)
            serializer = self.get_serializer(alumno)
            return Response({'mensaje': f'Alumno inscripto en {clase.nombre}', 'alumno': serializer.data})
        except Actividad.DoesNotExist:
            return Response({'error': 'Clase no encontrada'}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=True, methods=['post'])
    def desinscribir(self, request, pk=None):
        """Desinscribe al alumno de una clase específica."""
        alumno = self.get_object()
        clase_id = request.data.get('clase_id')
        if not clase_id:
            return Response({'error': 'El campo clase_id es requerido'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            clase = Actividad.objects.get(id=clase_id)
            alumno.clases.remove(clase)
            serializer = self.get_serializer(alumno)
            return Response({'mensaje': f'Alumno desinscripto de {clase.nombre}', 'alumno': serializer.data})
        except Actividad.DoesNotExist:
            return Response({'error': 'Clase no encontrada'}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=False, methods=['get'])
    def resumen(self, request):
        """Métricas globales del padrón de alumnos."""
        total = Alumno.objects.count()
        activos = Alumno.objects.filter(activo=True).count()
        con_clases = Alumno.objects.filter(clases__isnull=False).distinct().count()

        return Response({
            'total_alumnos': total,
            'alumnos_activos': activos,
            'alumnos_inscriptos': con_clases,
            'sin_asignar': total - con_clases
        })
