import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { registerSW } from 'virtual:pwa-register'
import 'leaflet/dist/leaflet.css'
import './index.css'
import App from './App.tsx'

// Register PWA Service Worker with auto-reload upon updates
registerSW({ immediate: true })

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
