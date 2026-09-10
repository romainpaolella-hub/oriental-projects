/**
 * Re-téléverse les PDF de brochure de public/brochures/ et met à jour les
 * champs brochureFr / brochureEn des documents concernés.
 *
 *   cd studio && npm run sync:brochures
 *
 * Idempotent. Le site sert les brochures en statique (public/brochures/) ;
 * ces champs Sanity sont là pour un futur branchement du téléchargement sur le CMS.
 */
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import {fileURLToPath} from 'node:url'
import {createClient} from '@sanity/client'

const HERE = path.dirname(fileURLToPath(import.meta.url))
const PUBLIC = path.resolve(HERE, '../../public')
const PROJECT_ID = process.env.SANITY_STUDIO_PROJECT_ID || 'x3jcttot'

function resolveToken() {
  if (process.env.SANITY_AUTH_TOKEN) return process.env.SANITY_AUTH_TOKEN
  for (const p of [
    path.join(os.homedir(), '.config', 'sanity', 'config.json'),
    path.join(process.env.APPDATA || '', 'sanity', 'config.json'),
  ]) {
    try {
      const t = JSON.parse(fs.readFileSync(p, 'utf8')).authToken
      if (t) return t
    } catch {}
  }
  return null
}
const token = resolveToken()
if (!token) {
  console.error('\n✗ Aucun jeton. Lance `npx sanity login` (ou définis SANITY_AUTH_TOKEN).\n')
  process.exit(1)
}
const client = createClient({projectId: PROJECT_ID, dataset: 'production', apiVersion: '2024-01-01', token, useCdn: false})

// _id du document  ->  base du nom de fichier dans public/brochures/
const MAP = {
  'programme-sea-view': 'villa-sea-view',
  'programme-eden-tropical': 'eden-tropical',
  'programme-terra-mare': 'terra-mare',
  'villa-0': 'tropical-golf-villa-2', // Tropical Golf — Villa 2 (villaDispo)
}

async function uploadPdf(rel) {
  const abs = path.join(PUBLIC, rel)
  if (!fs.existsSync(abs)) { console.warn('  ! introuvable :', rel); return null }
  const asset = await client.assets.upload('file', fs.createReadStream(abs), {filename: path.basename(abs)})
  return {_type: 'file', asset: {_type: 'reference', _ref: asset._id}}
}

async function run() {
  for (const [id, base] of Object.entries(MAP)) {
    const fr = await uploadPdf(`brochures/${base}-fr.pdf`)
    const en = await uploadPdf(`brochures/${base}-en.pdf`)
    const set = {}
    if (fr) set.brochureFr = fr
    if (en) set.brochureEn = en
    if (!Object.keys(set).length) { console.log('—', id, ': aucun PDF'); continue }
    await client.patch(id).set(set).commit({autoGenerateArrayKeys: true})
    console.log('✓', id, '←', base + '-{fr,en}.pdf')
  }
}
run().then(() => console.log('\nBrochures synchronisées.')).catch((e) => { console.error('✗', e.message); process.exit(1) })
