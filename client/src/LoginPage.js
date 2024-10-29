import React, { useState } from 'react';
import axios from 'axios';

const InputField = ({ type, placeholder, value, onChange, onKeyPress }) => (
  <input
    type={type}
    placeholder={placeholder}
    value={value}
    onChange={onChange}
    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-200 focus:outline-none focus:border-blue-500"
    onKeyUp={onKeyPress}
  />
);

const LoginPage = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async () => {
    try {
      const response = await axios.post('/auth/login', { username, password });
      if (response.data.success) {
        console.log(response.config.url)
        onLogin(username, response.data.userId);
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Login failed');
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      handleLogin();
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900">
      <div className="w-full max-w-md">
        <div className="bg-gray-800 shadow-md rounded-lg px-8 py-10">
          <h2 className="text-3xl font-bold text-center text-gray-100 mb-8">Login</h2>
          {error && (
            <div className="bg-red-500 text-white px-4 py-2 rounded-lg mb-4">
              {error}
            </div>
          )}
          <div className="space-y-6">
            <InputField
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyPress={handleKeyPress}
            />
            <InputField
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyPress={handleKeyPress}
            />
            <button
              onClick={handleLogin}
              className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
            >
              Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;