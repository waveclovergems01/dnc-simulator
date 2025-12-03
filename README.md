# dnc-simulator  
### DNC Simulator — A full-featured Dragon Nest character simulator that allows players to build characters, allocate skill points, customize equipment, apply item stats, and calculate final damage output. Built with React, Vite, and TailwindCSS v4.

---

# DNC-Simulator  
React + Vite + TypeScript + TailwindCSS v4  
พร้อมระบบ Auto Deploy ไป GitHub Pages ด้วย GitHub Actions

---

# 📦 Requirements

- Node.js **20.19+** หรือ **22.12+**
- npm **10+**
- GitHub repository (ชื่อ: `dnc-simulator`)

ตรวจสอบเวอร์ชัน:

```bash
node -v
npm -v
```

---

# 🚀 1. Create Project with Vite

ไปที่โฟลเดอร์งาน:

```bash
cd "E:\Web Project\Git"
```

สร้างโปรเจกต์ด้วย Vite:

```bash
npm create vite@latest dnc-simulator -- --template react-ts
```

เลือก:

```
Framework: React
Variant:   TypeScript
```

เข้าโปรเจกต์และติดตั้ง dependencies:

```bash
cd dnc-simulator
npm install
npm run dev
```

รันที่:

```
http://localhost:5173/
```

---

# 🎨 2. Install TailwindCSS v4 (แบบใหม่)

ติดตั้ง TailwindCSS + Vite plugin:

```bash
npm install tailwindcss @tailwindcss/vite
```

---

# ⚙️ 3. Configure Vite to Use Tailwind v4

เปิดไฟล์ `vite.config.ts` แล้วแก้เป็น:

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

# 🖌 4. Configure Tailwind Entry File

เปิดไฟล์:

```
src/index.css
```

ลบทั้งหมด แล้วใส่:

```css
@import "tailwindcss";
```

> TailwindCSS v4 ไม่ต้องมีไฟล์ tailwind.config.js  
> ไม่ต้องมี postcss.config.js  
> ไม่ต้องใช้ @tailwind base/components/utilities  

---

# ▶ 5. Test TailwindCSS

เปิดไฟล์ `src/App.tsx` และแก้เป็น:

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

ถ้าพื้นหลังสี Slate-900 และตัวหนังสือสี Emerald-300 = Tailwind ทำงานแล้ว ✔

---

# 🌐 6. Setup Git & Push to GitHub

```bash
git init
git add .
git commit -m "init: dnc-simulator with react+vite+tailwind"
git remote add origin https://github.com/<USERNAME>/dnc-simulator.git
git branch -M main
git push -u origin main
```

---

# 🤖 7. GitHub Actions Auto Deploy (Deploy to GitHub Pages)

สร้างไฟล์:

```
.github/workflows/deploy.yml
```

ใส่เนื้อหานี้:

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

Commit และ push:

```bash
git add .
git commit -m "add deploy workflow"
git push
```

GitHub Actions จะรันอัตโนมัติ:

- build  
- generate artifact  
- deploy ไป GitHub Pages  

---

# 🌍 8. Enable GitHub Pages

ไปที่:

**GitHub → Repository → Settings → Pages → Build & Deployment → Source → GitHub Actions**

หลังจากนี้ ทุกครั้งที่ push → deploy อัตโนมัติ

---

# 🚀 9. Access the live site

```text
https://<USERNAME>.github.io/dnc-simulator/
```

---

# 🧰 Development Commands

| Command        | Description |
|----------------|-------------|
| npm run dev    | Start dev server |
| npm run build  | Build for production |
| npm run preview| Preview production |
| npm install    | Install dependencies |

---

TailwindCSS v4 + Vite + React อัปและ deploy พร้อมใช้งานแล้ว 🎉  
Enjoy your Dragon Nest Simulator Project!
