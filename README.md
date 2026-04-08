# Immich Clone

A self-hosted photo and video backup solution, inspired by [Immich](https://immich.app/).

## Features

- **Photo & Video Upload**: Upload and store your photos and videos
- **Album Management**: Organize your media into albums
- **Face Recognition**: Automatically detect and cluster faces using ML
- **Semantic Search**: Find photos using natural language queries
- **Smart Timeline**: Browse your photos chronologically
- **OAuth Authentication**: Sign in with Google, GitHub, or email/password
- **Local Storage**: All data stored locally on your server

## Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Next.js Web   │────▶│   NestJS API    │────▶│   PostgreSQL    │
│   (Port 3000)   │     │   (Port 3001)   │     │   (Port 5432)   │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                               │
                               ▼
                        ┌─────────────────┐
                        │   ML Service    │
                        │   (Port 3003)   │
                        └─────────────────┘
                               │
                               ▼
                        ┌─────────────────┐
                        │     Redis       │
                        │   (Port 6379)   │
                        └─────────────────┘
```

## Tech Stack

- **Frontend**: Next.js 14, React, Tailwind CSS, Zustand, React Query
- **Backend**: NestJS, TypeORM, PostgreSQL, Redis
- **ML Service**: Python, FastAPI, InsightFace, CLIP
- **Storage**: Local filesystem (S3-compatible coming soon)

## Prerequisites

- Node.js 20+
- Python 3.11+
- PostgreSQL 16+ (with pgvector extension)
- Redis 7+
- pnpm 8+

## Quick Start

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/immich-clone.git
cd immich-clone
```

### 2. Install dependencies

```bash
pnpm install
```

### 3. Set up environment variables

Create a `.env` file in the root directory:

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=immich_clone

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# Auth
JWT_SECRET=your-secret-key-change-in-production
JWT_REFRESH_SECRET=your-refresh-secret-key

# OAuth (optional)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=

# ML Service
ML_HOST=localhost
ML_PORT=3003
```

### 4. Start services with Docker Compose

```bash
cd docker
docker-compose up -d postgres redis
```

### 5. Run database migrations

```bash
pnpm --filter server db:migrate
```

### 6. Start development servers

```bash
# Terminal 1 - Start backend
pnpm --filter server dev

# Terminal 2 - Start frontend
pnpm --filter web dev

# Terminal 3 - Start ML service (optional)
cd apps/ml
pip install -r requirements.txt
python main.py
```

### 7. Access the application

- Web: http://localhost:3000
- API: http://localhost:3001/api
- API Docs: http://localhost:3001/api/docs

## Project Structure

```
immich-clone/
├── apps/
│   ├── web/                    # Next.js frontend
│   │   ├── src/
│   │   │   ├── app/           # App router pages
│   │   │   ├── components/    # React components
│   │   │   ├── hooks/         # Custom hooks
│   │   │   ├── stores/        # Zustand stores
│   │   │   └── lib/           # Utilities
│   │   └── package.json
│   │
│   ├── server/                # NestJS backend
│   │   ├── src/
│   │   │   ├── modules/      # Feature modules
│   │   │   ├── database/      # Entities & migrations
│   │   │   └── main.ts
│   │   └── package.json
│   │
│   └── ml/                    # Python ML service
│       ├── src/
│       │   ├── face_recognition/
│       │   ├── embeddings/
│       │   └── api/
│       ├── main.py
│       └── requirements.txt
│
├── packages/
│   ├── types/                 # Shared TypeScript types
│   ├── utils/                 # Shared utilities
│   └── config/                # Shared configuration
│
├── docker/                    # Docker configuration
│   ├── docker-compose.yml
│   ├── Dockerfile.server
│   ├── Dockerfile.web
│   └── Dockerfile.ml
│
└── package.json               # Monorepo root
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `POST /api/auth/refresh` - Refresh tokens
- `POST /api/auth/logout` - Logout
- `GET /api/auth/oauth/google` - Google OAuth
- `GET /api/auth/oauth/github` - GitHub OAuth

### Assets
- `GET /api/assets` - List assets
- `POST /api/assets` - Create asset
- `GET /api/assets/:id` - Get asset
- `PATCH /api/assets/:id` - Update asset
- `DELETE /api/assets/:id` - Delete asset
- `POST /api/assets/bulk/favorite` - Bulk favorite
- `POST /api/assets/bulk/archive` - Bulk archive

### Upload
- `POST /api/upload/single` - Upload single file
- `POST /api/upload/multiple` - Upload multiple files

### Albums
- `GET /api/albums` - List albums
- `POST /api/albums` - Create album
- `GET /api/albums/:id` - Get album
- `PATCH /api/albums/:id` - Update album
- `DELETE /api/albums/:id` - Delete album

### Search
- `GET /api/search` - Search assets
- `GET /api/search/timeline` - Get timeline
- `GET /api/search/years` - Get years
- `GET /api/search/locations` - Get locations

## Development

### Run tests

```bash
pnpm test
```

### Build for production

```bash
pnpm build
```

### Lint code

```bash
pnpm lint
```

## Deployment

### Using Docker Compose (Recommended)

```bash
cd docker
docker-compose up -d
```

This will start all services:
- PostgreSQL with pgvector
- Redis
- NestJS API server
- Next.js web app
- Python ML service

### Manual Deployment

1. Build the applications:

```bash
pnpm build
```

2. Set production environment variables

3. Start the services:

```bash
# Start backend
NODE_ENV=production node apps/server/dist/main.js

# Start frontend
NODE_ENV=production node apps/web/.next/standalone/server.js

# Start ML service
python apps/ml/main.py
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT License - see [LICENSE](LICENSE) for details.

## Acknowledgments

- [Immich](https://immich.app/) - Inspiration for this project
- [NestJS](https://nestjs.com/) - Backend framework
- [Next.js](https://nextjs.org/) - Frontend framework
- [InsightFace](https://insightface.ai/) - Face recognition
- [OpenAI CLIP](https://openai.com/research/clip) - Image embeddings