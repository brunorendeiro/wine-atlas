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
  otherGrapeIds?: string[]
  wineTypes: LocalizedList
  climate: LocalizedText
  service: LocalizedText
  pairings: LocalizedList
  fact: LocalizedText
  featured: boolean
  color: string
  subregion?: LocalizedText
  terroir?: LocalizedText
  elevation?: LocalizedText
  harvest?: LocalizedText
  reviewedAt?: string
  confidence?: 'high' | 'medium'
  sources?: Source[]
}

export interface Grape {
  id: string
  name: LocalizedText
  aliases: string[]
  regionalNames?: Record<string, LocalizedText>
  heritage?: 'native' | 'historic' | 'international'
  rarity?: 'rare' | 'revived'
  identityNote?: LocalizedText
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
  alcohol?: 'low' | 'medium' | 'high'
  ageing?: 'low' | 'medium' | 'high'
  fruit?: 'low' | 'medium' | 'high'
  typicalColour?: LocalizedText
  typicalWines?: LocalizedList
  reviewedAt?: string
  confidence?: 'high' | 'medium'
  sources?: Source[]
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
  reviewedAt?: string
  confidence?: 'high' | 'medium'
  sources?: Source[]
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

export interface Source {
  title: string
  url: string
}

export interface RegionWineCulture {
  reviewedAt: string
  confidence: 'high' | 'medium'
  wine: {
    style: LocalizedText
    examples: string[]
    profile: LocalizedText
    ageing: {
      ready: number
      peakStart: number
      peakEnd: number
      hold: number
    }
    source: Source
  }
  person: {
    name: string
    role: LocalizedText
    note: LocalizedText
    source: Source
  }
}

export interface SavedLocation {
  id: string
  label: LocalizedText
  kind: 'country' | 'city' | 'region' | 'device'
  coordinates: { lat: number; lng: number }
}
