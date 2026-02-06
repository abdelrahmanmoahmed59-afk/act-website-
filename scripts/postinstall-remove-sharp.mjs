import fs from 'node:fs'
import path from 'node:path'

function safeRm(targetPath) {
  try {
    fs.rmSync(targetPath, { recursive: true, force: true })
  } catch {
    // best-effort
  }
}

function main() {
  const root = process.cwd()
  const nodeModules = path.join(root, 'node_modules')
  if (!fs.existsSync(nodeModules)) return

  // Next.js lists `sharp` as an optional dependency. On some VPS CPUs the prebuilt
  // `sharp` binary cannot load (requires newer x86-64 microarchitecture) and
  // causes `next build` to fail. We don't rely on Next image optimization in this
  // project (see `next.config.mjs`), so we remove `sharp` to force Next's fallback.
  safeRm(path.join(nodeModules, 'sharp'))

  const imgDir = path.join(nodeModules, '@img')
  if (fs.existsSync(imgDir)) {
    for (const name of fs.readdirSync(imgDir)) {
      if (name.startsWith('sharp-') || name.startsWith('sharp-libvips-')) {
        safeRm(path.join(imgDir, name))
      }
    }
  }
}

main()

