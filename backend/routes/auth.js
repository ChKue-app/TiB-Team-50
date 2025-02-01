import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

// Spielerin Login
router.post('/login', async (req, res) => {
  try {
    const { name, team_id } = req.body;
    console.log('Player login attempt:', { name, team_id }); // DEBUG
    
    // Finde oder erstelle Spielerin
    let user = await User.findOne({ name, team_id });
    if (!user) {
      user = new User({
        name,
        team_id,
        role: 'player'
      });
      await user.save();
      console.log('New player created'); // DEBUG
    }

    const token = jwt.sign(
      { id: user._id, name: user.name, role: user.role, team_id: user.team_id },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    console.log('Player login successful'); // DEBUG
    res.json({ token, user: { name: user.name, role: user.role } });
  } catch (error) {
    console.error('Player login error:', error); // DEBUG
    res.status(400).json({ error: 'Login fehlgeschlagen' });
  }
});

// Admin Login
router.post('/admin/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    console.log('Admin login attempt:', { username }); // DEBUG
    
    if (username !== process.env.ADMIN_USERNAME || 
        password !== process.env.ADMIN_PASSWORD) {
      console.log('Admin login failed: invalid credentials'); // DEBUG
      return res.status(401).json({ error: 'Ungültige Anmeldedaten' });
    }

    // Finde oder erstelle Admin
    let admin = await User.findOne({ 
      name: username, 
      role: 'admin',
      team_id: process.env.INITIAL_TEAM_ID 
    });

    if (!admin) {
      console.log('Creating new admin user'); // DEBUG
      const hashedPassword = await bcrypt.hash(password, 10);
      admin = new User({
        name: username,
        password: hashedPassword,
        role: 'admin',
        team_id: process.env.INITIAL_TEAM_ID
      });
      await admin.save();
    }

    const token = jwt.sign(
      { id: admin._id, name: admin.name, role: admin.role, team_id: admin.team_id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    console.log('Admin login successful, token created'); // DEBUG
    res.json({ token, user: { name: admin.name, role: admin.role } });
  } catch (error) {
    console.error('Admin login error:', error); // DEBUG
    res.status(400).json({ error: 'Admin-Login fehlgeschlagen' });
  }
});

// Test-Route für Token-Validierung
router.get('/verify', async (req, res) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    console.log('Verifying token:', token);
    
    if (!token) {
      return res.status(401).json({ error: 'Kein Token gefunden' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Token verified:', decoded);
    
    res.json({ valid: true, user: decoded });
  } catch (error) {
    console.error('Token verification failed:', error);
    res.status(401).json({ error: 'Ungültiger Token' });
  }
});

export default router; 