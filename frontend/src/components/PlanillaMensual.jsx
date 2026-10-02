import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';

const MESES = [
  { id: 1, nombre: 'Enero' },
  { id: 2, nombre: 'Febrero' },
  { id: 3, nombre: 'Marzo' },
  { id: 4, nombre: 'Abril' },
  { id: 5, nombre: 'Mayo' },
  { id: 6, nombre: 'Junio' },
  { id: 7, nombre: 'Julio' },
  { id: 8, nombre: 'Agosto' },
  { id: 9, nombre: 'Septiembre' },
  { id: 10, nombre: 'Octubre' },
  { id: 11, nombre: 'Noviembre' },
  { id: 12, nombre: 'Diciembre' },
];

export default function PlanillaMensual() {
  const [actividades, setActividades] = useState([]);
  const [selectedClaseId, setSelectedClaseId] = useState('');
  const [mes, setMes] = useState(new Date().getMonth() + 1);
  const [anio, setAnio] = useState(new Date().getFullYear());
  const [dataMatriz, setDataMatriz] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Cargar actividades
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

  // Cargar matriz mensual
  const loadMatriz = useCallback(async () => {
    if (!selectedClaseId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await api.getMatrizMensual(selectedClaseId, mes, anio);
      setDataMatriz(data);
    } catch (err) {
      console.error('Error al cargar matriz mensual:', err);
      setError('Error al generar la matriz de asistencia mensual');
    } finally {
      setLoading(false);
    }
  }, [selectedClaseId, mes, anio]);

  useEffect(() => {
    if (selectedClaseId) {
      loadMatriz();
    }
  }, [selectedClaseId, mes, anio, loadMatriz]);

  const encabezado = dataMatriz?.encabezado;
  const diasInfo = dataMatriz?.dias_info || [];
  const alumnos = dataMatriz?.alumnos || [];
  const totalesPorDia = dataMatriz?.totales_por_dia || {};
  const diasEnMes = encabezado?.dias_en_mes || 31;

  const diasArray = Array.from({ length: 31 }, (_, i) => i + 1);

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '40px' }}>
      {/* Selector de Parámetros */}
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
              📊 Motor de Generación de Planilla Mensual GCBA
            </h2>
            <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              Matriz oficial de asistencia con cálculo de presentismo del 1 al 31 para la Secretaría de Deportes.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
            <select
              value={mes}
              onChange={(e) => setMes(parseInt(e.target.value, 10))}
              style={{
                padding: '8px 12px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-subtle)',
                fontFamily: 'inherit',
                fontSize: '0.875rem',
                fontWeight: 600,
                backgroundColor: 'var(--bg-app)',
              }}
            >
              {MESES.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.nombre}
                </option>
              ))}
            </select>

            <input
              type="number"
              value={anio}
              onChange={(e) => setAnio(parseInt(e.target.value, 10))}
              min="2020"
              max="2035"
              style={{
                width: '90px',
                padding: '8px 12px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-subtle)',
                fontFamily: 'inherit',
                fontSize: '0.875rem',
                fontWeight: 600,
                backgroundColor: 'var(--bg-app)',
              }}
            />

            <button
              className="btn btn-secondary"
              onClick={loadMatriz}
              title="Recargar"
              style={{ padding: '8px 14px' }}
            >
              🔄 Recargar
            </button>
          </div>
        </div>

        {/* Selector de Clase */}
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <label style={{ fontSize: '0.875rem', fontWeight: 600, minWidth: '60px' }}>
            Clase:
          </label>
          <select
            value={selectedClaseId}
            onChange={(e) => setSelectedClaseId(e.target.value)}
            style={{
              flex: 1,
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
                {act.nombre} — {act.horario} ({Array.isArray(act.dias_semana) ? act.dias_semana.join(', ') : act.dias_semana}) | {act.polideportivo}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div
          style={{
            padding: '12px 16px',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: 'var(--color-warning-light)',
            color: 'var(--color-warning)',
            marginBottom: '20px',
            border: '1px solid var(--color-warning)',
            fontWeight: 600,
          }}
        >
          {error}
        </div>
      )}

      {/* Vista de Planilla Oficial */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
          Generando matriz mensual de asistencia...
        </div>
      ) : dataMatriz ? (
        <div
          style={{
            background: 'var(--bg-surface)',
            borderRadius: 'var(--radius-md)',
            boxShadow: 'var(--shadow-card)',
            border: '1px solid var(--border-subtle)',
            padding: '24px',
            overflow: 'hidden',
          }}
        >
          {/* Encabezado Oficial GCBA */}
          <div
            style={{
              borderBottom: '2px solid var(--color-primary)',
              paddingBottom: '16px',
              marginBottom: '20px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--color-primary)', letterSpacing: '0.5px' }}>
                  {encabezado.organismo} — {encabezado.subtitulo}
                </div>
                <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-main)', marginTop: '2px' }}>
                  {encabezado.titulo}: {encabezado.polideportivo}
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <span
                  style={{
                    backgroundColor: 'var(--color-accent-light)',
                    color: 'var(--color-primary)',
                    padding: '6px 12px',
                    borderRadius: 'var(--radius-pill)',
                    fontWeight: 700,
                    fontSize: '0.875rem',
                  }}
                >
                  MES: {encabezado.mes_nombre.toUpperCase()} {encabezado.anio}
                </span>
              </div>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '12px',
                marginTop: '16px',
                padding: '12px',
                backgroundColor: 'var(--bg-app)',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.875rem',
              }}
            >
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Actividad: </span>
                <strong>{encabezado.actividad} (ID #{encabezado.id_actividad})</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Días y Horarios: </span>
                <strong>{encabezado.dias_y_horarios}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Profesor: </span>
                <strong>{encabezado.profesor}</strong>
              </div>
            </div>
          </div>

          {/* Tabla de Matriz Mensual (Días 1 a 31) */}
          <div style={{ overflowX: 'auto', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)' }}>
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontSize: '0.8125rem',
                textAlign: 'center',
                minWidth: '1000px',
              }}
            >
              <thead>
                <tr style={{ backgroundColor: 'var(--bg-app)', borderBottom: '2px solid var(--border-subtle)' }}>
                  <th style={{ padding: '8px 6px', width: '35px', position: 'sticky', left: 0, backgroundColor: 'var(--bg-app)', zIndex: 2 }}>Nº</th>
                  <th style={{ padding: '8px 10px', textAlign: 'left', minWidth: '130px', position: 'sticky', left: '35px', backgroundColor: 'var(--bg-app)', zIndex: 2 }}>
                    APELLIDO
                  </th>
                  <th style={{ padding: '8px 10px', textAlign: 'left', minWidth: '130px' }}>
                    NOMBRE
                  </th>
                  {diasArray.map((dia) => {
                    const diaInfo = diasInfo[dia - 1];
                    const isProgramado = diaInfo?.es_programado;
                    const isValid = dia <= diasEnMes;
                    return (
                      <th
                        key={dia}
                        style={{
                          padding: '6px 2px',
                          width: '24px',
                          backgroundColor: !isValid
                            ? '#f1f5f9'
                            : isProgramado
                            ? 'var(--color-accent-light)'
                            : 'inherit',
                          color: isProgramado ? 'var(--color-primary)' : 'var(--text-muted)',
                          fontWeight: isProgramado ? 800 : 500,
                          borderLeft: '1px solid var(--border-subtle)',
                        }}
                      >
                        <div style={{ fontSize: '0.7rem' }}>{isValid && diaInfo?.dia_semana}</div>
                        <div>{dia}</div>
                      </th>
                    );
                  })}
                  <th
                    style={{
                      padding: '8px 10px',
                      minWidth: '60px',
                      backgroundColor: 'var(--color-success-bg)',
                      color: 'var(--color-success)',
                      fontWeight: 800,
                      borderLeft: '2px solid var(--border-subtle)',
                    }}
                  >
                    TOTAL
                  </th>
                </tr>
              </thead>

              <tbody>
                {alumnos.length === 0 ? (
                  <tr>
                    <td colSpan={35} style={{ padding: '30px', color: 'var(--text-muted)' }}>
                      No hay alumnos inscriptos en esta clase.
                    </td>
                  </tr>
                ) : (
                  alumnos.map((alum, index) => (
                    <tr
                      key={alum.alumno_id}
                      style={{
                        borderBottom: '1px solid var(--border-subtle)',
                        backgroundColor: index % 2 === 0 ? 'var(--bg-surface)' : 'var(--bg-app)',
                      }}
                    >
                      <td style={{ padding: '6px 4px', fontWeight: 600, position: 'sticky', left: 0, backgroundColor: index % 2 === 0 ? 'var(--bg-surface)' : 'var(--bg-app)', zIndex: 1 }}>
                        {alum.nro}
                      </td>
                      <td style={{ padding: '6px 10px', textAlign: 'left', fontWeight: 600, position: 'sticky', left: '35px', backgroundColor: index % 2 === 0 ? 'var(--bg-surface)' : 'var(--bg-app)', zIndex: 1 }}>
                        {alum.apellido}
                      </td>
                      <td style={{ padding: '6px 10px', textAlign: 'left' }}>
                        {alum.nombre}
                      </td>

                      {diasArray.map((dia) => {
                        const val = alum.dias[dia.toString()];
                        const isPresente = val === 'P';
                        const isAusente = val === 'A';
                        const isSuspendida = val === 'S';
                        const isValid = dia <= diasEnMes;

                        return (
                          <td
                            key={dia}
                            style={{
                              padding: '4px 2px',
                              borderLeft: '1px solid var(--border-subtle)',
                              fontWeight: isPresente ? 800 : 500,
                              backgroundColor: !isValid
                                ? '#f8fafc'
                                : isPresente
                                ? 'var(--color-success-bg)'
                                : isAusente
                                ? 'var(--color-warning-light)'
                                : 'inherit',
                              color: isPresente
                                ? 'var(--color-success)'
                                : isAusente
                                ? 'var(--color-warning)'
                                : isSuspendida
                                ? '#94a3b8'
                                : 'var(--text-muted)',
                            }}
                          >
                            {val}
                          </td>
                        );
                      })}

                      <td
                        style={{
                          padding: '6px 10px',
                          fontWeight: 800,
                          fontSize: '0.9rem',
                          color: 'var(--color-primary)',
                          borderLeft: '2px solid var(--border-subtle)',
                          backgroundColor: 'var(--color-accent-light)',
                        }}
                      >
                        {alum.total_asistencias}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>

              {/* Fila de Totales por Día */}
              {alumnos.length > 0 && (
                <tfoot>
                  <tr
                    style={{
                      backgroundColor: 'var(--bg-app)',
                      fontWeight: 800,
                      borderTop: '2px solid var(--color-primary)',
                    }}
                  >
                    <td colSpan={3} style={{ padding: '10px', textAlign: 'right', position: 'sticky', left: 0, backgroundColor: 'var(--bg-app)', zIndex: 1 }}>
                      TOTAL PRESENTES POR DÍA:
                    </td>
                    {diasArray.map((dia) => {
                      const totalDia = totalesPorDia[dia.toString()] || 0;
                      const isValid = dia <= diasEnMes;
                      return (
                        <td
                          key={dia}
                          style={{
                            padding: '8px 2px',
                            borderLeft: '1px solid var(--border-subtle)',
                            color: totalDia > 0 ? 'var(--color-success)' : '#94a3b8',
                            backgroundColor: totalDia > 0 ? 'var(--color-success-bg)' : 'inherit',
                          }}
                        >
                          {isValid ? totalDia : ''}
                        </td>
                      );
                    })}
                    <td
                      style={{
                        padding: '10px',
                        fontSize: '1rem',
                        color: 'var(--color-primary)',
                        backgroundColor: 'var(--color-accent-light)',
                        borderLeft: '2px solid var(--border-subtle)',
                      }}
                    >
                      {dataMatriz.total_general_asistencias}
                    </td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>

          {/* Leyenda de Símbolos Oficiales */}
          <div
            style={{
              display: 'flex',
              gap: '20px',
              flexWrap: 'wrap',
              marginTop: '18px',
              fontSize: '0.8125rem',
              color: 'var(--text-muted)',
              borderTop: '1px solid var(--border-subtle)',
              paddingTop: '12px',
            }}
          >
            <div>
              <strong style={{ color: 'var(--color-success)' }}>P:</strong> Presente
            </div>
            <div>
              <strong style={{ color: 'var(--color-warning)' }}>A:</strong> Ausente
            </div>
            <div>
              <strong style={{ color: '#94a3b8' }}>S:</strong> Jornada Suspendida (Corte de Luz / Clima / Feriado)
            </div>
            <div>
              <strong style={{ color: '#cbd5e1' }}>-:</strong> Día sin clase programada
            </div>
            <div style={{ marginLeft: 'auto' }}>
              Total Alumnos: <strong>{dataMatriz.total_alumnos_inscriptos}</strong> | Asistencias Totales del Mes: <strong>{dataMatriz.total_general_asistencias}</strong>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
