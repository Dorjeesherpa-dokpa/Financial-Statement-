
import React, { useState } from 'react';
import Login from '../components/Login';
import Layout from '../components/Layout';

const Index = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  const handleLogin = () => {
    setIsLoggedIn(true);
  };
  
  const handleLogout = () => {
    setIsLoggedIn(false);
  };
  
  return (
    <div className="min-h-screen bg-background">
      {isLoggedIn ? (
        <Layout onLogout={handleLogout} />
      ) : (
        <Login onLogin={handleLogin} />
      )}
    </div>
  );
};

export default Index;
