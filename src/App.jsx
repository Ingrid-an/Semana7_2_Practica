import { useCallback, useEffect, useMemo, useReducer } from 'react'
import { ThemeProvider, useTheme } from './contexts/ThemeContext.jsx'
import { ACTIONS, CATEGORIES, FILTERS, initTasks, tasksReducer } from './hooks/useTasksReducer.js'
import { useLocalStorage } from './hooks/useLocalStorage.js'
import TaskList from './components/TaskList.jsx'
import StatCard from './components/StatCard.jsx'
import { BarChart, DonutChart, RingsChart } from './components/Charts.jsx'

// Tareas de ejemplo para la primera vez que se abre el dashboard
const SEED_TASKS = [
  { id: 's1', title: 'Maquetar el login', category: 'Frontend', priority: 'alta', completed: true, createdAt: '2026-10-10T10:00:00.000Z' },
  { id: 's2', title: 'Crear endpoint de usuarios', category: 'Backend', priority: 'alta', completed: false, createdAt: '2026-10-10T11:00:00.000Z' },
  { id: 's3', title: 'Paleta de colores del dashboard', category: 'Diseño', priority: 'media', completed: true, createdAt: '2026-10-11T09:00:00.000Z' },
  { id: 's4', title: 'Pruebas del reducer', category: 'QA', priority: 'media', completed: false, createdAt: '2026-10-11T15:00:00.000Z' },
  { id: 's5', title: 'README con diagrama de estado', category: 'Documentación', priority: 'alta', completed: false, createdAt: '2026-10-12T08:00:00.000Z' },
  { id: 's6', title: 'Grabar Profiler antes y después', category: 'QA', priority: 'baja', completed: false, createdAt: '2026-10-12T12:00:00.000Z' },
  { id: 's7', title: 'Tema claro y oscuro', category: 'Frontend', priority: 'media', completed: true, createdAt: '2026-10-13T10:00:00.000Z' },
  { id: 's8', title: 'Validar formularios', category: 'Frontend', priority: 'baja', completed: false, createdAt: '2026-10-13T16:00:00.000Z' },
]

const CATEGORY_COLORS = {
  Frontend: '#e2a9ef',
  Backend: '#8b7cf0',
  Diseño: '#27b3d9',
  QA: '#7ed8b4',
  Documentación: '#f5e663',
}
const PRIORITY_COLORS = { alta: '#27b3d9', media: '#e2a9ef', baja: '#8b7cf0' }
const FILTER_LABELS = { all: 'Todas', pending: 'Pendientes', completed: 'Completadas', high: 'Alta prioridad' }

function Dashboard() {
  const { theme, toggleTheme } = useTheme()

  // Hook personalizado: las tareas se guardan en localStorage
  const [savedTasks, setSavedTasks] = useLocalStorage('dashboard-tareas', SEED_TASKS)

  // useReducer: estado complejo (items + filter + sort) con transiciones claras.
  // initTasks arma el estado inicial con lo guardado (solo en el primer render).
  const [state, dispatch] = useReducer(tasksReducer, savedTasks, initTasks)
  const { items, filter, sort } = state

  // Sincroniza la lista con localStorage cada vez que cambian los items
  useEffect(() => {
    setSavedTasks(items)
  }, [items, setSavedTasks])

  // Handlers estables (dispatch nunca cambia), se pasan como props a TaskList
  const handleAdd = useCallback((task) => dispatch({ type: ACTIONS.ADD, payload: task }), [])
  const handleRemove = useCallback((id) => dispatch({ type: ACTIONS.REMOVE, payload: id }), [])
  const handleToggle = useCallback((id) => dispatch({ type: ACTIONS.TOGGLE, payload: id }), [])

  // useMemo: métricas derivadas para KPIs y gráficos. Solo se recalculan si cambian
  // los items; cambiar filtro, orden o tema NO las recalcula.
  const stats = useMemo(() => {
    const total = items.length
    const done = items.filter((t) => t.completed).length
    const byCategory = CATEGORIES.map((c) => {
      const group = items.filter((t) => t.category === c)
      return { label: c, value: group.length, total: group.length, done: group.filter((t) => t.completed).length, color: CATEGORY_COLORS[c] }
    })
    const byPriority = ['alta', 'media', 'baja'].map((p) => {
      const group = items.filter((t) => t.priority === p)
      const hechas = group.filter((t) => t.completed).length
      return { label: p, total: group.length, done: hechas, percent: group.length ? Math.round((hechas / group.length) * 100) : 0, color: PRIORITY_COLORS[p] }
    })
    return {
      total,
      done,
      pending: total - done,
      progress: total ? Math.round((done / total) * 100) : 0,
      high: items.filter((t) => t.priority === 'alta' && !t.completed).length,
      byCategory,
      byPriority,
    }
  }, [items])

  return (
    <div className="shell">
      <header className="topbar">
        <div>
          <h1>Panel de tareas</h1>
          <p className="muted">Sprint de la Semana 07 · Desarrollo de Aplicaciones Web</p>
        </div>
        <div className="topbar-actions">
          <button type="button" className="icon-btn" onClick={toggleTheme} aria-label="Cambiar tema" title="Cambiar tema">
            {theme === 'light' ? '🌙' : '☀️'}
          </button>
          <span className="avatar" aria-hidden="true">IA</span>
        </div>
      </header>

      <section className="stats">
        <StatCard tone="blue" icon="📋" value={stats.total} label="Total de tareas" />
        <StatCard tone="violet" icon="✅" value={stats.done} label="Completadas" />
        <StatCard tone="mint" icon="⏳" value={stats.pending} label="Pendientes" />
        <StatCard tone="pink" icon="📈" value={`${stats.progress}%`} label="Avance del sprint" />
      </section>

      <section className="grid">
        <article className="card">
          <header className="card-head"><h2>Por categoría</h2></header>
          <div className="chart-row">
            <ul className="legend">
              {stats.byCategory.map((c) => (
                <li key={c.label}>
                  <span className="dot" style={{ background: c.color }} />
                  {c.label}
                  <b>{stats.total ? Math.round((c.value / stats.total) * 100) : 0}%</b>
                </li>
              ))}
            </ul>
            <DonutChart data={stats.byCategory} />
          </div>
        </article>

        <article className="card">
          <header className="card-head"><h2>Avance por prioridad</h2></header>
          <div className="chart-row">
            <ul className="legend">
              {stats.byPriority.map((p) => (
                <li key={p.label}>
                  <span className="dot" style={{ background: p.color }} />
                  {p.label[0].toUpperCase() + p.label.slice(1)}
                  <b>{p.percent}%</b>
                </li>
              ))}
            </ul>
            <RingsChart data={stats.byPriority} />
          </div>
        </article>

        <article className="card card-tasks">
          <header className="card-head">
            <div>
              <h2>Tareas</h2>
              <p className="muted small">
                <b className="accent">{stats.high}</b> de alta prioridad pendientes
              </p>
            </div>
            <button
              type="button"
              className="pill"
              onClick={() => dispatch({ type: ACTIONS.SORT, payload: sort === 'asc' ? 'desc' : 'asc' })}
              aria-label={`Orden ${sort === 'asc' ? 'A a Z' : 'Z a A'}`}
            >
              {sort === 'asc' ? 'A → Z' : 'Z → A'}
            </button>
          </header>

          <div className="filters" role="group" aria-label="Filtrar tareas">
            {FILTERS.map((f) => (
              <button
                key={f}
                type="button"
                className={f === filter ? 'chip active' : 'chip'}
                aria-pressed={f === filter}
                onClick={() => dispatch({ type: ACTIONS.FILTER, payload: f })}
              >
                {FILTER_LABELS[f]}
              </button>
            ))}
          </div>

          <TaskList
            tasks={items}
            filter={filter}
            sort={sort}
            onAdd={handleAdd}
            onRemove={handleRemove}
            onToggle={handleToggle}
          />
        </article>

        <article className="card card-wide">
          <header className="card-head">
            <div>
              <h2>Tareas por categoría</h2>
              <p className="muted small">Barra clara: total · barra intensa: completadas</p>
            </div>
            <span className="badge">{stats.progress}% del sprint</span>
          </header>
          <BarChart data={stats.byCategory} />
        </article>
      </section>
    </div>
  )
}

// El Provider envuelve al Dashboard: así Dashboard puede usar useTheme()
export default function App() {
  return (
    <ThemeProvider>
      <Dashboard />
    </ThemeProvider>
  )
}
