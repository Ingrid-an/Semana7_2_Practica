import { memo } from 'react'

// Gráficos en SVG puro, sin librerías.

/** Dona segmentada: un arco por categoría. */
export const DonutChart = memo(function DonutChart({ data, size = 136, stroke = 24 }) {
  const r = (size - stroke) / 2
  const circ = 2 * Math.PI * r
  const total = data.reduce((s, d) => s + d.value, 0)
  let offset = 0
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label="Distribución por categoría">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--track)" strokeWidth={stroke} />
      {total > 0 &&
        data.map((d) => {
          const len = (d.value / total) * circ
          const gap = data.filter((x) => x.value > 0).length > 1 ? 3 : 0
          const seg = (
            <circle
              key={d.label}
              cx={size / 2}
              cy={size / 2}
              r={r}
              fill="none"
              stroke={d.color}
              strokeWidth={stroke}
              strokeDasharray={`${Math.max(len - gap, 0)} ${circ}`}
              strokeDashoffset={-offset}
              transform={`rotate(-90 ${size / 2} ${size / 2})`}
            />
          )
          offset += len
          return seg
        })}
    </svg>
  )
})

/** Anillos concéntricos: cada anillo muestra el % completado de un grupo. */
export const RingsChart = memo(function RingsChart({ data, size = 136, stroke = 11, gap = 6 }) {
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label="Avance por prioridad">
      {data.map((d, i) => {
        const r = size / 2 - stroke / 2 - i * (stroke + gap)
        const circ = 2 * Math.PI * r
        return (
          <g key={d.label} transform={`rotate(-90 ${size / 2} ${size / 2})`}>
            <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--track)" strokeWidth={stroke} />
            {d.percent > 0 && (
            <circle
              cx={size / 2}
              cy={size / 2}
              r={r}
              fill="none"
              stroke={d.color}
              strokeWidth={stroke}
              strokeLinecap="round"
              strokeDasharray={`${(d.percent / 100) * circ} ${circ}`}
            />
            )}
          </g>
        )
      })}
    </svg>
  )
})

/** Barras verticales: total de tareas por categoría y cuántas están hechas. */
export const BarChart = memo(function BarChart({ data }) {
  const max = Math.max(1, ...data.map((d) => d.total))
  return (
    <div className="bars" role="img" aria-label="Tareas por categoría">
      {data.map((d) => (
        <div key={d.label} className="bar-col">
          <div className="bar-track">
            <div className="bar-total" style={{ height: `${(d.total / max) * 100}%` }}>
              <div className="bar-done" style={{ height: d.total ? `${(d.done / d.total) * 100}%` : 0 }} />
            </div>
            <span className="bar-tip">{d.done}/{d.total}</span>
          </div>
          <span className="bar-label">{d.label}</span>
        </div>
      ))}
    </div>
  )
})
