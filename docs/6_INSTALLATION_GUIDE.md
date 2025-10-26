# 🚀 คู่มือติดตั้ง - Customer System Complete

**วันที่:** 26 ตุลาคม 2025  
**สถานะ:** ✅ พร้อมใช้งาน 100%

---

## 📦 ไฟล์ที่ได้รับ (7 ไฟล์)

### Backend (2 ไฟล์)
1. `1_customer_purchase_api.py` - Orders & Purchase API
2. `2_email_service.py` - Email Service

### Frontend (3 ไฟล์ - รวม 7 หน้า)
3. `3_checkout_page.tsx` - หน้า Checkout
4. `4_order_and_download_pages.tsx` - Order Confirmation + Download (2 หน้า)
5. `5_login_register_account_pages.tsx` - Login + Register + My Account (3 หน้า)

### คู่มือ (2 ไฟล์)
6. `6_INSTALLATION_GUIDE.md` - คู่มือนี้
7. `7_README.md` - สรุปโครงการ

---

## ⚡ Quick Start - 30 นาที

### Step 1: Backend API (10 นาที)

#### 1.1 แก้ไข Database Model
```bash
# แก้ไขไฟล์ services/api/models.py
# เพิ่ม fields ตามที่ระบุใน 1_customer_purchase_api.py
```

ค้นหาคำว่า `class Purchase(Base):` แล้วเพิ่ม fields เหล่านี้:
- `photo_ids` (JSON)
- `photo_count` (Integer)
- `download_token` (String, unique)
- `download_expires_at` (DateTime)
- `download_count` (Integer)
- `max_downloads` (Integer)

#### 1.2 เพิ่ม API Endpoints
```bash
# คัดลอกโค้ดจาก 1_customer_purchase_api.py
# วางไปใน services/api/main.py
```

**Endpoints ที่เพิ่ม (8 endpoints):**
- POST `/api/purchases` - สร้างคำสั่งซื้อ
- GET `/api/orders` - ดูออเดอร์ทั้งหมด (Admin)
- GET `/api/my-orders` - ดูออเดอร์ของตัวเอง
- PUT `/api/orders/{id}/confirm-payment` - ยืนยันการชำระเงิน
- GET `/api/download/{token}` - ดาวน์โหลดรูปภาพ

#### 1.3 Restart API
```bash
docker compose restart api

# ตรวจสอบ
docker compose logs -f api
```

#### 1.4 Test API
เปิด http://localhost:8000/docs
ทดสอบ endpoints ใหม่

---

### Step 2: Frontend Pages (15 นาที)

#### 2.1 ติดตั้ง Dependencies
```bash
cd apps/frontend
npm install jszip file-saver axios react-hot-toast
```

#### 2.2 สร้างหน้าใหม่ 7 หน้า

**จากไฟล์ `3_checkout_page.tsx`:**
```bash
# สร้างไฟล์ apps/frontend/app/checkout/page.tsx
# คัดลอกโค้ดทั้งหมดจาก 3_checkout_page.tsx
```

**จากไฟล์ `4_order_and_download_pages.tsx` (มี 2 หน้า):**
```bash
# หน้า 1: Order Confirmation
# สร้าง apps/frontend/app/order-confirmation/page.tsx
# คัดลอกส่วนแรก (OrderConfirmationPage)

# หน้า 2: Download
# สร้างโฟลเดอร์ apps/frontend/app/download/[token]/
# สร้างไฟล์ apps/frontend/app/download/[token]/page.tsx
# คัดลอกส่วนที่สอง (DownloadPage)
```

**จากไฟล์ `5_login_register_account_pages.tsx` (มี 3 หน้า):**
```bash
# หน้า 1: Login
# สร้าง apps/frontend/app/login/page.tsx
# คัดลอกส่วนแรก (LoginPage)

# หน้า 2: Register
# สร้าง apps/frontend/app/register/page.tsx
# คัดลอกส่วนที่สอง (RegisterPage)

# หน้า 3: My Account
# สร้าง apps/frontend/app/my-account/page.tsx
# คัดลอกส่วนที่สาม (MyAccountPage)
```

#### 2.3 แก้ไขหน้า Event Detail (เพิ่มปุ่มซื้อ)

แก้ไข `apps/frontend/app/events/[slug]/page.tsx`:

```typescript
// เพิ่ม state
const [selectedPhotos, setSelectedPhotos] = useState<number[]>([])

// เพิ่ม checkbox ในแต่ละรูปภาพ
<input
  type="checkbox"
  checked={selectedPhotos.includes(photo.id)}
  onChange={(e) => {
    if (e.target.checked) {
      setSelectedPhotos([...selectedPhotos, photo.id])
    } else {
      setSelectedPhotos(selectedPhotos.filter(id => id !== photo.id))
    }
  }}
/>

// เพิ่มปุ่มชำระเงินด้านล่าง
{selectedPhotos.length > 0 && (
  <div className="fixed bottom-0 left-0 right-0 bg-white shadow-lg p-4">
    <div className="max-w-6xl mx-auto flex justify-between items-center">
      <div>
        <p>เลือกแล้ว: {selectedPhotos.length} ภาพ</p>
      </div>
      <a
        href={`/checkout?event=${eventId}&photos=${selectedPhotos.join(',')}`}
        className="px-8 py-3 bg-blue-600 text-white rounded-lg"
      >
        ชำระเงิน ฿{selectedPhotos.length * 50}
      </a>
    </div>
  </div>
)}
```

#### 2.4 Start Dev Server
```bash
npm run dev
```

เปิด http://localhost:3000

---

### Step 3: Email Service (Optional - 5 นาที)

#### 3.1 Setup Gmail App Password

1. ไปที่ https://myaccount.google.com/security
2. เปิด "2-Step Verification"
3. ไปที่ "App passwords"
4. สร้าง password ใหม่ สำหรับ "Mail"
5. คัดลอก password (16 ตัว)

#### 3.2 แก้ไข .env

```env
# Email Service
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your@gmail.com
SMTP_PASSWORD=xxxx_xxxx_xxxx_xxxx
SMTP_FROM_EMAIL=your@gmail.com
SMTP_FROM_NAME=Photo Event Platform

# Frontend URL
FRONTEND_URL=https://yourdomain.com
```

#### 3.3 คัดลอก Email Service

```bash
# คัดลอกไฟล์ 2_email_service.py
cp 2_email_service.py services/api/email_service.py
```

#### 3.4 เพิ่มการส่งอีเมลใน API

แก้ไข `services/api/main.py`:

```python
from email_service import send_order_confirmation, send_download_link

# ใน create_purchase endpoint (หลังสร้าง order):
try:
    await send_order_confirmation(
        customer_email=new_purchase.customer_email,
        customer_name=new_purchase.customer_name,
        order_id=new_purchase.id,
        photo_count=new_purchase.photo_count,
        amount=new_purchase.amount,
        event_name=event.name
    )
except Exception as e:
    logger.error(f"Email error: {e}")

# ใน confirm_payment endpoint (หลังยืนยัน):
try:
    await send_download_link(
        customer_email=order.customer_email,
        customer_name=order.customer_name,
        order_id=order.id,
        download_token=order.download_token,
        expires_at=order.download_expires_at
    )
except Exception as e:
    logger.error(f"Email error: {e}")
```

---

## 🧪 Testing (10 นาที)

### Test Customer Flow

1. ✅ ไปหน้างานอีเวนท์
2. ✅ ค้นหารูปด้วยใบหน้า
3. ✅ เลือกรูปที่ต้องการ (checkbox)
4. ✅ กด "ชำระเงิน"
5. ✅ กรอกข้อมูล (email, ชื่อ)
6. ✅ กด "ยืนยันการสั่งซื้อ"
7. ✅ เห็นหน้ายืนยันคำสั่งซื้อ
8. ✅ ได้รับอีเมลยืนยัน (ถ้ามี SMTP)

### Test Admin Flow

1. ✅ Login เป็น Admin
2. ✅ ไปหน้า Orders
3. ✅ เห็นคำสั่งซื้อใหม่
4. ✅ กด "ยืนยันการชำระเงิน"
5. ✅ ลูกค้าได้รับอีเมลพร้อมลิงก์

### Test Download

1. ✅ คลิกลิงก์ดาวน์โหลด
2. ✅ เห็นรูปภาพทั้งหมด
3. ✅ ดาวน์โหลดทีละภาพ

---

## 📋 Checklist สรุป

### Backend ✅
- [ ] แก้ไข models.py (เพิ่ม Purchase fields)
- [ ] คัดลอก API endpoints ไปใส่ main.py
- [ ] Restart API
- [ ] Test API endpoints

### Frontend ✅
- [ ] ติดตั้ง dependencies (jszip, file-saver)
- [ ] สร้างหน้า checkout
- [ ] สร้างหน้า order-confirmation
- [ ] สร้างหน้า download/[token]
- [ ] สร้างหน้า login
- [ ] สร้างหน้า register
- [ ] สร้างหน้า my-account
- [ ] แก้ไขหน้า event detail (เพิ่มปุ่มซื้อ)
- [ ] Test แต่ละหน้า

### Email (Optional) ✅
- [ ] Setup Gmail App Password
- [ ] แก้ไข .env
- [ ] คัดลอก email_service.py
- [ ] เพิ่มการส่งอีเมลใน API
- [ ] Test email

---

## 💡 Tips

1. **ทดสอบทีละส่วน** - Backend ก่อน แล้วค่อย Frontend
2. **เช็ค logs** - `docker compose logs -f api`
3. **ใช้ Swagger** - http://localhost:8000/docs
4. **Email ไม่จำเป็น** - สามารถใช้งานได้โดยไม่ต้องมี Email

---

## 🎯 คุณสมบัติที่ได้

### ลูกค้า
- ✅ ค้นหาและเลือกรูปภาพ
- ✅ สั่งซื้อและชำระเงิน
- ✅ ดาวน์โหลดรูปภาพ
- ✅ Login/Register
- ✅ ดูประวัติการสั่งซื้อ

### แอดมิน
- ✅ จัดการคำสั่งซื้อ
- ✅ ยืนยันการชำระเงิน
- ✅ ส่งลิงก์ดาวน์โหลด

---

## 📞 Support

**หากมีปัญหา:**

1. เช็ค logs: `docker compose logs -f api`
2. Test API: http://localhost:8000/docs
3. เช็ค database: `docker compose exec db psql -U postgres -d photoevent`

---

**ขอให้โชคดี! 🚀**
