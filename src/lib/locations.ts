import type { LocalizedText, SavedLocation } from '../types'
import { regions, text } from './data'

const l = (pt: string, en: string, de: string): LocalizedText => ({ pt, en, de })

export const locationOptions: SavedLocation[] = [
  { id: 'lisbon', label: l('Lisboa, Portugal', 'Lisbon, Portugal', 'Lissabon, Portugal'), kind: 'city', coordinates: { lat: 38.7223, lng: -9.1393 } },
  { id: 'porto', label: l('Porto, Portugal', 'Porto, Portugal', 'Porto, Portugal'), kind: 'city', coordinates: { lat: 41.1579, lng: -8.6291 } },
  { id: 'madrid', label: l('Madrid, Espanha', 'Madrid, Spain', 'Madrid, Spanien'), kind: 'city', coordinates: { lat: 40.4168, lng: -3.7038 } },
  { id: 'paris', label: l('Paris, França', 'Paris, France', 'Paris, Frankreich'), kind: 'city', coordinates: { lat: 48.8566, lng: 2.3522 } },
  { id: 'zurich', label: l('Zurique, Suíça', 'Zurich, Switzerland', 'Zürich, Schweiz'), kind: 'city', coordinates: { lat: 47.3769, lng: 8.5417 } },
  { id: 'berlin', label: l('Berlim, Alemanha', 'Berlin, Germany', 'Berlin, Deutschland'), kind: 'city', coordinates: { lat: 52.52, lng: 13.405 } },
  ...regions.map((region): SavedLocation => ({
    id: `region-${region.id}`,
    label: region.name,
    kind: 'region',
    coordinates: region.coordinates,
  })),
]

export function searchLocations(query: string, locale: 'pt' | 'en' | 'de') {
  const value = query.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase().trim()
  if (!value) return locationOptions.slice(0, 8)
  return locationOptions.filter((option) => {
    const label = text(option.label, locale).normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase()
    const region = option.id.startsWith('region-') ? regions.find((item) => `region-${item.id}` === option.id) : undefined
    const country = region ? text(region.country, locale).normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase() : ''
    return label.includes(value) || country.includes(value)
  }).slice(0, 10)
}
