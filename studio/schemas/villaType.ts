import {defineType, defineField} from 'sanity'

/**
 * Typologie de villa (Eden Tropical / Terra Mare) ou parcelle (Sea View) d'un programme —
 * carte de la grille villas.html ET, si un modèle générique la prend en charge (linkHref
 * sans page dédiée existante), le contenu de sa fiche détaillée.
 *
 * S'ajoute aux typologies/parcelles déjà en place (vil_cards sur programmePage) sans les
 * remplacer : les 8 pages existantes (Eden ×2, Terra ×2, Sea View ×4) restent des fichiers
 * statiques inchangés. Ce type ne sert qu'aux typologies/parcelles ajoutées à partir de
 * maintenant.
 *
 * Le site (js/cms.js → OD_renderVillaTypePage) lit les champs `page*` ci-dessous et
 * remplace les éléments porteurs d'un attribut data-cms="…" sur la fiche. Tant qu'un champ
 * page* est vide, le texte du modèle générique reste affiché.
 */

const factRow = {
  type: 'object',
  name: 'factRowType',
  title: 'Chiffre clé',
  fields: [
    defineField({name: 'value', title: 'Valeur', type: 'localeString', description: 'Ex. « 150 m² », « 3/3 », « 8 × 3 m »'}),
    defineField({name: 'label', title: 'Légende', type: 'localeString', description: 'Ex. « Surface habitable »'}),
  ],
  preview: {select: {title: 'value.fr', subtitle: 'label.fr'}},
}

const specGroup = {
  type: 'object',
  name: 'specGroupType',
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

export const villaType = defineType({
  name: 'villaType',
  title: 'Typologie / parcelle (programme)',
  type: 'document',
  groups: [
    {name: 'card', title: 'Carte (liste)', default: true},
    {name: 'page', title: 'Fiche complète'},
  ],
  fields: [
    defineField({
      name: 'programmeSlug',
      title: 'Identifiant du programme',
      type: 'string',
      description: 'Doit correspondre au dossier du site : « sea-view », « eden-tropical », « terra-mare », ou l’identifiant d’un nouveau programme.',
      validation: (r) => r.required(),
      group: 'card',
    }),
    defineField({name: 'name', title: 'Nom', type: 'string', description: 'Ex. « Villa 2 Chambres », « Parcelle 5 ». Affiché sur la carte et la fiche.', validation: (r) => r.required(), group: 'card'}),
    defineField({name: 'order', title: 'Ordre d’affichage', type: 'number', initialValue: 10, validation: (r) => r.required(), group: 'card'}),
    defineField({
      name: 'linkHref',
      title: 'Lien de la fiche',
      type: 'string',
      description: 'Ex. « villa-4-chambres.html » ou « parcelle-5.html » — chemin relatif au dossier du programme, sans espaces ni accents. Vide = pas de lien depuis la carte. Pour une nouvelle typologie/parcelle, ce chemin devient directement l’adresse de la page (FR et EN) — inutile de faire créer la page par le développeur.',
      group: 'card',
    }),

    defineField({
      name: 'images',
      title: 'Photos',
      description: 'La première photo alimente la carte ; toutes alimentent la fiche (photo principale, photo de présentation, galerie complète).',
      type: 'array',
      of: [{type: 'image', options: {hotspot: true}, fields: [{name: 'alt', title: 'Description', type: 'localeString'}]}],
      group: 'card',
    }),
    defineField({name: 'badge', title: 'Badge', type: 'localeString', description: 'Ex. « Disponible », « Dernière opportunité » (format parcelle).', group: 'card'}),
    defineField({name: 'subtitle', title: 'Sous-titre', type: 'localeString', description: 'Ex. « Parcelle 5 · 3 ch · 4 sdb » (format parcelle).', group: 'card'}),
    defineField({name: 'zone', title: 'Étiquette', type: 'localeString', description: 'Ex. « 4 unités disponibles » (format typologie).', group: 'card'}),
    defineField({name: 'desc', title: 'Description courte', type: 'localeText', description: 'Paragraphe (format parcelle).', group: 'card'}),
    defineField({
      name: 'specs',
      title: 'Caractéristiques',
      type: 'array',
      description: 'Liste intitulé / valeur (format typologie).',
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
    defineField({name: 'price', title: 'Prix', type: 'localeString', description: 'Ex. « dès ฿9 300 000 » / « from ฿9,300,000 ». Texte libre (le format peut différer FR / EN).', group: 'card'}),
    defineField({name: 'priceNote', title: 'Mention sous le prix', type: 'localeString', description: 'Ex. « Hors frais de transfert et taxes ».', group: 'card'}),
    defineField({name: 'linkText', title: 'Texte du lien (carte)', type: 'localeString', description: 'Ex. « Voir la villa · plan & implantation → ».', group: 'card'}),

    // ---------------------------------------------------------------
    // FICHE COMPLÈTE — contenu du modèle générique <programme>/<slug>.html
    // ---------------------------------------------------------------
    defineField({name: 'pageHeroEyebrow', title: 'Hero — surtitre', type: 'localeString', description: 'Ex. « Disponible »', group: 'page'}),
    defineField({name: 'pageHeroSub', title: 'Hero — sous-titre', type: 'localeText', group: 'page'}),

    defineField({name: 'pagePresEyebrow', title: 'Présentation — surtitre', type: 'localeString', group: 'page'}),
    defineField({name: 'pagePresHeading', title: 'Présentation — titre', type: 'localeString', group: 'page'}),
    defineField({name: 'pagePresBody', title: 'Présentation — texte', type: 'localeText', group: 'page'}),

    defineField({name: 'pageRevenueBig', title: 'Encart prix — ligne principale', type: 'localeString', description: 'Vide = utilise le champ Prix ci-dessus.', group: 'page'}),
    defineField({name: 'pageRevenueNote', title: 'Encart prix — ligne secondaire', type: 'localeString', group: 'page'}),
    defineField({name: 'pageLegalNote', title: 'Encart prix — mention légale', type: 'localeString', group: 'page'}),

    defineField({
      name: 'pageFacts',
      title: 'Chiffres clés (bandeau sous l’encart prix)',
      description: '4 chiffres, ex. Surface / Chambres-sdb / Piscine / Statut.',
      type: 'array',
      of: [factRow],
      group: 'page',
    }),

    defineField({name: 'pageGalleryNote', title: 'Galerie — légende', type: 'localeString', group: 'page'}),

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
    defineField({name: 'pageMapQuery', title: 'Localisation — recherche carte Google Maps', type: 'string', description: 'Adresse ou « lat,lng ».', group: 'page'}),
    defineField({name: 'pageMapNote', title: 'Localisation — note sous la carte', type: 'localeText', group: 'page'}),

    defineField({name: 'pageCtaHeading', title: 'Appel à l’action final — titre', type: 'localeString', group: 'page'}),
    defineField({name: 'pageCtaBody', title: 'Appel à l’action final — texte', type: 'localeText', group: 'page'}),
  ],
  orderings: [{title: 'Ordre', name: 'order', by: [{field: 'order', direction: 'asc'}]}],
  preview: {
    select: {title: 'name', programmeSlug: 'programmeSlug', price: 'price', media: 'images.0'},
    prepare: ({title, programmeSlug, price, media}) => ({
      title,
      subtitle: [programmeSlug, price].filter(Boolean).join(' · '),
      media,
    }),
  },
})
