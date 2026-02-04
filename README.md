# Notes API

Minimal backend API for managing notes with intelligent behavior.

## Tech Stack
- Node.js
- Express.js

## Features
- Create, read, update notes
- Intelligent search (case-insensitive, partial match)
- Rate limiting (5 notes/min)
- Trim & validation handling

## Run
```bash
npm install
node index.js
Endpoints

POST /notes

GET /notes

PUT /notes/:id

GET /notes/search?q=

