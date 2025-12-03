# dnc-simulator  
### DNC Simulator — A full-featured Dragon Nest character simulator that allows players to build characters, allocate skill points, customize equipment, apply item stats, and calculate final damage output. Built with React, Vite, and TailwindCSS.

---

# DNC-Simulator (React + Vite + TailwindCSS + TypeScript)

โปรเจกต์นี้เป็น Static Web App สำหรับระบบจำลองตัวละคร Dragon Nest  
สร้างด้วย React + Vite + TypeScript + TailwindCSS  
รองรับการ deploy อัตโนมัติไปยัง GitHub Pages ผ่าน GitHub Actions เมื่อ push code เข้า `main`

---

## 🚀 Features

- React + TypeScript
- Vite (รวดเร็วมาก)
- TailwindCSS
- Auto Deploy ด้วย GitHub Actions
- Static hosting on GitHub Pages
- เหมาะสำหรับระบบ Simulator เช่น build stats, damage, equipment

---

# 1️⃣ Create Project — React + Vite + TypeScript

```bash
npm create vite@latest dnc-simulator -- --template react-ts
cd dnc-simulator
npm install
```

Run dev:

```bash
npm run dev
```

---

# 2️⃣ Install TailwindCSS

```bash
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

## tailwind.config.cjs

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

## src/index.css

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

---

# 3️⃣ Configure Vite for GitHub Pages

แก้ไฟล์ `vite.config.ts`:

```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/dnc-simulator/', // IMPORTANT for GitHub Pages
})
```

---

# 4️⃣ Git Setup

```bash
git init
git add .
git commit -m "chore: initial project setup"
```

เชื่อมกับ GitHub repo:

```bash
git remote add origin https://github.com/<USERNAME>/dnc-simulator.git
git branch -M main
git push -u origin main
```

---

# 5️⃣ GitHub Actions — Auto Deploy to GitHub Pages

สร้างโฟลเดอร์:

```
.github/workflows/deploy.yml
```

เพิ่มเนื้อหานี้:

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
          node-version: '20'
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

Commit workflow:

```bash
git add .
git commit -m "chore: add GitHub Pages deploy workflow"
git push
```

---

# 6️⃣ Enable GitHub Pages

ไปที่:

**GitHub → Settings → Pages → Build and Deployment → Source → GitHub Actions**

---

# 7️⃣ Auto-Deploy

ทุกครั้งที่ push:

```bash
git add .
git commit -m "feat: update UI"
git push
```

GitHub Actions จะ build + deploy อัตโนมัติ

เว็บจะขึ้นที่:

```
https://<USERNAME>.github.io/dnc-simulator/
```

---

# 8️⃣ Local Build Test

```bash
npm run build
npm run preview
```

---

# Development Commands

| Command | Description |
|--------|-------------|
| npm run dev | Run development server |
| npm run build | Build for production |
| npm run preview | Preview production |
| npm install | Install dependencies |

---

จบ README.md พร้อมใช้งาน 🎉
