import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { PencilIcon, CheckIcon, XMarkIcon, TrashIcon, ChevronUpIcon, ChevronDownIcon } from '@heroicons/react/24/solid';

function PlayerManagement() {
  const { user } = useAuth();
  const [players, setPlayers] = useState([]);
  const [newPlayer, setNewPlayer] = useState({ name: '', email: '', phone: '', position: '' });
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState('');
  const [editingPlayer, setEditingPlayer] = useState(null);

  useEffect(() => {
    // Sofort zurückkehren, wenn kein User eingeloggt ist
    if (!user) {
      setError('Bitte erst einloggen');
      return;
    }
    
    fetchPlayers();
  }, [user]); // Abhängigkeit von user hinzugefügt

  const fetchPlayers = async () => {
    try {
      const token = localStorage.getItem('token');
      console.log('Using token:', token); // DEBUG

      const response = await fetch('http://localhost:3000/api/players', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` // Wichtig: "Bearer " vor dem Token!
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Fehler beim Laden der Spielerinnen');
      }

      const data = await response.json();
      console.log('Received data:', data); // DEBUG
      setPlayers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Fehler beim Laden der Spielerinnen:', error);
      setError(error.message);
    }
  };

  const handleAddPlayer = async (e) => {
    e.preventDefault();
    try {
      const playerData = {
        ...newPlayer,
        team_id: 'tib-damen-50'
      };
      console.log('Sending to backend:', playerData);

      const response = await fetch('http://localhost:3000/api/players', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(playerData)
      });
      
      if (!response.ok) {
        const error = await response.json();
        console.error('Server error:', error);
        throw new Error(error.error || 'Fehler beim Speichern');
      }
      
      const savedPlayer = await response.json();
      console.log('Response from server:', savedPlayer);
      
      setNewPlayer({ name: '', email: '', phone: '', position: '' });
      setIsAdding(false);
      fetchPlayers();
    } catch (error) {
      console.error('Error in handleAddPlayer:', error);
    }
  };

  const handleEditPlayer = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`http://localhost:3000/api/players/${editingPlayer._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          name: editingPlayer.name,
          email: editingPlayer.email,
          phone: editingPlayer.phone
        })
      });
      
      if (response.ok) {
        setEditingPlayer(null);
        fetchPlayers();
      }
    } catch (error) {
      console.error('Fehler beim Aktualisieren:', error);
    }
  };

  const handleDeletePlayer = async (playerId) => {
    if (!window.confirm('Möchten Sie diese Spielerin wirklich löschen?')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:3000/api/players/${playerId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        fetchPlayers(); // Liste neu laden
      }
    } catch (error) {
      console.error('Fehler beim Löschen:', error);
    }
  };

  const movePlayer = async (playerId, direction) => {
    try {
      const currentIndex = players.findIndex(p => p._id === playerId);
      console.log('Moving player:', {
        playerId,
        direction,
        currentIndex,
        totalPlayers: players.length
      });

      if (
        (direction === 'up' && currentIndex === 0) || 
        (direction === 'down' && currentIndex === players.length - 1)
      ) {
        console.log('Move not possible - at boundary');
        return;
      }

      const newPlayers = [...players];
      const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
      
      [newPlayers[currentIndex], newPlayers[newIndex]] = 
      [newPlayers[newIndex], newPlayers[currentIndex]];

      console.log('New player order:', newPlayers.map(p => ({
        id: p._id,
        name: p.name,
        newPosition: newPlayers.indexOf(p) + 1
      })));

      // Optimistisches Update
      setPlayers(newPlayers);

      const playerUpdates = newPlayers.map((p, i) => ({
        _id: p._id,
        position: i + 1
      }));

      console.log('Sending player updates:', playerUpdates);

      const response = await fetch('http://localhost:3000/api/players/reorder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ players: playerUpdates })
      });

      const data = await response.json();
      console.log('Server response:', data);

      if (!response.ok) {
        throw new Error(data.error || 'Fehler beim Aktualisieren der Positionen');
      }

      // Lade die Liste neu
      await fetchPlayers();
    } catch (error) {
      console.error('Fehler beim Speichern der Reihenfolge:', error);
      // Lade die ursprüngliche Liste bei Fehler
      await fetchPlayers();
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Spielerinnen-Verwaltung</h2>
          {user?.role === 'admin' && (
            <button
              onClick={() => setIsAdding(true)}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Neue Spielerin
            </button>
          )}
        </div>

        {error && (
          <div className="mb-4 p-2 bg-red-100 text-red-700 rounded">
            {error}
          </div>
        )}

        {/* Formular für neue Spielerin */}
        {isAdding && (
          <form onSubmit={handleAddPlayer} className="mb-6 p-4 bg-gray-50 rounded">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <input
                  type="text"
                  value={newPlayer.name}
                  onChange={(e) => setNewPlayer({...newPlayer, name: e.target.value})}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">E-Mail</label>
                <input
                  type="email"
                  value={newPlayer.email}
                  onChange={(e) => setNewPlayer({...newPlayer, email: e.target.value})}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Telefon</label>
                <input
                  type="tel"
                  value={newPlayer.phone}
                  onChange={(e) => setNewPlayer({...newPlayer, phone: e.target.value})}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Meldeposition
                </label>
                <input
                  type="number"
                  min="1"
                  value={newPlayer.position}
                  onChange={(e) => setNewPlayer({
                    ...newPlayer, 
                    position: e.target.value ? parseInt(e.target.value) : ''
                  })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="mt-4 flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
              >
                Abbrechen
              </button>
              <button
                type="submit"
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Speichern
              </button>
            </div>
          </form>
        )}

        {/* Spielerinnen-Liste */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  E-Mail
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Telefon
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Position
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Aktionen
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {Array.isArray(players) && players.map((player, index) => (
                <tr key={player._id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className="mr-2 cursor-move">
                        {/* Placeholder for drag handle */}
                      </span>
                      {player.name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {player.email || '(keine E-Mail)'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {player.phone || '(keine Nummer)'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {index + 1}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                    <div className="flex items-center space-x-2">
                      <div className="flex flex-col">
                        <button
                          onClick={() => movePlayer(player._id, 'up')}
                          className="text-gray-600 hover:text-gray-900 p-1"
                          disabled={index === 0}
                        >
                          <ChevronUpIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => movePlayer(player._id, 'down')}
                          className="text-gray-600 hover:text-gray-900 p-1"
                          disabled={index === players.length - 1}
                        >
                          <ChevronDownIcon className="h-4 w-4" />
                        </button>
                      </div>
                      <button
                        onClick={() => setEditingPlayer(player)}
                        className="text-blue-600 hover:text-blue-900 p-1 rounded-full hover:bg-blue-100"
                      >
                        <PencilIcon className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDeletePlayer(player._id)}
                        className="text-red-600 hover:text-red-900 p-1 rounded-full hover:bg-red-100"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default PlayerManagement; 