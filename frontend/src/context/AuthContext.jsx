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
          setUser({ ...profile, goalPeriods: profile.goalPeriods || [] });
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
    setUser({ _id: res._id, phoneNumber: res.phoneNumber, dailyGoal: res.dailyGoal, goalPeriods: res.goalPeriods || [] });
    return res;
  }

  async function register({ phoneNumber, password }) {
    setError(null);
    const res = await AuthAPI.register({ phoneNumber, password });
    localStorage.setItem('token', res.token);
    setUser({ _id: res._id, phoneNumber: res.phoneNumber, dailyGoal: res.dailyGoal, goalPeriods: res.goalPeriods || [] });
    return res;
  }

  async function updateDailyGoal(newGoal) {
    try {
      const res = await AuthAPI.updateDailyGoal({ dailyGoal: newGoal });
      setUser(prev => ({ ...prev, dailyGoal: res.dailyGoal, goalPeriods: res.goalPeriods || [] }));
      return res;
    } catch (error) {
      console.error('Failed to update daily goal:', error);
      throw error;
    }
  }

  async function addGoalPeriod(goal, startDate, endDate) {
    try {
      const res = await AuthAPI.addGoalPeriod({ goal, startDate, endDate });
      setUser(prev => ({ ...prev, goalPeriods: res.goalPeriods || [] }));
      return res;
    } catch (error) {
      console.error('Failed to add goal period:', error);
      throw error;
    }
  }

  async function updateGoalPeriod(id, updates) {
    try {
      const res = await AuthAPI.updateGoalPeriod(id, updates);
      setUser(prev => ({ ...prev, goalPeriods: res.goalPeriods || [] }));
      return res;
    } catch (error) {
      console.error('Failed to update goal period:', error);
      throw error;
    }
  }

  async function deleteGoalPeriod(id) {
    try {
      const res = await AuthAPI.deleteGoalPeriod(id);
      setUser(prev => ({ ...prev, goalPeriods: res.goalPeriods || [] }));
      return res;
    } catch (error) {
      console.error('Failed to delete goal period:', error);
      throw error;
    }
  }

  function logout() {
    localStorage.removeItem('token');
    setUser(null);
  }

  const value = useMemo(() => ({ user, loading, error, login, register, logout, updateDailyGoal, addGoalPeriod, updateGoalPeriod, deleteGoalPeriod }), [user, loading, error]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
