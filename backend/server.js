import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Team from './models/Team.js';
import User from './models/User.js';
import authRoutes from './routes/auth.js';
import playerRoutes from './routes/players.js';

// Konfiguration laden
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Basis-Route zum Testen
app.get('/', (req, res) => {
  res.json({ message: 'Tennis-Teams Backend läuft!' });
});

// Initiales Team erstellen
async function initializeFirstTeam() {
  try {
    const teamExists = await Team.findOne({ id: process.env.INITIAL_TEAM_ID });
    if (!teamExists) {
      const team = new Team({
        id: process.env.INITIAL_TEAM_ID,
        name: process.env.INITIAL_TEAM_NAME,
        type: process.env.INITIAL_TEAM_TYPE
      });
      await team.save();
      console.log('Initiales Team erstellt:', team.name);
    }
  } catch (error) {
    console.error('Fehler beim Erstellen des initialen Teams:', error);
  }
}

// Auth-Routen einbinden
app.use('/api/auth', authRoutes);

// Player-Routen einbinden
app.use('/api/players', playerRoutes);

// MongoDB Verbindung und Server Start
mongoose.connect(process.env.MONGODB_URI)
.then(() => {
  console.log('MongoDB verbunden');
  // Erst nach erfolgreicher Verbindung das Team initialisieren
  initializeFirstTeam();
  
  // Server starten
  app.listen(port, () => {
    console.log(`Server läuft auf Port ${port}`);
  });
})
.catch(err => {
  console.error('MongoDB Verbindungsfehler:', err);
  process.exit(1);  // Server beenden bei Verbindungsfehler
}); 