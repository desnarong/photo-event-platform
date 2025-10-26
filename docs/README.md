# 📸 Photo Event Platform

ระบบจัดการและค้นหารูปภาพจากงานอีเว้นท์ ด้วยเทคโนโลยี AI Face Recognition

## ✨ Features

- 🎯 **Face Search**: ค้นหารูปภาพด้วยใบหน้า ด้วย AI
- 📤 **Photo Upload**: อัพโหลดรูปภาพจากช่างภาพ
- 💳 **Payment Integration**: รองรับการชำระเงินออนไลน์
- 📊 **Admin Dashboard**: จัดการงาน รูปภาพ และคำสั่งซื้อ
- 📈 **Analytics**: ดู metrics และสถิติการใช้งาน
- 🔐 **Security**: SSL, authentication, และ data encryption

## 🏗️ Architecture

```
┌─────────────────────────────────────┐
│  Cloudflare (CDN + SSL + DDoS)      │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│  Traefik (Reverse Proxy)            │
└──────────────┬──────────────────────┘
               │
    ┌──────────┼──────────┐
    │          │          │
┌───▼───┐  ┌──▼───┐  ┌──▼────┐
│Next.js│  │FastAPI│ │AI Svc│
│Frontend│ │  API  │ │Python│
└───────┘  └──────┘  └───────┘
               │
    ┌──────────┼──────────┐
┌───▼───┐  ┌──▼───┐  ┌──▼────┐
│Postgres│ │Redis │ │MinIO  │
└────────┘  └──────┘  └───────┘
```

## 🚀 Quick Start

### Prerequisites

- Ubuntu 24.04 LTS (bare metal)
- 16GB+ RAM
- 100GB+ Storage
- Domain name pointed to your server

### 1. Clone Repository

```bash
cd /opt
git clone https://github.com/your-username/photo-event-platform.git
cd photo-event-platform
```

### 2. Run Setup

```bash
chmod +x scripts/*.sh
sudo ./scripts/setup.sh
```

### 3. Configure Environment

```bash
cp .env.example .env
nano .env
```

**Important: Change all passwords and secrets!**

Required variables:
- `DOMAIN` - Your domain name
- `DB_PASSWORD` - PostgreSQL password
- `MINIO_SECRET_KEY` - MinIO password
- `JWT_SECRET` - JWT secret key
- `ACME_EMAIL` - Email for SSL certificates

### 4. Generate Traefik Auth

```bash
# Install htpasswd
sudo apt install apache2-utils

# Generate auth string
echo $(htpasswd -nb admin your-password) | sed -e s/\\$/\\$\\$/g
```

Copy the output to `TRAEFIK_AUTH` in `.env`

### 5. Deploy

```bash
sudo ./scripts/deploy.sh
```

### 6. Check Status

```bash
docker compose ps
docker compose logs -f
```

## 📦 Services

| Service | Port | URL | Description |
|---------|------|-----|-------------|
| Frontend | 3000 | https://yourdomain.com | Customer portal |
| Admin | 3000 | https://admin.yourdomain.com | Admin panel |
| API | 8000 | https://api.yourdomain.com | REST API |
| AI Service | 8001 | Internal | Face recognition |
| MinIO | 9000/9001 | https://minio.yourdomain.com | Object storage |
| Grafana | 3000 | https://monitor.yourdomain.com | Monitoring |
| PostgreSQL | 5432 | Internal | Database |
| Redis | 6379 | Internal | Cache & Queue |

## 🔧 Configuration

### Business Settings

Edit in `.env`:

```bash
# Pricing
PHOTO_PRICE=50          # Price per photo (THB)

# Upload limits
MAX_UPLOAD_SIZE_MB=50   # Max file size

# Watermark
WATERMARK_TEXT=YourBrand
```

### Advanced Settings

Edit in `services/api/main.py`:

```python
# Face detection confidence
MIN_CONFIDENCE = 0.9

# Search similarity threshold
SIMILARITY_THRESHOLD = 0.7

# Maximum search results
MAX_SEARCH_RESULTS = 50
```

## 📊 Monitoring

Access Grafana at: `https://monitor.yourdomain.com`

Default credentials:
- Username: admin
- Password: (from `.env`)

Available metrics:
- API request rate & latency
- Database queries
- AI service processing time
- Photo upload statistics
- Search queries per event

## 💾 Backup & Restore

### Backup

```bash
# Manual backup
sudo ./scripts/backup.sh

# Automatic backup (daily at 2 AM)
crontab -e
# Add line:
0 2 * * * /opt/photo-event-platform/scripts/backup.sh
```

Backups are stored in `backups/` directory.

### Restore

```bash
# Restore database
gunzip < backups/database_YYYYMMDD_HHMMSS.sql.gz | \
  docker compose exec -T postgres psql -U postgres eventphotos

# Restore MinIO
docker compose exec -T minio tar xzf - < backups/minio_YYYYMMDD_HHMMSS.tar.gz
```

## 🔒 Security

### SSL/TLS

SSL certificates are automatically obtained from Let's Encrypt via Traefik.

### Firewall

```bash
sudo ufw status
sudo ufw allow 22/tcp   # SSH
sudo ufw allow 80/tcp   # HTTP
sudo ufw allow 443/tcp  # HTTPS
```

### Secrets Management

Never commit `.env` to git!

Add to `.gitignore`:
```
.env
*.pem
*.key
backups/
```

## 🐛 Troubleshooting

### Container won't start

```bash
# Check logs
docker compose logs service-name

# Restart specific service
docker compose restart service-name
```

### Database connection error

```bash
# Check PostgreSQL
docker compose exec postgres psql -U postgres -c "SELECT 1"

# Reset database
docker compose down
docker volume rm photo-event-platform_postgres-data
docker compose up -d
```

### AI service out of memory

Edit `docker-compose.yml`:
```yaml
ai-service:
  deploy:
    resources:
      limits:
        memory: 32G  # Increase memory
```

### Slow face search

```bash
# Check Redis cache
docker compose exec redis redis-cli INFO

# Clear cache
docker compose exec redis redis-cli FLUSHALL
```

## 📈 Performance Tuning

### PostgreSQL

Edit in `docker-compose.yml`:

```yaml
postgres:
  command:
    - "postgres"
    - "-c"
    - "shared_buffers=8GB"         # Increase for more RAM
    - "-c"
    - "effective_cache_size=24GB"  # 75% of total RAM
    - "-c"
    - "work_mem=128MB"
```

### Redis

```yaml
redis:
  command: redis-server --maxmemory 16gb --maxmemory-policy allkeys-lru
```

### AI Service

For better performance, add GPU support:

```yaml
ai-service:
  deploy:
    resources:
      reservations:
        devices:
          - driver: nvidia
            count: 1
            capabilities: [gpu]
```

## 🔄 Updates

```bash
cd /opt/photo-event-platform
git pull origin main
sudo ./scripts/deploy.sh
```

## 📚 API Documentation

API docs available at: `https://api.yourdomain.com/docs`

### Example: Create Event

```bash
curl -X POST "https://api.yourdomain.com/api/events" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "งานวิ่งมาราธอน 2024",
    "date": "2024-12-01T08:00:00Z",
    "location": "สวนลุมพินี กรุงเทพฯ"
  }'
```

### Example: Search Face

```bash
curl -X POST "https://api.yourdomain.com/api/search-face?event_id=1" \
  -H "Content-Type: multipart/form-data" \
  -F "face_image=@my-face.jpg"
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📝 License

This project is licensed under the MIT License.

## 💬 Support

- Documentation: [docs.yourdomain.com](https://docs.yourdomain.com)
- Email: support@yourdomain.com
- Issues: [GitHub Issues](https://github.com/your-username/photo-event-platform/issues)

## 🎉 Credits

Built with:
- [Next.js](https://nextjs.org/) - React framework
- [FastAPI](https://fastapi.tiangolo.com/) - Python web framework
- [facenet-pytorch](https://github.com/timesler/facenet-pytorch) - Face recognition
- [PostgreSQL](https://www.postgresql.org/) - Database
- [Redis](https://redis.io/) - Cache & Queue
- [MinIO](https://min.io/) - Object storage
- [Traefik](https://traefik.io/) - Reverse proxy
- [Grafana](https://grafana.com/) - Monitoring

---

Made with ❤️ for event photographers and attendees
