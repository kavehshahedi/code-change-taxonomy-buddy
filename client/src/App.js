import React, { useState, useEffect } from 'react';
import LoginPage from './LoginPage';
import CodeChangeTaxonomyBuddy from './CodeChangeTaxonomyBuddy';
import axios from 'axios';

axios.defaults.baseURL = 'http://localhost:5001/api';

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [userId, setUserId] = useState('');

  useEffect(() => {
    // Check localStorage for saved login info when the app loads
    const savedUsername = localStorage.getItem('username');
    const savedUserId = localStorage.getItem('userId');
    if (savedUsername && savedUserId) {
      setIsLoggedIn(true);
      setUsername(savedUsername);
      setUserId(savedUserId);
    }
  }, []);

  const handleLogin = (loggedInUsername, loggedInUserId) => {
    setIsLoggedIn(true);
    setUsername(loggedInUsername);
    setUserId(loggedInUserId);
    // Save login info to localStorage
    localStorage.setItem('username', loggedInUsername);
    localStorage.setItem('userId', loggedInUserId);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUsername('');
    setUserId('');
    // Clear login info from localStorage
    localStorage.removeItem('username');
    localStorage.removeItem('userId');
  };

  return (
    <>
      {!isLoggedIn ? (
        <LoginPage onLogin={handleLogin} />
      ) : (
        <CodeChangeTaxonomyBuddy username={username} userId={userId} onLogout={handleLogout} />
      )}
    </>
  );
};

export default App;