# Requerimientos -- fitPM

_Generado automaticamente el 2026-10-02T14:07:27.650Z -- no editar a mano, se sobreescribe en cada publicacion._

## HU-01: Gestión de Clases, Horarios y Alumnos

### RF-01: Modelo y ABM de Actividades / Clases (Funcional)

Definición de actividad (ej. Deporte / Taller), sede / polideportivo, días de semana asignados y franjas horarias (17 hs, 18 hs, 19 hs).

**Condiciones de aprobación**

_Sin condiciones de aprobación cargadas: pedíselas al Project Manager o al Scrum Master antes de darlo por terminado._

### RF-02: Padrón y Asignación de Alumnos (Funcional)

Registro de alumnos (Nombre, Apellido, datos de contacto) e inscripción / asociación a una o más clases.

**Condiciones de aprobación**

_Sin condiciones de aprobación cargadas: pedíselas al Project Manager o al Scrum Master antes de darlo por terminado._

## HU-02: Toma de Asistencia Rápida por Clase

### RF-01: Pantalla de Toma de Asistencia Diaria (Funcional)

Selector de fecha y clase activa; grilla/lista táctil de alumnos con toggle rápido (Presente / Ausente) y guardado instantáneo.

**Condiciones de aprobación**

_Sin condiciones de aprobación cargadas: pedíselas al Project Manager o al Scrum Master antes de darlo por terminado._

### RF-02: Registro de Novedades y Suspensiones de Clase (Funcional)

Posibilidad de registrar eventos especiales sobre el día de clase (ej. Suspendido por corte de luz, Feriado, observaciones del docente).

**Condiciones de aprobación**

_Sin condiciones de aprobación cargadas: pedíselas al Project Manager o al Scrum Master antes de darlo por terminado._

## HU-03: Generación y Exportación de Planillas Oficiales de Asistencia

### RF-01: Motor de Generación de Planilla Mensual Polideportivo GCBA (Funcional)

Vista matriz mensual (días 1 al 31) consolidando asistencias, inasistencias y totales por alumno según el formato de la planilla oficial.

**Condiciones de aprobación**

_Sin condiciones de aprobación cargadas: pedíselas al Project Manager o al Scrum Master antes de darlo por terminado._

### RF-02: Exportación y Descarga de Planillas (CSV / Excel / PDF) (Funcional)

Exportación directa del reporte mensual respetando los encabezados oficiales (Secretaría de Deportes GCBA, Actividad, Mes, Año, Profesor) para su entrega o envío.

**Condiciones de aprobación**

_Sin condiciones de aprobación cargadas: pedíselas al Project Manager o al Scrum Master antes de darlo por terminado._

## RO-01: Configuración de Infraestructura y Despliegue en VPS

### RF-01: Configuración de Virtual Host en Nginx y SSL (Funcional)

Creación del archivo de configuración en Nginx para el nuevo dominio, proxy reverso al puerto de la app y emisión de certificado SSL con Let's Encrypt / Certbot.

**Condiciones de aprobación**

_Sin condiciones de aprobación cargadas: pedíselas al Project Manager o al Scrum Master antes de darlo por terminado._

### RF-02: Configuración del Entorno de Ejecución y Servicio de la App (Funcional)

Configuración de variables de entorno de producción, script de inicio/daemon (systemd / Docker) y verificación de conectividad.

**Condiciones de aprobación**

_Sin condiciones de aprobación cargadas: pedíselas al Project Manager o al Scrum Master antes de darlo por terminado._
