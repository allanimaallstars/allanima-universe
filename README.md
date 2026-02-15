# 🌌 ALLANIMA Universe — Live Notion Dashboard

เว็บไซต์ฐานข้อมูลจักรวาล ALLANIMA เชื่อมต่อ Notion แบบ Real-time  
แก้ข้อมูลใน Notion → เว็บอัปเดตอัตโนมัติ

---

## ✨ Features

- **LIVE Notion Sync** — ดึงข้อมูลจาก Notion ทุก 60 วินาที
- **7 หมวด** — Overview, Search, Beings, 7 Sins, Layers, Timeline, Relations
- **ค้นหาข้ามหมวด** — พิมพ์ชื่อ/คำอธิบายค้นหาทุกอย่างพร้อมกัน
- **Filter 3 ชั้น** — กรองตาม Type, Alignment, Status
- **ลิงก์กลับ Notion** — กดแก้ไขข้อมูลใน Notion ได้ทันที
- **Cosmic Theme** — ธีมอวกาศพร้อมดาวระยิบระยับ
- **Responsive** — ใช้ได้ทั้งมือถือและคอมพิวเตอร์

---

## 🚀 วิธี Deploy ขึ้น Vercel (ฟรี!)

### ขั้นตอนที่ 1: สร้าง Notion Integration

1. ไปที่ **https://www.notion.so/my-integrations**
2. กด **"New Integration"**
3. ตั้งชื่อ: `ALLANIMA Dashboard`
4. กด **Submit** → จะได้ **Internal Integration Secret** (ขึ้นต้นด้วย `secret_...`)
5. **Copy ค่านี้เก็บไว้** — จะใช้เป็น `NOTION_TOKEN`

### ขั้นตอนที่ 2: เชื่อม Integration กับ Database

1. เปิด **ALLANIMA COSMOLOGY Master Database** ใน Notion
2. กดจุด 3 จุด `...` มุมขวาบน
3. เลือก **Connections** → ค้นหา `ALLANIMA Dashboard`
4. กด **Confirm**

> ⚠️ ต้องทำขั้นตอนนี้ ไม่งั้นเว็บจะอ่านข้อมูลไม่ได้!

### ขั้นตอนที่ 3: อัปโหลดขึ้น GitHub

1. สร้าง repository ใหม่ที่ **https://github.com/new**
2. ตั้งชื่อ: `allanima-universe` (หรืออะไรก็ได้)
3. อัปโหลดไฟล์ทั้งหมดในโฟลเดอร์นี้ขึ้น GitHub

**วิธีอัปโหลดผ่าน command line:**
```bash
cd allanima-web
git init
git add .
git commit -m "ALLANIMA Universe Dashboard"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/allanima-universe.git
git push -u origin main
```

**หรือวิธีง่าย:** ลาก zip ไปวางที่ GitHub เลย

### ขั้นตอนที่ 4: Deploy ที่ Vercel

1. ไปที่ **https://vercel.com** → สมัครด้วย GitHub
2. กด **"Add New Project"**
3. เลือก repository `allanima-universe`
4. ในหน้า Configure:
   - **Framework Preset:** Next.js (จะเลือกให้อัตโนมัติ)
   - **Environment Variables:** เพิ่ม 2 ค่านี้:

   | Key | Value |
   |---|---|
   | `NOTION_TOKEN` | `secret_xxxxxxxxx...` (จากขั้นตอนที่ 1) |
   | `NOTION_DATABASE_ID` | `31d46ffe0aaa440997bf7b46b709e63b` |

5. กด **Deploy**
6. รอ 1-2 นาที → ได้ URL เช่น `allanima-universe.vercel.app` 🎉

---

## 📁 โครงสร้างโปรเจกต์

```
allanima-web/
├── app/
│   ├── api/notion/route.js   # API route ดึงข้อมูลจาก Notion
│   ├── globals.css            # Cosmic theme + Tailwind
│   ├── layout.js              # Root layout
│   └── page.js                # Dashboard หลัก (ทุกหน้า)
├── lib/
│   └── notion.js              # Notion API integration
├── .env.local.example         # ตัวอย่าง environment variables
├── .gitignore
├── jsconfig.json
├── next.config.js
├── package.json
├── postcss.config.js
├── tailwind.config.js
└── README.md
```

---

## 🔧 รันบนเครื่องตัวเอง (Development)

```bash
# 1. Clone โปรเจกต์
git clone https://github.com/YOUR_USERNAME/allanima-universe.git
cd allanima-universe

# 2. ติดตั้ง dependencies
npm install

# 3. สร้างไฟล์ .env.local
cp .env.local.example .env.local
# แก้ไขใส่ NOTION_TOKEN จริง

# 4. รัน dev server
npm run dev

# 5. เปิด http://localhost:3000
```

---

## 📝 การแก้ไขข้อมูล

1. เปิด Notion → แก้ข้อมูลใน Master Database
2. รอ ~60 วินาที หรือกดปุ่ม ↻ บนเว็บ
3. เว็บอัปเดตอัตโนมัติ!

**เพิ่ม Being ใหม่:** เพิ่ม row ใน Beings & Entities view → ใส่ข้อมูล → เว็บแสดงทันที  
**เพิ่ม Layer:** เพิ่มใน Layers & Realms view  
**เพิ่ม ERA:** เพิ่มใน ERAs & Timeline view

---

## 🎨 Customization

- **เปลี่ยนสี:** แก้ใน `tailwind.config.js` → `colors.cosmos`
- **เปลี่ยนฟอนต์:** แก้ใน `tailwind.config.js` → `fontFamily`
- **เพิ่มหน้า:** เพิ่ม component ใน `app/page.js` → เพิ่มใน `NAV` array
- **เปลี่ยน cache:** แก้ `revalidate` ใน `app/api/notion/route.js`

---

Built for the ALLANIMA Multiverse 🌌
