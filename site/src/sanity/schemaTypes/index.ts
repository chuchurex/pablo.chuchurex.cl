import { articleType } from './documents/article'
import { categoryType } from './documents/category'
import { pageType } from './documents/page'
import { seminarType } from './documents/seminar'
import { siteSettingsType } from './documents/site-settings'
import { seoType } from './objects/seo'
import { bridgeContextType } from './objects/bridge-context'
import { sourceLinkType } from './objects/source-link'

export const schemaTypes = [
  // Documents
  articleType,
  categoryType,
  pageType,
  seminarType,
  siteSettingsType,
  // Objects
  seoType,
  bridgeContextType,
  sourceLinkType,
]
