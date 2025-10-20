## Quick local run (without Docker)

1. Start MongoDB locally (default: mongodb://localhost:27017)
2. Backend:
   - cd backend
   - npm install
   - cp ../.env.example .env
   - npm run dev
3. Frontend:
   - cd frontend
   - npm install
   - npm run dev

By default frontend expects backend at http://localhost:4000 (VITE_API_URL).
