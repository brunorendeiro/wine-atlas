import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { getArticle, getGrape, getRegion, text } from '../lib/data'

const SITE_URL = 'https://wine-atlas.app'

function upsertMeta(selector: string, attribute: 'name' | 'property', key: string, content: string) {
  let element = document.head.querySelector<HTMLMetaElement>(selector)
  if (!element) {
    element = document.createElement('meta')
    element.setAttribute(attribute, key)
    document.head.appendChild(element)
  }
  element.content = content
}

export function Seo() {
  const { pathname } = useLocation()
  const { locale } = useApp()

  useEffect(() => {
    const parts = pathname.split('/').filter(Boolean)
    const id = parts[1]
    const region = parts[0] === 'regioes' && id ? getRegion(id) : undefined
    const grape = parts[0] === 'castas' && id ? getGrape(id) : undefined
    const article = parts[0] === 'guia' && id ? getArticle(id) : undefined
    const homeCopy = {
      pt: ['Wine Atlas — Regiões vinícolas perto de ti', 'Descobre regiões vinícolas próximas, castas, harmonizações e guias de vinho revistos.'],
      en: ['Wine Atlas — Wine regions near you', 'Discover nearby wine regions, grapes, pairings and reviewed wine guides.'],
      de: ['Wine Atlas — Weinregionen in deiner Nähe', 'Entdecke nahe Weinregionen, Rebsorten, Kombinationen und geprüfte Weinführer.'],
    }[locale]
    let title = homeCopy[0]
    let description = homeCopy[1]
    let schema: Record<string, unknown> = {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'Wine Atlas',
      url: SITE_URL,
      inLanguage: locale,
    }
    const breadcrumbs: { '@type': 'ListItem'; position: number; name: string; item: string }[] = [
      { '@type': 'ListItem', position: 1, name: 'Wine Atlas', item: SITE_URL },
    ]
    if (region) {
      title = `${text(region.name, locale)} — Wine Atlas`
      description = text(region.description, locale)
      breadcrumbs.push({ '@type': 'ListItem', position: 2, name: text(region.name, locale), item: `${SITE_URL}${pathname}` })
      schema = {
        '@context': 'https://schema.org', '@type': 'Place',
        additionalType: 'https://schema.org/WineRegion',
        name: text(region.name, locale), description,
        address: { '@type': 'PostalAddress', addressCountry: region.countryCode },
        geo: { '@type': 'GeoCoordinates', latitude: region.coordinates.lat, longitude: region.coordinates.lng },
      }
    } else if (grape) {
      title = `${text(grape.name, locale)} — Wine Atlas`
      description = text(grape.description, locale)
    } else if (article) {
      title = `${text(article.title, locale)} — Wine Atlas`
      description = text(article.summary, locale)
      breadcrumbs.push({ '@type': 'ListItem', position: 2, name: text(article.title, locale), item: `${SITE_URL}${pathname}` })
      schema = { '@context': 'https://schema.org', '@type': 'Article', headline: text(article.title, locale), description, inLanguage: locale, dateModified: article.reviewedAt ?? '2026-07-27' }
    }
    const canonical = `${SITE_URL}${pathname === '/' ? '' : pathname}`
    document.title = title
    upsertMeta('meta[name="description"]', 'name', 'description', description)
    upsertMeta('meta[property="og:title"]', 'property', 'og:title', title)
    upsertMeta('meta[property="og:description"]', 'property', 'og:description', description)
    upsertMeta('meta[property="og:type"]', 'property', 'og:type', article ? 'article' : 'website')
    upsertMeta('meta[property="og:url"]', 'property', 'og:url', canonical)
    upsertMeta('meta[name="twitter:card"]', 'name', 'twitter:card', 'summary_large_image')
    upsertMeta('meta[name="twitter:title"]', 'name', 'twitter:title', title)
    upsertMeta('meta[name="twitter:description"]', 'name', 'twitter:description', description)
    let link = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')
    if (!link) {
      link = document.createElement('link')
      link.rel = 'canonical'
      document.head.appendChild(link)
    }
    link.href = canonical
    let script = document.head.querySelector<HTMLScriptElement>('#structured-data')
    if (!script) {
      script = document.createElement('script')
      script.id = 'structured-data'
      script.type = 'application/ld+json'
      document.head.appendChild(script)
    }
    script.text = JSON.stringify(breadcrumbs.length > 1 ? [
      schema,
      { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: breadcrumbs },
    ] : schema)
  }, [locale, pathname])

  return null
}
