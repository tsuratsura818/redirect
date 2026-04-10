export interface CaseStudy {
  slug: string
  industry: string
  title: string
  seoTitle: string
  metaDescription: string
  image: string
  sectionImages: [string, string, string]
  icon: string
  feature: string
  featureColor: string
  problem: string
  solution: string
  publishedAt: string
  detail: {
    industryContext: string
    background: string
    challenges: { title: string; body: string }[]
    howPivolink: { title: string; body: string }[]
    results: { title: string; body: string }[]
    tips: { title: string; body: string }[]
    faq: { q: string; a: string }[]
    quote: string
  }
}

import { restaurantCase } from './cases/restaurant'
import { retailCase } from './cases/retail'
import { realestateCase } from './cases/realestate'
import { eventCase } from './cases/event'
import { salonCase } from './cases/salon'
import { tourismCase } from './cases/tourism'
import { manufacturingCase } from './cases/manufacturing'
import { ecCase } from './cases/ec'
import { gymCase } from './cases/gym'
import { publisherCase } from './cases/publisher'
import { educationCase } from './cases/education'
import { hotelCase } from './cases/hotel'

export const CASE_STUDIES: CaseStudy[] = [
  restaurantCase,
  retailCase,
  realestateCase,
  eventCase,
  salonCase,
  tourismCase,
  manufacturingCase,
  ecCase,
  gymCase,
  publisherCase,
  educationCase,
  hotelCase,
]
