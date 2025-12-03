# dnc-simulator  
### DNC Simulator — A full-featured Dragon Nest character simulator that allows players to build characters, allocate skill points, customize equipment, apply item stats, and calculate final damage output. Built with React, Vite, and TailwindCSS.

---

# DNC-Simulator (React + Vite + TailwindCSS + TypeScript)

โปรเจกต์นี้เป็น Static Web App สำหรับระบบจำลองตัวละคร Dragon Nest  
สร้างด้วย React + Vite + TypeScript + TailwindCSS  
รองรับการ deploy อัตโนมัติไปยัง GitHub Pages ผ่าน GitHub Actions เมื่อ push code เข้า `main`

---

# 📦 Requirements

- Node.js **20.19+** หรือ **22.12+**
- npm **10+**
- Git (สำหรับ push ขึ้น GitHub)

เช็คเวอร์ชัน:

```bash
node -v
npm -v
```

---

# 🚀 1. Create Project with Vite

ไปที่โฟลเดอร์ที่ต้องการเก็บโปรเจกต์:

```bash
cd "E:\Web Project\Git"
```

แล้วรัน:

```bash
npm create vite@latest dnc-simulator -- --template react-ts
```

หลังรันคำสั่งนี้ Vite จะมี interactive setup ให้เลือกดังนี้:

---

## ✅ Step 1 — Select a framework

```
Select a framework:
> React
  Vue
  Svelte
  Solid
  ...
```

✔️ เลือก **React**

---

## ✅ Step 2 — Select a variant

```
Select a variant:
> TypeScript
  JavaScript
  TypeScript + SWC
  JavaScript + SWC
```

✔️ เลือก **TypeScript**

หากต้องการ build เร็วกว่านี้ เลือก **TypeScript + SWC** ได้  
แต่สำหรับโปรเจกต์นี้ TypeScript ปกติแนะนำที่สุด

---

## จากนั้นเข้าโปรเจกต์และติดตั้ง dependencies

```bash
cd dnc-simulator
npm install
npm run dev
```

หากเห็นข้อความ:

```
VITE v7.x.x  ready in ...
Local: http://localhost:5173/
```

แปลว่าโปรเจกต์สร้างเสร็จเรียบร้อย 🎉

เปิดใน browser:

```
http://localhost:5173/
```

---

# 🎨 2. Install & Configure TailwindCSS

ติดตั้ง Tailwind:

```bash
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

จะได้ไฟล์:

- `tailwind.config.cjs`
- `postcss.config.cjs`

## ตั้งค่า tailwind.config.cjs

```js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

## ตั้งค่า src/index.css

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

---

# ⚙️ 3. Configure Vite for GitHub Pages

เปิด `vite.config.ts` และแก้:

```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/dnc-simulator/', // IMPORTANT for GitHub Pages
})
```

---

# 🌐 4. Setup Git Repository & Push to GitHub

```bash
git init
git add .
git commit -m "init: dnc-simulator with react + vite + ts"
git remote add origin https://github.com/<USERNAME>/dnc-simulator.git
git branch -M main
git push -u origin main
```

---

# 🤖 5. GitHub Actions Auto Deployment

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

# 🌐 6. Enable GitHub Pages

ไปที่:

**GitHub → Repository → Settings → Pages → Build & Deployment → Source → GitHub Actions**

หลังเปิดใช้งานแล้ว GitHub Pages จะรอให้ workflow deploy ครั้งแรก

---

# 🚀 7. Auto-Deploy เมื่อ push code

ทุกครั้งที่คุณ push:

```bash
git add .
git commit -m "feat: update UI"
git push
```

GitHub Actions จะ build + deploy ลง Pages อัตโนมัติ  
พร้อมใช้งานที่:

```
https://<USERNAME>.github.io/dnc-simulator/
```

---

# 🧪 8. Test Production Build Locally

```bash
npm run build
npm run preview
```

---

# 📚 Development Commands

| Command | Description |
|--------|-------------|
| npm run dev | Run development server |
| npm run build | Build for production |
| npm run preview | Preview production build |
| npm install | Install dependencies |

---

README พร้อมใช้งานจริง 100% 🎉
