import {defineType, defineField} from 'sanity'

/**
 * Textes des sous-pages d'un programme (La Résidence, Les Villas, Localisation, Investir).
 * Un document par programme, relié aux pages du site par `programmeSlug`.
 *
 * Le site (js/cms.js) lit ce document sur les pages /<slug>/<sous-page>.html
 * et remplace les éléments porteurs d'un attribut data-cms="…".
 * Tant qu'un champ est vide, le texte du HTML statique reste affiché.
 *
 * Migration progressive : on commence par « La Résidence ».
 */

const specGroup = {
  type: 'object',
  name: 'specGroup',
  title: 'Colonne',
  fields: [
    defineField({name: 'title', title: 'Titre de colonne', type: 'localeString'}),
    defineField({
      name: 'rows',
      title: 'Lignes',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            defineField({name: 'label', title: 'Intitulé', type: 'localeString'}),
            defineField({name: 'value', title: 'Valeur', type: 'localeString'}),
          ],
          preview: {select: {title: 'label.fr', subtitle: 'value.fr'}},
        },
      ],
    }),
  ],
  preview: {select: {title: 'title.fr'}},
}

const numItem = {
  type: 'object',
  name: 'numItem',
  title: 'Élément',
  fields: [
    defineField({name: 'num', title: 'Numéro', type: 'string', description: 'Ex. « 01 »'}),
    defineField({name: 'title', title: 'Titre', type: 'localeString'}),
    defineField({name: 'body', title: 'Texte', type: 'localeText'}),
  ],
  preview: {select: {title: 'title.fr', subtitle: 'num'}},
}

const villaCard = {
  type: 'object',
  name: 'villaCard',
  title: 'Carte',
  fields: [
    defineField({name: 'badge', title: 'Badge', type: 'localeString', description: 'Ex. « Disponible », « Dernière opportunité » (Sea View).'}),
    defineField({name: 'subtitle', title: 'Sous-titre', type: 'localeString', description: 'Ex. « Parcelle 1 · 3 ch · 4 sdb » (Sea View).'}),
    defineField({name: 'zone', title: 'Étiquette', type: 'localeString', description: 'Ex. « Studio-sanctuaire », « 4 unités disponibles » (Eden / Terra).'}),
    defineField({name: 'title', title: 'Titre', type: 'localeString'}),
    defineField({name: 'desc', title: 'Description', type: 'localeText', description: 'Paragraphe (Sea View).'}),
    defineField({
      name: 'specs',
      title: 'Caractéristiques',
      type: 'array',
      description: 'Liste intitulé / valeur (Eden / Terra).',
      of: [
        {
          type: 'object',
          fields: [
            defineField({name: 'label', title: 'Intitulé', type: 'localeString'}),
            defineField({name: 'value', title: 'Valeur', type: 'localeString'}),
          ],
          preview: {select: {title: 'label.fr', subtitle: 'value.fr'}},
        },
      ],
    }),
    defineField({name: 'price', title: 'Prix', type: 'localeString', description: 'Ex. « ฿8 900 000 » / « ฿8,900,000 ». Texte libre (le format peut différer FR / EN).'}),
    defineField({name: 'priceNote', title: 'Mention sous le prix', type: 'localeString', description: 'Ex. « Hors frais de transfert et taxes ».'}),
    defineField({name: 'linkText', title: 'Texte du lien', type: 'localeString', description: 'Ex. « Voir la parcelle · plan → ».'}),
  ],
  preview: {select: {title: 'title.fr', subtitle: 'price'}},
}

export const programmePage = defineType({
  name: 'programmePage',
  title: 'Pages programme (textes)',
  type: 'document',
  groups: [
    {name: 'residence', title: 'La Résidence', default: true},
    {name: 'villas', title: 'Les Villas'},
    {name: 'localisation', title: 'Localisation'},
    {name: 'invest', title: 'Investir'},
  ],
  fields: [
    defineField({
      name: 'title',
      title: 'Programme',
      type: 'string',
      description: 'Ex. « Villa Sea View ». Sert uniquement de repère dans le Studio.',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'programmeSlug',
      title: 'Identifiant du programme',
      type: 'string',
      description: 'Doit correspondre au dossier du site : « sea-view », « eden-tropical » ou « terra-mare ».',
      validation: (r) => r.required(),
    }),

    // ---------------- LA RÉSIDENCE ----------------
    defineField({
      name: 'res_eyebrow',
      title: 'Surtitre',
      type: 'localeString',
      description: 'Petit texte au-dessus du titre. Ex. « L’esprit du lieu ».',
      group: 'residence',
    }),
    defineField({
      name: 'res_heading',
      title: 'Titre de section',
      type: 'localeText',
      group: 'residence',
    }),
    defineField({
      name: 'res_paragraphs',
      title: 'Paragraphes',
      type: 'array',
      of: [{type: 'localeText'}],
      description: 'Les paragraphes de présentation (dans l’ordre).',
      group: 'residence',
    }),
    defineField({
      name: 'res_caption',
      title: 'Légende de l’image pleine largeur',
      type: 'localeText',
      description: 'Uniquement Villa Sea View (phrase en italique sur la photo).',
      group: 'residence',
    }),
    defineField({
      name: 'res_specsIntro',
      title: 'Bloc « ce qui est livré » — surtitre & titre',
      type: 'object',
      description: 'Uniquement Eden Tropical / Terra Mare.',
      group: 'residence',
      fields: [
        defineField({name: 'eyebrow', title: 'Surtitre', type: 'localeString'}),
        defineField({name: 'heading', title: 'Titre', type: 'localeText'}),
      ],
    }),
    defineField({
      name: 'res_specs',
      title: 'Bloc « ce qui est livré » — tableau',
      type: 'array',
      of: [specGroup],
      description: 'Uniquement Eden Tropical / Terra Mare. Deux colonnes (Intérieur / Extérieur…).',
      group: 'residence',
    }),
    defineField({
      name: 'res_specsNote',
      title: 'Bloc « ce qui est livré » — note',
      type: 'localeText',
      group: 'residence',
    }),
    defineField({
      name: 'res_cta',
      title: 'Titre de l’appel à l’action (bas de page)',
      type: 'localeText',
      description: 'Ex. « Recevez le dossier complet de la résidence ».',
      group: 'residence',
    }),

    // ---------------- LES VILLAS ----------------
    defineField({name: 'vil_eyebrow', title: 'Section 1 — surtitre', type: 'localeString', group: 'villas'}),
    defineField({name: 'vil_heading', title: 'Section 1 — titre', type: 'localeText', group: 'villas'}),
    defineField({name: 'vil_body', title: 'Section 1 — texte', type: 'localeText', group: 'villas'}),
    defineField({
      name: 'vil_cards',
      title: 'Cartes (parcelles / typologies)',
      type: 'array',
      of: [villaCard],
      description: 'Dans l’ordre d’affichage. Sea View : 4 parcelles. Eden / Terra : 2 typologies.',
      group: 'villas',
    }),
    defineField({name: 'vil_cardsNote', title: 'Note sous les cartes', type: 'localeText', group: 'villas'}),

    defineField({name: 'vil_archEyebrow', title: 'Bloc Architecture — surtitre', type: 'localeString', description: 'Sea View.', group: 'villas'}),
    defineField({name: 'vil_archHeading', title: 'Bloc Architecture — titre', type: 'localeText', description: 'Sea View.', group: 'villas'}),
    defineField({name: 'vil_arch', title: 'Bloc Architecture — éléments', type: 'array', of: [numItem], description: 'Sea View (3 partis pris).', group: 'villas'}),

    defineField({name: 'vil_specsEyebrow', title: 'Bloc Prestations — surtitre', type: 'localeString', description: 'Sea View.', group: 'villas'}),
    defineField({name: 'vil_specsHeading', title: 'Bloc Prestations — titre', type: 'localeText', description: 'Sea View.', group: 'villas'}),
    defineField({name: 'vil_specs', title: 'Bloc Prestations — tableau', type: 'array', of: [specGroup], description: 'Sea View (Intérieur / Extérieur).', group: 'villas'}),

    defineField({name: 'vil_matEyebrow', title: 'Bloc Matières — surtitre', type: 'localeString', description: 'Sea View.', group: 'villas'}),
    defineField({name: 'vil_matHeading', title: 'Bloc Matières — titre', type: 'localeText', description: 'Sea View.', group: 'villas'}),
    defineField({name: 'vil_matBody', title: 'Bloc Matières — texte', type: 'localeText', description: 'Sea View.', group: 'villas'}),
    defineField({name: 'vil_mat', title: 'Bloc Matières — éléments', type: 'array', of: [numItem], description: 'Sea View (4 matières).', group: 'villas'}),

    defineField({name: 'vil_galEyebrow', title: 'Galerie — surtitre', type: 'localeString', group: 'villas'}),
    defineField({name: 'vil_galHeading', title: 'Galerie — titre', type: 'localeText', group: 'villas'}),
    defineField({name: 'vil_galNote', title: 'Galerie — note', type: 'localeText', description: 'Sea View / Terra.', group: 'villas'}),
    defineField({name: 'vil_galNote2', title: 'Galerie — 2e note', type: 'localeText', description: 'Terra Mare (photos / plans).', group: 'villas'}),

    defineField({name: 'vil_cta', title: 'Titre de l’appel à l’action (bas de page)', type: 'localeText', group: 'villas'}),

    // ---------------- LOCALISATION ----------------
    defineField({name: 'loc_heroEyebrow', title: 'Bandeau — surtitre', type: 'localeString', group: 'localisation'}),
    defineField({name: 'loc_heroTitle', title: 'Bandeau — titre', type: 'localeString', group: 'localisation'}),
    defineField({name: 'loc_eyebrow', title: 'Distances — surtitre', type: 'localeString', group: 'localisation'}),
    defineField({name: 'loc_heading', title: 'Distances — titre', type: 'localeText', group: 'localisation'}),
    defineField({name: 'loc_body', title: 'Distances — texte', type: 'localeText', group: 'localisation'}),
    defineField({
      name: 'loc_distances',
      title: 'Distances — lignes',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            defineField({name: 'label', title: 'Lieu', type: 'localeString'}),
            defineField({name: 'value', title: 'Distance / temps', type: 'localeString'}),
          ],
          preview: {select: {title: 'label.fr', subtitle: 'value.fr'}},
        },
      ],
      group: 'localisation',
    }),
    defineField({name: 'loc_distancesNote', title: 'Distances — note', type: 'localeText', description: 'Sea View / Eden (Terra garde son lien Google Maps).', group: 'localisation'}),
    defineField({name: 'loc_poiEyebrow', title: 'Points d’intérêt — surtitre', type: 'localeString', description: 'Terra Mare.', group: 'localisation'}),
    defineField({name: 'loc_poiHeading', title: 'Points d’intérêt — titre', type: 'localeText', description: 'Terra Mare.', group: 'localisation'}),
    defineField({name: 'loc_poiNote', title: 'Points d’intérêt — note', type: 'localeText', description: 'Terra Mare.', group: 'localisation'}),
    defineField({name: 'loc_islandEyebrow', title: 'Bloc « Pourquoi… » — surtitre', type: 'localeString', group: 'localisation'}),
    defineField({name: 'loc_islandHeading', title: 'Bloc « Pourquoi… » — titre', type: 'localeText', group: 'localisation'}),
    defineField({name: 'loc_island', title: 'Bloc « Pourquoi… » — éléments', type: 'array', of: [numItem], group: 'localisation'}),
    defineField({name: 'loc_cta', title: 'Titre de l’appel à l’action (bas de page)', type: 'localeText', group: 'localisation'}),

    // ---------------- INVESTIR ----------------
    defineField({name: 'inv_heroTitle', title: 'Bandeau — titre', type: 'localeString', group: 'invest'}),
    defineField({name: 'inv_simEyebrow', title: 'Simulateur — surtitre', type: 'localeString', group: 'invest'}),
    defineField({name: 'inv_simHeading', title: 'Simulateur — titre', type: 'localeText', group: 'invest'}),
    defineField({name: 'inv_simBody', title: 'Simulateur — texte', type: 'localeText', group: 'invest'}),
    defineField({name: 'inv_simNote', title: 'Simulateur — note', type: 'localeText', group: 'invest'}),
    defineField({name: 'inv_stepsEyebrow', title: 'Achat sur plan — surtitre', type: 'localeString', group: 'invest'}),
    defineField({name: 'inv_stepsHeading', title: 'Achat sur plan — titre', type: 'localeText', group: 'invest'}),
    defineField({
      name: 'inv_steps',
      title: 'Achat sur plan — jalons',
      type: 'array',
      description: 'Sea View / Eden (6 jalons).',
      of: [
        {
          type: 'object',
          fields: [
            defineField({name: 'pct', title: 'Montant / %', type: 'localeString'}),
            defineField({name: 'label', title: 'Étape', type: 'localeString', description: 'Ex. « Étape 1 »'}),
            defineField({name: 'title', title: 'Titre', type: 'localeString'}),
            defineField({name: 'body', title: 'Texte', type: 'localeText'}),
          ],
          preview: {select: {title: 'title.fr', subtitle: 'pct'}},
        },
      ],
      group: 'invest',
    }),
    defineField({name: 'inv_stepsProse', title: 'Achat sur plan — texte', type: 'localeText', description: 'Terra Mare (paragraphe au lieu des jalons).', group: 'invest'}),
    defineField({name: 'inv_stepsNote', title: 'Achat sur plan — note', type: 'localeText', group: 'invest'}),
    defineField({name: 'inv_leaseEyebrow', title: 'Bail & charges — surtitre', type: 'localeString', group: 'invest'}),
    defineField({name: 'inv_leaseHeading', title: 'Bail & charges — titre', type: 'localeText', group: 'invest'}),
    defineField({name: 'inv_leaseIntro', title: 'Bail & charges — introduction', type: 'localeText', description: 'La mise en gras des chiffres n’est pas conservée.', group: 'invest'}),
    defineField({
      name: 'inv_leaseRows',
      title: 'Bail & charges — grille',
      type: 'array',
      description: 'Sea View / Terra (paliers).',
      of: [
        {
          type: 'object',
          fields: [
            defineField({name: 'label', title: 'Période', type: 'localeString'}),
            defineField({name: 'sublabel', title: 'Précision', type: 'localeString', description: 'Sea View uniquement (petit texte sous la période).'}),
            defineField({name: 'value', title: 'Montant', type: 'localeString'}),
          ],
          preview: {select: {title: 'label.fr', subtitle: 'value'}},
        },
      ],
      group: 'invest',
    }),
    defineField({name: 'inv_leaseTotalLabel', title: 'Bail & charges — libellé du total', type: 'localeString', group: 'invest'}),
    defineField({name: 'inv_leaseTotalValue', title: 'Bail & charges — montant du total', type: 'localeString', group: 'invest'}),
    defineField({name: 'inv_leaseTable', title: 'Bail & charges — tableau', type: 'array', of: [specGroup], description: 'Eden Tropical (Bail du terrain / Entretien & charges).', group: 'invest'}),
    defineField({name: 'inv_leaseNote', title: 'Bail & charges — note', type: 'localeText', group: 'invest'}),
    defineField({name: 'inv_faqEyebrow', title: 'FAQ — surtitre', type: 'localeString', group: 'invest'}),
    defineField({name: 'inv_faqHeading', title: 'FAQ — titre', type: 'localeText', group: 'invest'}),
    defineField({
      name: 'inv_faq',
      title: 'FAQ — questions',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            defineField({name: 'q', title: 'Question', type: 'localeString'}),
            defineField({name: 'a', title: 'Réponse', type: 'localeText'}),
          ],
          preview: {select: {title: 'q.fr'}},
        },
      ],
      group: 'invest',
    }),
    defineField({name: 'inv_faqNote', title: 'FAQ — note', type: 'localeText', group: 'invest'}),
    defineField({name: 'inv_cta', title: 'Titre de l’appel à l’action (bas de page)', type: 'localeText', group: 'invest'}),

    defineField({
      name: 'inv_sim',
      title: 'Simulateur de rendement — paramétrage',
      type: 'object',
      description: 'Alimente le calculateur interactif de la page. Vide = valeurs par défaut de la page.',
      group: 'invest',
      options: {collapsible: true, collapsed: true},
      fields: [
        defineField({name: 'plotLabel', title: 'Libellé du sélecteur', type: 'localeString', description: 'Ex. « Choisissez votre parcelle ».'}),
        defineField({
          name: 'plots',
          title: 'Parcelles / villas',
          type: 'array',
          of: [
            {
              type: 'object',
              fields: [
                defineField({name: 'name', title: 'Nom', type: 'localeString'}),
                defineField({name: 'price', title: 'Prix (฿)', type: 'number'}),
              ],
              preview: {select: {title: 'name.fr', subtitle: 'price'}},
            },
          ],
        }),
        defineField({
          name: 'scenarios',
          title: 'Scénarios locatifs',
          type: 'array',
          of: [
            {
              type: 'object',
              fields: [
                defineField({name: 'name', title: 'Nom', type: 'localeString'}),
                defineField({name: 'nights', title: 'Nuits louées par an', type: 'number'}),
                defineField({name: 'adr', title: 'Prix moyen par nuit (฿)', type: 'number'}),
              ],
              preview: {select: {title: 'name.fr', subtitle: 'nights'}},
            },
          ],
        }),
        defineField({name: 'defaultScenario', title: 'Scénario affiché par défaut', type: 'number', description: '0 = le premier, 1 = le deuxième…', initialValue: 1}),
        defineField({name: 'costs', title: 'Charges & gestion (% du revenu)', type: 'number', initialValue: 35}),
        defineField({name: 'horizons', title: 'Durées de détention (années)', type: 'array', of: [{type: 'number'}], description: 'Ex. 1, 5, 10.'}),
      ],
    }),
  ],
  preview: {select: {title: 'title', subtitle: 'programmeSlug'}},
})
