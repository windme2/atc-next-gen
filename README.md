# ✨ ATC Next Gen API

REST API สำหรับระบบจัดการสินค้า พร้อม JWT Authentication และ MongoDB Atlas

**🌐 Live Demo:** [https://atc-next-gen-silk.onrender.com/api/status](https://atc-next-gen-silk.onrender.com/api/status)

## ✨ คุณสมบัติ

- REST API ด้วย Express.js
- JWT Authentication & Authorization
- MongoDB Atlas + Mongoose ODM
- Product CRUD Operations
- Server Uptime Logger Middleware
- Advanced Query (Stock ต่ำ, สถิติมูลค่า)

## 🚀 Quick Start

```bash
# 1. ติดตั้ง Dependencies
npm install

# 2. ตั้งค่า .env
PORT=3000
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/database
JWT_SECRET=your_secret_key

# 3. รันเซิร์ฟเวอร์
npm start        # Production
npm run dev      # Development (nodemon)
```


## 📂 หลักการทำงานของ Middleware

### Server Uptime Logger
Middleware ที่ติดตาม log เวลาการทำงานของเซิร์ฟเวอร์ทุกครั้งที่มี request เข้ามา

**วิธีการทำงาน:**
1. ใช้ `process.uptime()` ดึงเวลาที่เซิร์ฟเวอร์ทำงานมา (วินาที)
2. แปลงเป็นรูปแบบ `ชั่วโมง:นาที:วินาที`
3. แสดง log พร้อม HTTP Method, URL และ Timestamp

```javascript
// ตัวอย่าง Log Output
⏱️ [UptimeLogger] GET /api/products
📊 Server Uptime: 0h 5m 23s (323.45s)
🕐 Timestamp: 2025-11-09T10:30:45.123Z
```

### JWT Authentication Middleware
ตรวจสอบ JWT Token ก่อนอนุญาตให้เข้าถึง Protected Routes

**ขั้นตอนการทำงาน:**
1. ดึง Authorization header จาก request
2. แยก Bearer Token ออกมา
3. ใช้ `jwt.verify()` ตรวจสอบความถูกต้องของ Token
4. ถ้าถูกต้อง → ดึงข้อมูล user จาก token และส่งต่อให้ controller
5. ถ้าไม่ถูกต้อง → ส่ง 401 Unauthorized

## 🔐 JWT Authentication

**JSON Web Token** - token ที่เข้ารหัสข้อมูล user อย่างปลอดภัย (อายุ 24 ชม.)

```
Header.Payload.Signature
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Payload:**
```json
{
  "id": "user_id",
  "username": "testuser",
  "role": "staff",
  "exp": 1731160845
}
```

**Flow:** Login → รับ Token → ส่ง Header `Authorization: Bearer <token>` → Server ตรวจสอบ

## 💾 Database (MongoDB Atlas + Mongoose)

```javascript
mongoose.connect(process.env.MONGO_URI, {
  serverSelectionTimeoutMS: 30000,
  socketTimeoutMS: 45000,
});
```

### Schemas

**User:** username, email, passwordHash (bcrypt), role (admin/staff)  
**Product:** name, price, stock, sku, isActive  
**Order:** userId, items[], totalAmount, status, shippingAddress

## 📍 API Endpoints

### Authentication (Public)
```bash
POST /api/register   # สมัครสมาชิก
POST /api/login      # เข้าสู่ระบบ
GET  /api/profile    # ดูโปรไฟล์ (ต้องมี Token)
```

### Product Management (Protected - ต้องมี JWT Token)
```bash
GET    /api/products           # ดูสินค้าทั้งหมด
POST   /api/products           # เพิ่มสินค้า
PUT    /api/products/:id       # แก้ไขสินค้า
DELETE /api/products/:id       # ลบสินค้า

# Advanced Queries
GET /api/products/query/all          # ดึงทั้งหมด (รวมที่ไม่ active)
GET /api/products/query/low-stock    # สินค้า stock < 10
GET /api/products/query/total-value  # สถิติและมูลค่ารวม
```

## 📝 ตัวอย่างการใช้งาน

```bash
# 1. Login
POST /api/login
{"username": "testuser", "password": "password123"}

# Response → เก็บ token
{"token": "eyJhbGc...", "user": {...}}

# 2. เพิ่มสินค้า (ใช้ Token)
POST /api/products
Headers: Authorization: Bearer YOUR_TOKEN
{"name": "Mechanical Keyboard", "price": 1590, "stock": 50}

# 3. ดูสินค้าทั้งหมด
GET /api/products
Headers: Authorization: Bearer YOUR_TOKEN

# 4. Query สินค้า stock ต่ำ
GET /api/products/query/low-stock
Headers: Authorization: Bearer YOUR_TOKEN
```

## 📊 ผลลัพธ์จาก Query จริง

### Query 1: ดึงสินค้าทั้งหมด
```json
{
  "message": "ดึงสินค้าทั้งหมดสำเร็จ",
  "totalProducts": 5,
  "products": [
    {
      "id": "673f8a2b1c2d3e4f5a6b7c8d",
      "name": "Mechanical Keyboard RGB",
      "price": 1590,
      "stock": 45,
      "createdAt": "2025-11-09T08:30:15.000Z"
    },
    {
      "id": "673f8a3c2d3e4f5a6b7c8e9f",
      "name": "Gaming Mouse",
      "price": 890,
      "stock": 30
    }
  ]
}
```

### Query 2: สินค้า Stock ต่ำ (< 10)
```json
{
  "message": "สินค้าที่ stock น้อยกว่า 10 ชิ้น",
  "totalLowStock": 3,
  "products": [
    {
      "id": "673f8a4d3e4f5a6b7c8e9f0a",
      "name": "HDMI Cable 2m",
      "price": 199,
      "stock": 0,
      "status": "หมด"
    },
    {
      "id": "673f8a5e4f5a6b7c8e9f0a1b",
      "name": "USB-C Hub",
      "price": 790,
      "stock": 5,
      "status": "ใกล้หมด"
    },
    {
      "id": "673f8a6f5a6b7c8e9f0a1b2c",
      "name": "Webcam HD",
      "price": 1290,
      "stock": 8,
      "status": "ใกล้หมด"
    }
  ]
}
```

### Query 3: สถิติมูลค่ารวม
```json
{
  "message": "สถิติมูลค่าสินค้าทั้งหมด",
  "summary": {
    "totalProducts": 5,
    "totalStockQuantity": 88,
    "totalValue": "89820.00",
    "averagePrice": "1031.80",
    "maxPrice": 1590,
    "minPrice": 199
  },
  "currency": "THB"
}
```

---

## 🚀 Deploy to Render.com

### ขั้นตอนการ Deploy

1. **สร้าง Repository บน GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/your-username/atc-next-gen.git
   git push -u origin main
   ```

2. **ตั้งค่า MongoDB Atlas**
   - ไปที่ [MongoDB Atlas](https://cloud.mongodb.com/)
   - สร้าง Cluster ใหม่ (ฟรี)
   - เลือก **Network Access** → Add IP: `0.0.0.0/0` (อนุญาตทุก IP)
   - คัดลอก Connection String (MONGO_URI)

3. **Deploy บน Render.com**
   - ไปที่ [Render.com](https://render.com/) และ Login ด้วย GitHub
   - คลิก **New +** → **Web Service**
   - เชื่อมต่อ GitHub Repository (`atc-next-gen`)
   - ตั้งค่า:
     - **Name:** `atc-next-gen`
     - **Environment:** `Node`
     - **Build Command:** `npm install`
     - **Start Command:** `npm start`
   
4. **ตั้งค่า Environment Variables**
   - ไปที่ **Environment** tab
   - เพิ่มตัวแปรเหล่านี้:
     ```
     PORT=3000
     MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/database
     JWT_SECRET=your_super_secret_key_here_12345
     NODE_ENV=production
     ```

5. **Deploy และทดสอบ**
   - Render จะ auto-deploy เมื่อมีการ push ใหม่
   - ทดสอบ API: `https://your-app.onrender.com/api/status`
   - ⚠️ **หมายเหตุ:** Free tier จะ sleep หลัง 15 นาทีไม่มีใช้งาน (ใช้เวลา ~30 วินาทีในการ wake up)

---

## 📄 License

This project is licensed under the MIT License.
