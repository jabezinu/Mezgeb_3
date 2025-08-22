import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Overview from './pages/Overview';
import Clients from './pages/Clients';
import Leads from './pages/Leads';
import Login from './pages/Login';
import Register from './pages/Register';

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route element={<ProtectedRoute />}> 
          <Route element={<Layout />}> 
            <Route index element={<Overview />} />
            <Route path="clients" element={<Clients />} />
            <Route path="leads" element={<Leads />} />
          </Route>
        </Route>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="*" element={<div className="p-6">Not Found</div>} />
      </Routes>
    </AuthProvider>
  );
}