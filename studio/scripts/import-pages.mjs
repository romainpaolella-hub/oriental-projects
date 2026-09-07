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
const ni = (num, tf, te, bf, be) => ({_type: 'numItem', _key: k(), num, title: S(tf, te), body: T(bf, be)})
// carte : champs optionnels via un objet options {badge,subtitle,zone,desc,specs,priceNote,linkText}
const card = (tf, te, price, o = {}) => {
  const c = {_type: 'villaCard', _key: k(), title: S(tf, te)}
  c.price = Array.isArray(price) ? S(price[0], price[1]) : S(price, price)
  if (o.badge) c.badge = S(o.badge[0], o.badge[1])
  if (o.subtitle) c.subtitle = S(o.subtitle[0], o.subtitle[1])
  if (o.zone) c.zone = S(o.zone[0], o.zone[1])
  if (o.desc) c.desc = T(o.desc[0], o.desc[1])
  if (o.specs) c.specs = o.specs
  if (o.priceNote) c.priceNote = S(o.priceNote[0], o.priceNote[1])
  if (o.linkText) c.linkText = S(o.linkText[0], o.linkText[1])
  return c
}
const PN = ['Hors frais de transfert et taxes', 'Excluding transfer fees and taxes']
const LINK_VILLA = ['Voir la villa · plan & implantation →', 'View the villa · plan & layout →']
const LINK_PLOT = ['Voir la parcelle · plan →', 'View the plot · floor plan →']
const CTA_VISIT = T('Réservez une visite, sur place ou en visioconférence', 'Book a viewing, on site or by video call')

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

    vil_eyebrow: S('Disponibilités', 'Availability'),
    vil_heading: T('Quatre villas, une même signature', 'Four villas, one signature'),
    vil_body: T(
      'Chacune révèle pourtant un point de vue singulier sur la palmeraie et la mer.',
      'Yet each reveals a singular outlook onto the coconut grove and the sea.',
    ),
    vil_cards: [
      card('Le jardin', 'The garden', ['฿8 900 000', '฿8,900,000'], {
        badge: ['Disponible', 'Available'],
        subtitle: ['Parcelle 1 · 3 ch · 4 sdb', 'Plot 1 · 3 bed · 4 bath'],
        desc: [
          "Position basse, le jardin le plus généreux du programme et un accès direct depuis l'allée privée.",
          'Low position, the most generous garden in the project and direct access from the private lane.',
        ],
        linkText: LINK_PLOT,
      }),
      card('Plein soleil', 'Full sun', ['฿9 200 000', '฿9,200,000'], {
        badge: ['Disponible', 'Available'],
        subtitle: ['Parcelle 2 · 3 ch · 4 sdb', 'Plot 2 · 3 bed · 4 bath'],
        desc: [
          'Orientation plein soleil sur la piscine, avec un salon extérieur abrité toute la journée.',
          'Full-sun orientation over the pool, with an outdoor lounge shaded all day.',
        ],
        linkText: LINK_PLOT,
      }),
      card('Le surplomb', 'The overlook', ['฿9 500 000', '฿9,500,000'], {
        badge: ['Disponible', 'Available'],
        subtitle: ['Parcelle 3 · 3 ch · 4 sdb', 'Plot 3 · 3 bed · 4 bath'],
        desc: [
          'Terrasse en léger surplomb et large dégagement sur la palmeraie comme sur la mer.',
          'Slightly raised terrace and a wide open view over both the coconut grove and the sea.',
        ],
        linkText: LINK_PLOT,
      }),
      card('La vue mer', 'The sea view', ['฿9 900 000', '฿9,900,000'], {
        badge: ['Dernière opportunité', 'Last opportunity'],
        subtitle: ['Parcelle 4 · 3 ch · 4 sdb', 'Plot 4 · 3 bed · 4 bath'],
        desc: [
          'Le point le plus haut du terrain, et la plus belle vue mer de la résidence.',
          'The highest point of the land, and the finest sea view in the residence.',
        ],
        linkText: LINK_PLOT,
      }),
    ],
    vil_cardsNote: T(
      "Chaque villa : ≈ 500 m² de terrain · 332 m² bâtis · 3 chambres / 4 salles de bains · piscine 4 × 8 m · leasehold. Prix indicatifs, hors mobilier. Vues d'artiste.",
      "Each villa: ≈ 500 m² of land · 332 m² built · 3 bedrooms / 4 bathrooms · 4 × 8 m pool · leasehold. Indicative prices, furniture not included. Artist's impressions.",
    ),
    vil_archEyebrow: S('Architecture', 'Architecture'),
    vil_archHeading: T('Trois partis pris', 'Three design choices'),
    vil_arch: [
      ni('01', "L'espace en mouvement", 'Space in motion',
        "Les volumes s'ouvrent largement sur le paysage. Séjour, cuisine et salle à manger se prolongent naturellement vers les espaces extérieurs, créant une continuité entre intérieur et nature.",
        'The volumes open wide onto the landscape. Living room, kitchen and dining area extend naturally toward the outdoor spaces, creating continuity between interior and nature.'),
      ni('02', "L'élégance des matières", 'The elegance of materials',
        'Une sélection de matières et de textures aux tonalités naturelles compose une atmosphère chaleureuse et contemporaine. Chaque détail participe à une esthétique sobre, durable et intemporelle.',
        'A selection of materials and textures in natural tones creates a warm, contemporary atmosphere. Every detail contributes to an understated, durable and timeless aesthetic.'),
      ni('03', "L'art de vivre dehors", 'The art of outdoor living',
        'La terrasse, le salon extérieur, la piscine privée de 4 × 8 m et le jardin tropical forment un espace pensé pour vivre au rythme du climat et du paysage.',
        'The terrace, the outdoor lounge, the private 4 × 8 m pool and the tropical garden form a space designed for living to the rhythm of the climate and the landscape.'),
    ],
    vil_specsEyebrow: S('Prestations', 'Specifications'),
    vil_specsHeading: T('Ce qui est livré', 'What is delivered'),
    vil_specs: [
      grp('Intérieur', 'Interior', [
        row('Chambres', 'Bedrooms', '3, toutes avec salle de bain', '3, all en-suite'),
        row('Salles de bain', 'Bathrooms', '4, dont une invités', '4, including a guest bathroom'),
        row('Cuisine', 'Kitchen', 'Européenne intégrée & Équipée', 'Fitted European, fully equipped'),
        row('Climatisation', 'Air conditioning', 'Toutes les pièces', 'All rooms'),
        row('Sols', 'Flooring', 'Céramique effet Travertin', 'Travertine-effect ceramic'),
        row('Éclairage', 'Lighting', 'Corniches indirectes + spots', 'Indirect cornices + spots'),
      ]),
      grp('Extérieur', 'Exterior', [
        row('Piscine', 'Pool', '4 × 8 m, débordement', '4 × 8 m, infinity edge'),
        row('Terrasse', 'Terrace', 'Céramique effet Travertin', 'Travertine-effect ceramic'),
        row('Salon extérieur', 'Outdoor lounge', 'Couvert, plafond bois', 'Covered, timber ceiling'),
        row('Stationnement', 'Parking', '1 place couverte', '1 covered space'),
        row('Jardin', 'Garden', 'Paysagé', 'Landscaped'),
        row('Clôture', 'Enclosure', 'Murs + portail privatif', 'Walls + private gate'),
      ]),
    ],
    vil_matEyebrow: S('Les matières', 'Materials'),
    vil_matHeading: T('Une palette naturelle et intemporelle', 'A natural, timeless palette'),
    vil_matBody: T(
      "Les intérieurs privilégient une esthétique sobre et chaleureuse, construite autour de tonalités naturelles, de textures minérales et de matières choisies pour leur élégance et leur simplicité.",
      'The interiors favour an understated, warm aesthetic, built around natural tones, mineral textures and materials chosen for their elegance and simplicity.',
    ),
    vil_mat: [
      ni('01', 'Des tons naturels', 'Natural tones',
        'Une palette douce et lumineuse, pensée pour accompagner la lumière tropicale et créer une atmosphère sérène.',
        'A soft, luminous palette, designed to work with the tropical light and create a serene atmosphere.'),
      ni('02', 'Des textures minérales', 'Mineral textures',
        "Les surfaces et revêtements privilégient une expression minérale, avec des finitions sobres qui prolongent naturellement l'esprit de la villa",
        'Surfaces and finishes favour a mineral expression, with understated detailing that naturally extends the spirit of the villa.'),
      ni('03', 'Des eaux aux teintes tropicales', 'Tropical-toned water',
        'La piscine adopte des nuances inspirées des eaux de Koh Samui, créant une continuité visuelle entre le bassin, la végétation et l\'horizon marin.',
        'The pool takes on shades inspired by the waters of Koh Samui, creating visual continuity between the pool, the greenery and the ocean horizon.'),
      ni('04', 'Une végétation généreuse', 'Lush planting',
        'Palmiers, frangipaniers et végétation tropicale composent un jardin vivant, offrant ombre, intimité et fraîcheur autour de chaque villa.',
        'Palms, frangipani and tropical vegetation make up a living garden, offering shade, privacy and coolness around each villa.'),
    ],
    vil_galEyebrow: S('Galerie', 'Gallery'),
    vil_galHeading: T('Découvrez la villa', 'Explore the villa'),
    vil_galNote: T("Vues d'artiste — programme sur plan.", "Artist's impressions — off-plan project."),
    vil_cta: CTA_VISIT,
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

    vil_eyebrow: S('Disponibilités', 'Availability'),
    vil_heading: T('Une villa pour chaque projet', 'A villa for every project'),
    vil_body: T(
      'Un studio-sanctuaire ou une villa familiale — même piscine privée, même esprit balinais.',
      'A studio sanctuary or a family villa — the same private pool, the same Balinese spirit.',
    ),
    vil_cards: [
      card('Villa 1 Chambre', '1-Bedroom Villa', ['dès ฿3 600 000', 'from ฿3,600,000'], {
        zone: ['Studio-sanctuaire', 'Studio sanctuary'],
        priceNote: PN,
        linkText: LINK_VILLA,
        specs: [
          row('Surface intérieure', 'Interior area', '66 m² (séjour 42 m²)', '66 m² (living room 42 m²)'),
          row('Surface extérieure', 'Exterior area', '68 m²', '68 m²'),
          row('Piscine privée', 'Private pool', '2,5 × 4,5 m', '2.5 × 4.5 m'),
          row('Configuration', 'Configuration', '1 chambre · 1,5 sdb', '1 bedroom · 1.5 bath'),
          row('Livraison', 'Delivery', 'Meublée, cuisine équipée', 'Furnished, fitted kitchen'),
        ],
      }),
      card('Villa 2 Chambres', '2-Bedroom Villa', ['dès ฿4 100 000', 'from ฿4,100,000'], {
        zone: ['Villa familiale', 'Family villa'],
        priceNote: PN,
        linkText: LINK_VILLA,
        specs: [
          row('Surface intérieure', 'Interior area', '102 m² (séjour 61 m²)', '102 m² (living room 61 m²)'),
          row('Surface extérieure', 'Exterior area', '84 m²', '84 m²'),
          row('Piscine privée', 'Private pool', '7 × 3 m', '7 × 3 m'),
          row('Configuration', 'Configuration', '2 chambres · 2,5 sdb', '2 bedrooms · 2.5 bath'),
          row('Livraison', 'Delivery', 'Meublée, cuisine équipée', 'Furnished, fitted kitchen'),
        ],
      }),
    ],
    vil_cardsNote: T(
      "Prix de départ, hors frais de transfert et taxes. Surfaces indicatives, à confirmer sur plan définitif. Vues d'artiste et photos de résidences similaires livrées par le même constructeur.",
      "Starting prices, excluding transfer fees and taxes. Indicative areas, to be confirmed on the final drawings. Artist's impressions and photos of similar residences delivered by the same builder.",
    ),
    vil_galEyebrow: S('Galerie', 'Gallery'),
    vil_galHeading: T('Découvrez les villas', 'Explore the villas'),
    vil_cta: CTA_VISIT,
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

    vil_eyebrow: S('Disponibilités', 'Availability'),
    vil_heading: T('12 villas, 2 configurations', '12 villas, 2 configurations'),
    vil_body: T(
      '8 villas de 3 chambres et 4 villas de 2 chambres, chacune avec sa piscine privée et son parking.',
      '8 three-bedroom villas and 4 two-bedroom villas, each with its own private pool and parking.',
    ),
    vil_cards: [
      card('Villa 2 Chambres', '2-Bedroom Villa', ['dès ฿7 290 000', 'from ฿7,290,000'], {
        zone: ['4 unités disponibles', '4 units available'],
        priceNote: PN,
        linkText: LINK_VILLA,
        specs: [
          row('Surface parcelle', 'Plot area', '300 m²', '300 m²'),
          row('Surface intérieure', 'Interior area', '103 m² (dont 54 m² séjour)', '103 m² (incl. 54 m² living room)'),
          row('Surface extérieure', 'Exterior area', '53 m²', '53 m²'),
          row('Piscine privée', 'Private pool', 'env. 3 × 7 m', 'approx. 3 × 7 m'),
          row('Configuration', 'Configuration', '2 chambres · 2,5 sdb · parking', '2 bedrooms · 2.5 bath · parking'),
        ],
      }),
      card('Villa 3 Chambres', '3-Bedroom Villa', ['dès ฿8 900 000', 'from ฿8,900,000'], {
        zone: ['8 unités disponibles', '8 units available'],
        priceNote: PN,
        linkText: LINK_VILLA,
        specs: [
          row('Surface parcelle', 'Plot area', '380 à 400 m²', '380 to 400 m²'),
          row('Surface intérieure', 'Interior area', '127 m² (dont 54 m² séjour)', '127 m² (incl. 54 m² living room)'),
          row('Surface extérieure', 'Exterior area', '77 m²', '77 m²'),
          row('Piscine privée', 'Private pool', 'env. 3 × 10 m', 'approx. 3 × 10 m'),
          row('Configuration', 'Configuration', '3 chambres · 3 sdb · carport', '3 bedrooms · 3 bath · carport'),
        ],
      }),
    ],
    vil_cardsNote: T(
      "Prix de départ. Surfaces et dimensions de piscine indicatives, variables selon la parcelle (12 parcelles au total, 300 à 400 m²) — à confirmer sur plan définitif. Vues d'artiste.",
      "Starting prices. Areas and pool dimensions indicative, varying by plot (12 plots in total, 300 to 400 m²) — to be confirmed on the final drawings. Artist's impressions.",
    ),
    vil_galEyebrow: S('Galerie', 'Gallery'),
    vil_galHeading: T("Vues d'artiste & plans", "Artist's impressions & plans"),
    vil_galNote2: T(
      "Photos : vues d'artiste 3D non contractuelles. Plans : documents architecturaux fournis par le promoteur, à confirmer sur plan définitif.",
      'Photos: non-contractual 3D artist\'s impressions. Plans: architectural documents supplied by the developer, to be confirmed on the final drawings.',
    ),
    vil_cta: CTA_VISIT,
  },
]

const tx = DOCS.reduce((t, d) => t.createOrReplace(d), client.transaction())
tx.commit()
  .then(() => console.log(`✓ ${DOCS.length} documents « Pages programme » importés (section Résidence).`))
  .catch((e) => {
    console.error('✗', e.message)
    process.exit(1)
  })
