# 🚀 Quick Start Guide

## ติดตั้งภายใน 10 นาที!

### Step 1: เตรียม Server (2 นาที)

```bash
# SSH เข้า server
ssh root@your-server-ip

# Clone โปรเจค
cd /opt
git clone https://github.com/your-username/photo-event-platform.git
cd photo-event-platform
```

### Step 2: ติดตั้งระบบ (3 นาที)

```bash
# ทำให้ scripts executable
chmod +x scripts/*.sh

# รัน setup script
sudo ./scripts/setup.sh
```

Script จะติดตั้ง:
- ✅ Docker & Docker Compose
- ✅ Firewall configuration
- ✅ Required directories

### Step 3: กำหนดค่า (3 นาที)

```bash
# Copy environment template
cp .env.example .env

# Edit configuration
nano .env
```

**ต้องเปลี่ยนค่าเหล่านี้:**

```bash
DOMAIN=yourdomain.com              # ⚠️ เปลี่ยนเป็น domain จริง
ACME_EMAIL=admin@yourdomain.com    # ⚠️ email สำหรับ SSL

# เปลี่ยน passwords ทั้งหมด!
DB_PASSWORD=your-secure-password-here        # ⚠️
MINIO_SECRET_KEY=your-minio-password        # ⚠️
JWT_SECRET=your-jwt-secret-key              # ⚠️
GRAFANA_PASSWORD=your-grafana-password      # ⚠️
```

**Generate JWT Secret:**
```bash
openssl rand -base64 32
```

**Generate Traefik Auth:**
```bash
sudo apt install apache2-utils
echo $(htpasswd -nb admin your-password) | sed -e s/\\$/\\$\\$/g
# Copy output to TRAEFIK_AUTH in .env
```

### Step 4: Deploy! (2 นาที)

```bash
# Build และ start ทุกอย่าง
sudo ./scripts/deploy.sh
```

### Step 5: Check Status

```bash
# ดู containers ที่ทำงาน
docker compose ps

# ดู logs
docker compose logs -f

# Health check
./scripts/health-check.sh
```

---

## ✅ เข้าถึงระบบ

| Service | URL | Credentials |
|---------|-----|-------------|
| **Customer Portal** | https://yourdomain.com | - |
| **Admin Panel** | https://admin.yourdomain.com | (ตั้งในระบบ) |
| **API Docs** | https://api.yourdomain.com/docs | - |
| **MinIO Console** | https://minio.yourdomain.com | admin / MINIO_SECRET_KEY |
| **Monitoring** | https://monitor.yourdomain.com | admin / GRAFANA_PASSWORD |

---

## 🎯 First Steps

### 1. สร้าง Event แรก

เข้า Admin Panel หรือใช้ API:

```bash
curl -X POST "https://api.yourdomain.com/api/events" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Event",
    "date": "2024-12-01T10:00:00Z",
    "location": "Bangkok"
  }'
```

### 2. อัพโหลดรูปภาพ

```bash
# Via API
curl -X POST "https://api.yourdomain.com/api/events/1/photos" \
  -F "files=@photo1.jpg" \
  -F "files=@photo2.jpg"
```

### 3. ทดสอบ Face Search

1. เข้า https://yourdomain.com
2. เลือก event
3. อัพโหลดรูปหน้า
4. ดูผลลัพธ์!

---

## 🐛 Troubleshooting

### Containers ไม่ทำงาน?

```bash
# Check logs
docker compose logs service-name

# Restart
docker compose restart service-name
```

### SSL ไม่ work?

1. ตรวจสอบ DNS ชี้ถูกต้อง
2. รอ 1-2 นาที สำหรับ certificate
3. Check Traefik: `docker compose logs traefik`

### AI Service ช้า?

เพิ่ม memory:
```yaml
# docker-compose.yml
ai-service:
  deploy:
    resources:
      limits:
        memory: 32G
```

---

## 📚 Next Steps

1. อ่าน [README.md](README.md) ฉบับเต็ม
2. ปรับแต่ง business settings
3. Setup backup schedule
4. Configure monitoring alerts
5. Integrate payment gateway

---

## 💬 ต้องการความช่วยเหลือ?

- 📖 Documentation: README.md
- 🐛 Issues: GitHub Issues
- 📧 Email: support@yourdomain.com

---

**เรียบร้อย! ระบบพร้อมใช้งาน** 🎉
