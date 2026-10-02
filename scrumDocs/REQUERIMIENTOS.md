# Requerimientos -- fitPM

_Generado automaticamente el 2026-10-02T15:37:25.727Z -- no editar a mano, se sobreescribe en cada publicacion._

## HU-01: Gestión de Clases, Horarios y Alumnos

### RF-01: Modelo y ABM de Actividades / Clases (Funcional)

Definición de actividad (ej. Deporte / Taller), sede / polideportivo, días de semana asignados y franjas horarias (17 hs, 18 hs, 19 hs).

**Condiciones de aprobación**

1. Permite crear, editar, listar y eliminar actividades deportivas indicando nombre, sede/polideportivo, profesor, días de clase y franja horaria.
2. Valida que el nombre, horario y al menos un día sean obligatorios.
3. Provee endpoints REST para consulta con filtros por día, sede y horario.

### RF-02: Padrón y Asignación de Alumnos (Funcional)

Registro de alumnos (Nombre, Apellido, datos de contacto) e inscripción / asociación a una o más clases.

**Condiciones de aprobación**

1. Registrar y editar alumnos con nombre y DNI.
2. Inscribir y desinscribir de clases.
3. Filtrar por clase y buscar.

## HU-02: Toma de Asistencia Rápida por Clase

### RF-01: Pantalla de Toma de Asistencia Diaria (Funcional)

Selector de fecha y clase activa; grilla/lista táctil de alumnos con toggle rápido (Presente / Ausente) y guardado instantáneo.

**Condiciones de aprobación**

1. Permite seleccionar una fecha y una clase para cargar la nómina de alumnos inscriptos.
2. Permite alternar el estado Presente / Ausente de cada alumno con un solo toque y persistirlo inmediatamente.
3. Muestra el resumen de presentes y ausentes de la clase en tiempo real.

### RF-02: Registro de Novedades y Suspensiones de Clase (Funcional)

Posibilidad de registrar eventos especiales sobre el día de clase (ej. Suspendido por corte de luz, Feriado, observaciones del docente).

**Condiciones de aprobación**

1. Permite registrar novedades del día de clase (clase normal, suspendida por corte de luz, feriado, lluvia/clima u otra causa).
2. Guarda observaciones del docente sobre la jornada.
3. Afecta el cómputo de días válidos de clase del mes.

## HU-03: Generación y Exportación de Planillas Oficiales de Asistencia

### RF-01: Motor de Generación de Planilla Mensual Polideportivo GCBA (Funcional)

Vista matriz mensual (días 1 al 31) consolidando asistencias, inasistencias y totales por alumno según el formato de la planilla oficial.

**Condiciones de aprobación**

1. Genera una matriz mensual con columnas de días 1 al 31 y filas por alumno según formato oficial GCBA.
2. Muestra los presentes por día de clase y calcula automáticamente el total de asistencias del mes por alumno.
3. Incluye los encabezados oficiales de la Secretaría de Deportes, Polideportivo, Actividad, Mes, Año y Profesor.

### RF-02: Exportación y Descarga de Planillas (CSV / Excel / PDF) (Funcional)

Exportación directa del reporte mensual respetando los encabezados oficiales (Secretaría de Deportes GCBA, Actividad, Mes, Año, Profesor) para su entrega o envío.

**Condiciones de aprobación**

1. Permite exportar la planilla mensual a archivo CSV compatible con la plantilla de Deportes GCBA.
2. Permite descargar o imprimir el reporte en formato PDF/imprimible con formato oficial.
3. Valida que el archivo descargado contenga todos los datos y encabezados correctos.

## RO-01: Configuración de Infraestructura y Despliegue en VPS

### RF-01: Configuración de Virtual Host en Nginx y SSL (Funcional)

Creación del archivo de configuración en Nginx para el nuevo dominio, proxy reverso al puerto de la app y emisión de certificado SSL con Let's Encrypt / Certbot.

**Condiciones de aprobación**

1. Archivo de configuración de Nginx para el nuevo dominio con proxy_pass al puerto de la aplicación.
2. Certificado SSL activo (Let's Encrypt / Certbot) con redirección automática HTTP -> HTTPS.
3. Verificación de respuesta 200 OK en el dominio por HTTPS.

### RF-02: Configuración del Entorno de Ejecución y Servicio de la App (Funcional)

Configuración de variables de entorno de producción, script de inicio/daemon (systemd / Docker) y verificación de conectividad.

**Condiciones de aprobación**

1. Variables de entorno de producción configuradas y seguras.
2. Servicio systemd o contenedor Docker Compose activo en el VPS con reinicio automático.
3. Conectividad y persistencia de base de datos PostgreSQL verificada.
