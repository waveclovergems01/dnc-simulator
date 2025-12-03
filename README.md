# dnc-simulator  
### DNC Simulator — A full-featured Dragon Nest character simulator that allows players to build characters, allocate skill points, customize equipment, apply item stats, and calculate final damage output. Built with React, Vite, and TailwindCSS v4.

---

# DNC-Simulator (React + Vite + TailwindCSS v4 + TypeScript)

โปรเจกต์นี้เป็น Static Web App สำหรับระบบจำลองตัวละคร Dragon Nest  
สร้างด้วย React + Vite + TypeScript + TailwindCSS v4  
รองรับ GitHub Pages + Auto Deploy ผ่าน GitHub Actions

---

# 📦 Requirements

- Node.js **20.19+** หรือ **22.12+**
- npm **10+**
- GitHub account + repo ชื่อ `dnc-simulator`

ตรวจสอบเวอร์ชัน:

```bash
node -v
npm -v
```

---

# 🚀 1. Create Project using Vite

ไปที่โฟลเดอร์งาน:

```bash
cd "E:\Web Project\Git"
```

สร้างโปรเจกต์:

```bash
npm create vite@latest dnc-simulator -- --template react-ts
```

ระหว่างสร้างโปรเจกต์ เลือก:

```
Select a framework:  React
Select a variant:    TypeScript
```

เข้าโปรเจกต์และติดตั้ง dependency:

```bash
cd dnc-simulator
npm install
npm run dev
```

เปิดเว็บทดสอบได้ที่:

```
http://localhost:5173/
```

---

# 🎨 2. Install & Configure TailwindCSS v4

ติดตั้ง TailwindCSS + Vite plugin (วิธีใหม่ล่าสุด):

```bash
npm install tailwindcss @tailwindcss/vite
```

---

# ⚙️ 3. Configure Vite to use Tailwind v4

เปิดไฟล์ `vite.config.ts` และแก้ให้เป็น:

```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  base: '/dnc-simulator/', // required for GitHub Pages
})
```

---

# 🖌 4. Setup TailwindCSS entry file

เปิดไฟล์:

```
src/index.css
```

ลบทั้งหมด แล้วใส่เพียงบรรทัดนี้เท่านั้น:

```css
@import "tailwindcss";
```

TailwindCSS v4 ไม่ต้องมี:

- @tailwind base;
- @tailwind components;
- @tailwind utilities;
- tailwind.config.js
- postcss.config.js

ระบบจะ auto-config ให้หมด

---

# ▶ 5. Test TailwindCSS

เปิด `App.tsx` และแก้เป็น:

```tsx
export default function App() {
  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center">
      <h1 className="text-4xl font-bold text-emerald-300">
        TailwindCSS v4 Ready 🎉
      </h1>
    </div>
  );
}
```

รัน:

```bash
npm run dev
```

ถ้าเห็นพื้นหลังเข้ม + ตัวเขียว = Tailwind ทำงานสำเร็จ

---

# 🌐 6. Setup Git & GitHub Repo

```bash
git init
git add .
git commit -m "init: dnc-simulator with react+vite+tailwind"
git remote add origin https://github.com/<USERNAME>/dnc-simulator.git
git branch -M main
git push -u origin main
```

---

# 🤖 7. Setup GitHub Actions for Auto Deploy

สร้างไฟล์:

```
.github/workflows/deploy.yml
```

ใส่เนื้อหา:

```yaml
name: Deploy Vite React to GitHub Pages

on:
  push:
    branches: [ main ]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: true

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '22'
          cache: 'npm'

      - name: Install dependencies
        run: npm install

      - name: Build
        run: npm run build

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: dist

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

---

# 🌍 8. Enable GitHub Pages

ไปที่ repo บน GitHub:

**Settings → Pages → Build & deployment → Source → GitHub Actions**

---

# 🚀 9. Auto Deploy (หลัง push)

ต่อไปนี้ ทุกครั้งที่ push ไปที่ `main`:

```bash
git add .
git commit -m "update simulator ui"
git push
```

GitHub Actions จะ auto-build และ auto-deploy  
เข้าเว็บได้ที่:

```
https://<USERNAME>.github.io/dnc-simulator/
```

---

# 🧪 10. Build for Production (local test)

```bash
npm run build
npm run preview
```

---

# 🧰 Development Commands

| Command        | Description |
|----------------|-------------|
| npm run dev    | Start dev server |
| npm run build  | Build production |
| npm run preview| Preview built output |
| npm install    | Install dependencies |

---

TailwindCSS v4 + Vite + React พร้อมสำหรับสร้างระบบ DNC Simulator เต็มรูปแบบแล้ว! 🎮
