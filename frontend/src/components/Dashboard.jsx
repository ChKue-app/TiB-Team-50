import React from 'react';
import { useAuth } from '../context/AuthContext';

function Dashboard() {
  const { user, logout } = useAuth();

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Willkommen, {user?.name}!</h1>
          <button
            onClick={logout}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            Abmelden
          </button>
        </div>
        <p className="text-gray-600">
          Du bist erfolgreich eingeloggt als {user?.role === 'admin' ? 'Admin' : 'Spielerin'}.
        </p>
      </div>
    </div>
  );
}

export default Dashboard; 