from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status
from datetime import date
from .models import RegistroAsistencia
from actividades.models import Actividad
from alumnos.models import Alumno

class AsistenciaModelTest(TestCase):
    """Pruebas unitarias sobre el modelo RegistroAsistencia (RF-03)."""
    def setUp(self):
        self.clase = Actividad.objects.create(
            nombre="Fútbol Infantil 17hs",
            horario="17:00"
        )
        self.alumno = Alumno.objects.create(
            nombre="Lucas",
            apellido="Juarez",
            dni="45123456"
        )
        self.alumno.clases.add(self.clase)
        self.registro = RegistroAsistencia.objects.create(
            clase=self.clase,
            alumno=self.alumno,
            fecha=date(2026, 8, 11),
            estado="presente"
        )

    def test_creacion_asistencia(self):
        self.assertEqual(self.registro.estado, "presente")
        self.assertEqual(self.registro.fecha, date(2026, 8, 11))
        self.assertEqual(self.registro.clase, self.clase)
        self.assertEqual(self.registro.alumno, self.alumno)


class AsistenciaAPITest(APITestCase):
    """Pruebas de integración para endpoints de Asistencia (RF-03)."""
    def setUp(self):
        self.clase = Actividad.objects.create(
            nombre="Gimnasia 18hs",
            polideportivo="Polideportivo Patricios",
            horario="18:00"
        )
        self.alumno1 = Alumno.objects.create(nombre="Eduardo", apellido="Herrera", dni="30111222")
        self.alumno2 = Alumno.objects.create(nombre="Laura", apellido="Ramirez", dni="32333444")
        self.alumno1.clases.add(self.clase)
        self.alumno2.clases.add(self.clase)

    def test_planilla_clase(self):
        url = f"{reverse('asistencia-planilla-clase')}?clase={self.clase.id}&fecha=2026-08-11"
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['total_alumnos'], 2)
        self.assertEqual(len(response.data['alumnos']), 2)

    def test_guardar_lote_asistencia(self):
        url = reverse('asistencia-guardar-lote')
        data = {
            "clase_id": self.clase.id,
            "fecha": "2026-08-11",
            "asistencias": [
                {"alumno_id": self.alumno1.id, "estado": "presente"},
                {"alumno_id": self.alumno2.id, "estado": "ausente", "observacion": "Aviso médico"}
            ]
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(RegistroAsistencia.objects.count(), 2)

        reg1 = RegistroAsistencia.objects.get(alumno=self.alumno1, fecha="2026-08-11")
        reg2 = RegistroAsistencia.objects.get(alumno=self.alumno2, fecha="2026-08-11")
        self.assertEqual(reg1.estado, "presente")
        self.assertEqual(reg2.estado, "ausente")
        self.assertEqual(reg2.observacion, "Aviso médico")

    def test_toggle_asistencia(self):
        url = reverse('asistencia-toggle')
        data = {
            "clase_id": self.clase.id,
            "alumno_id": self.alumno1.id,
            "fecha": "2026-08-11"
        }
        # Primer toggle -> crea como presente
        res1 = self.client.post(url, data, format='json')
        self.assertEqual(res1.status_code, status.HTTP_200_OK)
        self.assertEqual(res1.data['estado'], "presente")

        # Segundo toggle -> cambia a ausente
        res2 = self.client.post(url, data, format='json')
        self.assertEqual(res2.status_code, status.HTTP_200_OK)
        self.assertEqual(res2.data['estado'], "ausente")

    def test_resumen_dia(self):
        RegistroAsistencia.objects.create(clase=self.clase, alumno=self.alumno1, fecha="2026-08-11", estado="presente")
        RegistroAsistencia.objects.create(clase=self.clase, alumno=self.alumno2, fecha="2026-08-11", estado="ausente")

        url = f"{reverse('asistencia-resumen-dia')}?fecha=2026-08-11"
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['total_registros'], 2)
        self.assertEqual(response.data['presentes'], 1)
        self.assertEqual(response.data['ausentes'], 1)
        self.assertEqual(response.data['porcentaje_asistencia'], 50.0)


class NovedadClaseAPITest(APITestCase):
    """Pruebas para registro de novedades y suspensiones de clase (RF-04 / REQ-1790949656976)."""
    def setUp(self):
        self.clase = Actividad.objects.create(
            nombre="Fútbol 19hs",
            polideportivo="Polideportivo Chacabuco",
            horario="19:00"
        )

    def test_registrar_jornada_normal(self):
        url = reverse('novedad-registrar-jornada')
        data = {
            "clase_id": self.clase.id,
            "fecha": "2026-08-12",
            "estado_clase": "normal",
            "observaciones": "Clase dictada con normalidad"
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['estado_clase'], 'normal')
        self.assertTrue(response.data['es_computable'])

    def test_registrar_jornada_suspendida_y_resumen(self):
        from .models import NovedadClase
        NovedadClase.objects.create(clase=self.clase, fecha=date(2026, 8, 5), estado_clase="normal")
        NovedadClase.objects.create(clase=self.clase, fecha=date(2026, 8, 12), estado_clase="suspendida_luz", observaciones="Corte general Edenor")
        NovedadClase.objects.create(clase=self.clase, fecha=date(2026, 8, 19), estado_clase="suspendida_clima", observaciones="Tormenta fuerte")
        NovedadClase.objects.create(clase=self.clase, fecha=date(2026, 8, 26), estado_clase="normal")

        url = f"{reverse('novedad-resumen-mensual')}?clase={self.clase.id}&mes=8&anio=2026"
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['total_jornadas_registradas'], 4)
        self.assertEqual(response.data['clases_dictadas'], 2)
        self.assertEqual(response.data['clases_suspendidas'], 2)
        self.assertEqual(response.data['desglose']['suspendida_luz'], 1)
        self.assertEqual(response.data['desglose']['suspendida_clima'], 1)

    def test_matriz_mensual_generacion(self):
        alumno = Alumno.objects.create(nombre="Carlos", apellido="Tevez", dni="31222333")
        alumno.clases.add(self.clase)
        RegistroAsistencia.objects.create(clase=self.clase, alumno=alumno, fecha=date(2026, 8, 5), estado="presente")
        RegistroAsistencia.objects.create(clase=self.clase, alumno=alumno, fecha=date(2026, 8, 12), estado="ausente")

        url = f"{reverse('asistencia-matriz-mensual')}?clase={self.clase.id}&mes=8&anio=2026"
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('encabezado', response.data)
        self.assertEqual(response.data['encabezado']['organismo'], 'SECRETARIA DE DEPORTES')
        self.assertEqual(response.data['encabezado']['mes_nombre'], 'Agosto')
        self.assertEqual(response.data['total_alumnos_inscriptos'], 1)
        
        alumno_data = response.data['alumnos'][0]
        self.assertEqual(alumno_data['apellido'], 'Tevez')
        self.assertEqual(alumno_data['dias']['5'], 'P')
        self.assertEqual(alumno_data['dias']['12'], 'A')
        self.assertEqual(alumno_data['total_asistencias'], 1)
