interface ConfigEntry {
  chave: string
  valor: string | null
}

const FEATURE_SLOTS = [1, 2, 3] as const
const TESTIMONIAL_SLOTS = [1, 2] as const

const normalize = (value: string | null | undefined) => value?.trim() ?? ''

export type HeroContent = Record<string, string>

export interface LandingFeature {
  title: string
  description: string
}

export interface LandingTestimonial {
  name: string
  role: string
  quote: string
}

export function extractHeroContent(entries: ConfigEntry[]): HeroContent {
  return entries.reduce<HeroContent>((acc, entry) => {
    acc[entry.chave] = normalize(entry.valor)
    return acc
  }, {})
}

export function extractFeatures(entries: ConfigEntry[]): LandingFeature[] {
  return FEATURE_SLOTS.map((slot) => {
    const title = normalize(entries.find((entry) => entry.chave === `feature_${slot}_title`)?.valor)
    const description = normalize(entries.find((entry) => entry.chave === `feature_${slot}_description`)?.valor)
    return { title, description }
  }).filter((feature) => feature.title.length > 0 || feature.description.length > 0)
}

export function extractTestimonials(entries: ConfigEntry[]): LandingTestimonial[] {
  return TESTIMONIAL_SLOTS.map((slot) => {
    const name = normalize(entries.find((entry) => entry.chave === `testimonial_${slot}_name`)?.valor)
    const role = normalize(entries.find((entry) => entry.chave === `testimonial_${slot}_role`)?.valor)
    const quote = normalize(entries.find((entry) => entry.chave === `testimonial_${slot}_quote`)?.valor)
    return { name, role, quote }
  }).filter((testimonial) => testimonial.name.length > 0 && testimonial.quote.length > 0)
}
