/* KOH SAMUI ESTATE — données du site (contenu réel + placeholders "xx" à compléter) */

/* ===== Hero carrousel (accueil) =====
   4 slides vidéo : hero de marque Koh Samui Estate (fond vidéo nu, le wordmark
   "KOH SAMUI ESTATE" est superposé en HTML/CSS -> plein écran responsive mobile)
   puis 1 vidéo par programme.
   Poids vidéo (720p H.264, compressé le 02/09) :
   oriental 4,1 Mo · sea-view 7,4 Mo · eden 9,3 Mo · terra 6,8 Mo — total ~27 Mo. */
window.HERO = [
  {
    brand: true,
    type: 'video',
    src: 'videos/oriental-hero-background.mp4',
    poster: 'videos/poster-oriental.jpg',
    w: 1280, h: 720,
    href: 'index.html#programmes',
    cta: 'Découvrir nos programmes'
  },
  {
    type: 'video',
    src: 'videos/sea-view-villa-hero.mp4',
    poster: 'videos/poster-sea-view.jpg',
    w: 1344, h: 768,
    kicker: 'Programme neuf · Ban Tai',
    title: 'Villa Sea View',
    sub: "Quatre villas privées, une palmeraie, et la mer pour horizon.",
    href: 'sea-view/index.html',
    cta: 'Découvrir le programme'
  },
  {
    type: 'video',
    src: 'videos/eden-tropical-hero.mp4',
    poster: 'videos/poster-eden.jpg',
    w: 1344, h: 768,
    kicker: 'Programme neuf · Lipa Noi',
    title: 'Eden Tropical',
    sub: "Villas balinaises avec piscine privée, à 250 m de la plage.",
    href: 'eden-tropical/index.html',
    cta: 'Découvrir le programme'
  },
  {
    type: 'video',
    src: 'videos/terra-mare-hero.mp4',
    poster: 'videos/poster-terra.jpg',
    w: 1344, h: 768,
    kicker: 'Programme neuf · Bophut',
    title: 'Terra Mare',
    sub: "12 villas contemporaines avec piscine privée, au cœur de l'île.",
    href: 'terra-mare/index.html',
    cta: 'Découvrir le programme'
  }
];

/* ===== Encarts programmes (accueil, section #programmes) ===== */
window.PROJECTS = [
  {
    name: 'Villa Sea View',
    zone: 'Ban Tai, Koh Samui',
    img: '005-rw-mtfhziri-74yt.jpg',
    w: 1672, h: 941,
    status: 'plan',
    statusLabel: 'Sur plan',
    pitch: "Une collection confidentielle de quatre résidences privées avec piscine, au cœur d'une palmeraie face à la mer.",
    facts: ['04 villas', '332 m² bâtis', 'dès ฿8,9 M', 'Leasehold'],
    href: 'sea-view/index.html'
  },
  {
    name: 'Eden Tropical',
    zone: 'Lipa Noi, Koh Samui',
    img: 'hailuo_image_transform-this-architectura-mtfi13qu-ray0.jpg',
    w: 1280, h: 720,
    statusLabel: 'Sur plan',
    pitch: "Des studios-villas avec piscine privée, entièrement aménagés et prêts à vivre, à seulement 250 mètres de la plage de Lipa Noi. Une adresse pensée pour conjuguer art de vivre tropical et potentiel locatif.",
    facts: ['2 typologies', '120 à 203 m²', 'dès ฿3,6 M', 'Leasehold'],
    href: 'eden-tropical/index.html'
  },
  {
    name: 'Terra Mare',
    zone: 'Bophut, Koh Samui',
    img: 'images/terra-mare/ext-dusk.jpg',
    w: 1672, h: 941,
    status: 'plan',
    statusLabel: 'Sur plan',
    pitch: "12 villas contemporaines de 2 et 3 chambres, chacune dotée de sa piscine privée, au cœur de Bophut, l'un des quartiers les plus emblématiques de Koh Samui.",
    facts: ['12 villas', '2 typologies', 'dès ฿7,29 M', 'Leasehold'],
    href: 'terra-mare/index.html'
  }
];

/* ===== Villas clé en main disponibles (accueil, section #a-vendre) =====
   Chiffres confirmés dans "À fournir — Koh Samui Estate v3" (Tropical Golf, Villa 2).
   Photos réelles reçues le 27/08 (dossier "Villa en vente"). Fiche complète : voir
   villas-a-vendre/index.html. Villa 4 (même résidence) et Villa Aurora annoncées
   par le client comme arrivant bientôt à la vente — pas encore de photos/prix. */
window.DISPOS = [
  {
    name: 'Tropical Golf — Villa 2',
    img: 'images/tropical-golf-v2/hero-dusk.jpg',
    w: 1920, h: 1440,
    statusLabel: 'Disponible',
    specs: ['≈ 250 m² bâtis', 'Piscine 7,5 × 3,5 m', '3 ch. · 3 sdb', 'Bail exclusif de 30 Ans Leasehold'],
    price: 8300000,
    rentMonthly: 80000,
    href: 'villas-a-vendre/tropical-golf-villa-2.html'
  },
  { placeholder: true, name: 'Tropical Golf — Villa 4', note: 'Même résidence · bientôt disponible' },
  { placeholder: true, name: 'Villa Aurora', note: 'Nouvelle adresse · bientôt disponible' }
];

/* ===== Réassurance (bandeau stats, section .stats) =====
   Seule la donnée "18 ans" est confirmée pour l'instant — le reste attend
   les chiffres du client (voir "À fournir — Koh Samui Estate v3", §1). */
window.STATS = [
  { n: '18', l: "Ans d'expérience" },
  { n: 'xx', l: 'Villas livrées' },
  { n: 'xx', l: 'Clients accompagnés' },
  { n: '3', l: 'Programmes en cours' }
];

/* ===== Réalisations (cartes villa, section #realisations) =====
   Quatre villas livrées à Koh Samui. Chaque carte renvoie vers sa page
   photos dédiée (realisations/<slug>.html). Photos client redimensionnées
   pour le web dans images/realisations/<slug>/NN.jpg (script import-realisations.ps1).
   Tropical Golf — Villa 2 réutilise les visuels web existants (images/tropical-golf-v2/)
   et sa page renvoie aussi vers la fiche de vente.
   - "zone" : quartier de Koh Samui à préciser avec le client (placeholder "Koh Samui").
   - "Tropical Golf" (3e carte) : villa distincte de la Villa 2 — nom exact à confirmer. */
window.REALISATIONS_VILLAS = [
  {
    slug: 'villa-aurora',
    name: 'Villa Aurora',
    zone: 'Koh Samui · Livrée',
    tag: 'Livrée',
    cover: 'images/realisations/villa-aurora/06.jpg',
    w: 2000, h: 1332,
    count: 14,
    blurb: 'Villa signature sur plusieurs niveaux : piscine à débordement, vue panoramique et home cinéma.',
    href: 'realisations/villa-aurora.html'
  },
  {
    slug: 'stella-del-mare',
    name: 'Stella Del Mare',
    zone: 'Koh Samui · Livrée',
    tag: 'Livrée',
    cover: 'images/realisations/stella-del-mare/01.jpg',
    w: 1600, h: 1199,
    count: 37,
    blurb: 'Villa contemporaine ouverte sur la mer, vaste terrasse et piscine à débordement adossée à la colline.',
    href: 'realisations/stella-del-mare.html'
  },
  {
    slug: 'tropical-golf',
    name: 'Tropical Golf',
    zone: 'Koh Samui · Livrée',
    tag: 'Livrée',
    cover: 'images/realisations/tropical-golf/19.jpg',
    w: 1600, h: 1200,
    count: 24,
    blurb: 'Villa de plain-pied, longue piscine et jardin paysagé planté de cocotiers.',
    href: 'realisations/tropical-golf.html'
  },
  {
    slug: 'tropical-golf-villa-2',
    name: 'Tropical Golf — Villa 2',
    zone: 'Koh Samui · Livrée · À la vente',
    tag: 'À la vente',
    cover: 'images/tropical-golf-v2/hero-dusk.jpg',
    w: 1920, h: 1440,
    files: [
      'hero-dusk.jpg','ext-dusk-2.jpg','pool-courtyard.jpg','ext-day-1.jpg','ext-day-2.jpg',
      'living-pool-view.jpg','living.jpg','kitchen.jpg','dining-outdoor.jpg',
      'bedroom-1.jpg','bedroom-2.jpg','bathroom-1.jpg','bathroom-2.jpg','entrance.jpg'
    ],
    folder: 'images/tropical-golf-v2/',
    blurb: 'Villa 2 chambres livrée et louée, aujourd\'hui proposée à la vente clé en main.',
    href: 'realisations/tropical-golf-villa-2.html'
  }
];
