from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status
from .models import Actividad

class ActividadModelTest(TestCase):
    """
    Pruebas unitarias sobre el modelo Actividad (RF-01).
    """
    def setUp(self):
        self.actividad = Actividad.objects.create(
            nombre="Gimnasia Artística",
            polideportivo="Polideportivo Patricios",
            profesor="Prof. Mauricio Casals",
            dias_semana=["Martes", "Jueves"],
            horario="17:00",
            cupo_maximo=25,
            observaciones="Clase para grupo inicial"
        )

    def test_creacion_actividad(self):
        self.assertEqual(self.actividad.nombre, "Gimnasia Artística")
        self.assertEqual(self.actividad.polideportivo, "Polideportivo Patricios")
        self.assertEqual(self.actividad.profesor, "Prof. Mauricio Casals")
        self.assertEqual(self.actividad.dias_semana, ["Martes", "Jueves"])
        self.assertEqual(self.actividad.horario, "17:00")
        self.assertEqual(self.actividad.cupo_maximo, 25)
        self.assertTrue(self.actividad.activa)

    def test_str_representation(self):
        expected_str = "Gimnasia Artística - Polideportivo Patricios (Martes, Jueves 17:00)"
        self.assertEqual(str(self.actividad), expected_str)


class ActividadAPITest(APITestCase):
    """
    Pruebas de integración para los endpoints REST de Actividades / Clases (RF-01).
    """
    def setUp(self):
        self.actividad1 = Actividad.objects.create(
            nombre="Fútbol Infantil",
            polideportivo="Polideportivo Patricios",
            profesor="Prof. Mauricio Casals",
            dias_semana=["Lunes", "Miércoles", "Viernes"],
            horario="18:00",
            cupo_maximo=30
        )
        self.actividad2 = Actividad.objects.create(
            nombre="Entrenamiento Funcional",
            polideportivo="Polideportivo Colegiales",
            profesor="Prof. Laura Ramirez",
            dias_semana=["Martes", "Jueves"],
            horario="19:00",
            cupo_maximo=20,
            activa=False
        )

    def test_listar_actividades(self):
        url = reverse('actividad-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Check pagination results
        results = response.data.get('results', response.data)
        self.assertEqual(len(results), 2)

    def test_crear_actividad_valida(self):
        url = reverse('actividad-list')
        data = {
            "nombre": "Natación Adultos",
            "polideportivo": "Polideportivo Patricios",
            "profesor": "Prof. Casals",
            "dias_semana": ["Martes", "Jueves"],
            "horario": "17:00",
            "cupo_maximo": 15,
            "observaciones": "Pileta cubierta"
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Actividad.objects.count(), 3)
        self.assertEqual(response.data['nombre'], "Natación Adultos")
        self.assertEqual(response.data['dias_display'], "Martes, Jueves")

    def test_crear_actividad_invalida_sin_nombre(self):
        url = reverse('actividad-list')
        data = {
            "nombre": "",
            "dias_semana": ["Lunes"],
            "horario": "18:00"
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('nombre', response.data)

    def test_crear_actividad_invalida_sin_dias(self):
        url = reverse('actividad-list')
        data = {
            "nombre": "Básquet",
            "dias_semana": [],
            "horario": "19:00"
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('dias_semana', response.data)

    def test_obtener_detalle_actividad(self):
        url = reverse('actividad-detail', kwargs={'pk': self.actividad1.id})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['nombre'], "Fútbol Infantil")
        self.assertEqual(response.data['horario'], "18:00")

    def test_actualizar_actividad(self):
        url = reverse('actividad-detail', kwargs={'pk': self.actividad1.id})
        data = {
            "nombre": "Fútbol Infantil Avanzado",
            "polideportivo": "Polideportivo Patricios",
            "profesor": "Prof. Mauricio Casals",
            "dias_semana": ["Lunes", "Miércoles", "Viernes"],
            "horario": "18:30",
            "cupo_maximo": 35
        }
        response = self.client.put(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.actividad1.refresh_from_db()
        self.assertEqual(self.actividad1.nombre, "Fútbol Infantil Avanzado")
        self.assertEqual(self.actividad1.horario, "18:30")
        self.assertEqual(self.actividad1.cupo_maximo, 35)

    def test_eliminar_actividad(self):
        url = reverse('actividad-detail', kwargs={'pk': self.actividad2.id})
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(Actividad.objects.count(), 1)

    def test_filtrar_por_polideportivo(self):
        url = f"{reverse('actividad-list')}?polideportivo=Patricios"
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        results = response.data.get('results', response.data)
        self.assertEqual(len(results), 1)
        self.assertEqual(results[0]['nombre'], "Fútbol Infantil")

    def test_resumen_dashboard(self):
        url = reverse('actividad-resumen')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['total_actividades'], 2)
        self.assertEqual(response.data['actividades_activas'], 1)
        self.assertEqual(response.data['total_sedes'], 2)
