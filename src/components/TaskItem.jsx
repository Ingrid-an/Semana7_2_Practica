import { memo } from 'react'

const PRIORITY_LABEL = { alta: 'Alta', media: 'Media', baja: 'Baja' }

/**
 * Fila de una tarea. React.memo evita re-renderizarla si sus props no cambian.
 * Por eso TaskList le pasa handlers estabilizados con useCallback.
 */
function TaskItem({ task, onToggle, onRemove }) {
  return (
    <li className={task.completed ? 'task done' : 'task'}>
      <label className="task-check">
        <input type="checkbox" checked={task.completed} onChange={() => onToggle(task.id)} />
        <span className="task-title">{task.title}</span>
      </label>
      <span className="task-meta">
        <span className={`tag tag-${task.category.toLowerCase()}`}>{task.category}</span>
        <span className={`prio prio-${task.priority}`}>{PRIORITY_LABEL[task.priority]}</span>
      </span>
      <button type="button" className="icon-btn danger" aria-label={`Eliminar ${task.title}`} onClick={() => onRemove(task.id)}>
        ✕
      </button>
    </li>
  )
}

export default memo(TaskItem)
