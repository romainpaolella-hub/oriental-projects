import {defineCliConfig} from 'sanity/cli'

// L'ID de projet est fourni par la variable d'environnement SANITY_STUDIO_PROJECT_ID
// (voir studio/.env.example). Remplace la valeur par défaut après avoir créé le projet.
const projectId = process.env.SANITY_STUDIO_PROJECT_ID || 'x3jcttot'

export default defineCliConfig({
  api: {projectId, dataset: 'production'},
  studioHost: 'kohsamuiestate',
})
