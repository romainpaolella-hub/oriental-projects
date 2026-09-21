import {localeString, localeText} from './locale'
import {siteSettings} from './siteSettings'
import {heroSlide} from './heroSlide'
import {programme} from './programme'
import {villaDispo} from './villaDispo'
import {realisation} from './realisation'
import {programmePage} from './programmePage'
import {lotPlan} from './lotPlan'
import {lead} from './lead'

// Types du dataset "production" (contenu public)
export const contentTypes = [
  localeString,
  localeText,
  siteSettings,
  heroSlide,
  programme,
  villaDispo,
  realisation,
  programmePage,
  lotPlan,
]

// Types du dataset "leads" (privé)
export const leadTypes = [lead]

export {lead}
