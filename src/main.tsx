import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
<<<<<<< HEAD
import App from './App'
import { ActivityProvider } from './context/ActivityContext'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ActivityProvider>
      <App />
    </ActivityProvider>
=======
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
>>>>>>> 55a37e5d5c6969a2c5f4cf7eb615c42827c3a8f7
  </StrictMode>,
)
