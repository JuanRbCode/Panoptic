import React, { useState } from 'react';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';

export default function App() {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });
  const [currentView, setCurrentView] = useState('login'); // 'login' o 'register'

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  if (!user) {
    if (currentView === 'register') {
      return <Register switchToLogin={() => setCurrentView('login')} />;
    }
    return <Login onLoginSuccess={(userData) => setUser(userData)} switchToRegister={() => setCurrentView('register')} />;
  }

  return <Dashboard user={user} onLogout={handleLogout} />;
}