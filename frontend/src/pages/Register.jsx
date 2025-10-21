import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ phoneNumber: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(form);
      navigate('/');
    } catch (e) {
      setError(e.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <form onSubmit={onSubmit} className="w-full max-w-md bg-white border rounded-lg p-6 space-y-4">
        <h1 className="text-xl font-semibold">Register</h1>
        {error && <div className="text-red-600 text-sm">{error}</div>}
        <div>
          <label className="block text-sm mb-1">Phone Number</label>
          <input
            type="tel"
            inputMode="numeric"
            pattern="[0-9]*"
            className="w-full border rounded px-3 py-2"
            value={form.phoneNumber}
            onChange={(e) => setForm(f => ({...f, phoneNumber: e.target.value}))}
            required
          />
        </div>
        <div>
          <label className="block text-sm mb-1">Password</label>
          <input
            type="password"
            className="w-full border rounded px-3 py-2"
            value={form.password}
            onChange={(e)=>setForm(f=>({...f, password: e.target.value}))}
            required
          />
        </div>
        <button disabled={loading} className="w-full bg-gray-900 text-white rounded px-3 py-2">
          {loading ? 'Creating account...' : 'Create Account'}
        </button>
        <p className="text-sm text-gray-600">Have an account? <Link to="/login" className="text-gray-900 underline">Login</Link></p>
      </form>
    </div>
  );
}
