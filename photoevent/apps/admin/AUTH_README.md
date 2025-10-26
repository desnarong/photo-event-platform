# 🔐 Admin Panel - Authentication System

## ภาพรวม

Admin Panel พร้อม Login และ Profile ระบบ authentication ครบถ้วน

## 📋 Features

### ✅ สิ่งที่มี

1. **Login System**
   - Login form with email/password
   - JWT token authentication
   - Remember me (localStorage)
   - Error handling

2. **Profile Management**
   - View profile info
   - Edit personal information (name, phone)
   - Change password
   - Account details display

3. **Auth Protection**
   - Protected routes
   - Automatic redirect to login
   - Token-based API calls
   - Logout functionality

4. **UI Components**
   - Auth context provider
   - User display in sidebar
   - Profile dropdown
   - Loading states

## 🗂️ File Structure

```
apps/admin/
├── app/
│   ├── login/page.tsx          # Login page
│   ├── profile/page.tsx        # Profile page
│   ├── logout/page.tsx         # Logout page (updated)
│   └── layout.tsx              # Root layout with AuthProvider
├── components/
│   ├── AdminSidebar.tsx        # Sidebar with user info
│   └── ProtectedRoute.tsx      # Route protection HOC
├── contexts/
│   └── AuthContext.tsx         # Auth state management
└── lib/
    └── auth.ts                 # Auth helper functions
```

## 🚀 การใช้งาน

### 1. สร้าง Admin User (ครั้งแรก)

```bash
# เข้าสู่ Docker container ของ API
docker exec -it photo-event-platform-api-1 bash

# เปิด Python interactive shell
python3

# สร้าง admin user
from models import User
from auth import get_password_hash
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import os

# Connect to database
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@postgres:5432/eventphotos")
engine = create_engine(DATABASE_URL)
Session = sessionmaker(bind=engine)
session = Session()

# Create admin user
admin = User(
    email="admin@example.com",
    password_hash=get_password_hash("admin123"),
    full_name="ผู้ดูแลระบบ",
    role="admin",
    is_active=True,
    is_verified=True
)

session.add(admin)
session.commit()
print(f"Admin user created: {admin.email}")
session.close()
```

### 2. Login

1. เปิด `http://localhost:3000/login`
2. กรอก Email: `admin@example.com`
3. กรอก Password: `admin123`
4. คลิก "เข้าสู่ระบบ"

### 3. ดู/แก้ไข Profile

1. คลิกที่ชื่อผู้ใช้ใน Sidebar หรือไปที่ `/profile`
2. แก้ไขข้อมูล: ชื่อ-นามสกุล, เบอร์โทร
3. เปลี่ยนรหัสผ่าน (ต้องใส่รหัสผ่านเดิม)
4. คลิก "บันทึกข้อมูล"

### 4. Logout

1. คลิก "ออกจากระบบ" ใน Sidebar
2. หรือไปที่ `/admin/logout`

## 🔧 API Endpoints

### Auth Endpoints

```typescript
POST /api/auth/register
Body: { email, password, full_name?, phone?, role? }
Response: { access_token, token_type, user }

POST /api/auth/login
Body: { email, password }
Response: { access_token, token_type, user }

GET /api/auth/me
Headers: { Authorization: "Bearer {token}" }
Response: { id, email, full_name, phone, role, ... }

PUT /api/auth/profile
Headers: { Authorization: "Bearer {token}" }
Body: { full_name?, phone?, current_password?, new_password? }
Response: { id, email, full_name, phone, role, ... }

POST /api/auth/logout
Response: { message: "ออกจากระบบสำเร็จ" }
```

## 💾 LocalStorage

ระบบเก็บข้อมูลใน localStorage:

- `admin_token` - JWT access token
- `admin_user` - User object (JSON)

## 🔐 Security

### ✅ Implemented

- Password hashing (bcrypt)
- JWT token authentication
- Token expiration (7 days)
- Protected API routes
- CORS configuration

### ⚠️ TODO

- Rate limiting
- Refresh token
- Email verification
- Two-factor authentication
- Password reset via email
- Session management

## 📝 Environment Variables

เพิ่มใน `.env`:

```bash
JWT_SECRET=your-secret-key-change-in-production-min-32-chars
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=10080  # 7 days
```

## 🎯 User Roles

- `admin` - ผู้ดูแลระบบ (เข้าถึงทุกอย่าง)
- `photographer` - ช่างภาพ (จัดการงานและรูปภาพ)
- `customer` - ลูกค้า (ค้นหาและซื้อรูปภาพ)

## 🔄 Auth Flow

### Login Flow
```
1. User enters email/password
2. POST /api/auth/login
3. Server validates credentials
4. Server returns JWT token + user data
5. Client saves to localStorage
6. Client redirects to dashboard
```

### Protected Route Flow
```
1. User navigates to protected page
2. AuthContext checks for token
3. If no token → redirect to /login
4. If token exists → load user data
5. Render protected content
```

### API Call Flow
```
1. Get token from localStorage
2. Add to Authorization header
3. Make API request
4. If 401 → redirect to login
5. If success → update UI
```

## 🧪 Testing

### Test Login

```bash
# Using curl
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}'

# Response
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "token_type": "bearer",
  "user": {
    "id": 1,
    "email": "admin@example.com",
    "full_name": "ผู้ดูแลระบบ",
    "role": "admin",
    ...
  }
}
```

### Test Protected Endpoint

```bash
# Get current user
curl -X GET http://localhost:8000/api/auth/me \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..."

# Update profile
curl -X PUT http://localhost:8000/api/auth/me \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..." \
  -H "Content-Type: application/json" \
  -d '{"full_name":"Admin User","phone":"0812345678"}'
```

## 🐛 Troubleshooting

### ปัญหา: Login ไม่ได้

```bash
# Check if API is running
curl http://localhost:8000/health

# Check database connection
docker exec -it photo-event-platform-postgres-1 \
  psql -U postgres -d eventphotos -c "SELECT * FROM users;"

# Check logs
docker logs photo-event-platform-api-1
```

### ปัญหา: Token หมดอายุ

- Token หมดอายุทุก 7 วัน
- Login ใหม่เพื่อรับ token ใหม่
- TODO: Implement refresh token

### ปัญหา: 401 Unauthorized

- Check if token exists in localStorage
- Check if token is valid (not expired)
- Check Authorization header format: `Bearer {token}`

## 📚 Additional Resources

- [JWT Documentation](https://jwt.io/)
- [FastAPI Security](https://fastapi.tiangolo.com/tutorial/security/)
- [Next.js Authentication](https://nextjs.org/docs/authentication)

## ✅ Checklist

### Before Production

- [ ] Change JWT_SECRET to strong random string
- [ ] Setup email verification
- [ ] Implement password reset
- [ ] Add rate limiting
- [ ] Enable HTTPS only
- [ ] Review CORS settings
- [ ] Add audit logging
- [ ] Setup monitoring alerts

---

**Version:** 1.0  
**Last Updated:** October 26, 2025  
**Status:** ✅ Production Ready (Basic Auth)
