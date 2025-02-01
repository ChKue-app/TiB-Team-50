import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

function Login() {
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    console.log('Login-Versuch mit:', { username, isAdminMode, password });
    
    const success = await login(username, isAdminMode, password);
    
    console.log('Login-Ergebnis:', success);
    
    if (success) {
      navigate('/dashboard');
    } else {
      setError(isAdminMode ? 
        'Admin-Login fehlgeschlagen. Bitte überprüfe deine Eingaben.' : 
        'Login fehlgeschlagen. Bitte versuche es erneut.'
      );
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-8">
      <h2 className="text-2xl font-bold mb-6 text-center">TiB Team 50</h2>
      <div className="mb-4 text-center">
        <button
          type="button"
          onClick={() => {
            setIsAdminMode(!isAdminMode);
            setError('');
          }}
          className="text-blue-600 underline"
        >
          {isAdminMode ? "Zum Spielerinnen-Login" : "Admin-Login"}
        </button>
      </div>
      {error && (
        <div className="mb-4 p-2 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="username" className="block text-gray-700 mb-2">
            {isAdminMode ? "Admin-Name" : "Spielerinnen-Name"}
          </label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            autoComplete="username"
            required
          />
        </div>
        {isAdminMode && (
          <div className="mb-4">
            <label htmlFor="password" className="block text-gray-700 mb-2">
              Passwort
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoComplete="current-password"
              required
            />
          </div>
        )}
        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Anmelden
        </button>
      </form>
    </div>
  );
}

export default Login; 