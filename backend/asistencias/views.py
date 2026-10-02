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

    @action(detail=False, methods=['get'])
    def matriz_mensual(self, request):
        """
        Motor de Generación de Planilla Mensual Polideportivo GCBA (RF-05 / REQ-1790949657128).
        Genera la matriz mensual con columnas del día 1 al 31 y filas por alumno,
        cálculo automático de presentes totales por alumno y encabezados oficiales GCBA.
        """
        import calendar
        from .models import NovedadClase

        clase_id = request.query_params.get('clase')
        mes = int(request.query_params.get('mes') or date.today().month)
        anio = int(request.query_params.get('anio') or date.today().year)

        if not clase_id:
            return Response({'error': 'El parámetro clase es obligatorio'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            clase = Actividad.objects.get(id=clase_id)
        except Actividad.DoesNotExist:
            return Response({'error': 'Clase no encontrada'}, status=status.HTTP_404_NOT_FOUND)

        MESES = [
            '', 'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
            'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
        ]
        DIAS_SEMANA = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']

        # Días en el mes
        _, dias_en_mes = calendar.monthrange(anio, mes)

        # Determinar días programados de la actividad
        dias_lista = clase.dias_semana if isinstance(clase.dias_semana, list) else [str(clase.dias_semana)]
        dias_programados = [d.strip().lower() for d in dias_lista if d.strip()]
        dias_str = ", ".join(dias_lista) if dias_lista else "Lunes, Miércoles, Viernes"

        # Mapeo de días de la semana y novedades
        dias_info = []
        novedades_mes = {
            n.fecha.day: n
            for n in NovedadClase.objects.filter(clase=clase, fecha__year=anio, fecha__month=mes)
        }

        for dia in range(1, dias_en_mes + 1):
            fecha_dia = date(anio, mes, dia)
            nombre_dia = DIAS_SEMANA[fecha_dia.weekday()]
            es_programado = any(d in nombre_dia.lower() for d in dias_programados) or len(dias_programados) == 0
            novedad_dia = novedades_mes.get(dia)

            dias_info.append({
                'numero': dia,
                'fecha': str(fecha_dia),
                'dia_semana': nombre_dia[:2],
                'dia_semana_completo': nombre_dia,
                'es_programado': es_programado,
                'estado_jornada': novedad_dia.estado_clase if novedad_dia else ('normal' if es_programado else 'sin_clase'),
                'es_computable': novedad_dia.es_computable if novedad_dia else es_programado
            })

        # Alumnos inscriptos
        alumnos = clase.alumnos.filter(activo=True).order_by('apellido', 'nombre')

        # Asistencias del mes
        registros_mes = RegistroAsistencia.objects.filter(
            clase=clase,
            fecha__year=anio,
            fecha__month=mes
        )
        asistencias_map = {}
        for reg in registros_mes:
            key = (reg.alumno_id, reg.fecha.day)
            asistencias_map[key] = reg.estado

        # Construir matriz de filas por alumno
        filas_alumnos = []
        totales_por_dia = {dia: 0 for dia in range(1, 32)}

        for idx, alumno in enumerate(alumnos, start=1):
            dias_alumno = {}
            total_presentes_alumno = 0

            for dia in range(1, 32):
                if dia <= dias_en_mes:
                    estado_reg = asistencias_map.get((alumno.id, dia))
                    dia_meta = dias_info[dia - 1]

                    if estado_reg == 'presente':
                        simbolo = 'P'
                        total_presentes_alumno += 1
                        totales_por_dia[dia] += 1
                    elif estado_reg == 'ausente':
                        simbolo = 'A'
                    elif not dia_meta['es_computable'] and dia_meta['estado_jornada'] != 'sin_clase':
                        simbolo = 'S' # Suspendida
                    elif dia_meta['es_programado']:
                        simbolo = '' # Día de clase sin registrar aún
                    else:
                        simbolo = '-' # Sin clase programada
                else:
                    simbolo = '' # Meses de menos de 31 días

                dias_alumno[str(dia)] = simbolo

            filas_alumnos.append({
                'nro': idx,
                'alumno_id': alumno.id,
                'apellido': alumno.apellido,
                'nombre': alumno.nombre,
                'nombre_completo': alumno.nombre_completo,
                'dni': alumno.dni or '',
                'dias': dias_alumno,
                'total_asistencias': total_presentes_alumno
            })

        total_general_asistencias = sum(a['total_asistencias'] for a in filas_alumnos)

        return Response({
            'encabezado': {
                'organismo': 'SECRETARIA DE DEPORTES',
                'subtitulo': 'GCBA',
                'titulo': 'PLANILLA DE ASISTENCIA - POLIDEPORTIVO',
                'polideportivo': clase.polideportivo or 'Polideportivo Patricios',
                'id_actividad': clase.id,
                'actividad': clase.nombre,
                'dias_y_horarios': f"{dias_str} {clase.horario}",
                'profesor': clase.profesor or 'Prof. Asignado',
                'mes_numero': mes,
                'mes_nombre': MESES[mes],
                'anio': anio,
                'dias_en_mes': dias_en_mes
            },
            'dias_info': dias_info,
            'alumnos': filas_alumnos,
            'totales_por_dia': {str(k): v for k, v in totales_por_dia.items()},
            'total_general_asistencias': total_general_asistencias,
            'total_alumnos_inscriptos': len(filas_alumnos)
        })

    @action(detail=False, methods=['get'])
    def exportar_csv(self, request):
        """
        Exportación de Planilla Mensual Polideportivo GCBA a CSV (RF-06 / REQ-1790949657258).
        Genera archivo CSV estructurado con formato idéntico a la plantilla oficial de la Secretaría de Deportes.
        """
        import csv
        from django.http import HttpResponse
        import calendar

        clase_id = request.query_params.get('clase')
        mes = int(request.query_params.get('mes') or date.today().month)
        anio = int(request.query_params.get('anio') or date.today().year)

        if not clase_id:
            return Response({'error': 'El parámetro clase es obligatorio'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            clase = Actividad.objects.get(id=clase_id)
        except Actividad.DoesNotExist:
            return Response({'error': 'Clase no encontrada'}, status=status.HTTP_404_NOT_FOUND)

        MESES = [
            '', 'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
            'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
        ]

        # Configurar respuesta HTTP con CSV UTF-8 con BOM para correcta apertura en Excel
        response = HttpResponse(content_type='text/csv; charset=utf-8-sig')
        filename = f"planilla_asistencia_{clase.nombre.replace(' ', '_')}_{MESES[mes]}_{anio}.csv"
        response['Content-Disposition'] = f'attachment; filename="{filename}"'

        writer = csv.writer(response)

        # Encabezados oficiales GCBA
        writer.writerow(['', '', 'SECRETARIA DE DEPORTES'] + [''] * 27)
        writer.writerow(['', '', 'GCBA'] + [''] * 27)
        writer.writerow([''] * 30)
        writer.writerow(['', f'PLANILLA DE ASISTENCIA - POLIDEPORTIVO {clase.polideportivo.upper()}'] + [''] * 28)
        writer.writerow(['', 'ID', '', str(clase.id), '', '', '', f'MES: {MESES[mes].upper()}', '', '', '', '', '', '', '', f'AÑO: {anio}'] + [''] * 14)
        
        dias_lista = clase.dias_semana if isinstance(clase.dias_semana, list) else [str(clase.dias_semana)]
        dias_str = ", ".join(dias_lista) if dias_lista else "Lunes, Miércoles, Viernes"
        writer.writerow(['', f'ACTIVIDAD: {clase.nombre}', '', '', '', '', '', '', '', '', '', f'DIAS Y HORARIOS: {dias_str} {clase.horario}'] + [''] * 17)
        writer.writerow(['', f'PROFESOR: {clase.profesor}'] + [''] * 28)
        writer.writerow([''] * 30)

        # Fila de Columnas (Nº, APELLIDO, NOMBRE, 1..31, TOTAL)
        header_cols = ['Nº', 'APELLIDO', 'NOMBRE'] + [str(i) for i in range(1, 32)] + ['TOTAL']
        writer.writerow(header_cols)

        # Datos de alumnos y cálculo de asistencias
        _, dias_en_mes = calendar.monthrange(anio, mes)
        alumnos = clase.alumnos.filter(activo=True).order_by('apellido', 'nombre')
        registros_mes = RegistroAsistencia.objects.filter(clase=clase, fecha__year=anio, fecha__month=mes)
        
        asistencias_map = {}
        for reg in registros_mes:
            asistencias_map[(reg.alumno_id, reg.fecha.day)] = reg.estado

        totales_por_dia = {dia: 0 for dia in range(1, 32)}

        for idx, alumno in enumerate(alumnos, start=1):
            row = [str(idx), alumno.apellido.upper(), alumno.nombre.upper()]
            total_alumno = 0

            for dia in range(1, 32):
                if dia <= dias_en_mes:
                    estado = asistencias_map.get((alumno.id, dia))
                    if estado == 'presente':
                        row.append('P')
                        total_alumno += 1
                        totales_por_dia[dia] += 1
                    elif estado == 'ausente':
                        row.append('A')
                    else:
                        row.append('')
                else:
                    row.append('')

            row.append(str(total_alumno))
            writer.writerow(row)

        # Fila de Totales por Día
        total_row = ['TOTAL', 'PRESENTES', 'POR DÍA'] + [str(totales_por_dia[d]) if d <= dias_en_mes else '' for d in range(1, 32)] + [str(sum(totales_por_dia.values()))]
        writer.writerow(total_row)

        return response


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
