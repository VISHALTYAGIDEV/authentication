import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { AppProvider } from './context/appContext.jsx'
// import tailwindcss from '@tailwindcss/vite'

export const server = "http://localhost:3000"

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AppProvider> <App /></AppProvider>
   
  </StrictMode>,
)

export default server