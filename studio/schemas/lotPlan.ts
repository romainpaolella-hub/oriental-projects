import {defineType, defineField} from 'sanity'

/**
 * Disponibilité des lots — un document par programme (Eden Tropical,
 * Terra Mare, Villa Sea View), lu et modifié directement par le plan
 * interactif (plan-des-lots.html) de chaque programme.
 *
 * La géométrie des lots (position sur le plan, surface, typologie) reste
 * dans le fichier HTML — seuls le statut et le prix, les deux champs que
 * le client modifie régulièrement, vivent ici. Le plan lit ce document au
 * chargement (API publique, lecture seule) et écrit ses changements via
 * la fonction Netlify /api/lots (jeton d'écriture côté serveur, jamais
 * exposé au navigateur) protégée par un mot de passe — voir netlify/functions/lots.js.
 */

const lotStatus = {
  type: 'object',
  name: 'lotStatus',
  title: 'Lot',
  fields: [
    defineField({name: 'lotId', title: 'Identifiant du lot', type: 'string', description: 'Doit correspondre exactement à l’identifiant utilisé sur le plan (ex. « 4 », « 12+ »).', validation: (r) => r.required()}),
    defineField({
      name: 'status',
      title: 'Statut',
      type: 'string',
      options: {list: [
        {title: 'Disponible', value: 'available'},
        {title: 'Réservé', value: 'reserved'},
        {title: 'Vendu', value: 'sold'},
      ], layout: 'radio'},
      initialValue: 'available',
    }),
    defineField({name: 'price', title: 'Prix (texte libre, optionnel)', type: 'string', description: 'Laisser vide pour garder le prix par défaut du programme.'}),
    defineField({
      name: 'box',
      title: 'Position sur le plan (optionnel)',
      description: 'Terra Mare uniquement : [gauche%, haut%, largeur%, hauteur%] — écrit automatiquement quand le lot est déplacé/redimensionné en Mode gestion. Laisser vide ailleurs.',
      type: 'array',
      of: [{type: 'number'}],
      validation: (r) => r.length(4).warning('Attendu : 4 nombres [gauche, haut, largeur, hauteur]'),
    }),
  ],
  preview: {select: {title: 'lotId', subtitle: 'status'}},
}

export const lotPlan = defineType({
  name: 'lotPlan',
  title: 'Plan des lots (disponibilité)',
  type: 'document',
  fields: [
    defineField({
      name: 'programmeSlug',
      title: 'Programme',
      type: 'string',
      options: {list: [
        {title: 'Eden Tropical', value: 'eden-tropical'},
        {title: 'Terra Mare', value: 'terra-mare'},
        {title: 'Villa Sea View', value: 'sea-view'},
      ]},
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'lots',
      title: 'Lots',
      type: 'array',
      of: [lotStatus],
    }),
    defineField({name: 'updatedAt', title: 'Dernière modification', type: 'datetime', readOnly: true}),
  ],
  preview: {
    select: {title: 'programmeSlug', count: 'lots'},
    prepare: ({title, count}) => ({title, subtitle: (count ? count.length : 0) + ' lot(s)'}),
  },
})
