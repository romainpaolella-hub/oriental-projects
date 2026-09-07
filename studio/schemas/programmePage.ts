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
  ],
  preview: {select: {title: 'title', subtitle: 'programmeSlug'}},
})
