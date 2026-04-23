# MathCampus — Online Mathematics Platform
> Grade 12 CAPS-aligned mathematics learning platform for South African students.

## Stack
| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite + TailwindCSS |
| Backend | Node.js + Express |
| Database | PostgreSQL 15 + Redis |
| Auth | JWT + Google OAuth |
| File Storage | AWS S3 + CloudFront CDN |
| Deployment | AWS (EC2, RDS, ElastiCache) + Docker |
| CI/CD | GitHub Actions |

## Quick Start (Local Dev)

```bash
# 1. Clone & install
git clone https://github.com/your-org/mathcampus
cd mathcampus

# 2. Set environment variables
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# 3. Start everything with Docker
docker-compose -f docker/docker-compose.yml up --build

# Frontend → http://localhost:5173
# Backend API → http://localhost:4000
# PostgreSQL → localhost:5432
# Redis → localhost:6379
```

## Manual Setup (without Docker)

```bash
# Database
createdb mathcampus
cd database && npm run migrate && npm run seed

# Backend
cd backend && npm install && npm run dev

# Frontend
cd frontend && npm install && npm run dev
```

## Project Structure
```
mathcampus/
├── frontend/          React + Vite + TailwindCSS SPA
├── backend/           Node.js + Express REST API
├── database/          PostgreSQL migrations & seeds
├── docker/            Docker Compose configs
├── nginx/             Reverse proxy config
├── scripts/           Deploy & utility scripts
└── .github/workflows/ CI/CD pipelines
```

## API Documentation
See `backend/src/routes/` — all routes documented with JSDoc.

Base URL: `https://api.mathcampus.co.za/v1`

### Auth
- `POST /auth/register`
- `POST /auth/login`
- `GET  /auth/google`
- `POST /auth/refresh`
- `POST /auth/logout`

### Campuses
- `GET  /campuses`
- `GET  /campuses/:id`
- `POST /campuses/:id/enroll`

### Lessons
- `GET  /campuses/:id/lessons`
- `POST /lessons/:id/complete`

### Progress
- `GET  /progress/me`
- `GET  /progress/campuses`

### Quizzes
- `GET  /quizzes/:id`
- `POST /quizzes/:id/submit`

### Discussion
- `GET  /campuses/:id/posts`
- `POST /campuses/:id/posts`
- `POST /posts/:id/replies`

## Deployment (AWS)
See `scripts/deploy.sh` and `.github/workflows/deploy.yml`.

Resources provisioned:
- EC2 t3.medium (backend, auto-scaled)
- RDS PostgreSQL db.t3.micro
- ElastiCache Redis t3.micro
- S3 bucket (media/assets)
- CloudFront distribution (CDN)
- Application Load Balancer

## License
MIT — MathCampus 2025
