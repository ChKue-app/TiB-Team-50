import express from 'express';
import { auth } from '../middleware/auth.js';
import User from '../models/User.js';
import mongoose from 'mongoose';

const router = express.Router();

// Alle Spielerinnen abrufen (sortiert nach Position)
router.get('/', auth, async (req, res) => {
  try {
    const players = await User.find({ 
      team_id: 'tib-damen-50',
      role: 'player'
    })
    .select('-password')
    .sort({ position: 1, name: 1 }); // Erst nach Position, dann nach Name
    
    res.json(players || []);
  } catch (error) {
    res.status(500).json({ error: 'Fehler beim Laden der Spielerinnen' });
  }
});

// Neue Spielerin hinzufügen (nur Admin)
router.post('/', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Keine Berechtigung' });
    }

    console.log('Received player data:', req.body); // DEBUG

    const { name, email, phone, team_id } = req.body;
    const player = new User({
      name,
      email,
      phone,
      team_id,
      role: 'player'
    });

    const savedPlayer = await player.save();
    console.log('Saved player in DB:', savedPlayer); // DEBUG

    res.status(201).json(savedPlayer);
  } catch (error) {
    console.error('Error saving player:', error); // DEBUG
    res.status(400).json({ error: 'Fehler beim Erstellen der Spielerin' });
  }
});

// Spielerin aktualisieren (nur Admin)
router.put('/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Keine Berechtigung' });
    }

    console.log('Updating player, received data:', req.body); // DEBUG

    const { name, email, phone } = req.body;
    const player = await User.findByIdAndUpdate(
      req.params.id,
      { name, email, phone },
      { new: true }
    ).select('-password');

    console.log('Updated player in DB:', player); // DEBUG

    if (!player) {
      return res.status(404).json({ error: 'Spielerin nicht gefunden' });
    }

    res.json(player);
  } catch (error) {
    console.error('Error updating player:', error); // DEBUG
    res.status(400).json({ error: 'Fehler beim Aktualisieren der Spielerin' });
  }
});

// Spielerin löschen (nur Admin)
router.delete('/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Keine Berechtigung' });
    }

    const player = await User.findByIdAndDelete(req.params.id);
    
    if (!player) {
      return res.status(404).json({ error: 'Spielerin nicht gefunden' });
    }

    res.json({ message: 'Spielerin erfolgreich gelöscht' });
  } catch (error) {
    res.status(400).json({ error: 'Fehler beim Löschen der Spielerin' });
  }
});

// Spielerinnen-Reihenfolge aktualisieren
router.post('/reorder', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Keine Berechtigung' });
    }

    const { players } = req.body;
    console.log('Reordering players:', players);

    // Alle Updates in einem Bulk-Operation ausführen
    const bulkOps = players.map(player => ({
      updateOne: {
        filter: { _id: player._id },
        update: { $set: { position: player.position } }
      }
    }));

    const result = await User.bulkWrite(bulkOps);
    console.log('Bulk update result:', result);

    res.json({ message: 'Reihenfolge aktualisiert' });
  } catch (error) {
    console.error('Reorder error:', error);
    res.status(400).json({ error: 'Fehler beim Aktualisieren der Reihenfolge' });
  }
});

export default router; 