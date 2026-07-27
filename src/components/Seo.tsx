import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { getArticle, getGrape, getRegion, text } from '../lib/data'

const PRODUCTION_URL = 'https://wine-atlas-eta.vercel.app'

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
    const siteUrl = import.meta.env.VITE_SITE_URL || (window.location.hostname === 'localhost' ? PRODUCTION_URL : window.location.origin)
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
    const routeCopy = {
      pt: {
        '/regioes': ['Regiões vinícolas — Wine Atlas', 'Explora regiões vinícolas, clima, terroir, castas, estilos e harmonizações.'],
        '/castas': ['Castapédia — Wine Atlas', 'Consulta perfis de castas, aromas, estrutura, regiões e harmonizações.'],
        '/guia': ['Guia do vinho — Wine Atlas', 'Aprende a servir, provar, guardar e harmonizar vinho com guias práticos.'],
        '/guia/sommelier': ['Provar como um sommelier — Wine Atlas', 'Segue um método simples para observar, cheirar, provar e avaliar vinho.'],
        '/guia/aromas': ['Roda de aromas — Wine Atlas', 'Explora famílias e descritores aromáticos para compreender melhor cada vinho.'],
        '/guia/historia': ['História do vinho — Wine Atlas', 'Viaja pelos principais momentos da história do vinho e da viticultura.'],
        '/ferramentas': ['Ferramentas de vinho — Wine Atlas', 'Prova vinho passo a passo, compara castas e encontra recomendações explicadas.'],
        '/ferramentas/prova': ['Prova guiada — Wine Atlas', 'Observa um vinho passo a passo sem guardar notas ou dados pessoais.'],
        '/ferramentas/escolher': ['Recomendador de vinho — Wine Atlas', 'Encontra castas, regiões e estilos adequados à refeição e preferências.'],
        '/ferramentas/comparar': ['Comparar castas — Wine Atlas', 'Compara estrutura, aromas, serviço e regiões de duas castas.'],
        '/favoritos': ['Favoritos — Wine Atlas', 'Consulta as regiões e castas que guardaste no teu dispositivo.'],
        '/pesquisa': ['Pesquisa — Wine Atlas', 'Pesquisa regiões vinícolas, castas, guias e artigos num único lugar.'],
        '/privacidade': ['Privacidade — Wine Atlas', 'Descobre como o Wine Atlas protege a localização e gere consentimento analítico.'],
        '/404': ['Página não encontrada — Wine Atlas', 'A página que procuras não existe ou mudou de lugar.'],
      },
      en: {
        '/regioes': ['Wine regions — Wine Atlas', 'Explore wine regions, climate, terroir, grapes, styles and pairings.'],
        '/castas': ['Grape library — Wine Atlas', 'Browse grape profiles, aromas, structure, regions and pairings.'],
        '/guia': ['Wine guide — Wine Atlas', 'Learn to serve, taste, store and pair wine with practical guides.'],
        '/guia/sommelier': ['Taste like a sommelier — Wine Atlas', 'Follow a simple method to observe, smell, taste and assess wine.'],
        '/guia/aromas': ['Aroma wheel — Wine Atlas', 'Explore aroma families and descriptors to understand every wine better.'],
        '/guia/historia': ['Wine history — Wine Atlas', 'Travel through key moments in the history of wine and viticulture.'],
        '/ferramentas': ['Wine tools — Wine Atlas', 'Taste step by step, compare grapes and get explained recommendations.'],
        '/ferramentas/prova': ['Guided tasting — Wine Atlas', 'Observe wine step by step without saving notes or personal data.'],
        '/ferramentas/escolher': ['Wine recommendations — Wine Atlas', 'Find grapes, regions and styles suited to your meal and preferences.'],
        '/ferramentas/comparar': ['Compare grapes — Wine Atlas', 'Compare the structure, aromas, service and regions of two grapes.'],
        '/favoritos': ['Favourites — Wine Atlas', 'Browse wine regions and grapes saved on your device.'],
        '/pesquisa': ['Search — Wine Atlas', 'Search wine regions, grapes, guides and articles in one place.'],
        '/privacidade': ['Privacy — Wine Atlas', 'Learn how Wine Atlas protects location and manages analytics consent.'],
        '/404': ['Page not found — Wine Atlas', 'The page you are looking for does not exist or has moved.'],
      },
      de: {
        '/regioes': ['Weinregionen — Wine Atlas', 'Entdecke Weinregionen, Klima, Terroir, Rebsorten, Stile und Kombinationen.'],
        '/castas': ['Rebsorten-Bibliothek — Wine Atlas', 'Finde Rebsortenprofile, Aromen, Struktur, Regionen und Speisen.'],
        '/guia': ['Weinführer — Wine Atlas', 'Lerne Wein praktisch zu servieren, verkosten, lagern und kombinieren.'],
        '/guia/sommelier': ['Wie ein Sommelier verkosten — Wine Atlas', 'Beobachte, rieche, verkoste und bewerte Wein mit einer einfachen Methode.'],
        '/guia/aromas': ['Aromarad — Wine Atlas', 'Entdecke Aromafamilien und Begriffe, um Wein besser zu verstehen.'],
        '/guia/historia': ['Geschichte des Weins — Wine Atlas', 'Reise durch wichtige Momente der Wein- und Weinbaugeschichte.'],
        '/ferramentas': ['Weinwerkzeuge — Wine Atlas', 'Verkoste Schritt für Schritt, vergleiche Rebsorten und erhalte Erklärungen.'],
        '/ferramentas/prova': ['Geführte Verkostung — Wine Atlas', 'Beobachte Wein Schritt für Schritt, ohne Notizen oder persönliche Daten zu speichern.'],
        '/ferramentas/escolher': ['Weinempfehlungen — Wine Atlas', 'Finde Rebsorten, Regionen und Stile passend zu Essen und Vorlieben.'],
        '/ferramentas/comparar': ['Rebsorten vergleichen — Wine Atlas', 'Vergleiche Struktur, Aromen, Servieren und Regionen zweier Rebsorten.'],
        '/favoritos': ['Favoriten — Wine Atlas', 'Öffne auf deinem Gerät gespeicherte Regionen und Rebsorten.'],
        '/pesquisa': ['Suche — Wine Atlas', 'Suche Weinregionen, Rebsorten, Führer und Artikel an einem Ort.'],
        '/privacidade': ['Datenschutz — Wine Atlas', 'Erfahre, wie Wine Atlas Standort und Analyse-Einwilligung schützt.'],
        '/404': ['Seite nicht gefunden — Wine Atlas', 'Die gesuchte Seite existiert nicht oder wurde verschoben.'],
      },
    }[locale] as unknown as Record<string, [string, string]>
    let title = homeCopy[0]
    let description = homeCopy[1]
    let schema: Record<string, unknown> = {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'Wine Atlas',
      url: siteUrl,
      inLanguage: locale,
    }
    const breadcrumbs: { '@type': 'ListItem'; position: number; name: string; item: string }[] = [
      { '@type': 'ListItem', position: 1, name: 'Wine Atlas', item: siteUrl },
    ]
    if (region) {
      title = `${text(region.name, locale)} — Wine Atlas`
      description = text(region.description, locale)
      breadcrumbs.push({ '@type': 'ListItem', position: 2, name: text(region.name, locale), item: `${siteUrl}${pathname}` })
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
      breadcrumbs.push({ '@type': 'ListItem', position: 2, name: text(article.title, locale), item: `${siteUrl}${pathname}` })
      schema = { '@context': 'https://schema.org', '@type': 'Article', headline: text(article.title, locale), description, inLanguage: locale, dateModified: article.reviewedAt ?? '2026-07-27' }
    } else {
      const routeKey = routeCopy[pathname]
        ? pathname
        : Object.keys(routeCopy).find((route) => pathname.startsWith(`${route}/`))
      if (routeKey) [title, description] = routeCopy[routeKey]
    }
    const canonical = `${siteUrl}${pathname === '/' ? '' : pathname}`
    document.title = title
    upsertMeta('meta[name="description"]', 'name', 'description', description)
    upsertMeta('meta[property="og:title"]', 'property', 'og:title', title)
    upsertMeta('meta[property="og:description"]', 'property', 'og:description', description)
    upsertMeta('meta[property="og:type"]', 'property', 'og:type', article ? 'article' : 'website')
    upsertMeta('meta[property="og:url"]', 'property', 'og:url', canonical)
    upsertMeta('meta[property="og:locale"]', 'property', 'og:locale', locale === 'pt' ? 'pt_PT' : locale === 'de' ? 'de_DE' : 'en_GB')
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
