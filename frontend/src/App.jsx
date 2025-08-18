import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Home from './pages/Home';
import Leads from './pages/Leads';
import Clients from './pages/Clients';
import CallToday from './pages/CallToday';
import Login from './pages/Login';
import Navbar from './componentes/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

const AppContent = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div>
      {isAuthenticated && <Navbar />}
      
      <main>
        <Routes>
          <Route path="/login" element={isAuthenticated ? <Navigate to="/" /> : <Login />} />
          
          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<Home />} />
            <Route path="/lead" element={<Leads />} />
            <Route path="/clients" element={<Clients />} />
            <Route path="/call-today" element={<CallToday />} />
          </Route>
          
          {/* Redirect any unknown paths to home or login */}
          <Route path="*" element={isAuthenticated ? <Navigate to="/" /> : <Navigate to="/login" />} />
        </Routes>
      </main>
    </div>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;
