 import { useState } from 'react';
 import { useNavigate } from 'react-router-dom';
 import { useAuth } from '../contexts/AuthContext';

export default function Login() {
  const [formData, setFormData] = useState({
    phoneNumber: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { phoneNumber, password } = formData;
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setError('');
      setLoading(true);
      
      if (!phoneNumber || !password) {
        throw new Error('Please enter both phone number and password');
      }
      
      const result = await login(phoneNumber, password);
      
      if (result.success) {
        navigate('/');
      } else {
        setError(result.message || 'Failed to log in');
      }
    } catch (err) {
      setError('Failed to log in. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white flex items-center justify-center px-4">
      <div className="card w-full max-w-md p-6">
        <h2 className="text-center text-2xl font-bold tracking-tight text-gray-900 mb-6">
          Sign in to your account
        </h2>

        {error && (
          <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="phoneNumber" className="mb-1 block text-sm font-medium text-gray-700">
              Phone number
            </label>
            <input
              id="phoneNumber"
              name="phoneNumber"
              type="text"
              required
              className="input"
              placeholder="Enter your phone number"
              value={phoneNumber}
              onChange={handleChange}
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-1 block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className="input"
              placeholder="Enter your password"
              value={password}
              onChange={handleChange}
            />
          </div>

          <div className="mb-1">
            <a href="#" className="text-sm text-indigo-600 hover:text-indigo-500">
              Forgot your password?
            </a>
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  );
}
