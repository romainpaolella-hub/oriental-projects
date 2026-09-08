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

// ligne de distance / caractéristique (label + value bilingues)
const dr = (lf, le, vf, ve) => ({_type: 'object', _key: k(), label: S(lf, le), value: S(vf, ve)})
// jalon d'échéancier
const stp = (pf, pe, ef, ee, tf, te, bf, be) => ({_type: 'object', _key: k(), pct: S(pf, pe), label: S(ef, ee), title: S(tf, te), body: T(bf, be)})
// palier de bail (sublabel optionnel)
const lr = (lf, le, vf, ve, sf, se) => {
  const o = {_type: 'object', _key: k(), label: S(lf, le), value: S(vf, ve)}
  if (sf != null) o.sublabel = S(sf, se)
  return o
}
// question/réponse FAQ
const fq = (qf, qe, af, ae) => ({_type: 'object', _key: k(), q: S(qf, qe), a: T(af, ae)})

// éléments communs FAQ (Q + A identiques d'un programme à l'autre)
const FAQ_FOREIGNER = fq(
  'Un étranger peut-il acheter une villa en Thaïlande ?', 'Can a foreigner buy a villa in Thailand?',
  "Un non-résident ne peut pas détenir le terrain en pleine propriété à son nom, mais il peut sécuriser l'usage de la villa par un bail de longue durée (leasehold) renouvelable, ou via une structure de société thaïlandaise. Le montage est validé au cas par cas par un cabinet indépendant.",
  'A non-resident cannot hold the land in full freehold ownership in their own name, but can secure the use of the villa through a renewable long-term lease (leasehold), or via a Thai company structure. The arrangement is validated case by case by an independent firm.',
)
const FAQ_RENTAL_SHORT = fq(
  "Qui s'occupe de la location ?", 'Who handles the rental?',
  "Notre équipe locale peut prendre en charge la commercialisation, l'accueil des voyageurs, le ménage et l'entretien, avec un reporting des revenus et des charges.",
  'Our local team can take care of marketing, guest check-in, cleaning and maintenance, with reporting of income and costs.',
)
const FAQ_NOTE = T(
  "Informations générales fournies à titre indicatif. Elles ne constituent pas un conseil juridique, fiscal ou financier et doivent être validées avec un avocat ou notaire thaïlandais avant tout engagement.",
  'General information provided for guidance only. It does not constitute legal, tax or financial advice and must be validated with a Thai lawyer or notary before any commitment.',
)
const LOC_CTA = T('Nous vous envoyons la localisation exacte sur demande', "We'll send you the exact location on request")
const INV_CTA = T('Nous vous envoyons le dossier chiffré complet', "We'll send you the full costed dossier")
const INV_HERO = S('Rendement & acquisition', 'Yield & acquisition')
const SIM_HEAD = T('Estimez votre rendement', 'Estimate your yield')

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

    // --- LOCALISATION ---
    loc_heroEyebrow: S('Localisation', 'Location'),
    loc_heroTitle: S('Au cœur de Koh Samui', 'At the heart of Koh Samui'),
    loc_eyebrow: S('Distances', 'Distances'),
    loc_heading: T('Plages, commerces et aéroport à quelques minutes', 'Beaches, shops and airport just minutes away'),
    loc_body: T(
      "Un secteur résidentiel calme de Ban Tai, dans un environnement préservé, avec un accès facile à l'essentiel.",
      'A quiet residential area of Ban Tai, in an unspoilt setting, with easy access to the essentials.',
    ),
    loc_distances: [
      dr('Plage la plus proche', 'Nearest beach', '5 min', '5 min'),
      dr('Commerces & restaurants', 'Shops & restaurants', '5 min', '5 min'),
      dr("Fisherman's Village, Bophut", "Fisherman's Village, Bophut", '15 min', '15 min'),
      dr('Hôpital international', 'International hospital', '15 min', '15 min'),
      dr('Aéroport de Koh Samui', 'Koh Samui airport', '20 min', '20 min'),
      dr('Écoles internationales', 'International schools', '20 min', '20 min'),
    ],
    loc_distancesNote: T(
      "Distances indicatives, à préciser selon l'emplacement définitif du terrain.",
      'Indicative distances, to be confirmed based on the final plot location.',
    ),
    loc_islandEyebrow: S("L'île", 'The island'),
    loc_islandHeading: T('Pourquoi Koh Samui', 'Why Koh Samui'),
    loc_island: [
      ni('01', 'Destination phare', 'A flagship destination',
        'Deuxième plus grande île de Thaïlande, réputée pour ses plages, sa nature et son art de vivre.',
        "Thailand's second-largest island, renowned for its beaches, nature and lifestyle."),
      ni('02', 'Accès international', 'International access',
        'Aéroport desservant Bangkok, Singapour, Hong Kong et de nombreuses liaisons régionales.',
        'An airport serving Bangkok, Singapore, Hong Kong and many regional routes.'),
      ni('03', 'Marché dynamique', 'A dynamic market',
        "Forte demande locative touristique toute l'année, en haute comme en basse saison.",
        'Strong year-round tourist rental demand, in both high and low season.'),
    ],
    loc_cta: LOC_CTA,

    // --- INVESTIR ---
    inv_heroTitle: INV_HERO,
    inv_simEyebrow: S('Simulateur', 'Simulator'),
    inv_simHeading: SIM_HEAD,
    inv_simBody: T(
      'Choisissez une parcelle et un scénario locatif — ou ajustez librement les nuits louées et le tarif moyen.',
      'Choose a plot and a rental scenario — or freely adjust the nights let and the average nightly rate.',
    ),
    inv_simNote: T(
      "Rendement brut = revenu locatif annuel ÷ prix d'acquisition. Rendement net après déduction d'environ 35 % de charges et frais de gestion. Repères marché Koh Samui pour une villa 3 chambres avec piscine : ฿4 500–7 000 par nuit, 120–260 nuits louées par an. Estimations indicatives, non garanties, dépendant de la saison et du taux d'occupation réel ; elles ne constituent pas un conseil en investissement.",
      'Gross yield = annual rental income ÷ acquisition price. Net yield after deducting roughly 35% of charges and management fees. Koh Samui market benchmarks for a 3-bedroom villa with pool: ฿4,500–7,000 per night, 120–260 nights let per year. Indicative estimates, not guaranteed, depending on the season and the actual occupancy rate; they do not constitute investment advice.',
    ),
    inv_stepsEyebrow: S('Achat sur plan', 'Off-plan purchase'),
    inv_stepsHeading: T('Échéancier en six jalons', 'A six-milestone payment schedule'),
    inv_steps: [
      stp('10 %', '10%', 'Étape 1', 'Step 1', 'Réservation', 'Reservation',
        'Signature du contrat de réservation et blocage de la parcelle choisie.', 'Signing of the reservation contract and hold on the chosen plot.'),
      stp('20 %', '20%', 'Étape 2', 'Step 2', 'Terrassement', 'Earthworks',
        'Préparation du terrain, fondations et réseaux enterrés.', 'Site preparation, foundations and buried utilities.'),
      stp('20 %', '20%', 'Étape 3', 'Step 3', 'Structure', 'Structure',
        'Élévation des murs, dalles et charpente de toiture.', 'Walls, slabs and roof framing.'),
      stp('20 %', '20%', 'Étape 4', 'Step 4', 'Second œuvre', 'Second fix',
        'Menuiseries, piscine, enduits et réseaux intérieurs.', 'Joinery, pool, renders and interior services.'),
      stp('20 %', '20%', 'Étape 5', 'Step 5', 'Finitions', 'Finishes',
        'Sols, salles de bain, cuisine, éclairage et paysagement.', 'Flooring, bathrooms, kitchen, lighting and landscaping.'),
      stp('10 %', '10%', 'Étape 6', 'Step 6', 'Livraison', 'Handover',
        'Réception des travaux, remise des clés et transfert du bail.', 'Snagging, handover of keys and transfer of the lease.'),
    ],
    inv_stepsNote: T(
      "Échéancier indicatif présenté à titre d'exemple. Les modalités exactes — montants, jalons, garanties — sont contractualisées au cas par cas.",
      'Indicative schedule shown as an example. The exact terms — amounts, milestones, guarantees — are set contractually on a case-by-case basis.',
    ),
    inv_leaseEyebrow: S('Bail & charges', 'Lease & costs'),
    inv_leaseHeading: T('Bail du terrain sur 30 ans', 'A 30-year land lease'),
    inv_leaseIntro: T(
      "Bail de 30 ans renouvelable, avec permis de construire établi au nom de l'acquéreur. Redevance indexée de 3 % tous les 3 ans. Frais de renouvellement du bail ou de transfert de propriété : 400 000 THB.",
      "A 30-year renewable lease, with the building permit issued in the buyer's name. Fee indexed by 3% every 3 years. Lease renewal or ownership transfer fee: 400,000 THB.",
    ),
    inv_leaseRows: [
      lr('Années 1–3', 'Years 1–3', '234 000,00 ฿', '234,000.00 ฿', "À l'enregistrement du bail au Land Office", 'On registration of the lease at the Land Office'),
      lr('Années 4–6', 'Years 4–6', '241 020,00 ฿', '241,020.00 ฿', 'Au plus tard le 15 décembre 2028', 'By 15 December 2028'),
      lr('Années 7–9', 'Years 7–9', '248 250,60 ฿', '248,250.60 ฿', 'Au plus tard le 15 décembre 2031', 'By 15 December 2031'),
      lr('Années 10–12', 'Years 10–12', '255 698,12 ฿', '255,698.12 ฿', 'Au plus tard le 15 décembre 2034', 'By 15 December 2034'),
      lr('Années 13–15', 'Years 13–15', '263 369,06 ฿', '263,369.06 ฿', 'Au plus tard le 15 décembre 2037', 'By 15 December 2037'),
      lr('Années 16–18', 'Years 16–18', '271 270,13 ฿', '271,270.13 ฿', 'Au plus tard le 15 décembre 2040', 'By 15 December 2040'),
      lr('Années 19–21', 'Years 19–21', '279 408,24 ฿', '279,408.24 ฿', 'Au plus tard le 15 décembre 2043', 'By 15 December 2043'),
      lr('Années 22–24', 'Years 22–24', '287 790,48 ฿', '287,790.48 ฿', 'Au plus tard le 15 décembre 2046', 'By 15 December 2046'),
      lr('Années 25–27', 'Years 25–27', '296 424,20 ฿', '296,424.20 ฿', 'Au plus tard le 15 décembre 2049', 'By 15 December 2049'),
      lr('Années 28–30', 'Years 28–30', '305 316,93 ฿', '305,316.93 ฿', 'Au plus tard le 15 décembre 2052', 'By 15 December 2052'),
    ],
    inv_leaseTotalLabel: S('Total sur 30 ans', 'Total over 30 years'),
    inv_leaseTotalValue: S('2 682 547,76 ฿', '2,682,547.76 ฿'),
    inv_leaseNote: T(
      "Paiements effectués par virement bancaire sur le compte du bailleur. Montants indiqués à titre d'exemple, conformes au contrat de bail standard ; ils ne constituent pas un engagement contractuel et sont confirmés au cas par cas.",
      "Payments made by bank transfer to the lessor's account. Amounts shown as an example, in line with the standard lease contract; they are not a contractual commitment and are confirmed on a case-by-case basis.",
    ),
    inv_faqEyebrow: S('Questions fréquentes', 'Frequently asked questions'),
    inv_faqHeading: T('FAQ investisseurs', 'Investor FAQ'),
    inv_faq: [
      FAQ_FOREIGNER,
      fq('Que couvre le prix affiché ?', 'What does the listed price cover?',
        'La construction de la villa livrée clé en main, la piscine, le paysagement, les murs de clôture et les raccordements. Le mobilier, les frais de transfert et les taxes sont chiffrés séparément.',
        'Construction of the turnkey villa, the pool, landscaping, boundary walls and utility connections. Furniture, transfer fees and taxes are quoted separately.'),
      fq("Qui s'occupe de la location ?", 'Who handles the rental?',
        "Notre équipe locale peut prendre en charge la commercialisation, l'accueil des voyageurs, le ménage et l'entretien, avec un reporting mensuel des revenus et des charges.",
        'Our local team can take care of marketing, guest check-in, cleaning and maintenance, with monthly reporting of income and costs.'),
      fq('Le loyer du bail peut-il évoluer ?', 'Can the lease fee change?',
        "Oui — la redevance de bail progresse de 3 % tous les 3 ans sur toute la durée du bail de 30 ans, selon l'échéancier détaillé ci-dessus.",
        'Yes — the lease fee rises by 3% every 3 years over the full 30-year lease term, as set out in the schedule above.'),
      fq('Quels sont les délais de construction ?', 'How long does construction take?',
        "Environ douze mois à compter de l'obtention du permis, selon la saison et la parcelle. Le calendrier précis est annexé au contrat.",
        'About twelve months from the granting of the permit, depending on the season and the plot. The precise schedule is annexed to the contract.'),
      fq('Peut-on personnaliser la villa ?', 'Can the villa be customised?',
        'Oui, dans les limites du gros œuvre : finitions, teintes, cuisine, salles de bain et aménagement extérieur peuvent être adaptés avant le démarrage du second œuvre.',
        'Yes, within the limits of the structural shell: finishes, colours, kitchen, bathrooms and outdoor layout can be adapted before second-fix works begin.'),
    ],
    inv_faqNote: FAQ_NOTE,
    inv_cta: INV_CTA,
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

    // --- LOCALISATION ---
    loc_heroEyebrow: S('Localisation', 'Location'),
    loc_heroTitle: S('Lipa Noi, côte ouest', 'Lipa Noi, west coast'),
    loc_eyebrow: S('Distances', 'Distances'),
    loc_heading: T("À deux pas de la plage, loin de l'agitation", 'Steps from the beach, far from the bustle'),
    loc_body: T(
      "Lipa Noi est un secteur résidentiel ultra-calme de la côte ouest de Koh Samui, prisé pour ses couchers de soleil sur la mer d'Andaman.",
      'Lipa Noi is a very quiet residential area on the west coast of Koh Samui, prized for its sunsets over the Andaman Sea.',
    ),
    loc_distances: [
      dr('Plage publique', 'Public beach', '250 m · 3 min à pied', '250 m · 3 min walk'),
      dr('Location de jet-ski', 'Jet-ski rental', '250 m', '250 m'),
      dr('Nikki Beach (club de luxe)', 'Nikki Beach (luxury club)', '350 m', '350 m'),
      dr('Seven Eleven / commerces', 'Seven Eleven / shops', '300 m', '300 m'),
      dr('Aéroport de Koh Samui', 'Koh Samui airport', '~30 min', '~30 min'),
    ],
    loc_distancesNote: T(
      "Distances à vol d'oiseau communiquées par le promoteur, à confirmer sur l'emplacement définitif du terrain.",
      'Straight-line distances provided by the developer, to be confirmed based on the final plot location.',
    ),
    loc_islandEyebrow: S('Lipa Noi', 'Lipa Noi'),
    loc_islandHeading: T("Le joyau caché de l'île", "The island's hidden gem"),
    loc_island: [
      ni('01', 'Environnement protégé', 'A protected setting',
        "Une zone naturelle ultra-calme, à l'écart des zones touristiques les plus fréquentées de l'île.",
        "A very quiet natural area, away from the island's busiest tourist spots."),
      ni('02', 'Couchers de soleil', 'Sunsets',
        "Orientée côte ouest, face à la mer d'Andaman — un rendez-vous quotidien pour les amateurs de sunset.",
        'Facing the west coast and the Andaman Sea — a daily ritual for sunset lovers.'),
      ni('03', "L'essentiel à proximité", 'Essentials nearby',
        'Plage, jet-ski, restaurant de plage et supérette à moins de 5 minutes à pied.',
        'Beach, jet-ski, beach restaurant and convenience store less than a 5-minute walk away.'),
    ],
    loc_cta: LOC_CTA,

    // --- INVESTIR ---
    inv_heroTitle: INV_HERO,
    inv_simEyebrow: S('Simulateur', 'Simulator'),
    inv_simHeading: SIM_HEAD,
    inv_simBody: T(
      'Choisissez une villa et un scénario locatif — ou ajustez librement les nuits louées et le tarif moyen.',
      'Choose a villa and a rental scenario — or freely adjust the nights let and the average nightly rate.',
    ),
    inv_simNote: T(
      "Rendement brut = revenu locatif annuel ÷ prix d'acquisition. Rendement net après déduction d'environ 30 % de charges (bail, entretien, gestion) — hors frais de transfert et taxes. Repères indicatifs pour un studio-villa avec piscine privée dans le secteur de Lipa Noi : ฿1 800–2 800 par nuit, 140–210 nuits louées par an. Ces hypothèses n'ont pas été vérifiées auprès de données de marché locales spécifiques à Lipa Noi et doivent être calibrées avant toute décision d'investissement ; elles ne constituent pas un conseil en investissement.",
      'Gross yield = annual rental income ÷ acquisition price. Net yield after deducting roughly 30% of costs (lease, maintenance, management) — excluding transfer fees and taxes. Indicative benchmarks for a studio-villa with private pool in the Lipa Noi area: ฿1,800–2,800 per night, 140–210 nights let per year. These assumptions have not been checked against local market data specific to Lipa Noi and must be calibrated before any investment decision; they do not constitute investment advice.',
    ),
    inv_stepsEyebrow: S('Achat sur plan', 'Off-plan purchase'),
    inv_stepsHeading: T('Échéancier en six étapes', 'A six-step payment schedule'),
    inv_steps: [
      stp('100 000 ฿', '฿100,000', 'Étape 1', 'Step 1', 'Réservation', 'Reservation',
        "Dépôt fixe versé à l'avocat mandaté à la signature du contrat de réservation, conservé en séquestre.",
        'Fixed deposit paid to the appointed lawyer on signing the reservation contract, held in escrow.'),
      stp('33 %', '33%', 'Étape 2', 'Step 2', 'Permis de construire', 'Building permit',
        "Versement à l'obtention du permis et à l'autorisation de démarrer les travaux.",
        'Payment on obtaining the permit and authorisation to start works.'),
      stp('33 %', '33%', 'Étape 3', 'Step 3', 'Structure RDC & piscine', 'Ground-floor structure & pool',
        "À l'achèvement de la structure du rez-de-chaussée et du bassin.",
        'On completion of the ground-floor structure and the pool.'),
      stp('17 %', '17%', 'Étape 4', 'Step 4', 'Étage & toiture', 'Upper floor & roof',
        "À l'achèvement de la structure d'étage et de la charpente de toiture.",
        'On completion of the upper-floor structure and roof framing.'),
      stp('14 %', '14%', 'Étape 5', 'Step 5', 'Maçonnerie & enduits', 'Masonry & renders',
        "À l'achèvement des murs en briques et des enduits intérieurs/extérieurs.",
        'On completion of the brick walls and interior/exterior renders.'),
      stp('2 %', '2%', 'Étape 6', 'Step 6', 'Finitions & livraison', 'Finishes & handover',
        'Carrelage, menuiseries, peinture et équipements — remise des clés à la livraison.',
        'Tiling, joinery, paint and equipment — handover of keys on delivery.'),
    ],
    inv_stepsNote: T(
      "Pourcentages calculés sur le solde après réservation (identiques pour les deux typologies) ; dépôt de réservation fixe de 100 000 THB. Prix total : ฿3 600 000 (1 chambre) / ฿4 100 000 (2 chambres). Échéancier contractualisé au cas par cas.",
      'Percentages calculated on the balance after reservation (identical for both layouts); fixed reservation deposit of 100,000 THB. Total price: ฿3,600,000 (1 bedroom) / ฿4,100,000 (2 bedrooms). Schedule set contractually on a case-by-case basis.',
    ),
    inv_leaseEyebrow: S('Bail & charges', 'Lease & costs'),
    inv_leaseHeading: T('Coûts annuels de détention', 'Annual holding costs'),
    inv_leaseTable: [
      grp('Bail du terrain', 'Land lease', [
        row('Villa 1 chambre', '1-bedroom villa', '25 000 THB / an', '25,000 THB / year'),
        row('Villa 2 chambres', '2-bedroom villa', '30 000 THB / an', '30,000 THB / year'),
        row('Révision', 'Review', '+3 % tous les 3 ans', '+3% every 3 years'),
        row('Renouvellement (bail 30 ans)', 'Renewal (30-year lease)', '300 000 THB (1ch) · 400 000 THB (2ch)', '300,000 THB (1BR) · 400,000 THB (2BR)'),
      ]),
      grp('Entretien & charges', 'Maintenance & charges', [
        row('Copropriété (parties communes)', 'Common-area service charge', '2 000 THB / mois', '2,000 THB / month'),
        row('Eau', 'Water', '500 THB / mois', '500 THB / month'),
        row('Électricité', 'Electricity', 'Compteur officiel gouvernemental', 'Official government meter'),
        row('Entretien piscine (2×/semaine, optionnel)', 'Pool maintenance (2×/week, optional)', '2 000 THB / mois', '2,000 THB / month'),
        row('Entretien jardin (2×/semaine, optionnel)', 'Garden maintenance (2×/week, optional)', '3 000 THB / mois', '3,000 THB / month'),
      ]),
    ],
    inv_leaseNote: T(
      'Montants communiqués par le promoteur. Charges optionnelles souscrites librement selon les besoins du propriétaire.',
      "Amounts provided by the developer. Optional services taken up freely according to the owner's needs.",
    ),
    inv_faqEyebrow: S('Questions fréquentes', 'Frequently asked questions'),
    inv_faqHeading: T('FAQ investisseurs', 'Investor FAQ'),
    inv_faq: [
      FAQ_FOREIGNER,
      fq('Que couvre le prix affiché ?', 'What does the listed price cover?',
        'La construction de la villa livrée meublée et équipée, la piscine privée et le jardin. Le bail du terrain, les charges de copropriété, les frais de transfert et les taxes sont facturés séparément, comme détaillé ci-dessus.',
        'Construction of the villa delivered furnished and equipped, the private pool and the garden. The land lease, common-area charges, transfer fees and taxes are billed separately, as detailed above.'),
      FAQ_RENTAL_SHORT,
      fq('Quels sont les délais de construction ?', 'How long does construction take?',
        "Le calendrier précis, jalon par jalon, est annexé au contrat de vente et dépend de la date d'obtention du permis de construire.",
        'The precise milestone-by-milestone schedule is annexed to the sale contract and depends on the date the building permit is granted.'),
      fq('Le mobilier est-il vraiment inclus ?', 'Is the furniture really included?',
        'Oui — lit, dressing, cuisine équipée, canapé, télévision, table à manger, climatisation et bains de soleil sont inclus dans le prix affiché. Un pack déco optionnel est proposé en supplément.',
        'Yes — bed, wardrobe, fitted kitchen, sofa, television, dining table, air conditioning and sun loungers are included in the listed price. An optional decor pack is offered as an extra.'),
    ],
    inv_faqNote: FAQ_NOTE,
    inv_cta: INV_CTA,
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

    // --- LOCALISATION ---
    loc_heroEyebrow: S('Localisation', 'Location'),
    loc_heroTitle: S('Bophut, côte nord', 'Bophut, north coast'),
    loc_eyebrow: S('Distances', 'Distances'),
    loc_heading: T("Au cœur du quartier le plus vivant de l'île", "At the heart of the island's liveliest district"),
    loc_body: T(
      'Terra Mare est implanté à Bophut, à quelques pas de la plage, entre nature préservée et adresses réputées du secteur.',
      "Terra Mare sits in Bophut, steps from the beach, between unspoilt nature and the area's best-known addresses.",
    ),
    loc_distances: [
      dr('Plage la plus proche — W Beach', 'Nearest beach — W Beach', '200 m', '200 m'),
      dr('Bo Phut Beach', 'Bo Phut Beach', '270 m', '270 m'),
      dr('Distributeur (ATM)', 'Cash machine (ATM)', '660 m', '660 m'),
      dr("Fisherman's Village", "Fisherman's Village", '2,23 km', '2.23 km'),
      dr('Aéroport international de Samui (USM)', 'Samui International Airport (USM)', '5,77 km', '5.77 km'),
      dr('Central Festival Samui', 'Central Festival Samui', '6,63 km', '6.63 km'),
    ],
    loc_poiEyebrow: S("Points d'intérêt à proximité", 'Points of interest nearby'),
    loc_poiHeading: T('Distances réelles depuis Terra Mare', 'Real distances from Terra Mare'),
    loc_poiNote: T(
      "Distances routières mesurées depuis la villa Terra Mare (Google Maps). Susceptibles de varier selon l'itinéraire.",
      'Driving distances measured from the Terra Mare villa (Google Maps). May vary depending on the route.',
    ),
    loc_islandEyebrow: S("L'île", 'The island'),
    loc_islandHeading: T('Pourquoi Bophut', 'Why Bophut'),
    loc_island: [
      ni('01', "Fisherman's Village", "Fisherman's Village",
        'Le village de pêcheurs historique de Koh Samui, restauré en une rue animée de restaurants, galeries et marché de nuit.',
        "Koh Samui's historic fishing village, restored into a lively street of restaurants, galleries and a night market."),
      ni('02', 'Aéroport à proximité', 'Airport nearby',
        "Bophut est l'un des quartiers les plus proches de l'aéroport de Koh Samui, desservant Bangkok et de nombreuses liaisons régionales.",
        'Bophut is one of the districts closest to Koh Samui airport, serving Bangkok and many regional routes.'),
      ni('03', 'Nature & tranquillité', 'Nature & quiet',
        "Un environnement boisé au bord de mer, à proximité immédiate d'adresses réputées comme Fair House Villas & Spa.",
        'A wooded seafront setting, right next to well-known addresses such as Fair House Villas & Spa.'),
    ],
    loc_cta: LOC_CTA,

    // --- INVESTIR ---
    inv_heroTitle: INV_HERO,
    inv_simEyebrow: S('Simulateur', 'Simulator'),
    inv_simHeading: SIM_HEAD,
    inv_simBody: T(
      'Choisissez une villa et un scénario locatif — ou ajustez librement les nuits louées et le tarif moyen.',
      'Choose a villa and a rental scenario — or freely adjust the nights let and the average nightly rate.',
    ),
    inv_simNote: T(
      "Rendement brut = revenu locatif annuel ÷ prix d'acquisition. Rendement net après déduction d'environ 33 % de charges (bail, entretien, gestion) — hors frais de transfert et taxes. Repères indicatifs pour une villa avec piscine privée à Koh Samui, non spécifiques au secteur de Bophut : ฿4 800–6 500 par nuit, 150–205 nuits louées par an. Ces hypothèses n'ont pas été vérifiées auprès de données de marché locales et doivent être calibrées avant toute décision d'investissement ; elles ne constituent pas un conseil en investissement.",
      'Gross yield = annual rental income ÷ acquisition price. Net yield after deducting roughly 33% of costs (lease, maintenance, management) — excluding transfer fees and taxes. Indicative benchmarks for a villa with private pool in Koh Samui, not specific to the Bophut area: ฿4,800–6,500 per night, 150–205 nights let per year. These assumptions have not been checked against local market data and must be calibrated before any investment decision; they do not constitute investment advice.',
    ),
    inv_stepsEyebrow: S('Achat sur plan', 'Off-plan purchase'),
    inv_stepsHeading: T('Modalités de paiement', 'Payment terms'),
    inv_stepsProse: T(
      "Le prix d'acquisition est réglé par étapes, au fil de l'avancement du chantier, selon un échéancier lié aux jalons de construction (permis, structure, second œuvre, finitions et livraison). Le détail des jalons et des pourcentages associés est communiqué dans le dossier contractuel remis à la réservation.",
      'The acquisition price is paid in stages, as the works progress, on a schedule tied to the construction milestones (permit, structure, second fix, finishes and handover). The detail of the milestones and their associated percentages is set out in the contract pack handed over at reservation.',
    ),
    inv_stepsNote: T(
      "Contrairement à Villa Sea View et Eden Tropical, l'échéancier détaillé de Terra Mare (pourcentages par jalon) n'a pas été fourni à ce stade — il sera précisé avant toute réservation.",
      'Unlike Villa Sea View and Eden Tropical, the detailed Terra Mare schedule (percentages per milestone) has not been provided at this stage — it will be specified before any reservation.',
    ),
    inv_leaseEyebrow: S('Bail & charges', 'Lease & costs'),
    inv_leaseHeading: T('Bail du terrain sur 30 ans', 'A 30-year land lease'),
    inv_leaseIntro: T(
      'Loyer de départ : 8 300 THB / mois pour les 3 premières années, puis +5 % tous les 3 ans sur toute la durée du bail (30 ans).',
      'Starting rent: 8,300 THB / month for the first 3 years, then +5% every 3 years over the full lease term (30 years).',
    ),
    inv_leaseRows: [
      lr('Palier 1 (années 1–3)', 'Tier 1 (years 1–3)', '306 000 ฿', '306,000 ฿'),
      lr('Palier 2 (années 4–6)', 'Tier 2 (years 4–6)', '321 300 ฿', '321,300 ฿'),
      lr('Palier 3 (années 7–9)', 'Tier 3 (years 7–9)', '337 365 ฿', '337,365 ฿'),
      lr('Palier 4 (années 10–12)', 'Tier 4 (years 10–12)', '354 233 ฿', '354,233 ฿'),
      lr('Palier 5 (années 13–15)', 'Tier 5 (years 13–15)', '371 945 ฿', '371,945 ฿'),
      lr('Palier 6 (années 16–18)', 'Tier 6 (years 16–18)', '390 542 ฿', '390,542 ฿'),
      lr('Palier 7 (années 19–21)', 'Tier 7 (years 19–21)', '410 069 ฿', '410,069 ฿'),
      lr('Palier 8 (années 22–24)', 'Tier 8 (years 22–24)', '430 573 ฿', '430,573 ฿'),
      lr('Palier 9 (années 25–30)', 'Tier 9 (years 25–30)', '452 101 ฿', '452,101 ฿'),
    ],
    inv_leaseTotalLabel: S('Total sur 30 ans', 'Total over 30 years'),
    inv_leaseTotalValue: S('3 374 129 ฿', '3,374,129 ฿'),
    inv_leaseNote: T(
      "Grille communiquée par le promoteur. Numérotation exacte des paliers annuels à confirmer avec le contrat de bail — de légers écarts d'arrondi entre le tarif mensuel de départ et les totaux ci-dessus proviennent du document source.",
      'Schedule provided by the developer. Exact numbering of the annual tiers to be confirmed with the lease contract — minor rounding differences between the starting monthly rent and the totals above come from the source document.',
    ),
    inv_faqEyebrow: S('Questions fréquentes', 'Frequently asked questions'),
    inv_faqHeading: T('FAQ investisseurs', 'Investor FAQ'),
    inv_faq: [
      FAQ_FOREIGNER,
      fq('Que couvre le prix affiché ?', 'What does the listed price cover?',
        "La construction de la villa, sa piscine privée, son jardin et sa place de parking. Le bail du terrain, les charges d'entretien, les frais de transfert et les taxes sont facturés séparément.",
        'Construction of the villa, its private pool, its garden and its parking space. The land lease, maintenance charges, transfer fees and taxes are billed separately.'),
      FAQ_RENTAL_SHORT,
      fq('Le loyer du bail peut-il évoluer ?', 'Can the lease rent change?',
        'Oui — il progresse de 5 % tous les 3 ans sur toute la durée du bail de 30 ans, selon la grille détaillée ci-dessus.',
        'Yes — it rises by 5% every 3 years over the full 30-year lease term, according to the schedule detailed above.'),
      fq('Peut-on personnaliser la villa ?', 'Can the villa be customised?',
        'Les possibilités de personnalisation (finitions, cuisine, salle de bain) sont précisées dans le dossier contractuel remis à la réservation.',
        'The customisation options (finishes, kitchen, bathroom) are set out in the contract pack handed over at reservation.'),
    ],
    inv_faqNote: FAQ_NOTE,
    inv_cta: INV_CTA,
  },
]

const tx = DOCS.reduce((t, d) => t.createOrReplace(d), client.transaction())
tx.commit()
  .then(() => console.log(`✓ ${DOCS.length} documents « Pages programme » importés (section Résidence).`))
  .catch((e) => {
    console.error('✗', e.message)
    process.exit(1)
  })
