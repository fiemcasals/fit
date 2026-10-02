:root {
  /* Paleta Base */
  --color-primary: #006699;
  --color-primary-hover: #004d73;
  --color-accent: #00c2cb;
  --color-accent-light: #e0f9fb;
  --color-warning: #ff6b4a;
  --color-warning-light: #fff1ee;
  --color-success: #10b981;
  --color-success-bg: #ecfdf5;

  /* Superficies y Neutros */
  --bg-app: #f4f8fa;
  --bg-surface: #ffffff;
  --border-subtle: #e2e8f0;
  --text-main: #1e293b;
  --text-muted: #64748b;

  /* Geometría y Elevación */
  --radius-sm: 8px;
  --radius-md: 14px;
  --radius-lg: 20px;
  --radius-pill: 9999px;
  --shadow-card: 0 4px 16px -2px rgba(0, 78, 128, 0.07);
  --shadow-elevated: 0 8px 24px -4px rgba(0, 78, 128, 0.12);

  /* Tipografía */
  --font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
}

/* Base / Reset mínimo */
body {
  font-family: var(--font-family);
  background-color: var(--bg-app);
  color: var(--text-main);
  margin: 0;
  padding: 16px;
  -webkit-font-smoothing: antialiased;
}

/* 1. Header / Barra Superior */
.app-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background-color: var(--bg-surface);
  border-radius: var(--radius-md);
  margin-bottom: 20px;
  box-shadow: var(--shadow-card);
}

.app-brand {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--color-primary);
}

/* 2. Tarjeta de Clase */
.class-card {
  background: var(--bg-surface);
  border-radius: var(--radius-md);
  padding: 16px;
  box-shadow: var(--shadow-card);
  border: 1px solid var(--border-subtle);
  display: flex;
  flex-direction: column;
  gap: 12px;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}

.class-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-elevated);
}

.class-card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.class-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-main);
  margin: 0 0 4px 0;
}

.class-meta {
  font-size: 0.8125rem;
  color: var(--text-muted);
  display: flex;
  gap: 12px;
}

/* 3. Badges (Nivel, Carril, Estados) */
.badge {
  display: inline-flex;
  align-items: center;
  padding: 4px 10px;
  border-radius: var(--radius-pill);
  font-size: 0.75rem;
  font-weight: 600;
  line-height: 1;
}

.badge-lane {
  background-color: var(--color-accent-light);
  color: var(--color-primary);
}

.badge-status-full {
  background-color: var(--color-warning-light);
  color: var(--color-warning);
}

.badge-status-open {
  background-color: var(--color-success-bg);
  color: var(--color-success);
}

/* 4. Barra de Capacidad / Cupo */
.capacity-container {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.capacity-info {
  display: flex;
  justify-content: space-between;
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--text-muted);
}

.capacity-bar {
  width: 100%;
  height: 6px;
  background-color: var(--border-subtle);
  border-radius: var(--radius-pill);
  overflow: hidden;
}

.capacity-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--color-accent), var(--color-primary));
  border-radius: var(--radius-pill);
}

/* 5. Lista de Alumnos / Check-in */
.student-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 12px;
  background: var(--bg-surface);
  border-radius: var(--radius-sm);
  border: 1px solid var(--border-subtle);
}

.student-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.student-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background-color: var(--color-accent-light);
  color: var(--color-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.875rem;
}

.student-name {
  font-size: 0.875rem;
  font-weight: 600;
  margin: 0;
}

.student-detail {
  font-size: 0.75rem;
  color: var(--text-muted);
  margin: 0;
}

/* 6. Botones y Acciones */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-family: inherit;
  font-size: 0.875rem;
  font-weight: 600;
  border-radius: var(--radius-sm);
  padding: 10px 16px;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  text-decoration: none;
}

.btn-primary {
  background-color: var(--color-primary);
  color: #ffffff;
}

.btn-primary:hover {
  background-color: var(--color-primary-hover);
}

.btn-secondary {
  background-color: transparent;
  color: var(--color-primary);
  border: 1px solid var(--color-primary);
}

.btn-secondary:hover {
  background-color: var(--color-accent-light);
}

.btn-checkin {
  padding: 6px 12px;
  font-size: 0.75rem;
  border-radius: var(--radius-pill);
}

.btn-checkin.checked {
  background-color: var(--color-success-bg);
  color: var(--color-success);
  border: 1px solid var(--color-success);
}