import {defineType, defineField} from 'sanity'

export const siteSettings = defineType({
  name: 'siteSettings',
  title: 'Réglages du site',
  type: 'document',
  // singleton : un seul document, pas de bouton "créer"
  fields: [
    defineField({
      name: 'stats',
      title: 'Bandeau de chiffres (accueil)',
      description: 'Section sombre « 18 ans d’expérience ». Remplace les « xx » par les vrais chiffres.',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            defineField({name: 'value', title: 'Chiffre', type: 'string', validation: (r) => r.required()}),
            defineField({name: 'label', title: 'Libellé', type: 'localeString', validation: (r) => r.required()}),
          ],
          preview: {select: {title: 'value', subtitle: 'label.fr'}},
        },
      ],
      validation: (r) => r.max(6),
    }),
    defineField({
      name: 'phones',
      title: 'Téléphones / WhatsApp',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            defineField({name: 'label', title: 'Intitulé', type: 'string', description: 'Ex. « Jean-David », « Équipe EU »'}),
            defineField({name: 'number', title: 'Numéro affiché', type: 'string', description: 'Ex. +66 655 767 871'}),
            defineField({name: 'whatsapp', title: 'Numéro WhatsApp (chiffres seuls)', type: 'string', description: 'Ex. 66655767871'}),
          ],
          preview: {select: {title: 'label', subtitle: 'number'}},
        },
      ],
    }),
    defineField({name: 'email', title: 'E-mail de contact affiché', type: 'string'}),
  ],
  preview: {prepare: () => ({title: 'Réglages du site'})},
})
