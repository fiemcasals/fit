from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import AsistenciaViewSet, NovedadClaseViewSet

router = DefaultRouter()
router.register(r'asistencias', AsistenciaViewSet, basename='asistencia')
router.register(r'novedades', NovedadClaseViewSet, basename='novedad')

urlpatterns = [
    path('', include(router.urls)),
]
