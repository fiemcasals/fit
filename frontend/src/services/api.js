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
  }
};
