import { memo } from 'react'

/** Tarjeta KPI pastel (fila superior del dashboard). */
function StatCard({ icon, value, label, trend, tone }) {
  const positive = trend >= 0
  return (
    <article className={`stat stat-${tone}`}>
      <div className="stat-top">
        <span className="stat-icon" aria-hidden="true">{icon}</span>
        <strong className="stat-value">{value}</strong>
      </div>
      <div className="stat-bottom">
        <span>{label}</span>
        {trend !== undefined && (
          <span className={positive ? 'trend up' : 'trend down'}>
            {positive ? '+' : ''}{trend}% {positive ? '↗' : '↘'}
          </span>
        )}
      </div>
    </article>
  )
}

export default memo(StatCard)
