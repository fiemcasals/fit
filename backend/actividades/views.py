from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Actividad
from .serializers import ActividadSerializer

class ActividadViewSet(viewsets.ModelViewSet):
    """
    API ViewSet para el ABM completo de Actividades / Clases.
    Endpoints:
    - GET /api/actividades/ -> Lista de actividades con filtros
    - POST /api/actividades/ -> Crear nueva actividad / clase
    - GET /api/actividades/{id}/ -> Detalle de actividad
    - PUT / PATCH /api/actividades/{id}/ -> Modificar actividad
    - DELETE /api/actividades/{id}/ -> Eliminar actividad
    - GET /api/actividades/resumen/ -> Estadísticas rápidas para el dashboard
    """
    queryset = Actividad.objects.all()
    serializer_class = ActividadSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['nombre', 'polideportivo', 'profesor', 'horario']
    ordering_fields = ['nombre', 'horario', 'created_at', 'cupo_maximo']
    ordering = ['nombre', 'horario']

    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Filtro opcional por estado activa
        activa = self.request.query_params.get('activa')
        if activa is not None:
            queryset = queryset.filter(activa=activa.lower() in ['true', '1', 'yes'])
            
        # Filtro por sede / polideportivo
        sede = self.request.query_params.get('polideportivo')
        if sede:
            queryset = queryset.filter(polideportivo__icontains=sede)

        # Filtro por horario
        horario = self.request.query_params.get('horario')
        if horario:
            queryset = queryset.filter(horario__icontains=horario)

        # Filtro por día de la semana
        dia = self.request.query_params.get('dia')
        if dia:
            # Filtro en JSONField
            queryset = queryset.filter(dias_semana__icontains=dia)

        return queryset

    @action(detail=False, methods=['get'])
    def resumen(self, request):
        """
        Retorna estadísticas globales sobre las actividades configuradas.
        """
        total = Actividad.objects.count()
        activas = Actividad.objects.filter(activa=True).count()
        sedes = Actividad.objects.values_list('polideportivo', flat=True).distinct()
        
        return Response({
            'total_actividades': total,
            'actividades_activas': activas,
            'total_sedes': len(sedes),
            'sedes': list(sedes)
        })
