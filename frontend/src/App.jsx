import React, { useState } from 'react';
import Navbar from './components/Navbar';
import ActividadesList from './components/ActividadesList';
import { Users, CalendarCheck, FileSpreadsheet } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('actividades');

  return (
    <div className="app-container">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      {activeTab === 'actividades' && <ActividadesList />}

      {activeTab === 'alumnos' && (
        <div className="empty-state">
          <Users size={48} color="var(--color-primary)" style={{ margin: '0 auto 16px' }} />
          <h3>Módulo de Alumnos (RF-02)</h3>
          <p style={{ color: 'var(--text-muted)' }}>
            Este módulo se habilitará en el siguiente requerimiento secuencial del plan.
          </p>
        </div>
      )}

      {activeTab === 'asistencia' && (
        <div className="empty-state">
          <CalendarCheck size={48} color="var(--color-primary)" style={{ margin: '0 auto 16px' }} />
          <h3>Toma de Asistencia Diaria (HU-02 / RF-01)</h3>
          <p style={{ color: 'var(--text-muted)' }}>
            Interfaz táctil de toma de presentes por clase y registro de novedades.
          </p>
        </div>
      )}

      {activeTab === 'reportes' && (
        <div className="empty-state">
          <FileSpreadsheet size={48} color="var(--color-primary)" style={{ margin: '0 auto 16px' }} />
          <h3>Generación de Planillas GCBA (HU-03 / RF-01)</h3>
          <p style={{ color: 'var(--text-muted)' }}>
            Motor de reporte mensual de asistencia oficial y exportación.
          </p>
        </div>
      )}
    </div>
  );
}
