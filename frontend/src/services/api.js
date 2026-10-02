const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export const api = {
  // Actividades / Clases
  async getActividades(params = {}) {
    const query = new URLSearchParams(params).toString();
    const url = `${API_BASE_URL}/actividades/${query ? `?${query}` : ''}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('Error al cargar actividades');
    return response.json();
  },

  async getActividad(id) {
    const response = await fetch(`${API_BASE_URL}/actividades/${id}/`);
    if (!response.ok) throw new Error('Error al obtener la actividad');
    return response.json();
  },

  async createActividad(data) {
    const response = await fetch(`${API_BASE_URL}/actividades/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(JSON.stringify(errorData));
    }
    return response.json();
  },

  async updateActividad(id, data) {
    const response = await fetch(`${API_BASE_URL}/actividades/${id}/`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(JSON.stringify(errorData));
    }
    return response.json();
  },

  async deleteActividad(id) {
    const response = await fetch(`${API_BASE_URL}/actividades/${id}/`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Error al eliminar la actividad');
    return true;
  },

  async getResumen() {
    const response = await fetch(`${API_BASE_URL}/actividades/resumen/`);
    if (!response.ok) throw new Error('Error al cargar estadísticas');
    return response.json();
  },

  // Alumnos
  async getAlumnos(params = {}) {
    const query = new URLSearchParams(params).toString();
    const url = `${API_BASE_URL}/alumnos/${query ? `?${query}` : ''}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('Error al cargar alumnos');
    return response.json();
  },

  async getAlumno(id) {
    const response = await fetch(`${API_BASE_URL}/alumnos/${id}/`);
    if (!response.ok) throw new Error('Error al obtener el alumno');
    return response.json();
  },

  async createAlumno(data) {
    const response = await fetch(`${API_BASE_URL}/alumnos/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(JSON.stringify(errorData));
    }
    return response.json();
  },

  async updateAlumno(id, data) {
    const response = await fetch(`${API_BASE_URL}/alumnos/${id}/`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(JSON.stringify(errorData));
    }
    return response.json();
  },

  async deleteAlumno(id) {
    const response = await fetch(`${API_BASE_URL}/alumnos/${id}/`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Error al eliminar el alumno');
    return true;
  },

  async inscribirAlumno(alumnoId, claseId) {
    const response = await fetch(`${API_BASE_URL}/alumnos/${alumnoId}/inscribir/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clase_id: claseId }),
    });
    if (!response.ok) throw new Error('Error al inscribir el alumno');
    return response.json();
  },

  async desinscribirAlumno(alumnoId, claseId) {
    const response = await fetch(`${API_BASE_URL}/alumnos/${alumnoId}/desinscribir/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clase_id: claseId }),
    });
    if (!response.ok) throw new Error('Error al desinscribir el alumno');
    return response.json();
  },

  async getResumenAlumnos() {
    const response = await fetch(`${API_BASE_URL}/alumnos/resumen/`);
    if (!response.ok) throw new Error('Error al cargar estadísticas de alumnos');
    return response.json();
  },

  // Asistencias
  async getPlanillaClase(claseId, fecha) {
    const params = new URLSearchParams({ clase: claseId, ...(fecha ? { fecha } : {}) });
    const response = await fetch(`${API_BASE_URL}/asistencias/planilla_clase/?${params.toString()}`);
    if (!response.ok) throw new Error('Error al cargar planilla de clase');
    return response.json();
  },

  async toggleAsistencia(claseId, alumnoId, fecha, estado) {
    const response = await fetch(`${API_BASE_URL}/asistencias/toggle/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        clase_id: claseId,
        alumno_id: alumnoId,
        fecha,
        estado
      })
    });
    if (!response.ok) throw new Error('Error al alternar asistencia');
    return response.json();
  },

  async guardarLoteAsistencias(data) {
    const response = await fetch(`${API_BASE_URL}/asistencias/guardar_lote/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) {
      const err = await response.json();
      throw new Error(JSON.stringify(err));
    }
    return response.json();
  },

  async getResumenDia(fecha) {
    const params = fecha ? `?fecha=${fecha}` : '';
    const response = await fetch(`${API_BASE_URL}/asistencias/resumen_dia/${params}`);
    if (!response.ok) throw new Error('Error al obtener métricas del día');
    return response.json();
  },

  // Novedades y Suspensiones de Clase
  async getNovedades(params = {}) {
    const query = new URLSearchParams(params).toString();
    const response = await fetch(`${API_BASE_URL}/novedades/${query ? `?${query}` : ''}`);
    if (!response.ok) throw new Error('Error al cargar novedades');
    return response.json();
  },

  async registrarNovedadJornada(data) {
    const response = await fetch(`${API_BASE_URL}/novedades/registrar_jornada/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) {
      const err = await response.json();
      throw new Error(JSON.stringify(err));
    }
    return response.json();
  },

  async getResumenMensualNovedades(claseId, mes, anio) {
    const params = new URLSearchParams({
      clase: claseId,
      ...(mes ? { mes } : {}),
      ...(anio ? { anio } : {})
    });
    const response = await fetch(`${API_BASE_URL}/novedades/resumen_mensual/?${params.toString()}`);
    if (!response.ok) throw new Error('Error al obtener resumen mensual de novedades');
    return response.json();
  },

  // Planillas Mensuales GCBA
  async getMatrizMensual(claseId, mes, anio) {
    const params = new URLSearchParams({
      clase: claseId,
      ...(mes ? { mes } : {}),
      ...(anio ? { anio } : {})
    });
    const response = await fetch(`${API_BASE_URL}/asistencias/matriz_mensual/?${params.toString()}`);
    if (!response.ok) throw new Error('Error al generar matriz mensual');
    return response.json();
  }
};
