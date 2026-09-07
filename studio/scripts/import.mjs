/**
 * Pré-remplit le CMS Sanity à partir du contenu actuel du site (public/).
 * Téléverse les images / vidéos / PDF et crée les documents.
 *
 * À lancer UNE FOIS, après avoir créé le projet Sanity :
 *
 *   cd studio
 *   npm install
 *   npx sanity login
 *   npx sanity exec scripts/import.mjs --with-user-token
 *
 * Idempotent : relançable (createOrReplace). Ré-téléverse les assets à chaque fois.
 */
import fs from 'node:fs'
import path from 'node:path'
import vm from 'node:vm'
import {fileURLToPath} from 'node:url'
import {getCliClient} from 'sanity/cli'

const HERE = path.dirname(fileURLToPath(import.meta.url))
const PUBLIC = path.resolve(HERE, '../../public')

// Auth : soit `sanity exec ... --with-user-token`, soit la variable
// d'environnement SANITY_AUTH_TOKEN (jeton Editor).
let client = getCliClient({apiVersion: '2024-01-01'})
if (process.env.SANITY_AUTH_TOKEN) {
  client = client.withConfig({token: process.env.SANITY_AUTH_TOKEN})
}

// ---------- lecture du contenu actuel ----------
const sandbox = {window: {}}
vm.createContext(sandbox)
vm.runInContext(fs.readFileSync(path.join(PUBLIC, 'js/projects.js'), 'utf8'), sandbox)
const {HERO = [], PROJECTS = [], DISPOS = [], STATS = [], REALISATIONS_VILLAS = []} = sandbox.window

const L = (fr, en) => (fr == null ? undefined : {_type: 'localeString', fr, en: en || undefined})
const LT = (fr, en) => (fr == null ? undefined : {_type: 'localeText', fr, en: en || undefined})

function extractObjectLiteral(src, varName) {
  const start = src.indexOf(`window.${varName}`)
  if (start === -1) return null
  const braceStart = src.indexOf('{', start)
  if (braceStart === -1) return null
  let depth = 0
  for (let i = braceStart; i < src.length; i++) {
    if (src[i] === '{') depth++
    else if (src[i] === '}') {
      depth--
      if (depth === 0) {
        try {
          return vm.runInNewContext('(' + src.slice(braceStart, i + 1) + ')')
        } catch {
          return null
        }
      }
    }
  }
  return null
}

// ---------- téléversement d'assets (avec cache) ----------
const assetCache = new Map()
async function upload(kind, publicRelPath) {
  if (!publicRelPath) return undefined
  const clean = String(publicRelPath).replace(/^\.?\//, '').replace(/^\.\.\//, '')
  if (assetCache.has(kind + clean)) return assetCache.get(kind + clean)
  const abs = path.join(PUBLIC, clean)
  if (!fs.existsSync(abs)) {
    console.warn('  ! introuvable, ignoré :', clean)
    return undefined
  }
  process.stdout.write(`  ↑ ${clean}\n`)
  const asset = await client.assets.upload(kind === 'file' ? 'file' : 'image', fs.createReadStream(abs), {
    filename: path.basename(abs),
  })
  const ref = {_type: kind === 'file' ? 'file' : 'image', asset: {_type: 'reference', _ref: asset._id}}
  assetCache.set(kind + clean, ref)
  return ref
}
const img = (p) => upload('image', p)
const file = (p) => upload('file', p)

// ---------- construction + écriture ----------
const created = []
async function put(doc) {
  await client.createOrReplace(doc)
  created.push(`${doc._type}/${doc._id}`)
}

async function run() {
  // ===== Réglages du site =====
  await put({
    _id: 'siteSettings',
    _type: 'siteSettings',
    stats: STATS.map((s, i) => ({_key: `stat${i}`, value: s.n, label: L(s.l)})),
    phones: [
      {_key: 'p1', label: 'Jean-David', number: '+66 655 767 871', whatsapp: '66655767871'},
      {_key: 'p2', label: 'Équipe EU', number: '+66 981 905 157', whatsapp: '66981905157'},
    ],
    email: 'contact@orientalprojects.co',
  })

  // ===== Carrousel d'accueil =====
  for (let i = 0; i < HERO.length; i++) {
    const s = HERO[i]
    await put({
      _id: `hero-${i}`,
      _type: 'heroSlide',
      order: (i + 1) * 10,
      brand: !!s.brand,
      kind: s.type === 'video' ? 'video' : 'image',
      video: s.type === 'video' ? await file(s.src) : undefined,
      poster: s.poster ? await img(s.poster) : undefined,
      image: s.type === 'image' ? await img(s.img) : undefined,
      kicker: L(s.kicker),
      title: s.title || undefined,
      sub: L(s.sub),
      cta: L(s.cta),
      linkHref: s.href,
    })
  }

  // ===== Programmes =====
  const SLUG_BY_HREF = {
    'sea-view/index.html': 'sea-view',
    'eden-tropical/index.html': 'eden-tropical',
    'terra-mare/index.html': 'terra-mare',
  }
  const BROCHURE_BASE = {'sea-view': 'villa-sea-view', 'eden-tropical': 'eden-tropical', 'terra-mare': 'terra-mare'}
  for (let i = 0; i < PROJECTS.length; i++) {
    const p = PROJECTS[i]
    const slug = SLUG_BY_HREF[p.href] || p.href.split('/')[0]
    const heroSlide = HERO.find((h) => h.href === p.href)

    let sim
    const investPath = path.join(PUBLIC, slug, 'investissement.html')
    if (fs.existsSync(investPath)) {
      const od = extractObjectLiteral(fs.readFileSync(investPath, 'utf8'), 'OD_SIM')
      if (od) {
        sim = {
          types: (od.types || []).map((t, k) => ({_key: `t${k}`, name: L(t.name), price: t.price, rent: t.rent})),
          costs: od.costs ?? 35,
        }
      }
    }

    const galDir = path.join(PUBLIC, 'images', slug)
    const gallery = []
    if (fs.existsSync(galDir)) {
      const files = fs.readdirSync(galDir).filter((f) => /\.(jpe?g|png|webp)$/i.test(f)).sort()
      for (let k = 0; k < files.length; k++) {
        const ref = await img(`images/${slug}/${files[k]}`)
        if (ref) gallery.push({_key: `g${k}`, ...ref})
      }
    }

    const bb = BROCHURE_BASE[slug]
    await put({
      _id: `programme-${slug}`,
      _type: 'programme',
      name: p.name,
      slug: {_type: 'slug', current: slug},
      zone: p.zone,
      order: (i + 1) * 10,
      status: p.status === 'livre' ? 'livre' : 'plan',
      statusLabel: L(p.statusLabel),
      pitch: LT(p.pitch),
      facts: (p.facts || []).map((f) => L(f)),
      cardImage: await img(p.img),
      heroVideo: heroSlide ? await file(heroSlide.src) : undefined,
      heroPoster: heroSlide ? await img(heroSlide.poster) : undefined,
      gallery,
      sim,
      brochureFr: bb ? await file(`brochures/${bb}-fr.pdf`) : undefined,
      brochureEn: bb ? await file(`brochures/${bb}-en.pdf`) : undefined,
    })
  }

  // ===== Villas à vendre =====
  for (let i = 0; i < DISPOS.length; i++) {
    const v = DISPOS[i]
    if (v.placeholder) {
      await put({_id: `villa-${i}`, _type: 'villaDispo', name: v.name, order: (i + 1) * 10, isPlaceholder: true, note: L(v.note)})
      continue
    }
    const dir = path.join(PUBLIC, 'images', 'tropical-golf-v2')
    const images = []
    if (fs.existsSync(dir)) {
      const files = fs.readdirSync(dir).filter((f) => /\.(jpe?g|png|webp)$/i.test(f)).sort()
      for (let k = 0; k < files.length; k++) {
        const ref = await img(`images/tropical-golf-v2/${files[k]}`)
        if (ref) images.push({_key: `i${k}`, ...ref})
      }
    }
    await put({
      _id: `villa-${i}`,
      _type: 'villaDispo',
      name: v.name,
      order: (i + 1) * 10,
      isPlaceholder: false,
      images,
      specs: (v.specs || []).map((s) => L(s)),
      statusLabel: L(v.statusLabel),
      price: v.price,
      rentMonthly: v.rentMonthly,
      linkHref: v.href,
    })
  }

  // ===== Réalisations =====
  for (let i = 0; i < REALISATIONS_VILLAS.length; i++) {
    const r = REALISATIONS_VILLAS[i]
    const gallery = []
    const pagePath = path.join(PUBLIC, 'realisations', `${r.slug}.html`)
    if (fs.existsSync(pagePath)) {
      const od = extractObjectLiteral(fs.readFileSync(pagePath, 'utf8'), 'OD_RGAL')
      if (od) {
        const base = (od.base || '').replace(/^\.\.\//, '')
        let urls = []
        if (od.files) urls = od.files.map((f) => base + (od.folder || '') + f)
        else if (od.count && od.slug) {
          for (let n = 1; n <= od.count; n++) urls.push(`${base}images/realisations/${od.slug}/${String(n).padStart(2, '0')}.jpg`)
        }
        for (let k = 0; k < urls.length; k++) {
          const ref = await img(urls[k].replace(/^\.\.\//, ''))
          if (ref) gallery.push({_key: `g${k}`, ...ref})
        }
      }
    }
    await put({
      _id: `realisation-${r.slug}`,
      _type: 'realisation',
      name: r.name,
      slug: {_type: 'slug', current: r.slug},
      order: (i + 1) * 10,
      zone: L(r.zone),
      tag: L(r.tag),
      blurb: LT(r.blurb),
      cover: await img(r.cover),
      gallery,
      linkHref: r.href,
    })
  }

  console.log(`\n✓ ${created.length} documents créés / remplacés`)
  console.log(`  ${assetCache.size} assets téléversés`)
}

run().catch((e) => {
  console.error('\n✗ Échec :', e.message)
  process.exit(1)
})
