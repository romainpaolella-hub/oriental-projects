import {defineType, defineField} from 'sanity'

export const programme = defineType({
  name: 'programme',
  title: 'Programme',
  type: 'document',
  groups: [
    {name: 'card', title: 'Fiche (accueil)', default: true},
    {name: 'media', title: 'Vidéo & photos'},
    {name: 'invest', title: 'Simulateur'},
    {name: 'files', title: 'Brochures'},
  ],
  fields: [
    defineField({name: 'name', title: 'Nom', type: 'string', group: 'card', validation: (r) => r.required()}),
    defineField({
      name: 'slug',
      title: 'Identifiant (dossier du site)',
      type: 'slug',
      options: {source: 'name'},
      description: 'Ex. « sea-view », « eden-tropical », « terra-mare ». Doit correspondre au dossier des pages.',
      group: 'card',
      validation: (r) => r.required(),
    }),
    defineField({name: 'zone', title: 'Quartier', type: 'string', description: 'Ex. « Ban Tai, Koh Samui »', group: 'card'}),
    defineField({name: 'order', title: 'Ordre d’affichage', type: 'number', initialValue: 10, group: 'card', validation: (r) => r.required()}),
    defineField({
      name: 'status',
      title: 'Statut',
      type: 'string',
      options: {list: [{title: 'Sur plan', value: 'plan'}, {title: 'Livré', value: 'livre'}], layout: 'radio'},
      initialValue: 'plan',
      group: 'card',
    }),
    defineField({name: 'statusLabel', title: 'Étiquette de statut', type: 'localeString', description: 'Ex. « Sur plan »', group: 'card'}),
    defineField({name: 'pitch', title: 'Accroche (fiche accueil)', type: 'localeText', group: 'card', validation: (r) => r.required()}),
    defineField({
      name: 'facts',
      title: 'Points clés (4 max)',
      description: 'Ex. « 04 villas », « 332 m² bâtis », « dès ฿8,9 M », « Leasehold »',
      type: 'array',
      of: [{type: 'localeString'}],
      validation: (r) => r.max(6),
      group: 'card',
    }),
    defineField({name: 'cardImage', title: 'Image de la fiche (accueil)', type: 'image', options: {hotspot: true}, group: 'card'}),

    defineField({name: 'heroVideo', title: 'Vidéo hero (MP4)', type: 'file', options: {accept: 'video/mp4'}, group: 'media'}),
    defineField({name: 'heroPoster', title: 'Image d’attente de la vidéo hero', type: 'image', options: {hotspot: true}, group: 'media'}),
    defineField({
      name: 'gallery',
      title: 'Galerie photos (pages du programme)',
      type: 'array',
      of: [
        {
          type: 'image',
          options: {hotspot: true},
          fields: [{name: 'alt', title: 'Description', type: 'localeString'}],
        },
      ],
      group: 'media',
    }),

    defineField({
      name: 'sim',
      title: 'Simulateur de rendement',
      type: 'object',
      group: 'invest',
      fields: [
        defineField({
          name: 'types',
          title: 'Typologies',
          type: 'array',
          of: [
            {
              type: 'object',
              fields: [
                defineField({name: 'name', title: 'Nom', type: 'localeString'}),
                defineField({name: 'price', title: 'Prix (฿)', type: 'number'}),
                defineField({name: 'rent', title: 'Loyer mensuel estimé (฿)', type: 'number'}),
              ],
              preview: {select: {title: 'name.fr', subtitle: 'price'}},
            },
          ],
        }),
        defineField({name: 'costs', title: 'Charges & gestion (% du revenu)', type: 'number', initialValue: 35}),
      ],
    }),

    defineField({name: 'brochureFr', title: 'Brochure — Français (PDF)', type: 'file', options: {accept: 'application/pdf'}, group: 'files'}),
    defineField({name: 'brochureEn', title: 'Brochure — English (PDF)', type: 'file', options: {accept: 'application/pdf'}, group: 'files'}),
  ],
  orderings: [{title: 'Ordre', name: 'order', by: [{field: 'order', direction: 'asc'}]}],
  preview: {select: {title: 'name', subtitle: 'zone', media: 'cardImage'}},
})
