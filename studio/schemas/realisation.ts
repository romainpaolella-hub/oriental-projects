import {defineType, defineField} from 'sanity'

export const realisation = defineType({
  name: 'realisation',
  title: 'Réalisation (villa livrée)',
  type: 'document',
  fields: [
    defineField({name: 'name', title: 'Nom', type: 'string', validation: (r) => r.required()}),
    defineField({
      name: 'slug',
      title: 'Identifiant',
      type: 'slug',
      options: {source: 'name'},
      description: 'Ex. « villa-aurora ». Correspond à realisations/<slug>.html.',
      validation: (r) => r.required(),
    }),
    defineField({name: 'order', title: 'Ordre d’affichage', type: 'number', initialValue: 10, validation: (r) => r.required()}),
    defineField({name: 'zone', title: 'Ligne d’info', type: 'localeString', description: 'Ex. « Koh Samui · Livrée »'}),
    defineField({name: 'tag', title: 'Badge', type: 'localeString', description: 'Ex. « Livrée », « À la vente »'}),
    defineField({name: 'blurb', title: 'Description courte', type: 'localeText'}),
    defineField({name: 'cover', title: 'Photo de couverture', type: 'image', options: {hotspot: true}, validation: (r) => r.required()}),
    defineField({
      name: 'gallery',
      title: 'Galerie photos',
      type: 'array',
      of: [{type: 'image', options: {hotspot: true}, fields: [{name: 'alt', title: 'Description', type: 'localeString'}]}],
    }),
    defineField({
      name: 'linkHref',
      title: 'Lien de la page',
      type: 'string',
      description: 'Ex. « realisations/villa-aurora.html »',
    }),
  ],
  orderings: [{title: 'Ordre', name: 'order', by: [{field: 'order', direction: 'asc'}]}],
  preview: {select: {title: 'name', subtitle: 'zone.fr', media: 'cover'}},
})
