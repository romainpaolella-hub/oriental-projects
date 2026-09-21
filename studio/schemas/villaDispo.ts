import {defineType, defineField} from 'sanity'

/**
 * Villa clé en main (à vendre) — carte de la page « Villas disponibles »
 * ET, depuis la Phase 2 du back-office, le contenu de sa fiche détaillée
 * (villas-a-vendre/<slug>.html), reliée par `linkHref`.
 *
 * Le site (js/cms.js → OD_renderVillaDispoPage) lit les champs `page*`
 * ci-dessous et remplace les éléments porteurs d'un attribut data-cms="…"
 * sur la fiche. Tant qu'un champ page* est vide, le texte du HTML statique
 * reste affiché — rien ne casse si une fiche n'a pas encore été enrichie.
 */

const factRow = {
  type: 'object',
  name: 'factRow',
  title: 'Chiffre clé',
  fields: [
    defineField({name: 'value', title: 'Valeur', type: 'localeString', description: 'Ex. « 150 m² », « 3/3 », « 8 × 3 m »'}),
    defineField({name: 'label', title: 'Légende', type: 'localeString', description: 'Ex. « Surface habitable »'}),
  ],
  preview: {select: {title: 'value.fr', subtitle: 'label.fr'}},
}

const specGroup = {
  type: 'object',
  name: 'specGroupVilla',
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

export const villaDispo = defineType({
  name: 'villaDispo',
  title: 'Villa clé en main (à vendre)',
  type: 'document',
  groups: [
    {name: 'card', title: 'Carte (liste)', default: true},
    {name: 'page', title: 'Fiche complète'},
  ],
  fields: [
    defineField({name: 'name', title: 'Nom', type: 'string', validation: (r) => r.required(), group: 'card'}),
    defineField({name: 'order', title: 'Ordre d’affichage', type: 'number', initialValue: 10, validation: (r) => r.required(), group: 'card'}),
    defineField({
      name: 'isPlaceholder',
      title: 'À venir (carte grisée)',
      description: 'Coche pour une villa annoncée mais pas encore en vente : seuls le nom et une note s’affichent.',
      type: 'boolean',
      initialValue: false,
      group: 'card',
    }),
    defineField({
      name: 'note',
      title: 'Note « à venir »',
      type: 'localeString',
      description: 'Ex. « Même résidence · bientôt disponible »',
      hidden: ({parent}) => !parent?.isPlaceholder,
      group: 'card',
    }),

    defineField({
      name: 'images',
      title: 'Photos',
      type: 'array',
      of: [{type: 'image', options: {hotspot: true}, fields: [{name: 'alt', title: 'Description', type: 'localeString'}]}],
      hidden: ({parent}) => parent?.isPlaceholder,
      group: 'card',
    }),
    defineField({
      name: 'specs',
      title: 'Caractéristiques',
      description: 'Ex. « ≈ 250 m² bâtis », « Piscine 7,5 × 3,5 m », « 3 ch. · 3 sdb »',
      type: 'array',
      of: [{type: 'localeString'}],
      hidden: ({parent}) => parent?.isPlaceholder,
      group: 'card',
    }),
    defineField({name: 'statusLabel', title: 'Étiquette de statut', type: 'localeString', description: 'Ex. « Disponible »', hidden: ({parent}) => parent?.isPlaceholder, group: 'card'}),
    defineField({name: 'price', title: 'Prix (฿)', type: 'number', hidden: ({parent}) => parent?.isPlaceholder, group: 'card'}),
    defineField({name: 'rentMonthly', title: 'Loyer mensuel actuel (฿)', type: 'number', hidden: ({parent}) => parent?.isPlaceholder, group: 'card'}),
    defineField({name: 'simCosts', title: 'Simulateur — charges & gestion (%)', type: 'number', initialValue: 30, description: 'Alimente le calculateur de rendement de la fiche (le prix et le loyer ci-dessus servent aussi de base).', hidden: ({parent}) => parent?.isPlaceholder, group: 'card'}),
    defineField({name: 'brochureFr', title: 'Brochure — Français (PDF)', type: 'file', options: {accept: 'application/pdf'}, hidden: ({parent}) => parent?.isPlaceholder, group: 'card'}),
    defineField({name: 'brochureEn', title: 'Brochure — English (PDF)', type: 'file', options: {accept: 'application/pdf'}, hidden: ({parent}) => parent?.isPlaceholder, group: 'card'}),
    defineField({
      name: 'linkHref',
      title: 'Lien de la fiche',
      type: 'string',
      description: 'Ex. « villas-a-vendre/tropical-golf-villa-2.html ». Vide = bouton vers la page contact. Doit correspondre exactement à l’URL de la fiche pour que les champs « Fiche complète » ci-dessous s’y appliquent.',
      hidden: ({parent}) => parent?.isPlaceholder,
      group: 'card',
    }),

    // ---------------------------------------------------------------
    // FICHE COMPLÈTE — contenu de villas-a-vendre/<slug>.html
    // ---------------------------------------------------------------
    defineField({name: 'pageHeroEyebrow', title: 'Hero — surtitre', type: 'localeString', description: 'Ex. « Neuve · disponible », « Clé en main · disponible »', group: 'page'}),
    defineField({name: 'pageHeroSub', title: 'Hero — sous-titre', type: 'localeText', group: 'page'}),

    defineField({name: 'pagePresEyebrow', title: 'Présentation — surtitre', type: 'localeString', description: 'Ex. « La villa »', group: 'page'}),
    defineField({name: 'pagePresHeading', title: 'Présentation — titre', type: 'localeString', group: 'page'}),
    defineField({name: 'pagePresBody', title: 'Présentation — texte', type: 'localeText', group: 'page'}),

    defineField({name: 'pageRevenueBig', title: 'Encart prix — ligne principale', type: 'localeString', description: 'Ex. « ฿11 900 000 ». Vide = utilise le champ Prix ci-dessus, formaté automatiquement.', group: 'page'}),
    defineField({name: 'pageRevenueNote', title: 'Encart prix — ligne secondaire', type: 'localeString', description: 'Ex. « Vendue avec société thaïlandaise » ou « Loué ฿80 000 / mois · ≈ 12,0 % de rendement brut »', group: 'page'}),
    defineField({name: 'pageLegalNote', title: 'Encart prix — mention légale', type: 'localeString', description: 'Ex. « Statut juridique communiqué sur demande. Frais de transfert et taxes chiffrés séparément. »', group: 'page'}),

    defineField({
      name: 'pageFacts',
      title: 'Chiffres clés (bandeau sous l’encart prix)',
      description: '4 chiffres, ex. Surface habitable / Chambres-sdb / Piscine / Terrain.',
      type: 'array',
      of: [factRow],
      group: 'page',
    }),

    defineField({name: 'pageGalleryNote', title: 'Galerie — légende', type: 'localeString', description: 'Ex. « Photographies de la villa achevée. »', group: 'page'}),

    defineField({name: 'pageSpecsHeading', title: '« Ce qui est inclus » — titre', type: 'localeString', group: 'page'}),
    defineField({
      name: 'pageSpecs',
      title: '« Ce qui est inclus » — tableau (2 colonnes)',
      type: 'array',
      of: [specGroup],
      group: 'page',
    }),
    defineField({name: 'pageSpecsNote', title: '« Ce qui est inclus » — note de bas de tableau', type: 'localeText', group: 'page'}),

    defineField({name: 'pageLocHeading', title: 'Localisation — titre', type: 'localeString', group: 'page'}),
    defineField({name: 'pageLocBody', title: 'Localisation — texte', type: 'localeText', group: 'page'}),
    defineField({
      name: 'pageLocFacts',
      title: 'Localisation — distances (optionnel)',
      description: 'Ex. « 1 min · Golf de Santiburi (100 m) ». Laisser vide si la fiche n’a pas ce bandeau (cas des villas déjà louées).',
      type: 'array',
      of: [factRow],
      group: 'page',
    }),
    defineField({name: 'pageMapQuery', title: 'Localisation — recherche carte Google Maps', type: 'string', description: 'Adresse ou « lat,lng » utilisée dans l’URL de la carte intégrée.', group: 'page'}),
    defineField({name: 'pageMapNote', title: 'Localisation — note sous la carte', type: 'localeText', group: 'page'}),

    defineField({name: 'pageSimIntro', title: 'Simulateur locatif — texte d’intro (optionnel)', description: 'Uniquement pour une villa déjà louée avec calculateur de rendement.', type: 'localeText', group: 'page'}),

    defineField({name: 'pageCtaHeading', title: 'Appel à l’action final — titre', type: 'localeString', group: 'page'}),
    defineField({name: 'pageCtaBody', title: 'Appel à l’action final — texte', type: 'localeText', group: 'page'}),
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
