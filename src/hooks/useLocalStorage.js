import { useEffect, useState } from 'react'

/**
 * Estado de React sincronizado con localStorage.
 * Funciona igual que useState: const [valor, setValor] = useLocalStorage('clave', defecto)
 *
 * @param {string} key          Clave en localStorage
 * @param {*}      defaultValue Valor si no hay nada guardado (o si está corrupto)
 */
export function useLocalStorage(key, defaultValue) {
  // Inicializador perezoso: solo lee localStorage en el primer render
  const [value, setValue] = useState(() => {
    try {
      const raw = localStorage.getItem(key)
      return raw !== null ? JSON.parse(raw) : defaultValue
    } catch {
      return defaultValue
    }
  })

  // Guarda cada vez que cambia el valor (o la clave)
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch {
      // cuota llena o storage bloqueado: el estado sigue en memoria
    }
  }, [key, value])

  // Sincroniza entre pestañas: si otra pestaña cambia esta clave, actualizamos
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key !== key || e.newValue === null) return
      try {
        setValue(JSON.parse(e.newValue))
      } catch {
        // valor externo inválido: lo ignoramos
      }
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage) // cleanup: evita memory leaks
  }, [key])

  return [value, setValue] // setValue de useState ya es estable entre renders
}
