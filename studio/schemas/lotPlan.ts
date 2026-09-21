import {defineType, defineField} from 'sanity'

/**
 * Disponibilité des lots — un document par programme (Eden Tropical,
 * Terra Mare, Villa Sea View, et tout nouveau programme), lu et modifié
 * directement par le plan interactif (plan-des-lots.html) de chaque programme.
 *
 * Pour Eden Tropical / Terra Mare / Villa Sea View, la géométrie des lots
 * (position sur le plan, surface, typologie) reste dans leur fichier HTML —
 * seuls le statut et le prix vivent ici. Pour un nouveau programme (page
 * générique, Phase D), TOUT vient de ce document, y compris l'image de fond
 * (planImage) et la géométrie de chaque lot (box) : le champ `lots` y est
 * écrit automatiquement par le plan interactif (Mode gestion, ajout /
 * déplacement / suppression de lot) — ce n'est pas destiné à être rempli à
 * la main ici. Le plan lit ce document au chargement (API publique, lecture
 * seule) et écrit ses changements via la fonction Netlify /api/lots (jeton
 * d'écriture côté serveur, jamais exposé au navigateur) protégée par un mot
 * de passe — voir netlify/functions/lots.js.
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
    defineField({name: 'name', title: 'Nom du lot (optionnel)', type: 'string', description: 'Nouveau programme uniquement. Ex. « Villa 3 chambres ». Laisser vide pour afficher juste l’identifiant.'}),
    defineField({
      name: 'specs',
      title: 'Caractéristiques (optionnel)',
      description: 'Nouveau programme uniquement. Liste intitulé / valeur libre (ex. « Surface » / « 130 m² »).',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            defineField({name: 'label', title: 'Intitulé', type: 'string'}),
            defineField({name: 'value', title: 'Valeur', type: 'string'}),
          ],
          preview: {select: {title: 'label', subtitle: 'value'}},
        },
      ],
    }),
    defineField({
      name: 'box',
      title: 'Position sur le plan (optionnel)',
      description: 'Terra Mare et nouveaux programmes : [gauche%, haut%, largeur%, hauteur%] — écrit automatiquement quand le lot est déplacé/redimensionné en Mode gestion. Laisser vide ailleurs.',
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
      title: 'Identifiant du programme',
      type: 'string',
      description: 'Doit correspondre au dossier du site : « sea-view », « eden-tropical », « terra-mare », ou l’identifiant d’un nouveau programme.',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'planImage',
      title: 'Image du plan (nouveau programme)',
      type: 'image',
      options: {hotspot: true},
      description: 'Uniquement pour un nouveau programme sans plan déjà en place. Vide = image de repli neutre affichée.',
    }),
    defineField({
      name: 'lots',
      title: 'Lots',
      type: 'array',
      of: [lotStatus],
      description: 'Pour un nouveau programme, ne pas remplir ici — utiliser le Mode gestion sur la page publique du plan (ajout, positionnement, statut, prix).',
    }),
    defineField({name: 'updatedAt', title: 'Dernière modification', type: 'datetime', readOnly: true}),
  ],
  preview: {
    select: {title: 'programmeSlug', count: 'lots'},
    prepare: ({title, count}) => ({title, subtitle: (count ? count.length : 0) + ' lot(s)'}),
  },
})
