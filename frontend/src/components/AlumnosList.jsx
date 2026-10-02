import React, { useState, useEffect } from 'react';
import { Plus, Search, Users, UserCheck, Phone, Mail, Edit2, Trash2, Calendar, BookOpen } from 'lucide-react';
import { api } from '../services/api';
import AlumnoModal from './AlumnoModal';

export default function AlumnosList() {
  const [alumnos, setAlumnos] = useState([]);
  const [clases, setClases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filtroClase, setFiltroClase] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingAlumno, setEditingAlumno] = useState(null);
  const [resumen, setResumen] = useState(null);

  const fetchDatos = async () => {
    try {
      setLoading(true);
      const params = {};
      if (search) params.search = search;
      if (filtroClase) params.clase = filtroClase;

      const [alumnosData, clasesData, resData] = await Promise.all([
        api.getAlumnos(params),
        api.getActividades(),
        api.getResumenAlumnos()
      ]);

      setAlumnos(alumnosData.results || alumnosData);
      setClases(clasesData.results || clasesData);
      setResumen(resData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDatos();
  }, [search, filtroClase]);

  const handleSave = async (formData) => {
    if (editingAlumno) {
      await api.updateAlumno(editingAlumno.id, formData);
    } else {
      await api.createAlumno(formData);
    }
    fetchDatos();
  };

  const handleDelete = async (id, nombreCompleto) => {
    if (window.confirm(`¿Está seguro de eliminar al alumno "${nombreCompleto}"?`)) {
      try {
        await api.deleteAlumno(id);
        fetchDatos();
      } catch (err) {
        alert('Error al eliminar el alumno');
      }
    }
  };

  return (
    <div>
      {/* Resumen Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div>
            <div className="stat-val">{resumen?.total_alumnos ?? alumnos.length}</div>
            <div className="stat-label">Padrón Total de Alumnos</div>
          </div>
          <div className="stat-icon">
            <Users size={22} />
          </div>
        </div>

        <div className="stat-card">
          <div>
            <div className="stat-val">{resumen?.alumnos_activos ?? alumnos.filter((a) => a.activo).length}</div>
            <div className="stat-label">Alumnos Activos</div>
          </div>
          <div className="stat-icon" style={{ background: 'var(--color-success-bg)', color: 'var(--color-success)' }}>
            <UserCheck size={22} />
          </div>
        </div>

        <div className="stat-card">
          <div>
            <div className="stat-val">{resumen?.alumnos_inscriptos ?? 0}</div>
            <div className="stat-label">Inscriptos en Clases</div>
          </div>
          <div className="stat-icon" style={{ background: 'var(--color-accent-light)', color: 'var(--color-primary)' }}>
            <BookOpen size={22} />
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="toolbar">
        <div style={{ display: 'flex', gap: '10px', flex: 1, flexWrap: 'wrap' }}>
          <input
            type="text"
            className="search-input"
            placeholder="Buscar por apellido, nombre, DNI o teléfono..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <select
            className="filter-select"
            value={filtroClase}
            onChange={(e) => setFiltroClase(e.target.value)}
          >
            <option value="">Todas las clases</option>
            {clases.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre} ({c.horario} hs)
              </option>
            ))}
          </select>
        </div>

        <button
          className="btn btn-primary"
          onClick={() => {
            setEditingAlumno(null);
            setModalOpen(true);
          }}
        >
          <Plus size={18} />
          <span>Nuevo Alumno</span>
        </button>
      </div>

      {/* List of Students */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
          Cargando padrón de alumnos...
        </div>
      ) : alumnos.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">👥</div>
          <h3 style={{ margin: '0 0 8px 0', color: 'var(--text-main)' }}>No se encontraron alumnos</h3>
          <p style={{ color: 'var(--text-muted)', margin: '0 0 16px 0' }}>
            Registrá a los alumnos y asignalos a sus correspondientes clases y horarios.
          </p>
          <button
            className="btn btn-primary"
            onClick={() => {
              setEditingAlumno(null);
              setModalOpen(true);
            }}
          >
            <Plus size={18} />
            <span>Registrar Primer Alumno</span>
          </button>
        </div>
      ) : (
        <div className="cards-grid">
          {alumnos.map((alumno) => {
            const initials = `${alumno.nombre?.[0] || ''}${alumno.apellido?.[0] || ''}`.toUpperCase();
            const clasesAsignadas = alumno.clases_detalle || [];

            return (
              <div key={alumno.id} className="class-card">
                <div className="class-card-header">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div className="student-avatar">{initials}</div>
                    <div>
                      <h4 className="class-title" style={{ margin: 0 }}>{alumno.nombre_completo}</h4>
                      <div className="class-meta" style={{ marginTop: '2px' }}>
                        {alumno.dni ? `DNI: ${alumno.dni}` : 'Sin DNI'}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button
                      className="btn-icon"
                      onClick={() => {
                        setEditingAlumno(alumno);
                        setModalOpen(true);
                      }}
                      title="Editar alumno"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      className="btn-icon"
                      onClick={() => handleDelete(alumno.id, alumno.nombre_completo)}
                      title="Eliminar alumno"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                {/* Contact info */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                  {alumno.telefono && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Phone size={13} /> {alumno.telefono}
                    </span>
                  )}
                  {alumno.email && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Mail size={13} /> {alumno.email}
                    </span>
                  )}
                </div>

                {/* Enrolled classes badges */}
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>
                    Clases inscripto ({clasesAsignadas.length}):
                  </div>
                  {clasesAsignadas.length === 0 ? (
                    <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontStyle: 'italic' }}>
                      Sin clases asignadas
                    </span>
                  ) : (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {clasesAsignadas.map((c) => (
                        <span key={c.id} className="badge badge-lane" style={{ fontSize: '0.75rem' }}>
                          <Calendar size={11} style={{ marginRight: '4px' }} />
                          {c.nombre} ({c.horario} hs)
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {alumno.observaciones_medicas && (
                  <p style={{ fontSize: '0.75rem', color: '#b45309', background: '#fffbeb', padding: '6px 10px', borderRadius: '6px', margin: 0 }}>
                    ⚠️ {alumno.observaciones_medicas}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      <AlumnoModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        initialData={editingAlumno}
      />
    </div>
  );
}
