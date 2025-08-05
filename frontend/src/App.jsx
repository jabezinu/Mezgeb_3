import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home';
import Leads from './pages/Leads';
import Clients from './pages/Clients';
import CallToday from './pages/CallToday';
import Navbar from './componentes/Navbar';

const App = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%239C92AC%22%20fill-opacity%3D%220.03%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-40"></div>
      
      {/* Main Content Container */}
      <div className="relative z-10">
        <Navbar />
        
        {/* Page Content with Beautiful Container */}
        <main className="container mx-auto px-4 py-8">
          <div className="backdrop-blur-sm bg-white/70 rounded-3xl shadow-xl border border-white/20 overflow-hidden">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/lead" element={<Leads />} />
              <Route path="/clients" element={<Clients />} />
              <Route path="/call-today" element={<CallToday />} />
            </Routes>
          </div>
        </main>
      </div>

      {/* Floating Elements for Visual Interest */}
      <div className="fixed top-20 left-10 w-32 h-32 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full blur-xl animate-pulse"></div>
      <div className="fixed bottom-20 right-10 w-40 h-40 bg-gradient-to-r from-pink-400/20 to-orange-400/20 rounded-full blur-xl animate-pulse delay-1000"></div>
      <div className="fixed top-1/2 right-1/4 w-24 h-24 bg-gradient-to-r from-green-400/20 to-blue-400/20 rounded-full blur-xl animate-pulse delay-500"></div>
    </div>
  )
}

export default App
