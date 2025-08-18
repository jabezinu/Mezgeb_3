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

  const containerStyle = {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
    padding: '20px'
  };

  const formContainerStyle = {
    maxWidth: '400px',
    width: '100%',
    backgroundColor: 'white',
    padding: '30px',
    border: '1px solid #ddd'
  };

  const titleStyle = {
    textAlign: 'center',
    fontSize: '24px',
    fontWeight: 'bold',
    marginBottom: '30px',
    color: '#333'
  };

  const errorStyle = {
    backgroundColor: '#ffebee',
    border: '1px solid #f44336',
    color: '#d32f2f',
    padding: '10px',
    marginBottom: '20px'
  };

  const inputGroupStyle = {
    marginBottom: '15px'
  };

  const inputStyle = {
    width: '100%',
    padding: '12px',
    border: '1px solid #ccc',
    fontSize: '14px'
  };

  const buttonStyle = {
    width: '100%',
    padding: '12px',
    backgroundColor: '#2196f3',
    color: 'white',
    border: 'none',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer'
  };

  const disabledButtonStyle = {
    ...buttonStyle,
    backgroundColor: '#ccc',
    cursor: 'not-allowed'
  };

  return (
    <div style={containerStyle}>
      <div style={formContainerStyle}>
        <h2 style={titleStyle}>
          Sign in to your account
        </h2>
        
        {error && (
          <div style={errorStyle}>
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div style={inputGroupStyle}>
            <input
              id="phoneNumber"
              name="phoneNumber"
              type="text"
              required
              style={inputStyle}
              placeholder="Phone number"
              value={phoneNumber}
              onChange={handleChange}
            />
          </div>
          
          <div style={inputGroupStyle}>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              style={inputStyle}
              placeholder="Password"
              value={password}
              onChange={handleChange}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <a href="#" style={{ fontSize: '14px', color: '#2196f3', textDecoration: 'none' }}>
              Forgot your password?
            </a>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={loading ? disabledButtonStyle : buttonStyle}
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  );
}
