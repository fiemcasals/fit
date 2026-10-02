from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from datetime import date
from .models import RegistroAsistencia
from .serializers import RegistroAsistenciaSerializer, BulkAsistenciaSerializer
from actividades.models import Actividad
from alumnos.models import Alumno

class AsistenciaViewSet(viewsets.ModelViewSet):
    """
    API ViewSet para la toma y consulta de Asistencia Diaria (RF-03).
    Endpoints:
    - GET /api/asistencias/ -> Registros de asistencia
    - GET /api/asistencias/planilla_clase/?clase=ID&fecha=YYYY-MM-DD -> Lista de alumnos de la clase con su estado de asistencia para el día
    - POST /api/asistencias/guardar_lote/ -> Guardado masivo de asistencias del día
    - POST /api/asistencias/toggle/ -> Alternar presente/ausente de un alumno
    - GET /api/asistencias/resumen_dia/?fecha=YYYY-MM-DD -> Resumen diario
    """
    queryset = RegistroAsistencia.objects.select_related('clase', 'alumno').all()
    serializer_class = RegistroAsistenciaSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        clase_id = self.request.query_params.get('clase')
        fecha = self.request.query_params.get('fecha')
        alumno_id = self.request.query_params.get('alumno')

        if clase_id:
            queryset = queryset.filter(clase_id=clase_id)
        if fecha:
            queryset = queryset.filter(fecha=fecha)
        if alumno_id:
            queryset = queryset.filter(alumno_id=alumno_id)

        return queryset

    @action(detail=False, methods=['get'])
    def planilla_clase(self, request):
        """
        Devuelve la nómina completa de alumnos inscriptos en una clase,
        cruzada con el registro de asistencia del día especificado.
        """
        clase_id = request.query_params.get('clase')
        fecha_str = request.query_params.get('fecha') or str(date.today())

        if not clase_id:
            return Response({'error': 'El parámetro clase es obligatorio'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            clase = Actividad.objects.get(id=clase_id)
        except Actividad.DoesNotExist:
            return Response({'error': 'Clase no encontrada'}, status=status.HTTP_404_NOT_FOUND)

        # Alumnos inscriptos en la clase
        alumnos = clase.alumnos.filter(activo=True).order_by('apellido', 'nombre')

        # Registros existentes para esa fecha y clase
        registros_existentes = {
            r.alumno_id: r
            for r in RegistroAsistencia.objects.filter(clase=clase, fecha=fecha_str)
        }

        resultado = []
        for alumno in alumnos:
            registro = registros_existentes.get(alumno.id)
            resultado.append({
                'alumno_id': alumno.id,
                'nombre_completo': alumno.nombre_completo,
                'dni': alumno.dni,
                'telefono': alumno.telefono,
                'estado': registro.estado if registro else 'presente',
                'observacion': registro.observacion if registro else '',
                'registrado': registro is not None,
                'registro_id': registro.id if registro else None
            })

        presentes = sum(1 for item in resultado if item['estado'] == 'presente')
        ausentes = sum(1 for item in resultado if item['estado'] == 'ausente')

        return Response({
            'clase': {
                'id': clase.id,
                'nombre': clase.nombre,
                'horario': clase.horario,
                'polideportivo': clase.polideportivo,
                'profesor': clase.profesor
            },
            'fecha': fecha_str,
            'total_alumnos': len(resultado),
            'presentes': presentes,
            'ausentes': ausentes,
            'alumnos': resultado
        })

    @action(detail=False, methods=['post'])
    def toggle(self, request):
        """
        Alterna el estado Presente <-> Ausente para un alumno en una fecha y clase.
        """
        clase_id = request.data.get('clase_id')
        alumno_id = request.data.get('alumno_id')
        fecha_str = request.data.get('fecha') or str(date.today())
        nuevo_estado = request.data.get('estado')  # opcional: 'presente' o 'ausente'

        if not clase_id or not alumno_id:
            return Response({'error': 'clase_id y alumno_id son requeridos'}, status=status.HTTP_400_BAD_REQUEST)

        registro, created = RegistroAsistencia.objects.get_or_create(
            clase_id=clase_id,
            alumno_id=alumno_id,
            fecha=fecha_str,
            defaults={'estado': nuevo_estado or 'presente'}
        )

        if not created and not nuevo_estado:
            registro.estado = 'ausente' if registro.estado == 'presente' else 'presente'
            registro.save()
        elif nuevo_estado and registro.estado != nuevo_estado:
            registro.estado = nuevo_estado
            registro.save()

        serializer = self.get_serializer(registro)
        return Response(serializer.data)

    @action(detail=False, methods=['post'])
    def guardar_lote(self, request):
        """
        Guarda o actualiza masivamente las asistencias de una clase para una fecha.
        """
        serializer = BulkAsistenciaSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        data = serializer.validated_data
        clase_id = data['clase_id']
        fecha = data['fecha']
        asistencias_data = data['asistencias']

        guardados = []
        for item in asistencias_data:
            reg, _ = RegistroAsistencia.objects.update_or_create(
                clase_id=clase_id,
                alumno_id=item['alumno_id'],
                fecha=fecha,
                defaults={
                    'estado': item['estado'],
                    'observacion': item.get('observacion', '')
                }
            )
            guardados.append(reg)

        return Response({
            'mensaje': f'Asistencias guardadas exitosamente ({len(guardados)} registros)',
            'clase_id': clase_id,
            'fecha': str(fecha),
            'total_guardados': len(guardados)
        })

    @action(detail=False, methods=['get'])
    def resumen_dia(self, request):
        """Métricas de asistencias para una fecha dada."""
        fecha_str = request.query_params.get('fecha') or str(date.today())
        registros = RegistroAsistencia.objects.filter(fecha=fecha_str)

        total = registros.count()
        presentes = registros.filter(estado='presente').count()
        ausentes = registros.filter(estado='ausente').count()
        clases_con_asistencia = registros.values('clase').distinct().count()

        return Response({
            'fecha': fecha_str,
            'total_registros': total,
            'presentes': presentes,
            'ausentes': ausentes,
            'clases_con_asistencia': clases_con_asistencia,
            'porcentaje_asistencia': round((presentes / total * 100), 1) if total > 0 else 0
        })


class NovedadClaseViewSet(viewsets.ModelViewSet):
    """
    API ViewSet para Novedades y Suspensiones de Clase (RF-04 / REQ-1790949656976).
    Endpoints:
    - GET /api/novedades/ -> Listado de novedades (filtros por clase, fecha, mes, anio)
    - POST /api/novedades/ -> Crear novedad
    - PUT/PATCH /api/novedades/{id}/ -> Actualizar novedad
    - POST /api/novedades/registrar_jornada/ -> Registrar o actualizar novedad de una clase en una fecha
    - GET /api/novedades/resumen_mensual/?clase=ID&mes=MM&anio=YYYY -> Cómputo de días hábiles y clases dictadas
    """
    from .models import NovedadClase
    from .serializers import NovedadClaseSerializer
    queryset = NovedadClase.objects.select_related('clase').all()
    serializer_class = NovedadClaseSerializer

    def get_queryset(self):
        from .models import NovedadClase
        queryset = NovedadClase.objects.select_related('clase').all()
        clase_id = self.request.query_params.get('clase')
        fecha = self.request.query_params.get('fecha')
        mes = self.request.query_params.get('mes')
        anio = self.request.query_params.get('anio')

        if clase_id:
            queryset = queryset.filter(clase_id=clase_id)
        if fecha:
            queryset = queryset.filter(fecha=fecha)
        if mes and anio:
            queryset = queryset.filter(fecha__year=anio, fecha__month=mes)

        return queryset

    @action(detail=False, methods=['post'])
    def registrar_jornada(self, request):
        """Crea o actualiza la novedad de una clase para una fecha específica."""
        from .models import NovedadClase
        from .serializers import NovedadClaseSerializer
        clase_id = request.data.get('clase_id')
        fecha_str = request.data.get('fecha')
        estado_clase = request.data.get('estado_clase', 'normal')
        observaciones = request.data.get('observaciones', '')

        if not clase_id or not fecha_str:
            return Response({'error': 'clase_id y fecha son obligatorios'}, status=status.HTTP_400_BAD_REQUEST)

        novedad, created = NovedadClase.objects.update_or_create(
            clase_id=clase_id,
            fecha=fecha_str,
            defaults={
                'estado_clase': estado_clase,
                'observaciones': observaciones
            }
        )

        serializer = NovedadClaseSerializer(novedad)
        return Response(serializer.data, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)

    @action(detail=False, methods=['get'])
    def resumen_mensual(self, request):
        """Calcula los días dictados, suspendidos y el impacto en el cómputo mensual."""
        from .models import NovedadClase
        clase_id = request.query_params.get('clase')
        mes = request.query_params.get('mes') or date.today().month
        anio = request.query_params.get('anio') or date.today().year

        if not clase_id:
            return Response({'error': 'El parámetro clase es obligatorio'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            clase = Actividad.objects.get(id=clase_id)
        except Actividad.DoesNotExist:
            return Response({'error': 'Clase no encontrada'}, status=status.HTTP_404_NOT_FOUND)

        novedades = NovedadClase.objects.filter(clase=clase, fecha__year=anio, fecha__month=mes)

        total_registradas = novedades.count()
        dictadas_normal = novedades.filter(estado_clase='normal').count()
        suspendidas_luz = novedades.filter(estado_clase='suspendida_luz').count()
        suspendidas_clima = novedades.filter(estado_clase='suspendida_clima').count()
        feriados = novedades.filter(estado_clase='feriado').count()
        otros = novedades.filter(estado_clase__in=['paro', 'otro']).count()

        total_suspendidas = total_registradas - dictadas_normal

        return Response({
            'clase': {
                'id': clase.id,
                'nombre': clase.nombre,
                'horario': clase.horario
            },
            'mes': int(mes),
            'anio': int(anio),
            'total_jornadas_registradas': total_registradas,
            'clases_dictadas': dictadas_normal,
            'clases_suspendidas': total_suspendidas,
            'desglose': {
                'normal': dictadas_normal,
                'suspendida_luz': suspendidas_luz,
                'suspendida_clima': suspendidas_clima,
                'feriado': feriados,
                'otros': otros
            }
        })
