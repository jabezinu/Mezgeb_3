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
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%239C92AC" fill-opacity="0.03"%3E%3Ccircle cx="30" cy="30" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-40"></div>
      
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
