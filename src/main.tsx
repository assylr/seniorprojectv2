import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './App.css'
import App from './App.tsx'
import { apiClient } from './services/api'
import { getToken } from './services/auth'

const token = getToken()
if (token) {
  apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
