import {defineType, defineField} from 'sanity'

/**
 * Demande de brochure. Créé automatiquement par la fonction Netlify
 * (netlify/functions/brochure.js) dans le dataset "leads" (privé).
 * L’équipe le complète : statut + notes internes.
 */
export const lead = defineType({
  name: 'lead',
  title: 'Demande de brochure',
  type: 'document',
  fields: [
    defineField({
      name: 'status',
      title: 'Statut',
      type: 'string',
      options: {
        list: [
          {title: '🔵 Nouveau', value: 'nouveau'},
          {title: '🟡 Contacté', value: 'contacte'},
          {title: '🟠 Relancé', value: 'relance'},
          {title: '🟢 Converti', value: 'converti'},
          {title: '⚫ Perdu', value: 'perdu'},
        ],
        layout: 'radio',
      },
      initialValue: 'nouveau',
    }),
    defineField({name: 'notes', title: 'Notes internes', type: 'text', rows: 4}),

    defineField({name: 'name', title: 'Nom', type: 'string', readOnly: true}),
    defineField({name: 'email', title: 'E-mail', type: 'string', readOnly: true}),
    defineField({name: 'phone', title: 'Téléphone', type: 'string', readOnly: true}),
    defineField({name: 'country', title: 'Pays', type: 'string', readOnly: true}),
    defineField({name: 'programme', title: 'Programme demandé', type: 'string', readOnly: true}),
    defineField({name: 'brochureLang', title: 'Langue de la brochure', type: 'string', readOnly: true}),
    defineField({name: 'intention', title: 'Intention', type: 'string', readOnly: true}),
    defineField({name: 'message', title: 'Message', type: 'text', rows: 3, readOnly: true}),
    defineField({name: 'pageUrl', title: 'Page d’origine', type: 'string', readOnly: true}),
    defineField({name: 'createdAt', title: 'Reçu le', type: 'datetime', readOnly: true}),
  ],
  orderings: [
    {title: 'Plus récent', name: 'recent', by: [{field: 'createdAt', direction: 'desc'}]},
    {title: 'Statut', name: 'status', by: [{field: 'status', direction: 'asc'}, {field: 'createdAt', direction: 'desc'}]},
  ],
  preview: {
    select: {name: 'name', programme: 'programme', status: 'status', date: 'createdAt'},
    prepare: ({name, programme, status, date}) => ({
      title: `${name || 'Sans nom'} — ${programme || '?'}`,
      subtitle: `${status || 'nouveau'}${date ? ' · ' + new Date(date).toLocaleDateString('fr-FR') : ''}`,
    }),
  },
})
