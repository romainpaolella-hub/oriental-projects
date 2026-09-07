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
  ],
  preview: {select: {title: 'title', subtitle: 'programmeSlug'}},
})
