import {defineType, defineField} from 'sanity'

export const villaDispo = defineType({
  name: 'villaDispo',
  title: 'Villa clé en main (à vendre)',
  type: 'document',
  fields: [
    defineField({name: 'name', title: 'Nom', type: 'string', validation: (r) => r.required()}),
    defineField({name: 'order', title: 'Ordre d’affichage', type: 'number', initialValue: 10, validation: (r) => r.required()}),
    defineField({
      name: 'isPlaceholder',
      title: 'À venir (carte grisée)',
      description: 'Coche pour une villa annoncée mais pas encore en vente : seuls le nom et une note s’affichent.',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'note',
      title: 'Note « à venir »',
      type: 'localeString',
      description: 'Ex. « Même résidence · bientôt disponible »',
      hidden: ({parent}) => !parent?.isPlaceholder,
    }),

    defineField({
      name: 'images',
      title: 'Photos',
      type: 'array',
      of: [{type: 'image', options: {hotspot: true}, fields: [{name: 'alt', title: 'Description', type: 'localeString'}]}],
      hidden: ({parent}) => parent?.isPlaceholder,
    }),
    defineField({
      name: 'specs',
      title: 'Caractéristiques',
      description: 'Ex. « ≈ 250 m² bâtis », « Piscine 7,5 × 3,5 m », « 3 ch. · 3 sdb »',
      type: 'array',
      of: [{type: 'localeString'}],
      hidden: ({parent}) => parent?.isPlaceholder,
    }),
    defineField({name: 'statusLabel', title: 'Étiquette de statut', type: 'localeString', description: 'Ex. « Disponible »', hidden: ({parent}) => parent?.isPlaceholder}),
    defineField({name: 'price', title: 'Prix (฿)', type: 'number', hidden: ({parent}) => parent?.isPlaceholder}),
    defineField({name: 'rentMonthly', title: 'Loyer mensuel actuel (฿)', type: 'number', hidden: ({parent}) => parent?.isPlaceholder}),
    defineField({
      name: 'linkHref',
      title: 'Lien de la fiche',
      type: 'string',
      description: 'Ex. « villas-a-vendre/tropical-golf-villa-2.html ». Vide = bouton vers la page contact.',
      hidden: ({parent}) => parent?.isPlaceholder,
    }),
  ],
  orderings: [{title: 'Ordre', name: 'order', by: [{field: 'order', direction: 'asc'}]}],
  preview: {
    select: {title: 'name', price: 'price', placeholder: 'isPlaceholder', media: 'images.0'},
    prepare: ({title, price, placeholder, media}) => ({
      title,
      subtitle: placeholder ? 'À venir' : price ? `฿${price.toLocaleString('fr-FR')}` : '—',
      media,
    }),
  },
})
