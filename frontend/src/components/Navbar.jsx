import React from 'react';
import { Activity, Users, CalendarCheck, FileSpreadsheet, Layers } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab }) {
  const tabs = [
    { id: 'actividades', label: 'Clases y Horarios', icon: <Layers size={18} /> },
    { id: 'alumnos', label: 'Alumnos', icon: <Users size={18} /> },
    { id: 'asistencia', label: 'Toma de Asistencia', icon: <CalendarCheck size={18} /> },
    { id: 'reportes', label: 'Planillas GCBA', icon: <FileSpreadsheet size={18} /> },
  ];

  return (
    <header className="app-header">
      <div className="app-brand">
        <Activity size={26} color="var(--color-accent)" />
        <span>fitPM</span>
        <span className="app-brand-badge">Secretaría de Deportes</span>
      </div>

      <nav className="nav-links">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`nav-item ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </nav>
    </header>
  );
}
