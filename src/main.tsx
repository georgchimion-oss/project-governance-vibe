import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './pwc_compat.css'
import './pwc_light_mode.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
)
