import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './LoginPage';
import CodeChangeTaxonomyBuddy from './CodeChangeTaxonomyBuddy';
import CodeChangeViewer from './CodeChangeViewer';
import axios from 'axios';

axios.defaults.baseURL = `${process.env.REACT_APP_SERVER_BASE_URL}/api`;

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [userId, setUserId] = useState('');

  useEffect(() => {
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
    localStorage.setItem('username', loggedInUsername);
    localStorage.setItem('userId', loggedInUserId);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUsername('');
    setUserId('');
    localStorage.removeItem('username');
    localStorage.removeItem('userId');
  };

  return (
    <Router>
      <Routes>
        <Route 
          path="/viewer" 
          element={<CodeChangeViewer />} 
        />
        <Route
          path="/"
          element={
            !isLoggedIn ? (
              <LoginPage onLogin={handleLogin} />
            ) : (
              <CodeChangeTaxonomyBuddy 
                username={username} 
                userId={userId} 
                onLogout={handleLogout} 
              />
            )
          }
        />
      </Routes>
    </Router>
  );
};

export default App;