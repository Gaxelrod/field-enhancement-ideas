import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import { AddressPrototype } from './pages/AddressPrototype.tsx'
import { EmployerPrototype } from './pages/EmployerPrototype.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/address" element={<AddressPrototype />} />
        <Route path="/employer" element={<EmployerPrototype />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
