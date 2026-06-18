import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { execSync } from 'node:child_process'
import { readFileSync } from 'node:fs'

// Resolve the short commit hash: prefer CI env (GitHub Actions), fall back to git.
const resolveCommitHash = (): string => {
  const ciSha = process.env.GITHUB_SHA
  if (ciSha && ciSha.length >= 7) {
    return ciSha.slice(0, 7)
  }
  try {
    return execSync('git rev-parse --short HEAD', {
      stdio: ['ignore', 'pipe', 'ignore'],
    }).toString().trim()
  } catch {
    return 'dev'
  }
}

// Resolve a tag if the current commit is tagged, otherwise empty.
const resolveTag = (): string => {
  if (process.env.GITHUB_REF_TYPE === 'tag' && process.env.GITHUB_REF_NAME) {
    return process.env.GITHUB_REF_NAME
  }
  try {
    return execSync('git describe --tags --exact-match', {
      stdio: ['ignore', 'pipe', 'ignore'],
    }).toString().trim()
  } catch {
    return ''
  }
}

const pkg = JSON.parse(readFileSync('./package.json', 'utf-8')) as { version?: string }
const buildDate = new Date().toISOString().slice(0, 10)

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  base: '/dnc-simulator/', // สำหรับ GitHub Pages
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version ?? '1.0.0'),
    __COMMIT_HASH__: JSON.stringify(resolveCommitHash()),
    __APP_TAG__: JSON.stringify(resolveTag()),
    __BUILD_DATE__: JSON.stringify(buildDate),
  },
})
