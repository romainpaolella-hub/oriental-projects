import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import {contentTypes, leadTypes} from './schemas'

const projectId = process.env.SANITY_STUDIO_PROJECT_ID || 'x3jcttot'

// Arborescence du dataset "Contenu" : "Réglages du site" en singleton.
const contentStructure = (S: any) =>
  S.list()
    .title('Contenu')
    .items([
      S.listItem()
        .title('Réglages du site')
        .id('siteSettings')
        .child(S.document().schemaType('siteSettings').documentId('siteSettings')),
      S.divider(),
      S.documentTypeListItem('heroSlide').title('Carrousel d’accueil'),
      S.documentTypeListItem('programme').title('Programmes'),
      S.documentTypeListItem('programmePage').title('Pages programme (textes)'),
      S.documentTypeListItem('villaDispo').title('Villas à vendre'),
      S.documentTypeListItem('realisation').title('Réalisations'),
    ])

export default defineConfig([
  {
    name: 'contenu',
    title: 'Koh Samui Estate — Contenu',
    basePath: '/contenu',
    projectId,
    dataset: 'production',
    plugins: [structureTool({structure: contentStructure}), visionTool()],
    schema: {
      types: contentTypes,
      // pas de bouton "créer" pour le singleton
      templates: (prev) => prev.filter((t) => t.schemaType !== 'siteSettings'),
    },
  },
  {
    name: 'demandes',
    title: 'Koh Samui Estate — Demandes',
    basePath: '/demandes',
    projectId,
    dataset: 'leads',
    plugins: [structureTool()],
    schema: {types: leadTypes},
  },
])
