# ✅ Deployment Checklist

ใช้รายการนี้เพื่อตรวจสอบก่อน deploy production

## 📋 Pre-Deployment

### Server Setup
- [ ] Server ติดตั้ง Ubuntu 24.04 LTS แล้ว
- [ ] มี RAM อย่างน้อย 16GB
- [ ] มี Storage อย่างน้อย 100GB
- [ ] Domain ชี้มาที่ server IP แล้ว
- [ ] SSH access ใช้งานได้

### DNS Configuration
- [ ] A Record: `yourdomain.com` → Server IP
- [ ] A Record: `*.yourdomain.com` → Server IP
- [ ] หรือ CNAME: subdomains → main domain
- [ ] Cloudflare proxy enabled (ถ้าใช้)

### Security
- [ ] เปลี่ยน SSH port (optional แต่แนะนำ)
- [ ] ตั้ง SSH key authentication
- [ ] Disable root login
- [ ] Firewall configured (UFW)
- [ ] Fail2ban installed (optional)

---

## 🔧 Configuration

### Environment Variables (.env)
- [ ] `DOMAIN` = your actual domain
- [ ] `ACME_EMAIL` = your email
- [ ] `DB_PASSWORD` = strong password (NOT default!)
- [ ] `MINIO_SECRET_KEY` = strong password
- [ ] `JWT_SECRET` = random string (32+ chars)
- [ ] `GRAFANA_PASSWORD` = strong password
- [ ] `TRAEFIK_AUTH` = htpasswd generated

### Generate Secrets
```bash
# JWT Secret
openssl rand -base64 32

# Traefik Auth
echo $(htpasswd -nb admin your-password) | sed -e s/\\$/\\$\\$/g
```

### Business Settings
- [ ] `PHOTO_PRICE` = your pricing
- [ ] `WATERMARK_TEXT` = your brand
- [ ] `MAX_UPLOAD_SIZE_MB` = reasonable limit

---

## 🚀 Deployment Steps

### Initial Deployment
```bash
# 1. Clone repository
cd /opt
git clone https://github.com/your-repo.git photo-event-platform
cd photo-event-platform

# 2. Run setup
chmod +x scripts/*.sh
sudo ./scripts/setup.sh

# 3. Configure
cp .env.example .env
nano .env  # Edit all values!

# 4. Deploy
sudo ./scripts/deploy.sh

# 5. Check status
docker compose ps
docker compose logs -f
```

### Verify Deployment
- [ ] All containers running: `docker compose ps`
- [ ] No errors in logs: `docker compose logs`
- [ ] API health check: `curl https://api.yourdomain.com/health`
- [ ] Frontend accessible: `https://yourdomain.com`
- [ ] Admin accessible: `https://admin.yourdomain.com`
- [ ] SSL certificates working

---

## 🧪 Testing

### Manual Tests
- [ ] Can create event via API
- [ ] Can upload photos
- [ ] Photos appear in MinIO
- [ ] Worker processes photos
- [ ] Face detection works
- [ ] Face search returns results
- [ ] Can view photos on frontend
- [ ] Mobile responsive works

### API Tests
```bash
# Health check
curl https://api.yourdomain.com/health

# Create event
curl -X POST https://api.yourdomain.com/api/events \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","date":"2024-12-01T10:00:00Z"}'

# Upload photo
curl -X POST https://api.yourdomain.com/api/events/1/photos \
  -F "files=@test.jpg"
```

### Load Testing (Optional)
```bash
# Install hey
go install github.com/rakyll/hey@latest

# Test API
hey -n 1000 -c 10 https://api.yourdomain.com/health
```

---

## 📊 Monitoring Setup

### Grafana
- [ ] Access: `https://monitor.yourdomain.com`
- [ ] Login with credentials from .env
- [ ] Import dashboards (optional)
- [ ] Set up alert notifications
- [ ] Configure data retention

### Alert Rules
- [ ] Disk space < 20%
- [ ] Memory usage > 90%
- [ ] API error rate > 5%
- [ ] Database connection errors
- [ ] Service down alerts

---

## 💾 Backup Configuration

### Automated Backups
```bash
# Add to crontab
crontab -e

# Daily backup at 2 AM
0 2 * * * /opt/photo-event-platform/scripts/backup.sh

# Weekly cleanup
0 3 * * 0 find /opt/photo-event-platform/backups -mtime +30 -delete
```

### Backup Verification
- [ ] Test restore from backup
- [ ] Verify backup files readable
- [ ] Offsite backup configured (optional)

---

## 🔐 Security Hardening

### Application Security
- [ ] JWT_SECRET is strong and random
- [ ] All default passwords changed
- [ ] CORS configured properly
- [ ] Rate limiting enabled (optional)
- [ ] SQL injection prevention (parameterized queries)

### Server Security
- [ ] Firewall active: `sudo ufw status`
- [ ] Only necessary ports open
- [ ] SSH key-only auth
- [ ] Automatic security updates enabled
- [ ] Log monitoring configured

### SSL/TLS
- [ ] SSL certificates auto-renewing
- [ ] HTTPS redirect working
- [ ] SSL Labs test: A+ rating
- [ ] HSTS header enabled

---

## 📱 Integration

### Payment Gateway (ถ้ามี)
- [ ] API keys configured
- [ ] Test mode working
- [ ] Production keys ready
- [ ] Webhook endpoint tested
- [ ] Payment flow tested

### Email Service (ถ้ามี)
- [ ] SMTP credentials configured
- [ ] Test email sent successfully
- [ ] Email templates ready

### SMS Service (ถ้ามี)
- [ ] API keys configured
- [ ] Test SMS sent

---

## 🎯 Performance Optimization

### Database
- [ ] Indexes created
- [ ] Query optimization done
- [ ] Connection pooling configured
- [ ] Backup/restore tested

### Caching
- [ ] Redis working properly
- [ ] Cache hit ratio good (>80%)
- [ ] Cache invalidation working

### CDN (Cloudflare)
- [ ] Image optimization enabled
- [ ] Caching rules configured
- [ ] Compression enabled
- [ ] DDoS protection active

### AI Service
- [ ] Model loaded successfully
- [ ] Processing time acceptable (<5s)
- [ ] Memory usage stable
- [ ] GPU enabled (if available)

---

## 📖 Documentation

### Internal Docs
- [ ] README.md reviewed
- [ ] API documentation updated
- [ ] Deployment procedures documented
- [ ] Troubleshooting guide created

### External Docs
- [ ] User guide ready (ถ้ามี)
- [ ] FAQ prepared
- [ ] Contact information updated

---

## 🚦 Go-Live Checklist

### Final Checks
- [ ] All tests passing
- [ ] No critical errors in logs
- [ ] Performance acceptable
- [ ] Security scan clean
- [ ] Backup working
- [ ] Monitoring alerts configured

### Communication
- [ ] Stakeholders notified
- [ ] Support team trained (ถ้ามี)
- [ ] Announcement prepared
- [ ] Rollback plan ready

### Post-Launch
- [ ] Monitor logs for 24h
- [ ] Check error rates
- [ ] User feedback collected
- [ ] Performance metrics reviewed

---

## 🔄 Maintenance

### Daily
- [ ] Check error logs
- [ ] Monitor resource usage
- [ ] Review backup success

### Weekly
- [ ] Review performance metrics
- [ ] Check disk space
- [ ] Update dependencies (security)

### Monthly
- [ ] Full system backup verification
- [ ] Security audit
- [ ] Capacity planning review
- [ ] Update documentation

---

## 🆘 Emergency Contacts

```
Primary Contact: _______________
Phone: _______________
Email: _______________

Backup Contact: _______________
Phone: _______________
Email: _______________

Hosting Provider: _______________
Support: _______________

Domain Registrar: _______________
Support: _______________
```

---

## 📝 Notes

```
Deployment Date: _______________
Deployed By: _______________
Server IP: _______________
Domain: _______________

Issues Found:
1. _______________
2. _______________

Resolved:
1. _______________
2. _______________
```

---

**✅ เมื่อทำครบทุกข้อแล้ว → Ready for Production!** 🚀
