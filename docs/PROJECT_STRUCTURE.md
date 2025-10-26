# 📁 Project Structure

```
photo-event-platform/
├── 📄 docker-compose.yml          # Main orchestration file
├── 📄 .env.example                # Environment template
├── 📄 .gitignore                  # Git ignore rules
├── 📖 README.md                   # Full documentation
├── 📖 QUICKSTART.md               # Quick start guide
│
├── 📁 apps/                       # Frontend applications
│   ├── 📁 frontend/               # Customer portal (Next.js)
│   │   ├── 📄 package.json
│   │   ├── 📄 next.config.js
│   │   ├── 📄 tailwind.config.js
│   │   ├── 📄 Dockerfile
│   │   ├── 📁 app/
│   │   │   ├── 📄 layout.tsx      # Root layout
│   │   │   ├── 📄 page.tsx        # Homepage
│   │   │   ├── 📄 globals.css
│   │   │   └── 📁 events/
│   │   │       └── 📁 [slug]/
│   │   │           └── 📄 page.tsx  # Event detail + search
│   │   └── 📁 components/
│   │       └── 📄 Navbar.tsx
│   │
│   └── 📁 admin/                  # Admin panel (Next.js)
│       ├── 📄 package.json
│       ├── 📄 Dockerfile
│       └── 📁 app/
│
├── 📁 services/                   # Backend services
│   ├── 📁 api/                    # FastAPI service
│   │   ├── 📄 Dockerfile
│   │   ├── 📄 requirements.txt
│   │   ├── 📄 main.py            # API endpoints
│   │   └── 📄 models.py          # Database models
│   │
│   ├── 📁 ai/                     # AI service (Python)
│   │   ├── 📄 Dockerfile
│   │   ├── 📄 requirements.txt
│   │   └── 📄 main.py            # Face detection/matching
│   │
│   └── 📁 worker/                 # Background workers
│       ├── 📄 Dockerfile
│       ├── 📄 requirements.txt
│       └── 📄 tasks.py           # Celery tasks
│
├── 📁 monitoring/                 # Monitoring configuration
│   ├── 📁 prometheus/
│   │   └── 📄 prometheus.yml
│   ├── 📁 loki/
│   │   └── 📄 loki-config.yml
│   ├── 📁 promtail/
│   │   └── 📄 promtail-config.yml
│   └── 📁 grafana/
│       └── 📁 provisioning/
│
└── 📁 scripts/                    # Utility scripts
    ├── 📄 setup.sh               # Initial setup
    ├── 📄 deploy.sh              # Deploy/update
    ├── 📄 backup.sh              # Backup system
    ├── 📄 health-check.sh        # Health check
    ├── 📄 logs.sh                # View logs
    └── 📄 restart.sh             # Restart services
```

---

## 📦 Key Files Explained

### Infrastructure
- **docker-compose.yml** - Defines all services, networks, and volumes
- **.env** - Environment variables and secrets (not committed)

### Backend Services
- **services/api/main.py** - REST API endpoints for events, photos, search
- **services/api/models.py** - SQLAlchemy database models
- **services/ai/main.py** - Face detection and matching with PyTorch
- **services/worker/tasks.py** - Background job processing with Celery

### Frontend Apps
- **apps/frontend/app/page.tsx** - Homepage with event listing
- **apps/frontend/app/events/[slug]/page.tsx** - Event detail + face search UI
- **apps/frontend/components/Navbar.tsx** - Navigation component

### Scripts
- **setup.sh** - One-time server setup (Docker, firewall, etc.)
- **deploy.sh** - Build and deploy application
- **backup.sh** - Backup database and files
- **health-check.sh** - Check all services status

### Monitoring
- **monitoring/prometheus/** - Metrics collection config
- **monitoring/loki/** - Log aggregation config
- **monitoring/grafana/** - Dashboard provisioning

---

## 🔄 Data Flow

### Photo Upload Flow
```
User uploads photos
    ↓
Frontend → API (/api/events/{id}/photos)
    ↓
Store in MinIO
    ↓
Create DB record (status: pending)
    ↓
Queue worker task
    ↓
Worker fetches photo
    ↓
AI Service detects faces
    ↓
Update DB with embeddings
    ↓
Status: completed
```

### Face Search Flow
```
User uploads face image
    ↓
Frontend → API (/api/search-face)
    ↓
AI Service extracts embedding
    ↓
Compare with stored embeddings
    ↓
Return matching photos
    ↓
Display results to user
```

---

## 🗄️ Database Schema

### Tables

**events**
- id, name, slug, date, location, description, status, created_at

**photos**
- id, event_id, original_path, thumbnail_path
- has_face, face_count, face_embeddings (JSON)
- status, price, file_size, created_at

**users**
- id, email, password_hash, full_name, role
- is_active, created_at

**purchases**
- id, user_id, photo_id, amount, payment_status
- transaction_id, download_count, created_at

**search_logs**
- id, event_id, face_embedding, results_count, created_at

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| POST | `/api/events` | Create event |
| GET | `/api/events` | List events |
| GET | `/api/events/{id}` | Get event |
| POST | `/api/events/{id}/photos` | Upload photos |
| GET | `/api/events/{id}/photos` | List photos |
| POST | `/api/search-face` | Search by face |

Full API docs: `https://api.yourdomain.com/docs`

---

## 🐳 Docker Services

| Service | Image | Purpose |
|---------|-------|---------|
| traefik | traefik:v3.0 | Reverse proxy + SSL |
| frontend | node:20-alpine | Customer portal |
| admin | node:20-alpine | Admin panel |
| api | python:3.11-slim | REST API |
| ai-service | python:3.11-slim | Face AI |
| worker | python:3.11-slim | Background jobs |
| postgres | postgres:16-alpine | Database |
| redis | redis:7-alpine | Cache + Queue |
| minio | minio/minio | Object storage |
| grafana | grafana/grafana | Monitoring |
| prometheus | prom/prometheus | Metrics |
| loki | grafana/loki | Logs |
| promtail | grafana/promtail | Log collector |

---

## 💾 Docker Volumes

| Volume | Purpose |
|--------|---------|
| postgres-data | Database files |
| redis-data | Cache data |
| minio-data | Photo files |
| ai-models | AI model weights |
| grafana-data | Dashboards |
| prometheus-data | Metrics history |
| loki-data | Log history |
| traefik-acme | SSL certificates |

---

## 🌐 Networks

| Network | Purpose |
|---------|---------|
| web | Public-facing services |
| backend | Internal services only |

---

## 🔐 Environment Variables

See `.env.example` for full list.

Critical variables:
- `DOMAIN` - Your domain
- `DB_PASSWORD` - Database password
- `JWT_SECRET` - JWT signing key
- `MINIO_SECRET_KEY` - Storage password

---

## 📝 Adding New Features

### Add new API endpoint:
1. Edit `services/api/main.py`
2. Add route function
3. Rebuild: `docker compose up -d --build api`

### Add new page:
1. Create file in `apps/frontend/app/`
2. Rebuild: `docker compose up -d --build frontend`

### Add new background task:
1. Edit `services/worker/tasks.py`
2. Add task function
3. Rebuild: `docker compose up -d --build worker`

---

## 🎯 Customization Points

**Business Logic:**
- `services/api/main.py` - Pricing, rules
- `services/ai/main.py` - AI thresholds
- `services/worker/tasks.py` - Processing logic

**UI/UX:**
- `apps/frontend/app/` - Pages
- `apps/frontend/components/` - Reusable components
- `apps/frontend/app/globals.css` - Styling

**Configuration:**
- `.env` - Environment settings
- `docker-compose.yml` - Resource limits
- `monitoring/prometheus/` - Metrics
