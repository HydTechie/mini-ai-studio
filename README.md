# Mini AI Studio

A minimal full-stack "AI Studio" that simulates a fashion image generation experience.
Features:
- Register / Login (JWT + bcrypt)
- Upload an image + prompt -> simulated generation (server-side saved)
- Random simulated API errors to exercise client error handling
- Recent generations list (up to 5)
- Logging, basic tests, Docker + docker-compose (includes MongoDB)

Structure:
- backend/  -- Fastify + TypeScript + Mongoose
- frontend/ -- Vite + React + TypeScript + Tailwind
- docker-compose.yml, README, .env.example

Run (dev):
1. Start MongoDB or `docker-compose up --build` (recommended).
2. Backend: cd backend && npm install && npm run dev
3. Frontend: cd frontend && npm install && npm run dev

This bundle was generated programmatically.
