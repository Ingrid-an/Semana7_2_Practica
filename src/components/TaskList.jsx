import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import TaskItem from './TaskItem.jsx'
import { useLocalStorage } from '../hooks/useLocalStorage.js'
import { CATEGORIES, PRIORITIES } from '../hooks/useTasksReducer.js'

const PRIORITY_ORDER = { alta: 0, media: 1, baja: 2 }

/**
 * Lista de tareas con formulario de alta.
 * @param {{ tasks: object[], filter: string, sort: 'asc'|'desc',
 *           onAdd: Function, onRemove: Function, onToggle: Function }} props
 */
export default function TaskList({ tasks, filter, sort, onAdd, onRemove, onToggle }) {
  // Hook personalizado reutilizado: el borrador sobrevive aunque recargues la página
  const [draft, setDraft] = useLocalStorage('dashboard-borrador', '')
  // useState para UI local del formulario (no pertenece al reducer global)
  const [category, setCategory] = useState(CATEGORIES[0])
  const [priority, setPriority] = useState('media')
  const [error, setError] = useState('')

  // useRef: referencia al <input> del DOM. Cambiarla NO provoca re-render.
  const inputRef = useRef(null)

  // Auto-focus al montar el componente (dependencias vacías: solo una vez por montaje)
  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  // useMemo: filtrar + ordenar solo cuando cambian tasks, filter o sort.
  // Cambiar el tema, escribir en el input o abrir otro widget NO recalcula esto.
  const visibleTasks = useMemo(() => {
    const filtered = tasks.filter((t) => {
      if (filter === 'completed') return t.completed
      if (filter === 'pending') return !t.completed
      if (filter === 'high') return t.priority === 'alta'
      return true
    })
    const dir = sort === 'asc' ? 1 : -1
    // [...filtered]: copiamos antes de ordenar porque sort() muta el arreglo
    return [...filtered].sort(
      (a, b) =>
        PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority] ||
        dir * a.title.localeCompare(b.title, 'es', { sensitivity: 'base' })
    )
  }, [tasks, filter, sort])

  // useCallback: referencias estables para los hijos memoizados (TaskItem).
  // Sin esto, cada render crearía funciones nuevas y React.memo no serviría.
  const handleToggle = useCallback((id) => onToggle(id), [onToggle])
  const handleRemove = useCallback((id) => onRemove(id), [onRemove])

  // No se memoiza: va a un <form> nativo, no a un hijo memoizado (evitar overuse)
  const handleSubmit = (e) => {
    e.preventDefault()
    if (draft.trim().length < 3) {
      setError('Escribe al menos 3 caracteres.')
      inputRef.current?.focus()
      return
    }
    onAdd({ title: draft, category, priority })
    setDraft('')
    setError('')
    inputRef.current?.focus() // listo para escribir la siguiente, sin re-render extra
  }

  return (
    <div className="task-panel">
      <form className="task-form" onSubmit={handleSubmit} noValidate>
        <input
          ref={inputRef}
          className="input"
          value={draft}
          onChange={(e) => {
            setDraft(e.target.value)
            if (error) setError('')
          }}
          placeholder="Nueva tarea..."
          aria-label="Nueva tarea"
          aria-invalid={Boolean(error)}
        />
        <select className="input select" value={category} onChange={(e) => setCategory(e.target.value)} aria-label="Categoría">
          {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
        </select>
        <select className="input select" value={priority} onChange={(e) => setPriority(e.target.value)} aria-label="Prioridad">
          {PRIORITIES.map((p) => <option key={p} value={p}>{p[0].toUpperCase() + p.slice(1)}</option>)}
        </select>
        <button type="submit" className="btn">Agregar</button>
      </form>
      {error && <p className="form-error" role="alert">{error}</p>}

      {visibleTasks.length === 0 ? (
        <p className="empty">No hay tareas en esta vista.</p>
      ) : (
        <ul className="task-list">
          {visibleTasks.map((t) => (
            <TaskItem key={t.id} task={t} onToggle={handleToggle} onRemove={handleRemove} />
          ))}
        </ul>
      )}
    </div>
  )
}
