from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status
from .models import Alumno
from actividades.models import Actividad

class AlumnoModelTest(TestCase):
    """Pruebas unitarias sobre el modelo Alumno (RF-02)."""
    def setUp(self):
        self.clase = Actividad.objects.create(
            nombre="Fútbol Infantil",
            polideportivo="Polideportivo Patricios",
            dias_semana=["Martes", "Jueves"],
            horario="17:00"
        )
        self.alumno = Alumno.objects.create(
            nombre="Lucas",
            apellido="Juarez",
            dni="45123456",
            telefono="11-2345-6789",
            email="lucas@example.com"
        )
        self.alumno.clases.add(self.clase)

    def test_creacion_alumno(self):
        self.assertEqual(self.alumno.nombre, "Lucas")
        self.assertEqual(self.alumno.apellido, "Juarez")
        self.assertEqual(self.alumno.nombre_completo, "Juarez, Lucas")
        self.assertEqual(str(self.alumno), "Juarez, Lucas")
        self.assertEqual(self.alumno.clases.count(), 1)
        self.assertTrue(self.alumno.activo)


class AlumnoAPITest(APITestCase):
    """Pruebas de integración para los endpoints de Alumnos (RF-02)."""
    def setUp(self):
        self.clase1 = Actividad.objects.create(
            nombre="Fútbol Infantil 17hs",
            polideportivo="Polideportivo Patricios",
            dias_semana=["Martes", "Jueves"],
            horario="17:00"
        )
        self.clase2 = Actividad.objects.create(
            nombre="Gimnasia 18hs",
            polideportivo="Polideportivo Patricios",
            dias_semana=["Martes", "Jueves"],
            horario="18:00"
        )
        self.alumno1 = Alumno.objects.create(
            nombre="Bruno",
            apellido="Ballesteros",
            dni="48111222",
            telefono="11-9876-5432"
        )
        self.alumno1.clases.add(self.clase1)

    def test_listar_alumnos(self):
        url = reverse('alumno-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        results = response.data.get('results', response.data)
        self.assertEqual(len(results), 1)

    def test_crear_alumno_con_clases(self):
        url = reverse('alumno-list')
        data = {
            "nombre": "Milena",
            "apellido": "Santangello",
            "dni": "49333444",
            "telefono": "11-4444-5555",
            "email": "milena@example.com",
            "clases": [self.clase1.id, self.clase2.id]
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Alumno.objects.count(), 2)
        alumno_creado = Alumno.objects.get(dni="49333444")
        self.assertEqual(alumno_creado.clases.count(), 2)

    def test_inscribir_alumno_en_clase(self):
        url = reverse('alumno-inscribir', kwargs={'pk': self.alumno1.id})
        data = {'clase_id': self.clase2.id}
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.alumno1.refresh_from_db()
        self.assertEqual(self.alumno1.clases.count(), 2)

    def test_desinscribir_alumno_de_clase(self):
        url = reverse('alumno-desinscribir', kwargs={'pk': self.alumno1.id})
        data = {'clase_id': self.clase1.id}
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.alumno1.refresh_from_db()
        self.assertEqual(self.alumno1.clases.count(), 0)

    def test_filtrar_alumnos_por_clase(self):
        # Crear otro alumno sin clase
        Alumno.objects.create(nombre="Valen", apellido="Del Soto", dni="50123987")
        url = f"{reverse('alumno-list')}?clase={self.clase1.id}"
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        results = response.data.get('results', response.data)
        self.assertEqual(len(results), 1)
        self.assertEqual(results[0]['apellido'], "Ballesteros")

    def test_resumen_alumnos(self):
        url = reverse('alumno-resumen')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['total_alumnos'], 1)
        self.assertEqual(response.data['alumnos_activos'], 1)
        self.assertEqual(response.data['alumnos_inscriptos'], 1)
