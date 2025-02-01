# TiB Tennis Team Manager

Eine Webanwendung zur Verwaltung des TiB Damen 50 Tennis Teams.

## Features

- Spielerinnen-Verwaltung
  - Hinzufügen/Bearbeiten/Löschen von Spielerinnen
  - Meldereihenfolge anpassen
  - Kontaktdaten verwalten

## Setup

1. Repository klonen
2. Dependencies installieren:
   ```bash
   # Backend
   cd backend
   npm install

   # Frontend
   cd frontend
   npm install
   ```

3. `.env` Datei im Backend erstellen:
   - Kopiere `.env.example` zu `.env`
   - Fülle die Werte entsprechend aus

4. Server starten:
   ```bash
   # Backend
   cd backend
   npm run dev

   # Frontend
   cd frontend
   npm run dev
   ```

## Tech Stack

- Frontend: React + Vite
- Backend: Node.js + Express
- Datenbank: MongoDB

## Projektstruktur
- `/frontend` - React-basierte Benutzeroberfläche
- `/backend` - Node.js/Express Server
  - `/models` - Datenbank-Modelle
  - `/routes` - API-Routen
  - `/controllers` - Geschäftslogik
  - `/middleware` - Auth & Validierung

## Erste Team-Installation
Aktuell konfiguriert für: TiB Damen 50 
