export type Locale = 'pt' | 'en' | 'de'
export type LocalizedText = Record<Locale, string>
export type LocalizedList = Record<Locale, string[]>

export interface Region {
  id: string
  name: LocalizedText
  country: LocalizedText
  countryCode: string
  coordinates: { lat: number; lng: number }
  description: LocalizedText
  grapeIds: string[]
  wineTypes: LocalizedList
  climate: LocalizedText
  service: LocalizedText
  pairings: LocalizedList
  fact: LocalizedText
  featured: boolean
  color: string
}

export interface Grape {
  id: string
  name: LocalizedText
  aliases: string[]
  origin: LocalizedText
  description: LocalizedText
  type: 'red' | 'white'
  aromas: LocalizedList
  body: 'light' | 'medium' | 'full'
  acidity: 'low' | 'medium' | 'high'
  tannins: 'low' | 'medium' | 'high'
  regionIds: string[]
  pairings: LocalizedList
  service: LocalizedText
  glass: LocalizedText
  decanting: LocalizedText
  color: string
}

export interface Article {
  id: string
  title: LocalizedText
  eyebrow: LocalizedText
  summary: LocalizedText
  intro: LocalizedText
  tips: LocalizedList
  icon: string
  featured: boolean
}

export interface SommelierGuide {
  eyebrow: LocalizedText
  title: LocalizedText
  intro: LocalizedText
  note: LocalizedText
  glassesTitle: LocalizedText
  glassesIntro: LocalizedText
  steps: {
    id: string
    icon: string
    title: LocalizedText
    body: LocalizedText
    action: LocalizedText
  }[]
  glasses: {
    id: string
    title: LocalizedText
    examples: LocalizedText
    glass: LocalizedText
    why: LocalizedText
    temperature: string
  }[]
  rulesTitle: LocalizedText
  rules: LocalizedList
}

export type Favorite = { type: 'region' | 'grape'; id: string }
