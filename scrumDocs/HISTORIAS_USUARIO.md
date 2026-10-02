# Historias de Usuario -- fitPM

_Generado automaticamente el 2026-10-02T14:06:56.123Z -- no editar a mano, se sobreescribe en cada publicacion._

## HU-01: Gestión de Clases, Horarios y Alumnos

Como profesor/administrador quiero gestionar las actividades, horarios y la nómina de alumnos para organizar los grupos de cada clase.

### Criterios de Aceptacion

1. El profesor/administrador puede crear, editar y consultar actividades indicando: sede/polideportivo, días de la semana y franja horaria (ej: 17 hs, 18 hs, 19 hs).
2. Permite registrar alumnos con Nombre, Apellido y datos de contacto.
3. Permite inscribir y dar de baja alumnos en una o varias clases específicas.
4. La nómina de alumnos de cada clase debe poder visualizarse ordenada alfabéticamente por Apellido y Nombre.

## HU-02: Toma de Asistencia Rápida por Clase

Como profesor quiero una interfaz ágil para marcar el presente de los alumnos en la clase del día y registrar novedades como clases suspendidas o feriados.

### Criterios de Aceptacion

1. Al seleccionar fecha y clase, el sistema carga automáticamente el listado de alumnos inscriptos en ese horario.
2. La interfaz permite alternar el estado (Presente / Ausente) con un solo toque/click por alumno.
3. Permite registrar novedades de la jornada (ej: Suspendido sin luz, Feriado, observaciones del docente) afectando a la clase del día.
4. El estado de asistencia queda guardado de manera persistente e inmediata al realizar cada cambio.

## HU-03: Generación y Exportación de Planillas Oficiales de Asistencia

Como profesor/coordinador quiero generar y exportar la planilla mensual de asistencia con el formato oficial del Polideportivo / GCBA para el envío de reportes.

### Criterios de Aceptacion

1. Genera una matriz mensual donde las columnas son los días del mes (1 al 31) y las filas son los alumnos inscriptos.
2. Muestra los presentes de cada alumno en los días en que hubo clase y totaliza las asistencias mensuales por alumno.
3. Incluye en el reporte los encabezados oficiales requeridos: Secretaría de Deportes GCBA, Polideportivo, Actividad, Días y Horarios, Profesor, Mes y Año.
4. Permite descargar/exportar el reporte en formato CSV compatible con la plantilla del GCBA y en formato descargable/imprimible.
