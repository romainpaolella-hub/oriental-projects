import {defineType, defineField} from 'sanity'

export const heroSlide = defineType({
  name: 'heroSlide',
  title: 'Diapo du carrousel d’accueil',
  type: 'document',
  fields: [
    defineField({
      name: 'order',
      title: 'Ordre',
      type: 'number',
      validation: (r) => r.required(),
      initialValue: 10,
    }),
    defineField({
      name: 'brand',
      title: 'Diapo de marque',
      description: 'La première diapo : fond vidéo nu + logo « ORIENTAL PROJECTS » superposé. Un seul bouton, pas de titre.',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'kind',
      title: 'Type de fond',
      type: 'string',
      options: {list: [{title: 'Vidéo', value: 'video'}, {title: 'Image', value: 'image'}], layout: 'radio'},
      initialValue: 'video',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'video',
      title: 'Vidéo de fond (MP4)',
      type: 'file',
      options: {accept: 'video/mp4'},
      hidden: ({parent}) => parent?.kind !== 'video',
    }),
    defineField({
      name: 'poster',
      title: 'Image d’attente de la vidéo',
      type: 'image',
      options: {hotspot: true},
      hidden: ({parent}) => parent?.kind !== 'video',
    }),
    defineField({
      name: 'image',
      title: 'Image de fond',
      type: 'image',
      options: {hotspot: true},
      hidden: ({parent}) => parent?.kind !== 'image',
    }),
    defineField({name: 'kicker', title: 'Surétiquette', type: 'localeString', description: 'Ex. « Programme neuf · Ban Tai »', hidden: ({parent}) => parent?.brand}),
    defineField({name: 'title', title: 'Titre', type: 'string', hidden: ({parent}) => parent?.brand}),
    defineField({name: 'sub', title: 'Sous-titre', type: 'localeString', hidden: ({parent}) => parent?.brand}),
    defineField({name: 'cta', title: 'Texte du bouton', type: 'localeString', validation: (r) => r.required()}),
    defineField({
      name: 'linkHref',
      title: 'Lien du bouton',
      type: 'string',
      description: 'Ex. « sea-view/index.html » ou « index.html#programmes »',
      validation: (r) => r.required(),
    }),
  ],
  orderings: [{title: 'Ordre', name: 'order', by: [{field: 'order', direction: 'asc'}]}],
  preview: {
    select: {title: 'title', brand: 'brand', order: 'order', media: 'poster'},
    prepare: ({title, brand, order, media}) => ({
      title: brand ? 'Diapo de marque' : title || 'Diapo',
      subtitle: `Ordre ${order}`,
      media,
    }),
  },
})
