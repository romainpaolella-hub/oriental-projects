/**
 * Pré-remplit les documents « Pages programme (textes) » à partir du contenu
 * actuel des sous-pages du site. À lancer après `npx sanity login` :
 *
 *   cd studio && npm run import:pages
 *
 * Idempotent (createOrReplace). Migration progressive : pour l'instant « La Résidence ».
 */
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import {createClient} from '@sanity/client'

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

const S = (fr, en) => ({_type: 'localeString', fr, en})
const T = (fr, en) => ({_type: 'localeText', fr, en})
const row = (lf, le, vf, ve) => ({_type: 'object', _key: k(), label: S(lf, le), value: S(vf, ve)})
let _n = 0
const k = () => 'k' + (++_n).toString(36) + Date.now().toString(36)
const grp = (tf, te, rows) => ({_type: 'specGroup', _key: k(), title: S(tf, te), rows})

const DOCS = [
  {
    _id: 'programmePage-sea-view',
    _type: 'programmePage',
    title: 'Villa Sea View',
    programmeSlug: 'sea-view',
    res_eyebrow: S("L'esprit du lieu", 'The spirit of the place'),
    res_heading: T(
      'Une palmeraie privée, quatre villas, bercées par le calme du paysage tropical',
      'A private coconut grove, four villas, cradled by the calm of the tropical landscape',
    ),
    res_paragraphs: [
      T(
        "Le terrain descend doucement vers la mer entre cocotiers et rochers. Les quatre villas y sont implantées en décalé : chacune conserve son intimité, son jardin et son propre dégagement sur l'horizon.",
        'The land slopes gently down to the sea between coconut palms and rocks. The four villas are set in a staggered layout: each keeps its privacy, its garden and its own open view of the horizon.',
      ),
      T(
        "Une allée privée dessert l'ensemble. Murs de clôture, portail, éclairage paysager et plantations tropicales sont livrés avec le programme.",
        'A private lane serves the whole site. Boundary walls, gate, landscape lighting and tropical planting are delivered with the project.',
      ),
    ],
    res_caption: T(
      'Une résidence privée nichée dans une palmeraie tropicale, face à la mer de Koh Samui.',
      'A private residence nestled in a tropical coconut grove, facing the sea of Koh Samui.',
    ),
    res_cta: T('Recevez le dossier complet de la résidence', 'Receive the full dossier for the residence'),
  },
  {
    _id: 'programmePage-eden-tropical',
    _type: 'programmePage',
    title: 'Eden Tropical',
    programmeSlug: 'eden-tropical',
    res_eyebrow: S('Zen living & esprit balinais', 'Zen living & Balinese spirit'),
    res_heading: T('Où le luxe rencontre la sérénité', 'Where luxury meets serenity'),
    res_paragraphs: [
      T(
        "Dans un environnement ultra-protégé, la résidence a été pensée avec un esprit balinais : palette neutre de beige chaud et matériaux naturels. Les espaces de vie ouverts font dialoguer intérieur et extérieur, pour une atmosphère apaisante, tournée vers la nature et la tranquillité.",
        'In a highly protected setting, the residence was designed with a Balinese spirit: a neutral palette of warm beige and natural materials. The open living spaces bring inside and outside into dialogue, for a calming atmosphere turned toward nature and tranquillity.',
      ),
      T(
        "Chaque villa dispose de sa propre piscine et de son jardin privatif. Le style architectural, aux toitures traditionnelles et aux larges ouvertures, crée une continuité naturelle entre les pièces de vie et l'extérieur — une manière de vivre au rythme de l'île.",
        'Each villa has its own pool and private garden. The architectural style, with traditional roofs and wide openings, creates a natural continuity between the living rooms and the outside — a way of living to the rhythm of the island.',
      ),
    ],
    res_specsIntro: {
      _type: 'object',
      eyebrow: S('Livrée clé en main', 'Turnkey delivery'),
      heading: T('Entièrement meublée et équipée', 'Fully furnished and equipped'),
    },
    res_specs: [
      grp('Intérieur', 'Interior', [
        row('Chambre', 'Bedroom', 'Lit en béton sur-mesure, chevets intégrés', 'Bespoke concrete bed, built-in bedside tables'),
        row('Literie', 'Bedding', 'Matelas premium inclus', 'Premium mattress included'),
        row('Rangements', 'Storage', 'Dressing et penderies en béton intégrés', 'Built-in concrete wardrobe and closets'),
        row('Cuisine équipée', 'Fitted kitchen', 'Four, plaque céramique, hotte, réfrigérateur, micro-ondes', 'Oven, ceramic hob, extractor, fridge, microwave'),
        row('Séjour', 'Living room', 'Canapé en béton sur-mesure + coussins, télévision', 'Bespoke concrete sofa + cushions, television'),
        row('Salle à manger', 'Dining room', 'Table et 4 chaises', 'Table and 4 chairs'),
      ]),
      grp('Extérieur & confort', 'Exterior & comfort', [
        row('Piscine privée', 'Private pool', '1BR 2,5 × 5 m · 2BR 2,5 × 6 m', '1BR 2.5 × 5 m · 2BR 2.5 × 6 m'),
        row('Terrasse', 'Terrace', '2 bains de soleil au bord du bassin', '2 sun loungers at the poolside'),
        row('Climatisation', 'Air conditioning', 'Toutes les pièces', 'All rooms'),
        row('Eau souterraine', 'Groundwater', 'Forage privé', 'Private borehole'),
        row('Électricité', 'Electricity', 'Compteur officiel gouvernemental', 'Official government meter'),
        row('Option décoration', 'Decor option', 'Pack accessoires et art de la table sur devis', 'Accessories and tableware pack on quotation'),
      ]),
    ],
    res_cta: T('Recevez le dossier complet de la résidence', 'Receive the full dossier for the residence'),
  },
  {
    _id: 'programmePage-terra-mare',
    _type: 'programmePage',
    title: 'Terra Mare',
    programmeSlug: 'terra-mare',
    res_eyebrow: S('Architecture contemporaine', 'Contemporary architecture'),
    res_heading: T('Vivre entre pierre, bois et piscine', 'Living among stone, timber and pool'),
    res_paragraphs: [
      T(
        "Les 12 villas de Terra Mare partagent une même écriture architecturale : toitures basses à larges débords, grandes baies coulissantes et matériaux naturels — bois, pierre et enduits clairs. Chaque plan de villa fait dialoguer le séjour intérieur avec la terrasse et la piscine, pour une vie résolument tournée vers l'extérieur.",
        'The 12 Terra Mare villas share a single architectural language: low roofs with wide eaves, large sliding bays and natural materials — timber, stone and pale renders. Each villa plan brings the indoor living room into dialogue with the terrace and the pool, for a life firmly turned outward.',
      ),
      T(
        "Chaque villa dispose de sa propre piscine, d'un jardin paysager et d'une place de parking privée. Une pergola abrite un espace cuisine extérieur et un salon de jardin, prolongement naturel de la vie intérieure.",
        'Each villa has its own pool, a landscaped garden and a private parking space. A pergola shelters an outdoor kitchen area and a garden lounge, a natural extension of indoor life.',
      ),
    ],
    res_specsIntro: {
      _type: 'object',
      eyebrow: S('Un plan par villa', 'One plan per villa'),
      heading: T('12 villas, 2 typologies', '12 villas, 2 layouts'),
    },
    res_specs: [
      grp('Composition de la résidence', 'Make-up of the residence', [
        row('Total villas', 'Total villas', '12 unités individuelles', '12 individual units'),
        row('Villas 3 chambres', '3-bedroom villas', '8 unités', '8 units'),
        row('Villas 2 chambres', '2-bedroom villas', '4 unités', '4 units'),
        row('Surface des parcelles', 'Plot area', '300 à 400 m² selon la villa', '300 to 400 m² depending on the villa'),
        row('Surface totale du programme', 'Total project area', '4 460 m²', '4,460 m²'),
      ]),
      grp('Prestations communes à chaque villa', 'Features common to every villa', [
        row('Piscine privée', 'Private pool', 'Non partagée, propre à chaque parcelle', 'Not shared, one per plot'),
        row('Cuisine extérieure', 'Outdoor kitchen', 'Espace couvert sous pergola', 'Covered area under a pergola'),
        row('Stationnement', 'Parking', 'Place privée sur la parcelle', 'Private space on the plot'),
        row('Jardin', 'Garden', "Paysager, clos par un mur d'enceinte", 'Landscaped, enclosed by a boundary wall'),
      ]),
    ],
    res_specsNote: T(
      "Vues d'artiste. Aménagement intérieur et mobilier livrés à confirmer avec le dossier contractuel du promoteur.",
      "Artist's impressions. Interior fit-out and furniture delivered to be confirmed with the developer's contract pack.",
    ),
    res_cta: T('Recevez le dossier complet de la résidence', 'Receive the full dossier for the residence'),
  },
]

const tx = DOCS.reduce((t, d) => t.createOrReplace(d), client.transaction())
tx.commit()
  .then(() => console.log(`✓ ${DOCS.length} documents « Pages programme » importés (section Résidence).`))
  .catch((e) => {
    console.error('✗', e.message)
    process.exit(1)
  })
