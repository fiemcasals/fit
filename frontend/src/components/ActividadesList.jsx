import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, Edit2, Trash2, Clock, MapPin, User, CheckCircle2, AlertCircle } from 'lucide-react';
import { api } from '../services/api';
import ActividadModal from './ActividadModal';

export default function ActividadesList() {
  const [actividades, setActividades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filtroDia, setFiltroDia] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingActividad, setEditingActividad] = useState(null);
  const [resumen, setResumen] = useState(null);

  const fetchActividades = async () => {
    try {
      setLoading(true);
      const params = {};
      if (search) params.search = search;
      if (filtroDia) params.dia = filtroDia;

      const data = await api.getActividades(params);
      setActividades(data.results || data);

      const resData = await api.getResumen();
      setResumen(resData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActividades();
  }, [search, filtroDia]);

  const handleSave = async (formData) => {
    if (editingActividad) {
      await api.updateActividad(editingActividad.id, formData);
    } else {
      await api.createActividad(formData);
    }
    fetchActividades();
  };

  const handleDelete = async (id, nombre) => {
    if (window.confirm(`¿Está seguro de eliminar la actividad "${nombre}"?`)) {
      try {
        await api.deleteActividad(id);
        fetchActividades();
      } catch (err) {
        alert('Error al eliminar la actividad');
      }
    }
  };

  return (
    <div>
      {/* Resumen Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div>
            <div className="stat-val">{resumen?.total_actividades ?? actividades.length}</div>
            <div className="stat-label">Total de Clases / Actividades</div>
          </div>
          <div className="stat-icon">
            <Clock size={22} />
          </div>
        </div>

        <div className="stat-card">
          <div>
            <div className="stat-val">{resumen?.actividades_activas ?? actividades.filter((a) => a.activa).length}</div>
            <div className="stat-label">Clases Activas en Curso</div>
          </div>
          <div className="stat-icon" style={{ background: 'var(--color-success-bg)', color: 'var(--color-success)' }}>
            <CheckCircle2 size={22} />
          </div>
        </div>

        <div className="stat-card">
          <div>
            <div className="stat-val">{resumen?.total_sedes ?? 1}</div>
            <div className="stat-label">Polideportivos / Sedes</div>
          </div>
          <div className="stat-icon">
            <MapPin size={22} />
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="toolbar">
        <div style={{ display: 'flex', gap: '10px', flex: 1, flexWrap: 'wrap' }}>
          <input
            type="text"
            className="search-input"
            placeholder="Buscar por actividad, sede, horario o profesor..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <select
            className="filter-select"
            value={filtroDia}
            onChange={(e) => setFiltroDia(e.target.value)}
          >
            <option value="">Todos los días</option>
            <option value="Lunes">Lunes</option>
            <option value="Martes">Martes</option>
            <option value="Miércoles">Miércoles</option>
            <option value="Jueves">Jueves</option>
            <option value="Viernes">Viernes</option>
            <option value="Sábado">Sábado</option>
          </select>
        </div>

        <button
          className="btn btn-primary"
          onClick={() => {
            setEditingActividad(null);
            setModalOpen(true);
          }}
        >
          <Plus size={18} />
          <span>Nueva Clase / Actividad</span>
        </button>
      </div>

      {/* Grid of Classes */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
          Cargando actividades...
        </div>
      ) : actividades.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📋</div>
          <h3 style={{ margin: '0 0 8px 0', color: 'var(--text-main)' }}>No hay actividades registradas</h3>
          <p style={{ color: 'var(--text-muted)', margin: '0 0 16px 0' }}>
            Comenzá creando tu primera clase con sus días de semana y franja horaria (ej: 17 hs, 18 hs, 19 hs).
          </p>
          <button
            className="btn btn-primary"
            onClick={() => {
              setEditingActividad(null);
              setModalOpen(true);
            }}
          >
            <Plus size={18} />
            <span>Crear Primera Actividad</span>
          </button>
        </div>
      ) : (
        <div className="cards-grid">
          {actividades.map((act) => (
            <div key={act.id} className="class-card">
              <div className="class-card-header">
                <div>
                  <h4 className="class-title">{act.nombre}</h4>
                  <div className="class-meta">
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <MapPin size={14} /> {act.polideportivo}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <User size={14} /> {act.profesor || 'Sin profesor asignado'}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '6px' }}>
                  <button
                    className="btn-icon"
                    onClick={() => {
                      setEditingActividad(act);
                      setModalOpen(true);
                    }}
                    title="Editar actividad"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    className="btn-icon"
                    onClick={() => handleDelete(act.id, act.nombre)}
                    title="Eliminar actividad"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                <span className="badge badge-time">
                  <Clock size={12} style={{ marginRight: '4px' }} />
                  {act.horario} hs
                </span>
                <span className="badge badge-lane">
                  {act.dias_display || (Array.isArray(act.dias_semana) ? act.dias_semana.join(', ') : act.dias_semana)}
                </span>
                <span className={`badge ${act.activa ? 'badge-status-open' : 'badge-status-full'}`}>
                  {act.activa ? 'Activa' : 'Pausada'}
                </span>
              </div>

              {act.observaciones && (
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', margin: 0, fontStyle: 'italic' }}>
                  "{act.observaciones}"
                </p>
              )}

              <div className="capacity-container">
                <div className="capacity-info">
                  <span>Cupo de Alumnos</span>
                  <span>Hasta {act.cupo_maximo} alumnos</span>
                </div>
                <div className="capacity-bar">
                  <div className="capacity-fill" style={{ width: '40%' }}></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      <ActividadModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        initialData={editingActividad}
      />
    </div>
  );
}
