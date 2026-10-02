import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';

export default function TomaAsistencia() {
  const [actividades, setActividades] = useState([]);
  const [selectedClaseId, setSelectedClaseId] = useState('');
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);
  const [planilla, setPlanilla] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [filterText, setFilterText] = useState('');

  // Cargar lista de clases
  useEffect(() => {
    async function loadActividades() {
      try {
        const data = await api.getActividades();
        const items = Array.isArray(data) ? data : data.results || [];
        setActividades(items);
        if (items.length > 0 && !selectedClaseId) {
          setSelectedClaseId(items[0].id.toString());
        }
      } catch (err) {
        console.error('Error al cargar actividades:', err);
      }
    }
    loadActividades();
  }, []);

  // Cargar planilla de la clase seleccionada para la fecha
  const loadPlanilla = useCallback(async () => {
    if (!selectedClaseId) return;
    setLoading(true);
    setMessage(null);
    try {
      const data = await api.getPlanillaClase(selectedClaseId, fecha);
      setPlanilla(data);
    } catch (err) {
      console.error('Error al cargar planilla:', err);
      setMessage({ type: 'error', text: 'Error al cargar planilla de asistencia' });
    } finally {
      setLoading(false);
    }
  }, [selectedClaseId, fecha]);

  useEffect(() => {
    if (selectedClaseId) {
      loadPlanilla();
    }
  }, [selectedClaseId, fecha, loadPlanilla]);

  // Alternar estado de un alumno individual con persistencia instantánea
  const handleToggle = async (alumnoId, currentEstado) => {
    const nuevoEstado = currentEstado === 'presente' ? 'ausente' : 'presente';
    
    // Actualización optimista local
    setPlanilla((prev) => {
      if (!prev) return prev;
      const updatedAlumnos = prev.alumnos.map((a) =>
        a.alumno_id === alumnoId ? { ...a, estado: nuevoEstado, registrado: true } : a
      );
      const presentes = updatedAlumnos.filter((a) => a.estado === 'presente').length;
      const ausentes = updatedAlumnos.filter((a) => a.estado === 'ausente').length;
      return {
        ...prev,
        alumnos: updatedAlumnos,
        presentes,
        ausentes,
      };
    });

    try {
      await api.toggleAsistencia(selectedClaseId, alumnoId, fecha, nuevoEstado);
    } catch (err) {
      console.error('Error al guardar asistencia:', err);
      setMessage({ type: 'error', text: 'Error al sincronizar asistencia' });
      // Revertir recargando
      loadPlanilla();
    }
  };

  // Marcar todos presentes o ausentes
  const handleMarcarTodos = async (estado) => {
    if (!planilla || !planilla.alumnos.length) return;
    setSaving(true);
    setMessage(null);

    const payload = {
      clase_id: parseInt(selectedClaseId, 10),
      fecha,
      asistencias: planilla.alumnos.map((a) => ({
        alumno_id: a.alumno_id,
        estado,
        observacion: a.observacion || '',
      })),
    };

    try {
      await api.guardarLoteAsistencias(payload);
      setMessage({
        type: 'success',
        text: `Se marcaron todos los alumnos como ${estado === 'presente' ? 'PRESENTES' : 'AUSENTES'}.`,
      });
      loadPlanilla();
    } catch (err) {
      console.error('Error en guardado por lote:', err);
      setMessage({ type: 'error', text: 'Error al actualizar lote de asistencias' });
    } finally {
      setSaving(false);
    }
  };

  // Filtrado de alumnos por buscador
  const filteredAlumnos = (planilla?.alumnos || []).filter((a) => {
    const query = filterText.toLowerCase();
    return (
      a.nombre_completo.toLowerCase().includes(query) ||
      (a.dni && a.dni.includes(query))
    );
  });

  const total = planilla?.total_alumnos || 0;
  const presentes = planilla?.presentes || 0;
  const ausentes = planilla?.ausentes || 0;
  const porcentaje = total > 0 ? Math.round((presentes / total) * 100) : 0;

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', paddingBottom: '40px' }}>
      {/* Encabezado y Selector */}
      <div
        style={{
          background: 'var(--bg-surface)',
          padding: '20px',
          borderRadius: 'var(--radius-md)',
          boxShadow: 'var(--shadow-card)',
          border: '1px solid var(--border-subtle)',
          marginBottom: '20px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '16px' }}>
          <div>
            <h2 style={{ margin: '0 0 4px 0', fontSize: '1.25rem', color: 'var(--color-primary)' }}>
              📋 Toma de Asistencia Diaria
            </h2>
            <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              Selecciona la clase y fecha para registrar y sincronizar el presentismo en tiempo real.
            </p>
          </div>

          {/* Selector de Fecha */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-main)' }}>
              Fecha:
            </label>
            <input
              type="date"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              style={{
                padding: '8px 12px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-subtle)',
                fontFamily: 'inherit',
                fontSize: '0.875rem',
                backgroundColor: 'var(--bg-app)',
                color: 'var(--text-main)',
                fontWeight: 600,
              }}
            />
          </div>
        </div>

        {/* Selector de Actividad / Clase */}
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
          <label style={{ fontSize: '0.875rem', fontWeight: 600, minWidth: '60px' }}>
            Clase:
          </label>
          <select
            value={selectedClaseId}
            onChange={(e) => setSelectedClaseId(e.target.value)}
            style={{
              flex: 1,
              minWidth: '240px',
              padding: '10px 14px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-subtle)',
              fontFamily: 'inherit',
              fontSize: '0.925rem',
              backgroundColor: 'var(--bg-app)',
              color: 'var(--text-main)',
              fontWeight: 600,
            }}
          >
            {actividades.map((act) => (
              <option key={act.id} value={act.id}>
                {act.nombre} — {act.horario} ({act.dias}) | {act.polideportivo}
              </option>
            ))}
          </select>

          <button
            className="btn btn-secondary"
            onClick={loadPlanilla}
            title="Recargar"
            style={{ padding: '8px 14px' }}
          >
            🔄 Actualizar
          </button>
        </div>
      </div>

      {/* Banner de Mensajes */}
      {message && (
        <div
          style={{
            padding: '12px 16px',
            borderRadius: 'var(--radius-sm)',
            marginBottom: '20px',
            fontSize: '0.875rem',
            fontWeight: 600,
            backgroundColor: message.type === 'success' ? 'var(--color-success-bg)' : 'var(--color-warning-light)',
            color: message.type === 'success' ? 'var(--color-success)' : 'var(--color-warning)',
            border: `1px solid ${message.type === 'success' ? 'var(--color-success)' : 'var(--color-warning)'}`,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <span>{message.text}</span>
          <button
            onClick={() => setMessage(null)}
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontWeight: 700 }}
          >
            ✕
          </button>
        </div>
      )}

      {/* Tarjeta de Resumen y Métricas en Tiempo Real */}
      {planilla && (
        <div
          style={{
            background: 'var(--bg-surface)',
            padding: '18px 20px',
            borderRadius: 'var(--radius-md)',
            boxShadow: 'var(--shadow-card)',
            border: '1px solid var(--border-subtle)',
            marginBottom: '20px',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
            gap: '16px',
            alignItems: 'center',
          }}
        >
          <div style={{ textAlign: 'center', borderRight: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Total Inscriptos</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--color-primary)' }}>{total}</div>
          </div>

          <div style={{ textAlign: 'center', borderRight: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Presentes</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--color-success)' }}>{presentes}</div>
          </div>

          <div style={{ textAlign: 'center', borderRight: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Ausentes</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--color-warning)' }}>{ausentes}</div>
          </div>

          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '4px' }}>% Asistencia</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--color-accent)' }}>{porcentaje}%</div>
          </div>
        </div>
      )}

      {/* Barra de Búsqueda y Acciones Rápidas */}
      {planilla && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px',
            marginBottom: '16px',
          }}
        >
          <input
            type="text"
            placeholder="🔍 Buscar alumno por nombre o DNI..."
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            style={{
              flex: 1,
              minWidth: '220px',
              padding: '10px 14px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-subtle)',
              fontFamily: 'inherit',
              fontSize: '0.875rem',
            }}
          />

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              className="btn"
              onClick={() => handleMarcarTodos('presente')}
              disabled={saving || total === 0}
              style={{
                backgroundColor: 'var(--color-success-bg)',
                color: 'var(--color-success)',
                border: '1px solid var(--color-success)',
                padding: '8px 14px',
                fontSize: '0.8125rem',
              }}
            >
              ✓ Todos Presentes
            </button>
            <button
              className="btn"
              onClick={() => handleMarcarTodos('ausente')}
              disabled={saving || total === 0}
              style={{
                backgroundColor: 'var(--color-warning-light)',
                color: 'var(--color-warning)',
                border: '1px solid var(--color-warning)',
                padding: '8px 14px',
                fontSize: '0.8125rem',
              }}
            >
              ✕ Todos Ausentes
            </button>
          </div>
        </div>
      )}

      {/* Lista de Alumnos para Toma de Asistencia */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
          Cargando planilla de asistencia...
        </div>
      ) : total === 0 ? (
        <div
          style={{
            background: 'var(--bg-surface)',
            padding: '36px 20px',
            borderRadius: 'var(--radius-md)',
            textAlign: 'center',
            border: '1px solid var(--border-subtle)',
          }}
        >
          <div style={{ fontSize: '2rem', marginBottom: '8px' }}>👥</div>
          <h3 style={{ margin: '0 0 6px 0', color: 'var(--text-main)' }}>No hay alumnos inscriptos</h3>
          <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            Asigna alumnos a esta actividad desde la sección de Alumnos para poder tomar asistencia.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {filteredAlumnos.map((alumno) => {
            const isPresente = alumno.estado === 'presente';
            return (
              <div
                key={alumno.alumno_id}
                className="student-item"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '14px 18px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--bg-surface)',
                  border: isPresente
                    ? '1.5px solid var(--color-success)'
                    : '1.5px solid var(--border-subtle)',
                  boxShadow: 'var(--shadow-card)',
                  transition: 'all 0.15s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div
                    className="student-avatar"
                    style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '50%',
                      backgroundColor: isPresente ? 'var(--color-success-bg)' : 'var(--bg-app)',
                      color: isPresente ? 'var(--color-success)' : 'var(--text-muted)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      fontSize: '1rem',
                      border: `1px solid ${isPresente ? 'var(--color-success)' : 'var(--border-subtle)'}`,
                    }}
                  >
                    {isPresente ? '✓' : '✕'}
                  </div>

                  <div>
                    <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-main)' }}>
                      {alumno.nombre_completo}
                    </div>
                    <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                      {alumno.dni ? `DNI: ${alumno.dni}` : 'Sin DNI'}
                      {alumno.telefono ? ` • Tel: ${alumno.telefono}` : ''}
                    </div>
                  </div>
                </div>

                {/* Botón Touch Grande de Toggle */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <button
                    onClick={() => handleToggle(alumno.alumno_id, alumno.estado)}
                    style={{
                      padding: '10px 20px',
                      borderRadius: 'var(--radius-pill)',
                      fontSize: '0.875rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      border: 'none',
                      transition: 'all 0.15s ease',
                      backgroundColor: isPresente ? 'var(--color-success)' : '#ef4444',
                      color: '#ffffff',
                      boxShadow: isPresente
                        ? '0 2px 8px rgba(16, 185, 129, 0.3)'
                        : '0 2px 8px rgba(239, 68, 68, 0.3)',
                    }}
                  >
                    {isPresente ? 'PRESENTE' : 'AUSENTE'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
