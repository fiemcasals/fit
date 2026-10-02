import React, { useState } from 'react';
import Navbar from './components/Navbar';
import ActividadesList from './components/ActividadesList';
import AlumnosList from './components/AlumnosList';
import TomaAsistencia from './components/TomaAsistencia';
import { Users, CalendarCheck, FileSpreadsheet } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('actividades');

  return (
    <div className="app-container">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      {activeTab === 'actividades' && <ActividadesList />}

      {activeTab === 'alumnos' && <AlumnosList />}

      {activeTab === 'asistencia' && <TomaAsistencia />}

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
