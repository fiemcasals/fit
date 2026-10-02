import React, { useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';
import { api } from '../services/api';

export default function AlumnoModal({ isOpen, onClose, onSave, initialData }) {
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    dni: '',
    telefono: '',
    email: '',
    observaciones_medicas: '',
    clases: [],
    activo: true,
  });
  const [clasesDisponibles, setClasesDisponibles] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadClases = async () => {
      try {
        const data = await api.getActividades();
        setClasesDisponibles(data.results || data);
      } catch (err) {
        console.error(err);
      }
    };
    if (isOpen) {
      loadClases();
    }
  }, [isOpen]);

  useEffect(() => {
    if (initialData) {
      setFormData({
        nombre: initialData.nombre || '',
        apellido: initialData.apellido || '',
        dni: initialData.dni || '',
        telefono: initialData.telefono || '',
        email: initialData.email || '',
        observaciones_medicas: initialData.observaciones_medicas || '',
        clases: Array.isArray(initialData.clases)
          ? initialData.clases.map((c) => (typeof c === 'object' ? c.id : c))
          : [],
        activo: initialData.activo !== undefined ? initialData.activo : true,
      });
    } else {
      setFormData({
        nombre: '',
        apellido: '',
        dni: '',
        telefono: '',
        email: '',
        observaciones_medicas: '',
        clases: [],
        activo: true,
      });
    }
    setError(null);
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const toggleClase = (claseId) => {
    const current = formData.clases;
    if (current.includes(claseId)) {
      setFormData({ ...formData, clases: current.filter((id) => id !== claseId) });
    } else {
      setFormData({ ...formData, clases: [...current, claseId] });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.nombre.trim() || !formData.apellido.trim()) {
      setError('Nombre y Apellido son campos obligatorios.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await onSave(formData);
      onClose();
    } catch (err) {
      setError(err.message || 'Error al guardar el alumno');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">
            {initialData ? 'Editar Alumno' : 'Registrar Nuevo Alumno'}
          </h3>
          <button className="btn-icon" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {error && (
          <div style={{ padding: '10px 14px', background: '#fee2e2', color: '#b91c1c', borderRadius: '8px', marginBottom: '16px', fontSize: '0.875rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="form-group">
              <label className="form-label">Nombre *</label>
              <input
                type="text"
                className="form-input"
                placeholder="Ej: Bruno"
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Apellido *</label>
              <input
                type="text"
                className="form-input"
                placeholder="Ej: Ballesteros"
                value={formData.apellido}
                onChange={(e) => setFormData({ ...formData, apellido: e.target.value })}
                required
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="form-group">
              <label className="form-label">DNI / Documento</label>
              <input
                type="text"
                className="form-input"
                placeholder="Sin puntos"
                value={formData.dni}
                onChange={(e) => setFormData({ ...formData, dni: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Teléfono de Contacto</label>
              <input
                type="tel"
                className="form-input"
                placeholder="Ej: 11-1234-5678"
                value={formData.telefono}
                onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Correo Electrónico</label>
            <input
              type="email"
              className="form-input"
              placeholder="alumno@ejemplo.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Inscribir en Clases / Actividades</label>
            {clasesDisponibles.length === 0 ? (
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                No hay actividades registradas aún.
              </p>
            ) : (
              <div className="days-chips-container">
                {clasesDisponibles.map((clase) => {
                  const selected = formData.clases.includes(clase.id);
                  return (
                    <button
                      key={clase.id}
                      type="button"
                      className={`day-chip ${selected ? 'selected' : ''}`}
                      onClick={() => toggleClase(clase.id)}
                    >
                      {selected && <Check size={12} style={{ display: 'inline', marginRight: '4px' }} />}
                      {clase.nombre} ({clase.horario} hs)
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Observaciones Médicas / Contacto de Emergencia</label>
            <textarea
              className="form-textarea"
              rows="2"
              placeholder="Apto físico, alergias, teléfono de urgencias..."
              value={formData.observaciones_medicas}
              onChange={(e) => setFormData({ ...formData, observaciones_medicas: e.target.value })}
            ></textarea>
          </div>

          <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input
              type="checkbox"
              id="alumno-activo-check"
              checked={formData.activo}
              onChange={(e) => setFormData({ ...formData, activo: e.target.checked })}
              style={{ width: '16px', height: '16px' }}
            />
            <label htmlFor="alumno-activo-check" style={{ fontSize: '0.875rem', fontWeight: '600', cursor: 'pointer' }}>
              Alumno activo en el padrón
            </label>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Guardando...' : initialData ? 'Guardar Cambios' : 'Registrar Alumno'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
