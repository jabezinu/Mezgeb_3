import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home';
import Leads from './pages/Leads';
import Clients from './pages/Clients';
import CallToday from './pages/CallToday';
import Navbar from './componentes/Navbar';

const App = () => {
  return (
    <div>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/lead" element={<Leads />} />
        <Route path="/clients" element={<Clients />} />
        <Route path="/call-today" element={<CallToday />} />
      </Routes>
    </div>
  )
}

export default App
