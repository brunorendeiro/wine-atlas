import regionsJson from '../data/regions.json'
import grapesJson from '../data/grapes.json'
import articlesJson from '../data/articles.json'
import guideExpansionJson from '../data/guide-expansion.json'
import regionWineCultureJson from '../data/region-wine-culture.json'
import sommelierJson from '../data/sommelier.json'
import type { Article, Grape, Locale, LocalizedList, LocalizedText, Region, RegionWineCulture, SommelierGuide } from '../types'

export const regions = regionsJson as Region[]
export const grapes = grapesJson as Grape[]
export const articles = [...articlesJson, ...guideExpansionJson] as Article[]
export const regionWineCulture = regionWineCultureJson as Record<string, RegionWineCulture>
export const sommelierGuide = sommelierJson as SommelierGuide

export function text(value: LocalizedText, locale: Locale) {
  return value[locale] || value.pt
}

export function list(value: LocalizedList, locale: Locale) {
  return value[locale] || value.pt
}

export function getRegion(id: string) {
  return regions.find((region) => region.id === id)
}

export function getGrape(id: string) {
  const canonicalId = id === 'tempranillo' ? 'tinta-roriz' : id
  return grapes.find((grape) => grape.id === canonicalId)
}

export function getArticle(id: string) {
  return articles.find((article) => article.id === id)
}

export function normalize(value: string) {
  return value.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase()
}

export function matchesLocalized(value: LocalizedText, query: string) {
  const normalized = normalize(query)
  return Object.values(value).some((item) => normalize(item).includes(normalized))
}

export function distanceKm(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number },
) {
  const earthRadius = 6371
  const toRadians = (degrees: number) => (degrees * Math.PI) / 180
  const dLat = toRadians(b.lat - a.lat)
  const dLng = toRadians(b.lng - a.lng)
  const lat1 = toRadians(a.lat)
  const lat2 = toRadians(b.lat)
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.sin(dLng / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2)
  return earthRadius * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h))
}

export function countryFlag(code: string) {
  return String.fromCodePoint(...code.toUpperCase().split('').map((char) => 127397 + char.charCodeAt(0)))
}
