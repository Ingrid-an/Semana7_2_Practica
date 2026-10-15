import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// StrictMode monta → desmonta → monta en desarrollo: sirve para comprobar
// que todos los useEffect tienen un cleanup correcto.
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
)
