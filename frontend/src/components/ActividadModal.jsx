import React, { useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';

const DIAS_DISPONIBLES = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
const HORARIOS_SUGERIDOS = ['17:00', '18:00', '19:00', '20:00'];

export default function ActividadModal({ isOpen, onClose, onSave, initialData }) {
  const [formData, setFormData] = useState({
    nombre: '',
    polideportivo: 'Polideportivo Patricios',
    profesor: 'Prof. Mauricio Casals',
    dias_semana: ['Martes', 'Jueves'],
    horario: '17:00',
    cupo_maximo: 30,
    observaciones: '',
    activa: true,
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        nombre: initialData.nombre || '',
        polideportivo: initialData.polideportivo || 'Polideportivo Patricios',
        profesor: initialData.profesor || 'Prof. Mauricio Casals',
        dias_semana: Array.isArray(initialData.dias_semana) ? initialData.dias_semana : [],
        horario: initialData.horario || '17:00',
        cupo_maximo: initialData.cupo_maximo || 30,
        observaciones: initialData.observaciones || '',
        activa: initialData.activa !== undefined ? initialData.activa : true,
      });
    } else {
      setFormData({
        nombre: '',
        polideportivo: 'Polideportivo Patricios',
        profesor: 'Prof. Mauricio Casals',
        dias_semana: ['Martes', 'Jueves'],
        horario: '17:00',
        cupo_maximo: 30,
        observaciones: '',
        activa: true,
      });
    }
    setError(null);
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const toggleDia = (dia) => {
    const current = formData.dias_semana;
    if (current.includes(dia)) {
      setFormData({ ...formData, dias_semana: current.filter((d) => d !== dia) });
    } else {
      setFormData({ ...formData, dias_semana: [...current, dia] });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.nombre.trim()) {
      setError('Por favor ingrese el nombre de la actividad.');
      return;
    }
    if (formData.dias_semana.length === 0) {
      setError('Seleccione al menos un día de la semana para la clase.');
      return;
    }
    if (!formData.horario.trim()) {
      setError('Ingrese el horario de la clase.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await onSave(formData);
      onClose();
    } catch (err) {
      setError(err.message || 'Error al guardar la actividad');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">
            {initialData ? 'Editar Actividad / Clase' : 'Nueva Actividad / Clase'}
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
          <div className="form-group">
            <label className="form-label">Nombre de la Actividad / Deporte *</label>
            <input
              type="text"
              className="form-input"
              placeholder="Ej: Fútbol Infantil, Gimnasia Artística, Natación"
              value={formData.nombre}
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="form-group">
              <label className="form-label">Sede / Polideportivo *</label>
              <input
                type="text"
                className="form-input"
                value={formData.polideportivo}
                onChange={(e) => setFormData({ ...formData, polideportivo: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Profesor a Cargo</label>
              <input
                type="text"
                className="form-input"
                value={formData.profesor}
                onChange={(e) => setFormData({ ...formData, profesor: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Días de la semana asignados *</label>
            <div className="days-chips-container">
              {DIAS_DISPONIBLES.map((dia) => {
                const selected = formData.dias_semana.includes(dia);
                return (
                  <button
                    key={dia}
                    type="button"
                    className={`day-chip ${selected ? 'selected' : ''}`}
                    onClick={() => toggleDia(dia)}
                  >
                    {selected && <Check size={12} style={{ display: 'inline', marginRight: '4px' }} />}
                    {dia}
                  </button>
                );
              })}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="form-group">
              <label className="form-label">Horario / Franja *</label>
              <input
                type="text"
                className="form-input"
                placeholder="17:00, 18:00, 19:00"
                value={formData.horario}
                onChange={(e) => setFormData({ ...formData, horario: e.target.value })}
                list="horarios-list"
                required
              />
              <datalist id="horarios-list">
                {HORARIOS_SUGERIDOS.map((h) => (
                  <option key={h} value={h} />
                ))}
              </datalist>
            </div>

            <div className="form-group">
              <label className="form-label">Cupo Máximo</label>
              <input
                type="number"
                min="1"
                max="200"
                className="form-input"
                value={formData.cupo_maximo}
                onChange={(e) => setFormData({ ...formData, cupo_maximo: parseInt(e.target.value, 10) || 30 })}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Observaciones / Descripción adicional</label>
            <textarea
              className="form-textarea"
              rows="2"
              placeholder="Notas sobre el grupo, nivel inicial, materiales..."
              value={formData.observaciones}
              onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
            ></textarea>
          </div>

          <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input
              type="checkbox"
              id="activa-check"
              checked={formData.activa}
              onChange={(e) => setFormData({ ...formData, activa: e.target.checked })}
              style={{ width: '16px', height: '16px' }}
            />
            <label htmlFor="activa-check" style={{ fontSize: '0.875rem', fontWeight: '600', cursor: 'pointer' }}>
              Actividad en curso activa
            </label>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Guardando...' : initialData ? 'Guardar Cambios' : 'Crear Actividad'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
