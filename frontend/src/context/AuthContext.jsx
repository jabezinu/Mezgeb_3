import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { AuthAPI } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          const profile = await AuthAPI.profile();
          setUser(profile);
        }
      } catch (e) {
        console.warn('Profile load failed:', e.message);
        localStorage.removeItem('token');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function login({ phoneNumber, password }) {
    setError(null);
    const res = await AuthAPI.login({ phoneNumber, password });
    localStorage.setItem('token', res.token);
    setUser({ _id: res._id, phoneNumber: res.phoneNumber, dailyGoal: res.dailyGoal });
    return res;
  }

  async function register({ phoneNumber, password }) {
    setError(null);
    const res = await AuthAPI.register({ phoneNumber, password });
    localStorage.setItem('token', res.token);
    setUser({ _id: res._id, phoneNumber: res.phoneNumber, dailyGoal: res.dailyGoal });
    return res;
  }

  async function updateDailyGoal(newGoal) {
    const res = await AuthAPI.updateDailyGoal({ dailyGoal: newGoal });
    setUser(prev => ({ ...prev, dailyGoal: res.dailyGoal }));
    return res;
  }

  function logout() {
    localStorage.removeItem('token');
    setUser(null);
  }

  const value = useMemo(() => ({ user, loading, error, login, register, logout, updateDailyGoal }), [user, loading, error]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
