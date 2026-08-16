/**
 * dsh-theme-machine zero-dependency build.
 *
 * Emits:
 *   lib/index.js  — host half (plain copy of src/index.js, ESM)
 *   lib/client.js — browser half: src/client.js wrapped in the dsh shell's
 *                   closure-factory handoff (window.__ModuleLoader__.load),
 *                   with src/skin.css inlined as __MACHINE_CSS__.
 *
 * Self-contained by design: `prepare` runs this on git installs, so it must
 * not assume anything beyond Node >= 18 (no tsdown, no network).
 */
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const src = join(root, 'src')
const lib = join(root, 'lib')

const ID = 'dsh-theme-machine'

const [hostHalf, clientBody, skinCss] = await Promise.all([
  readFile(join(src, 'index.js'), 'utf8'),
  readFile(join(src, 'client.js'), 'utf8'),
  readFile(join(src, 'skin.css'), 'utf8'),
])

await mkdir(lib, { recursive: true })

await writeFile(join(lib, 'index.js'), hostHalf)

const banner = `window.__ModuleLoader__.load({ id: ${JSON.stringify(ID)}, factory: (require) => {\n`
const intro = `'use strict';\nvar module = { exports: {} };\nvar exports = module.exports;\nconst __MACHINE_CSS__ = ${JSON.stringify(skinCss)};\n`
const footer = `\nreturn module.exports; } });\n`

await writeFile(join(lib, 'client.js'), banner + intro + clientBody + footer)

console.log('[dsh-theme-machine] built lib/index.js + lib/client.js')
