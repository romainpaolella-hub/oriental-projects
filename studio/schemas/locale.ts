import {defineType, defineField} from 'sanity'

/**
 * Champs bilingues simples. Le site lit `.fr` (et `.en` quand la version
 * anglaise sera lancée). Le français est requis, l'anglais est optionnel.
 */

export const localeString = defineType({
  name: 'localeString',
  title: 'Texte court (FR / EN)',
  type: 'object',
  fields: [
    defineField({name: 'fr', title: 'Français', type: 'string', validation: (r) => r.required()}),
    defineField({name: 'en', title: 'English', type: 'string'}),
  ],
})

export const localeText = defineType({
  name: 'localeText',
  title: 'Texte long (FR / EN)',
  type: 'object',
  fields: [
    defineField({name: 'fr', title: 'Français', type: 'text', rows: 4, validation: (r) => r.required()}),
    defineField({name: 'en', title: 'English', type: 'text', rows: 4}),
  ],
})
