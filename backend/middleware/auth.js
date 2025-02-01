import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'dein-geheimer-schluessel';

export const auth = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    console.log('Full Auth Header:', authHeader); // DEBUG

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new Error('Invalid Authorization header');
    }

    const token = authHeader.replace('Bearer ', '');
    console.log('Extracted token:', token); // DEBUG

    const decoded = jwt.verify(token, JWT_SECRET);
    console.log('Decoded token:', decoded); // DEBUG

    req.user = decoded;
    next();
  } catch (error) {
    console.error('Auth error:', error);
    res.status(401).json({ 
      error: 'Authentifizierung fehlgeschlagen',
      details: error.message 
    });
  }
}; 