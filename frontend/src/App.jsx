import React, { useState } from 'react';
import Navbar from './components/Navbar';
import ActividadesList from './components/ActividadesList';
import AlumnosList from './components/AlumnosList';
import TomaAsistencia from './components/TomaAsistencia';
import PlanillaMensual from './components/PlanillaMensual';
import { Users, CalendarCheck, FileSpreadsheet } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('actividades');

  return (
    <div className="app-container">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      {activeTab === 'actividades' && <ActividadesList />}

      {activeTab === 'alumnos' && <AlumnosList />}

      {activeTab === 'asistencia' && <TomaAsistencia />}

      {activeTab === 'reportes' && <PlanillaMensual />}
    </div>
  );
}
