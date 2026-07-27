import type { Locale } from '../types'
import { articles, grapes, normalize, regions, text } from './data'

export type SearchCategory = 'region' | 'grape' | 'guide' | 'article'

export interface SearchResult {
  id: string
  category: SearchCategory
  title: string
  summary: string
  to: string
  score: number
}

const RECENT_KEY = 'wine-atlas-recent-searches'

function editDistance(a: string, b: string) {
  const matrix = Array.from({ length: b.length + 1 }, (_, row) => [row])
  for (let column = 0; column <= a.length; column += 1) matrix[0][column] = column
  for (let row = 1; row <= b.length; row += 1) {
    for (let column = 1; column <= a.length; column += 1) {
      matrix[row][column] = b[row - 1] === a[column - 1]
        ? matrix[row - 1][column - 1]
        : Math.min(matrix[row - 1][column - 1], matrix[row][column - 1], matrix[row - 1][column]) + 1
    }
  }
  return matrix[b.length][a.length]
}

function tokenScore(query: string, haystack: string) {
  const q = normalize(query).trim()
  const value = normalize(haystack)
  if (!q) return 0
  if (value === q) return 100
  if (value.startsWith(q)) return 80
  if (value.includes(q)) return 65
  const queryTokens = q.split(/\s+/)
  const words = value.split(/[^a-z0-9]+/).filter(Boolean)
  const score = queryTokens.reduce((total, token) => {
    const best = words.reduce((distance, word) => Math.min(distance, editDistance(token, word.slice(0, Math.max(token.length, word.length)))), Infinity)
    const tolerance = token.length >= 7 ? 2 : token.length >= 4 ? 1 : 0
    return total + (best <= tolerance ? 38 - best * 8 : 0)
  }, 0)
  return score / queryTokens.length
}

export function unifiedSearch(query: string, locale: Locale): SearchResult[] {
  if (query.trim().length < 2) return []
  const results: SearchResult[] = []
  regions.forEach((region) => {
    const score = tokenScore(query, [
      ...Object.values(region.name), ...Object.values(region.country),
      ...Object.values(region.description), ...Object.values(region.climate),
      ...(region.subregion ? Object.values(region.subregion) : []),
    ].join(' '))
    if (score >= 30) results.push({
      id: region.id, category: 'region', title: text(region.name, locale),
      summary: `${text(region.country, locale)} · ${text(region.description, locale)}`,
      to: `/regioes/${region.id}`, score,
    })
  })
  grapes.forEach((grape) => {
    const score = tokenScore(query, [
      ...Object.values(grape.name), ...grape.aliases, ...Object.values(grape.origin),
      ...Object.values(grape.description), ...Object.values(grape.aromas).flat(),
    ].join(' '))
    if (score >= 30) results.push({
      id: grape.id, category: 'grape', title: text(grape.name, locale),
      summary: `${text(grape.origin, locale)} · ${text(grape.description, locale)}`,
      to: `/castas/${grape.id}`, score,
    })
  })
  articles.forEach((article) => {
    const score = tokenScore(query, [
      ...Object.values(article.title), ...Object.values(article.eyebrow),
      ...Object.values(article.summary), ...Object.values(article.intro),
    ].join(' '))
    if (score >= 30) results.push({
      id: article.id,
      category: article.featured ? 'guide' : 'article',
      title: text(article.title, locale),
      summary: text(article.summary, locale),
      to: `/guia/${article.id}`, score,
    })
  })
  return results.sort((a, b) => b.score - a.score || a.title.localeCompare(b.title, locale)).slice(0, 30)
}

export function getRecentSearches(): string[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(RECENT_KEY) || '[]')
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === 'string').slice(0, 6) : []
  } catch {
    return []
  }
}

export function rememberSearch(query: string) {
  const clean = query.trim()
  if (clean.length < 2) return
  const next = [clean, ...getRecentSearches().filter((item) => normalize(item) !== normalize(clean))].slice(0, 6)
  localStorage.setItem(RECENT_KEY, JSON.stringify(next))
}
