// =====================================================================
// Reducer de tareas: toda la lógica de actualización en una función pura.
// Nunca muta el estado: siempre devuelve un objeto nuevo.
// =====================================================================

export const initialState = { items: [], filter: 'all', sort: 'asc' }

export const ACTIONS = {
  ADD: 'ADD',
  REMOVE: 'REMOVE',
  TOGGLE: 'TOGGLE',
  FILTER: 'FILTER',
  SORT: 'SORT',
}

export const FILTERS = ['all', 'pending', 'completed', 'high']
export const CATEGORIES = ['Frontend', 'Backend', 'Diseño', 'QA', 'Documentación']
export const PRIORITIES = ['alta', 'media', 'baja']

const newId = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`

export function tasksReducer(state, action) {
  switch (action.type) {
    case ACTIONS.ADD: {
      const title = action.payload.title.trim()
      if (!title) return state // nada que agregar: se devuelve el MISMO estado (no re-render)
      const task = {
        id: newId(),
        title,
        category: action.payload.category ?? CATEGORIES[0],
        priority: action.payload.priority ?? 'media',
        completed: false,
        createdAt: new Date().toISOString(),
      }
      return { ...state, items: [...state.items, task] }
    }

    case ACTIONS.REMOVE:
      return { ...state, items: state.items.filter((t) => t.id !== action.payload) }

    case ACTIONS.TOGGLE:
      return {
        ...state,
        items: state.items.map((t) => (t.id === action.payload ? { ...t, completed: !t.completed } : t)),
      }

    case ACTIONS.FILTER:
      return FILTERS.includes(action.payload) ? { ...state, filter: action.payload } : state

    case ACTIONS.SORT:
      return action.payload === 'asc' || action.payload === 'desc' ? { ...state, sort: action.payload } : state

    default:
      throw new Error(`Acción desconocida: ${action.type}`)
  }
}

/** Función init de useReducer: arma el estado inicial con las tareas guardadas. */
export function initTasks(savedItems) {
  return { ...initialState, items: Array.isArray(savedItems) ? savedItems : [] }
}
