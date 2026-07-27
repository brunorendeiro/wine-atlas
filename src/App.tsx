import { Component, lazy, Suspense, useEffect, useMemo, useState, type ErrorInfo, type FormEvent, type ReactNode } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronRight,
  CircleGauge,
  Clock,
  CloudSun,
  Heart,
  LocateFixed,
  Map as MapIcon,
  MapPin,
  Search,
  Sparkles,
  Thermometer,
  Utensils,
  Wine,
} from 'lucide-react'
import {
  Link,
  Navigate,
  Route,
  Routes,
  useNavigate,
  useParams,
  useSearchParams,
} from 'react-router-dom'
import { ArticleCard, EmptyState, FavoriteButton, GrapeCard, RegionCard } from './components/Cards'
import { AromaWheel } from './components/AromaWheel'
import { DataQuality, GrapeRadar, LocationSelector, NearbyRegionGrid, RegionMap } from './components/DiscoveryEnhancements'
import { GuideIcon } from './components/GuideIcon'
import { Layout } from './components/Layout'
import { LocationIntro } from './components/Overlays'
import { useApp } from './context/AppContext'
import historyJson from './data/history.json'
import {
  articles,
  countryFlag,
  distanceKm,
  getArticle,
  getGrape,
  getRegion,
  grapes,
  list,
  matchesLocalized,
  normalize,
  regions,
  sommelierGuide,
  text,
} from './lib/data'
import type { Grape as GrapeType, LocalizedText, Region } from './types'
import { getRecentSearches, rememberSearch, unifiedSearch, type SearchCategory } from './lib/search'
import { trackEvent } from './lib/analytics'

const ToolsHubPage = lazy(() => import('./components/DiscoveryTools').then((module) => ({ default: module.ToolsHubPage })))
const GuidedTastingPage = lazy(() => import('./components/DiscoveryTools').then((module) => ({ default: module.GuidedTastingPage })))
const WineChooserPage = lazy(() => import('./components/DiscoveryTools').then((module) => ({ default: module.WineChooserPage })))
const GrapeComparePage = lazy(() => import('./components/DiscoveryTools').then((module) => ({ default: module.GrapeComparePage })))

const wineHistory = historyJson as {
  eyebrow: LocalizedText
  title: LocalizedText
  intro: LocalizedText
  events: { period: LocalizedText; place: LocalizedText; title: LocalizedText; body: LocalizedText }[]
}

const detailCopy = {
  pt: {
    subregion: 'Sub-região', terroir: 'Terroir', elevation: 'Altitude', harvest: 'Período de vindima',
    related: 'Regiões relacionadas', map: 'Mapa da região', typicalColour: 'Cor típica', alcohol: 'Tendência alcoólica',
    ageing: 'Potencial de guarda', typicalWines: 'Vinhos típicos', similar: 'Castas semelhantes',
    unavailable: 'Informação específica ainda não verificada', variable: 'Varia por sub-região e produtor',
    northHarvest: 'Agosto a outubro, consoante o ano e a altitude', southHarvest: 'Fevereiro a abril, consoante o ano e a altitude',
  },
  en: {
    subregion: 'Sub-region', terroir: 'Terroir', elevation: 'Elevation', harvest: 'Harvest period',
    related: 'Related regions', map: 'Region map', typicalColour: 'Typical colour', alcohol: 'Alcohol tendency',
    ageing: 'Ageing potential', typicalWines: 'Typical wines', similar: 'Similar grape varieties',
    unavailable: 'Specific information not yet verified', variable: 'Varies by sub-region and producer',
    northHarvest: 'August to October, depending on year and elevation', southHarvest: 'February to April, depending on year and elevation',
  },
  de: {
    subregion: 'Teilregion', terroir: 'Terroir', elevation: 'Höhenlage', harvest: 'Lesezeit',
    related: 'Verwandte Regionen', map: 'Regionalkarte', typicalColour: 'Typische Farbe', alcohol: 'Alkoholtendenz',
    ageing: 'Reifepotenzial', typicalWines: 'Typische Weine', similar: 'Ähnliche Rebsorten',
    unavailable: 'Spezifische Information noch nicht geprüft', variable: 'Je nach Teilregion und Erzeuger unterschiedlich',
    northHarvest: 'August bis Oktober, je nach Jahr und Höhenlage', southHarvest: 'Februar bis April, je nach Jahr und Höhenlage',
  },
} as const

function SectionHeading({ eyebrow, title, body, action, to }: { eyebrow?: string; title: string; body?: string; action?: string; to?: string }) {
  return (
    <div className="mb-7 flex items-end justify-between gap-5">
      <div className="max-w-2xl">
        {eyebrow && <p className="eyebrow mb-2">{eyebrow}</p>}
        <h2 className="font-display text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">{title}</h2>
        {body && <p className="mt-2 max-w-xl leading-7 text-muted">{body}</p>}
      </div>
      {action && to && (
        <Link to={to} className="hidden shrink-0 items-center gap-1 text-sm font-bold text-wine-light hover:gap-2 dark:text-gold sm:flex">
          {action}<ArrowRight size={17} />
        </Link>
      )}
    </div>
  )
}

function PageHero({ eyebrow, title, body, children }: { eyebrow: string; title: string; body: string; children?: ReactNode }) {
  return (
    <section className="border-b border-line bg-paper py-12 dark:border-white/10 dark:bg-night-soft sm:py-16">
      <div className="page-shell">
        <p className="eyebrow mb-3">{eyebrow}</p>
        <h1 className="max-w-3xl font-display text-4xl font-semibold leading-[1.08] tracking-tight sm:text-6xl">{title}</h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-muted sm:text-lg">{body}</p>
        {children}
      </div>
    </section>
  )
}

function SearchBar({ compact = false }: { compact?: boolean }) {
  const { t } = useApp()
  const [query, setQuery] = useState('')
  const navigate = useNavigate()
  function submit(event: FormEvent) {
    event.preventDefault()
    if (query.trim()) {
      rememberSearch(query)
      trackEvent('search_performed', { query_length: query.trim().length })
      navigate(`/pesquisa?q=${encodeURIComponent(query.trim())}`)
    }
  }
  return (
    <form onSubmit={submit} className={`relative ${compact ? '' : 'max-w-2xl'}`}>
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={20} />
      <input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder={compact ? t('searchShort') : t('searchPlaceholder')}
        className="h-14 w-full rounded-2xl border border-line bg-white pl-12 pr-28 text-sm shadow-sm outline-none ring-wine/15 transition focus:border-wine focus:ring-4 dark:border-white/15 dark:bg-white/[0.06] sm:text-base"
      />
      <button type="submit" className="absolute right-2 top-2 h-10 rounded-xl bg-wine px-4 text-xs font-bold text-white transition hover:bg-wine-light sm:px-5 sm:text-sm">
        {t('search')}
      </button>
    </form>
  )
}

function LocationBlock() {
  const { locale, location, locationStatus, requestLocation, selectedLocation, t } = useApp()
  const nearby = useMemo(() => {
    if (!location) return []
    return regions
      .map((region) => ({ region, distance: distanceKm(location, region.coordinates) }))
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 4)
  }, [location])

  if (locationStatus === 'granted' && nearby.length) {
    return (
      <section className="section-space bg-leaf text-white">
        <div className="page-shell">
          <div className="mb-7 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-leaf-light">{t('nearbyTitle')}</p>
              <h2 className="font-display text-3xl font-semibold sm:text-4xl">{t('nearbyTitle')}</h2>
              <p className="mt-2 text-sm text-white/65">{selectedLocation ? text(selectedLocation.label, locale) : t('basedOn')} · {t('mapHint')}</p>
            </div>
            <div className="flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm">
              <MapPin size={16} /> {text(nearby[0].region.name, locale)} · {Math.round(nearby[0].distance)} km
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {nearby.map(({ region, distance }) => (
              <RegionCard key={region.id} region={region} distance={distance} />
            ))}
          </div>
          <LocationSelector />
        </div>
      </section>
    )
  }

  return (
    <section className="page-shell section-space">
      <div className="relative overflow-hidden rounded-[2rem] bg-leaf px-6 py-9 text-white sm:px-10 sm:py-12">
        <div className="location-lines" aria-hidden="true" />
        <div className="relative max-w-xl">
          <div className="mb-5 grid size-12 place-items-center rounded-2xl bg-white/12"><LocateFixed size={23} /></div>
          <h2 className="font-display text-3xl font-semibold sm:text-4xl">
            {locationStatus === 'denied' ? t('locationDeniedTitle') : t('locationTitle')}
          </h2>
          <p className="mt-3 leading-7 text-white/70">
            {locationStatus === 'denied' ? t('locationDenied') : locationStatus === 'unavailable' ? t('locationUnavailable') : t('locationBody')}
          </p>
          <button type="button" className="mt-6 inline-flex h-12 items-center gap-2 rounded-full bg-cream px-5 text-sm font-bold text-leaf shadow-lg transition hover:-translate-y-0.5" onClick={requestLocation} disabled={locationStatus === 'loading'}>
            <LocateFixed size={18} className={locationStatus === 'loading' ? 'animate-pulse' : ''} />
            {locationStatus === 'loading' ? t('locating') : locationStatus === 'denied' || locationStatus === 'unavailable' ? t('tryAgain') : t('allowLocation')}
          </button>
          <LocationSelector />
          <p className="mt-3 text-xs text-white/50">{t('locationPrivate')}</p>
        </div>
      </div>
    </section>
  )
}

function HomePage() {
  const { t } = useApp()
  return (
    <>
      <LocationIntro />
      <section className="hero-section">
        <div className="page-shell relative grid min-h-[670px] items-center gap-10 py-16 lg:grid-cols-[1.15fr_.85fr] lg:py-24">
          <div className="relative z-10 max-w-3xl">
            <p className="eyebrow mb-4">{t('heroEyebrow')}</p>
            <h1 className="font-display text-[clamp(3.25rem,8vw,6.8rem)] font-semibold leading-[.98] tracking-[-0.055em]">
              <span className="block">{t('heroTitleA')}</span>
              <span className="block pt-[.06em] text-wine-light dark:text-gold">{t('heroTitleB')}</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-muted">{t('heroBody')}</p>
            <div className="mt-8">
              <SearchBar />
            </div>
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <a href="#location" className="button-primary"><LocateFixed size={18} />{t('nearMe')}</a>
              <Link to="/regioes" className="button-secondary"><MapIcon size={18} />{t('exploreAtlas')}</Link>
            </div>
          </div>
          <div className="hero-art" aria-hidden="true">
            <div className="hero-bottle"><span>WINE<br />ATLAS</span></div>
            <div className="hero-glass"><i /></div>
            <div className="hero-map-line hero-map-line-a" />
            <div className="hero-map-line hero-map-line-b" />
            <span className="hero-pin hero-pin-a"><MapPin /></span>
            <span className="hero-pin hero-pin-b"><MapPin /></span>
            <span className="hero-label hero-label-a">Douro · 41.16° N</span>
            <span className="hero-label hero-label-b">Lavaux · 46.49° N</span>
          </div>
        </div>
        <div className="page-shell pb-9">
          <div className="flex flex-wrap gap-x-8 gap-y-3 border-t border-line pt-5 text-xs font-bold uppercase tracking-widest text-muted dark:border-white/10">
            <span><strong className="text-ink dark:text-cream">{regions.length}</strong> {t('regionCount')}</span>
            <span><strong className="text-ink dark:text-cream">{grapes.length}</strong> {t('grapeCount')}</span>
            <span>PT · EN · DE</span>
          </div>
        </div>
      </section>

      <div id="location"><LocationBlock /></div>

      <section className="page-shell section-space">
        <SectionHeading title={t('featuredRegions')} body={t('featuredRegionsBody')} action={t('viewAll')} to="/regioes" />
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {regions.filter((region) => region.featured).slice(0, 6).map((region) => <RegionCard key={region.id} region={region} featured />)}
        </div>
        <Link to="/regioes" className="button-secondary mt-6 w-full sm:hidden">{t('viewAll')}<ArrowRight size={17} /></Link>
      </section>

      <section className="border-y border-line bg-paper dark:border-white/10 dark:bg-night-soft">
        <div className="page-shell section-space">
          <SectionHeading title={t('learnWine')} body={t('learnWineBody')} action={t('viewAll')} to="/guia" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {articles.filter((article) => article.featured).map((article) => <ArticleCard key={article.id} article={article} />)}
          </div>
        </div>
      </section>
    </>
  )
}

function RegionsPage() {
  const { locale, t } = useApp()
  const [search, setSearch] = useState('')
  const [country, setCountry] = useState('all')
  const [wineType, setWineType] = useState('all')
  const countries = useMemo(() => [...new Map(regions.map((region) => [region.countryCode, text(region.country, locale)])).entries()], [locale])
  const wineTypes = useMemo(() => [...new Set(regions.flatMap((region) => list(region.wineTypes, locale)))].sort(), [locale])
  const filtered = regions.filter((region) => {
    const queryMatch = !search || matchesLocalized(region.name, search) || matchesLocalized(region.description, search)
    const countryMatch = country === 'all' || region.countryCode === country
    const typeMatch = wineType === 'all' || list(region.wineTypes, locale).includes(wineType)
    return queryMatch && countryMatch && typeMatch
  })
  const hasFilters = search || country !== 'all' || wineType !== 'all'

  return (
    <>
      <PageHero eyebrow={`${regions.length} ${t('regionCount')}`} title={t('regionsTitle')} body={t('regionsIntro')} />
      <section className="page-shell py-8 sm:py-10">
        <div className="mb-7 grid gap-3 rounded-3xl border border-line bg-paper p-3 dark:border-white/10 dark:bg-white/[0.03] sm:grid-cols-3 sm:p-4">
          <label className="relative sm:col-span-1">
            <span className="sr-only">{t('search')}</span>
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" size={17} />
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder={t('searchShort')} className="filter-control pl-10" />
          </label>
          <label>
            <span className="sr-only">{t('filterCountry')}</span>
            <select value={country} onChange={(event) => setCountry(event.target.value)} className="filter-control">
              <option value="all">{t('allCountries')}</option>
              {countries.map(([code, name]) => <option key={code} value={code}>{countryFlag(code)} {name}</option>)}
            </select>
          </label>
          <label>
            <span className="sr-only">{t('filterType')}</span>
            <select value={wineType} onChange={(event) => setWineType(event.target.value)} className="filter-control">
              <option value="all">{t('allWineTypes')}</option>
              {wineTypes.map((type) => <option key={type} value={type}>{type}</option>)}
            </select>
          </label>
        </div>
        <div className="mb-5 flex items-center justify-between text-sm text-muted">
          <span><strong className="text-ink dark:text-cream">{filtered.length}</strong> {t('results')}</span>
          {hasFilters && <button type="button" className="font-bold text-wine-light dark:text-gold" onClick={() => { setSearch(''); setCountry('all'); setWineType('all') }}>{t('clearFilters')}</button>}
        </div>
        {filtered.length ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{filtered.map((region) => <RegionCard key={region.id} region={region} />)}</div>
        ) : <EmptyState title={t('noRegions')} body={t('adjustSearch')} />}
      </section>
    </>
  )
}

function RegionDetailPage() {
  const { id } = useParams()
  const { locale, t } = useApp()
  const region = id ? getRegion(id) : undefined
  useEffect(() => {
    if (id) trackEvent('region_opened', { region_id: id })
  }, [id])
  if (!region) return <Navigate to="/404" replace />
  const regionGrapes = region.grapeIds.map(getGrape).filter(Boolean) as GrapeType[]
  const otherRegionGrapes = (region.otherGrapeIds ?? []).map(getGrape).filter(Boolean) as GrapeType[]
  const d = detailCopy[locale]
  const related = regions
    .filter((item) => item.id !== region.id)
    .map((item) => ({
      item,
      relevance: (item.countryCode === region.countryCode ? 3 : 0) +
        list(item.wineTypes, locale).filter((style) => list(region.wineTypes, locale).includes(style)).length,
    }))
    .sort((a, b) => b.relevance - a.relevance)
    .slice(0, 3)
  return (
    <>
      <section className="relative overflow-hidden text-white" style={{ backgroundColor: region.color }}>
        <div className="detail-pattern" />
        <div className="absolute inset-y-0 right-0 hidden w-[44%] opacity-30 lg:block" aria-hidden="true">
          <svg viewBox="0 0 600 450" preserveAspectRatio="xMidYMid slice" className="h-full w-full">
            <path d="M0 320 Q120 180 250 270 T600 170 V450 H0Z" fill="#fff" opacity=".25" />
            <path d="M0 390 Q180 230 330 340 T600 260 V450 H0Z" fill="#171014" opacity=".3" />
            {Array.from({ length: 9 }, (_, index) => <path key={index} d={`M${index * 78 - 50} 450 Q${index * 72 + 30} 300 ${index * 76 + 115} 190`} fill="none" stroke="#fff" strokeWidth="2" opacity=".25" />)}
            <circle cx="455" cy="85" r="44" fill="#f3d99b" opacity=".65" />
          </svg>
        </div>
        <div className="page-shell relative py-10 sm:py-16 lg:pr-[38%]">
          <Link to="/regioes" className="mb-10 inline-flex items-center gap-2 text-sm font-semibold text-white/70 hover:text-white"><ArrowLeft size={17} />{t('backRegions')}</Link>
          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <p className="mb-3 text-xs font-bold uppercase tracking-[.2em] text-white/65">{countryFlag(region.countryCode)} {text(region.country, locale)}</p>
              <h1 className="font-display text-5xl font-semibold tracking-tight sm:text-7xl">{text(region.name, locale)}</h1>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-white/75">{text(region.description, locale)}</p>
            </div>
            <FavoriteButton type="region" id={region.id} compact={false} />
          </div>
        </div>
      </section>
      <section className="page-shell py-10 sm:py-14">
        <div className="grid gap-5 md:grid-cols-3">
          <InfoCard icon={<CloudSun />} label={t('climate')} value={text(region.climate, locale)} />
          <InfoCard icon={<Thermometer />} label={t('serviceTemperature')} value={text(region.service, locale)} />
          <InfoCard icon={<Wine />} label={t('wineStyles')} value={list(region.wineTypes, locale).join(' · ')} />
        </div>
        <div className="mt-5 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          <InfoCard icon={<MapPin />} label={d.subregion} value={region.subregion ? text(region.subregion, locale) : d.variable} />
          <InfoCard icon={<Sparkles />} label={d.terroir} value={region.terroir ? text(region.terroir, locale) : text(region.climate, locale)} />
          <InfoCard icon={<CircleGauge />} label={d.elevation} value={region.elevation ? text(region.elevation, locale) : d.unavailable} />
          <InfoCard icon={<Wine />} label={d.harvest} value={region.harvest ? text(region.harvest, locale) : region.coordinates.lat >= 0 ? d.northHarvest : d.southHarvest} />
        </div>
      </section>
      <section className="page-shell pb-12 sm:pb-16">
        <SectionHeading title={d.map} />
        <RegionMap region={region} />
      </section>
      <section className="page-shell pb-12 sm:pb-16">
        <SectionHeading title={t('mainGrapes')} />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{regionGrapes.map((grape) => <GrapeCard key={grape.id} grape={grape} contextRegion={region} />)}</div>
        {otherRegionGrapes.length > 0 && (
          <div className="mt-12 border-t border-line pt-10 dark:border-white/10">
            <SectionHeading title={t('otherGrapes')} body={t('otherGrapesIntro')} />
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{otherRegionGrapes.map((grape) => <GrapeCard key={grape.id} grape={grape} contextRegion={region} />)}</div>
          </div>
        )}
      </section>
      <section className="border-y border-line bg-paper dark:border-white/10 dark:bg-night-soft">
        <div className="page-shell grid gap-10 py-12 md:grid-cols-2 sm:py-16">
          <div>
            <div className="mb-5 grid size-12 place-items-center rounded-2xl bg-wine/10 text-wine-light dark:text-gold"><Utensils size={22} /></div>
            <h2 className="font-display text-3xl font-semibold">{t('pairings')}</h2>
            <div className="mt-5 grid gap-3">
              {list(region.pairings, locale).map((pairing) => <div key={pairing} className="flex items-center gap-3 rounded-2xl border border-line bg-canvas p-4 dark:border-white/10 dark:bg-night"><Check size={17} className="text-leaf dark:text-leaf-light" />{pairing}</div>)}
            </div>
          </div>
          <div className="rounded-[2rem] bg-gold/12 p-7 sm:p-9 dark:bg-gold/10">
            <Sparkles className="mb-7 text-gold-dark dark:text-gold" />
            <p className="eyebrow mb-2">{t('curiosity')}</p>
            <p className="font-display text-2xl leading-relaxed sm:text-3xl">{text(region.fact, locale)}</p>
          </div>
        </div>
      </section>
      <section className="page-shell py-12 sm:py-16">
        <div className="grid gap-12 lg:grid-cols-2">
          <NearbyRegionGrid current={region} />
          <div>
            <h2 className="font-display text-3xl font-semibold">{d.related}</h2>
            <div className="mt-5 grid gap-3">
              {related.map(({ item }) => <Link key={item.id} to={`/regioes/${item.id}`} className="flex min-h-14 items-center gap-3 rounded-2xl border border-line px-4 transition hover:border-wine dark:border-white/15"><span className="size-3 rounded-full" style={{ background: item.color }} /><strong>{text(item.name, locale)}</strong><ChevronRight className="ml-auto text-muted" size={18} /></Link>)}
            </div>
          </div>
        </div>
        <DataQuality reviewedAt={region.reviewedAt} confidence={region.confidence} sources={region.sources} countryCode={region.countryCode} />
      </section>
    </>
  )
}

function InfoCard({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-3xl border border-line bg-paper p-5 dark:border-white/10 dark:bg-white/[0.03]">
      <div className="mb-5 text-wine-light dark:text-gold">{icon}</div>
      <p className="eyebrow mb-1">{label}</p>
      <p className="font-medium leading-6">{value}</p>
    </div>
  )
}

function GrapesPage() {
  const { locale, t } = useApp()
  const [search, setSearch] = useState('')
  const [type, setType] = useState<'all' | 'red' | 'white'>('all')
  const filtered = grapes.filter((grape) => {
    const matches = !search || matchesLocalized(grape.name, search) || matchesLocalized(grape.description, search) || grape.aliases.some((alias) => normalize(alias).includes(normalize(search)))
    return matches && (type === 'all' || grape.type === type)
  }).sort((a, b) => text(a.name, locale).localeCompare(text(b.name, locale)))
  return (
    <>
      <PageHero eyebrow={t('encyclopediaEyebrow')} title={t('grapesTitle')} body={t('grapesIntro')}>
        <div className="mt-7 max-w-2xl"><SearchBar compact /></div>
      </PageHero>
      <section className="page-shell py-8 sm:py-10">
        <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <label className="relative w-full sm:max-w-sm">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" size={17} />
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder={t('searchShort')} className="filter-control pl-10" />
          </label>
          <div className="flex rounded-full border border-line bg-paper p-1 dark:border-white/10 dark:bg-white/[0.03]">
            {(['all', 'red', 'white'] as const).map((item) => <button key={item} type="button" onClick={() => setType(item)} className={`rounded-full px-4 py-2 text-sm font-bold transition ${type === item ? 'bg-wine text-white' : 'text-muted hover:text-ink dark:hover:text-white'}`}>{t(item)}</button>)}
          </div>
        </div>
        <p className="mb-5 text-sm text-muted"><strong className="text-ink dark:text-cream">{filtered.length}</strong> {t('results')}</p>
        {filtered.length ? <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{filtered.map((grape) => <GrapeCard key={grape.id} grape={grape} />)}</div> : <EmptyState title={t('noGrapes')} body={t('adjustSearch')} />}
      </section>
    </>
  )
}

function Scale({ label, value }: { label: string; value: 'low' | 'medium' | 'high' | 'light' | 'full' }) {
  const { t } = useApp()
  const positions = { low: 1, light: 1, medium: 2, high: 3, full: 3 }
  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-sm"><span className="font-semibold">{label}</span><span className="text-muted">{t(value)}</span></div>
      <div className="grid grid-cols-3 gap-1.5">{[1, 2, 3].map((item) => <span key={item} className={`h-2 rounded-full ${item <= positions[value] ? 'bg-wine dark:bg-gold' : 'bg-line dark:bg-white/10'}`} />)}</div>
    </div>
  )
}

function GrapeDetailPage() {
  const { id } = useParams()
  const { locale, t } = useApp()
  const grape = id ? getGrape(id) : undefined
  useEffect(() => {
    if (id) trackEvent('grape_opened', { grape_id: id })
  }, [id])
  if (!grape) return <Navigate to="/404" replace />
  const grapeRegions = grape.regionIds.map(getRegion).filter(Boolean) as Region[]
  const d = detailCopy[locale]
  const profileValue = (value: 'low' | 'medium' | 'high' | undefined, fallback: 'low' | 'medium' | 'high') => t(value ?? fallback)
  const similar = grapes
    .filter((item) => item.id !== grape.id && item.type === grape.type)
    .map((item) => {
      const score = (item.body === grape.body ? 1 : 0) + (item.acidity === grape.acidity ? 1 : 0) + (item.tannins === grape.tannins ? 1 : 0)
      return { item, score }
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
  const typicalWines = grape.typicalWines
    ? list(grape.typicalWines, locale)
    : [...new Set(grapeRegions.flatMap((region) => list(region.wineTypes, locale)))].slice(0, 4)
  return (
    <>
      <section className="page-shell py-9 sm:py-14">
        <Link to="/castas" className="mb-9 inline-flex items-center gap-2 text-sm font-semibold text-muted hover:text-ink dark:hover:text-white"><ArrowLeft size={17} />{t('backGrapes')}</Link>
        <div className="grid gap-10 lg:grid-cols-[1fr_.8fr] lg:items-center">
          <div>
            <div className="mb-6 grape-mark grape-mark-large" style={{ '--grape-color': grape.color } as React.CSSProperties}><span /><span /><span /><span /><span /><span /><span /></div>
            <p className="eyebrow mb-3">{t(grape.type)} · {text(grape.origin, locale)}</p>
            <h1 className="font-display text-5xl font-semibold leading-none tracking-tight sm:text-7xl">{text(grape.name, locale)}</h1>
            {grape.aliases.length > 0 && <p className="mt-3 text-sm text-muted">{t('alsoKnownAs')}: {grape.aliases.join(' · ')}</p>}
            <p className="mt-6 max-w-2xl text-lg leading-8 text-muted">{text(grape.description, locale)}</p>
            {(grape.aliases.length > 0 || grape.heritage || grape.rarity || grape.identityNote) && (
              <div className="mt-6 max-w-2xl rounded-2xl border border-line bg-paper/70 p-4 dark:border-white/15 dark:bg-white/[0.045]">
                <p className="mb-3 text-xs font-bold uppercase tracking-[.16em] text-wine-light dark:text-gold">{t('namesAndHeritage')}</p>
                <div className="mb-3 flex flex-wrap gap-2">
                  {grape.heritage && <span className="chip">{t(grape.heritage === 'native' ? 'nativeGrape' : grape.heritage === 'historic' ? 'historicGrape' : 'internationalGrape')}</span>}
                  {grape.rarity && <span className="chip">{t(grape.rarity === 'rare' ? 'rareGrape' : 'revivedGrape')}</span>}
                  {grape.aliases.map((alias) => <span key={alias} className="chip">{alias}</span>)}
                </div>
                <p className="text-sm leading-6 text-muted">{grape.identityNote ? text(grape.identityNote, locale) : t('namesVaryNote')}</p>
              </div>
            )}
            <div className="mt-7"><FavoriteButton type="grape" id={grape.id} compact={false} /></div>
          </div>
          <div>
            <GrapeRadar grape={grape} />
          <div className="mt-4 rounded-[2rem] border border-line bg-paper p-6 dark:border-white/10 dark:bg-white/[0.03] sm:p-8">
            <div className="mb-7 flex items-center gap-3"><CircleGauge className="text-wine-light dark:text-gold" /><h2 className="font-display text-2xl font-semibold">{t('freshness')}</h2></div>
            <div className="grid gap-6">
              <Scale label={t('body')} value={grape.body} />
              <Scale label={t('acidity')} value={grape.acidity} />
              <Scale label={t('tannins')} value={grape.tannins} />
            </div>
            <div className="mt-8 border-t border-line pt-6 dark:border-white/10">
              <p className="eyebrow mb-3">{t('aromas')}</p>
              <div className="flex flex-wrap gap-2">{list(grape.aromas, locale).map((aroma) => <span key={aroma} className="chip chip-large">{aroma}</span>)}</div>
            </div>
          </div>
          </div>
        </div>
      </section>
      <section className="border-y border-line bg-paper dark:border-white/10 dark:bg-night-soft">
        <div className="page-shell grid gap-4 py-10 sm:grid-cols-3 sm:py-14">
          <InfoCard icon={<Thermometer />} label={t('serviceTemperature')} value={text(grape.service, locale)} />
          <InfoCard icon={<Wine />} label={t('idealGlass')} value={text(grape.glass, locale)} />
          <InfoCard icon={<Sparkles />} label={t('decanting')} value={text(grape.decanting, locale)} />
        </div>
      </section>
      <section className="page-shell grid gap-12 py-12 md:grid-cols-2 sm:py-16">
        <div>
          <SectionHeading title={t('recommendedDishes')} />
          <div className="grid gap-3">{list(grape.pairings, locale).map((pairing) => <div key={pairing} className="flex items-center gap-3 rounded-2xl border border-line p-4 dark:border-white/10"><Utensils size={17} className="text-wine-light dark:text-gold" />{pairing}</div>)}</div>
        </div>
        <div>
          <SectionHeading title={t('grownIn')} />
          <div className="grid gap-3">{grapeRegions.map((region) => <Link key={region.id} to={`/regioes/${region.id}`} className="flex items-center gap-4 rounded-2xl border border-line p-4 transition hover:-translate-y-0.5 hover:border-wine dark:border-white/10"><span className="text-2xl">{countryFlag(region.countryCode)}</span><span className="font-semibold">{text(region.name, locale)}</span><ChevronRight className="ml-auto text-muted" size={18} /></Link>)}</div>
        </div>
      </section>
      <section className="border-y border-line bg-paper dark:border-white/10 dark:bg-night-soft">
        <div className="page-shell py-12 sm:py-16">
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <InfoCard icon={<Wine />} label={d.typicalColour} value={grape.typicalColour ? text(grape.typicalColour, locale) : grape.type === 'red' ? t('red') : t('white')} />
            <InfoCard icon={<CircleGauge />} label={d.alcohol} value={profileValue(grape.alcohol, grape.body === 'full' ? 'high' : 'medium')} />
            <InfoCard icon={<Clock />} label={d.ageing} value={profileValue(grape.ageing, grape.acidity === 'high' || grape.tannins === 'high' ? 'high' : 'medium')} />
            <InfoCard icon={<Sparkles />} label={d.typicalWines} value={typicalWines.join(' · ') || d.variable} />
          </div>
          <div className="mt-12">
            <SectionHeading title={d.similar} />
            <div className="grid gap-4 sm:grid-cols-3">{similar.map(({ item }) => <GrapeCard key={item.id} grape={item} />)}</div>
          </div>
          <DataQuality reviewedAt={grape.reviewedAt} confidence={grape.confidence} sources={grape.sources} />
        </div>
      </section>
    </>
  )
}

function GuidePage() {
  const { locale, t } = useApp()
  useEffect(() => trackEvent('guide_opened', { guide_id: 'index' }), [])
  return (
    <>
      <PageHero eyebrow={t('guideEyebrow')} title={t('guideTitle')} body={t('guideIntro')} />
      <section className="page-shell py-9 sm:py-12">
        <Link to="/guia/sommelier" className="sommelier-feature group mb-7">
          <div className="sommelier-feature-art" aria-hidden="true">
            <Wine size={52} strokeWidth={1.25} />
            <span className="sommelier-feature-orbit" />
          </div>
          <div className="relative p-6 sm:p-8">
            <p className="mb-2 text-xs font-bold uppercase tracking-[.18em] text-gold">{text(sommelierGuide.eyebrow, locale)}</p>
            <h2 className="max-w-xl font-display text-3xl font-semibold sm:text-4xl">{text(sommelierGuide.title, locale)}</h2>
            <p className="mt-3 max-w-2xl leading-7 text-white/75">{text(sommelierGuide.intro, locale)}</p>
            <span className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-gold">{t('openGuide')}<ArrowRight className="transition-transform group-hover:translate-x-1" size={17} /></span>
          </div>
        </Link>
        <Link to="/guia/aromas" className="aroma-feature group mb-7">
          <div className="aroma-feature-wheel" aria-hidden="true"><span /><span /><span /><span /><span /><span /><span /><span /></div>
          <div>
            <p className="eyebrow mb-2">{t('aromaWheelEyebrow')}</p>
            <h2 className="font-display text-3xl font-semibold">{t('aromaWheelTitle')}</h2>
            <p className="mt-2 max-w-2xl leading-7 text-muted">{t('aromaWheelIntro')}</p>
            <span className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-wine-light dark:text-gold">{t('aromaOpen')}<ArrowRight size={17} /></span>
          </div>
        </Link>
        <Link to="/guia/historia" className="history-feature group mb-7">
          <div className="history-feature-mark" aria-hidden="true"><span>6000</span><i /><span>1756</span><i /><span>Hoje</span></div>
          <div>
            <p className="eyebrow mb-2">{text(wineHistory.eyebrow, locale)}</p>
            <h2 className="font-display text-3xl font-semibold">{text(wineHistory.title, locale)}</h2>
            <p className="mt-2 max-w-2xl leading-7 text-muted">{text(wineHistory.intro, locale)}</p>
            <span className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-wine-light dark:text-gold">{t('historyOpen')}<ArrowRight size={17} /></span>
          </div>
        </Link>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{articles.map((article) => <ArticleCard key={article.id} article={article} />)}</div>
        <DataQuality />
      </section>
    </>
  )
}

function SommelierPage() {
  const { locale, t } = useApp()
  return (
    <>
      <PageHero eyebrow={text(sommelierGuide.eyebrow, locale)} title={text(sommelierGuide.title, locale)} body={text(sommelierGuide.intro, locale)}>
        <Link to="/guia" className="mt-7 inline-flex items-center gap-2 text-sm font-bold text-wine-light dark:text-gold"><ArrowLeft size={17} />{t('backGuide')}</Link>
      </PageHero>

      <section className="page-shell py-10 sm:py-16">
        <div className="mb-8 rounded-2xl border border-gold/30 bg-gold/10 p-4 text-sm leading-6 text-gold-dark dark:text-[#f0d59e]">
          <Sparkles className="mr-2 inline-block align-text-bottom" size={18} />{text(sommelierGuide.note, locale)}
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {sommelierGuide.steps.map((step, index) => (
            <article key={step.id} className="sommelier-step">
              <div className="flex items-start gap-4">
                <div className="sommelier-step-icon"><GuideIcon name={step.icon} size={22} /></div>
                <div>
                  <p className="eyebrow mb-1">{String(index + 1).padStart(2, '0')}</p>
                  <h2 className="font-display text-2xl font-semibold">{text(step.title, locale)}</h2>
                </div>
              </div>
              <p className="mt-5 leading-7 text-muted">{text(step.body, locale)}</p>
              <p className="mt-4 border-t border-line pt-4 text-sm font-semibold text-wine-light dark:border-white/15 dark:text-gold">{text(step.action, locale)}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="border-y border-line bg-paper dark:border-white/10 dark:bg-night-soft">
        <div className="page-shell py-12 sm:py-16">
          <SectionHeading title={text(sommelierGuide.glassesTitle, locale)} body={text(sommelierGuide.glassesIntro, locale)} />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {sommelierGuide.glasses.map((item) => (
              <article key={item.id} className="glass-card">
                <div className={`glass-shape glass-${item.id}`} aria-hidden="true">
                  <span className="glass-bowl"><i /></span>
                  <span className="glass-stem" />
                  <span className="glass-foot" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-display text-xl font-semibold">{text(item.title, locale)}</h3>
                      <p className="mt-1 text-xs leading-5 text-muted">{text(item.examples, locale)}</p>
                    </div>
                    <span className="shrink-0 rounded-full bg-wine/8 px-2.5 py-1 text-xs font-bold text-wine-light dark:bg-gold/10 dark:text-gold">{item.temperature}</span>
                  </div>
                  <p className="mt-4 text-sm font-bold">{text(item.glass, locale)}</p>
                  <p className="mt-1 text-sm leading-6 text-muted">{text(item.why, locale)}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="page-shell py-12 sm:py-16">
        <SectionHeading title={text(sommelierGuide.rulesTitle, locale)} />
        <div className="grid gap-3 md:grid-cols-2">
          {list(sommelierGuide.rules, locale).map((rule, index) => (
            <div key={rule} className="flex items-start gap-3 rounded-2xl border border-line p-4 dark:border-white/15">
              <span className="grid size-7 shrink-0 place-items-center rounded-full bg-leaf/10 text-xs font-bold text-leaf dark:bg-leaf-light/10 dark:text-leaf-light">{index + 1}</span>
              <p className="pt-0.5 leading-6">{rule}</p>
            </div>
          ))}
        </div>
        <DataQuality />
      </section>
    </>
  )
}

function AromaWheelPage() {
  const { t } = useApp()
  const steps = [
    [t('aromaStep1Title'), t('aromaStep1Body')],
    [t('aromaStep2Title'), t('aromaStep2Body')],
    [t('aromaStep3Title'), t('aromaStep3Body')],
    [t('aromaStep4Title'), t('aromaStep4Body')],
    [t('aromaStep5Title'), t('aromaStep5Body')],
  ]
  return (
    <>
      <PageHero eyebrow={t('aromaWheelEyebrow')} title={t('aromaWheelTitle')} body={t('aromaWheelIntro')}>
        <Link to="/guia" className="mt-7 inline-flex items-center gap-2 text-sm font-bold text-wine-light dark:text-gold"><ArrowLeft size={17} />{t('backGuide')}</Link>
      </PageHero>
      <section className="page-shell pt-10 sm:pt-16">
        <SectionHeading title={t('aromaHowTitle')} body={t('aromaHowIntro')} />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {steps.map(([title, body], index) => (
            <article key={title} className="rounded-2xl border border-line bg-paper/70 p-4 dark:border-white/15 dark:bg-white/[0.045]">
              <span className="mb-4 grid size-8 place-items-center rounded-full bg-wine text-xs font-bold text-white dark:bg-gold dark:text-night">{index + 1}</span>
              <h2 className="font-display text-xl font-semibold">{title}</h2>
              <p className="mt-2 text-sm leading-6 text-muted dark:text-[#eadfe2]">{body}</p>
            </article>
          ))}
        </div>
      </section>
      <section className="page-shell py-10 sm:py-16">
        <AromaWheel />
        <DataQuality />
      </section>
    </>
  )
}

function HistoryPage() {
  const { locale, t } = useApp()
  return (
    <>
      <PageHero eyebrow={text(wineHistory.eyebrow, locale)} title={text(wineHistory.title, locale)} body={text(wineHistory.intro, locale)}>
        <Link to="/guia" className="mt-7 inline-flex items-center gap-2 text-sm font-bold text-wine-light dark:text-gold"><ArrowLeft size={17} />{t('backGuide')}</Link>
      </PageHero>
      <section className="page-shell py-10 sm:py-16">
        <div className="mb-10 rounded-2xl border border-gold/30 bg-gold/10 p-4 text-sm leading-6 text-gold-dark dark:text-[#f0d59e]">
          <Sparkles className="mr-2 inline-block align-text-bottom" size={18} />{t('historyEvidence')}
        </div>
        <div className="wine-history">
          {wineHistory.events.map((event, index) => (
            <article key={`${event.period.pt}-${index}`} className="history-event">
              <div className="history-node"><span>{String(index + 1).padStart(2, '0')}</span></div>
              <div className="history-card">
                <p className="eyebrow mb-2">{text(event.period, locale)} · {text(event.place, locale)}</p>
                <h2 className="font-display text-2xl font-semibold sm:text-3xl">{text(event.title, locale)}</h2>
                <p className="mt-3 leading-7 text-muted">{text(event.body, locale)}</p>
              </div>
            </article>
          ))}
        </div>
        <DataQuality />
      </section>
    </>
  )
}

function ArticleDetailPage() {
  const { id } = useParams()
  const { locale, t } = useApp()
  const article = id ? getArticle(id) : undefined
  useEffect(() => {
    if (id) trackEvent('article_opened', { article_id: id })
  }, [id])
  if (!article) return <Navigate to="/404" replace />
  return (
    <article>
      <section className="border-b border-line bg-paper dark:border-white/10 dark:bg-night-soft">
        <div className="page-shell max-w-4xl py-10 sm:py-16">
          <Link to="/guia" className="mb-10 inline-flex items-center gap-2 text-sm font-semibold text-muted hover:text-ink dark:hover:text-white"><ArrowLeft size={17} />{t('backGuide')}</Link>
          <div className="mb-7 grid size-14 place-items-center rounded-2xl bg-gold/15 text-gold-dark dark:text-gold"><GuideIcon name={article.icon} size={27} /></div>
          <p className="eyebrow mb-3">{text(article.eyebrow, locale)}</p>
          <h1 className="font-display text-4xl font-semibold leading-tight tracking-tight sm:text-6xl">{text(article.title, locale)}</h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-muted">{text(article.intro, locale)}</p>
        </div>
      </section>
      <section className="page-shell max-w-4xl py-10 sm:py-14">
        <h2 className="mb-6 font-display text-3xl font-semibold">{t('keyPoints')}</h2>
        <div className="grid gap-3">
          {list(article.tips, locale).map((tip, index) => (
            <div key={tip} className="flex gap-4 rounded-2xl border border-line bg-paper p-5 dark:border-white/10 dark:bg-white/[0.03]">
              <span className="grid size-7 shrink-0 place-items-center rounded-full bg-wine text-xs font-bold text-white">{index + 1}</span>
              <p className="pt-0.5 leading-6">{tip}</p>
            </div>
          ))}
        </div>
        <DataQuality reviewedAt={article.reviewedAt} confidence={article.confidence} sources={article.sources} />
      </section>
    </article>
  )
}

function FavoritesPage() {
  const { favorites, t } = useApp()
  const favoriteRegions = favorites.filter((item) => item.type === 'region').map((item) => getRegion(item.id)).filter(Boolean) as Region[]
  const favoriteGrapes = favorites.filter((item) => item.type === 'grape').map((item) => getGrape(item.id)).filter(Boolean) as GrapeType[]
  return (
    <>
      <PageHero eyebrow={`${favorites.length} ${t('saved').toLowerCase()}`} title={t('favoritesTitle')} body={t('favoritesIntro')} />
      <section className="page-shell py-9 sm:py-12">
        {!favorites.length ? <EmptyState title={t('emptyFavorites')} body={t('emptyFavoritesBody')} action={t('startExploring')} to="/regioes" /> : (
          <div className="grid gap-14">
            {favoriteRegions.length > 0 && <div><SectionHeading title={t('favoriteRegions')} /><div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{favoriteRegions.map((region) => <RegionCard key={region.id} region={region} />)}</div></div>}
            {favoriteGrapes.length > 0 && <div><SectionHeading title={t('favoriteGrapes')} /><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{favoriteGrapes.map((grape) => <GrapeCard key={grape.id} grape={grape} />)}</div></div>}
          </div>
        )}
      </section>
    </>
  )
}

function SearchPage() {
  const { locale, t } = useApp()
  const [params, setParams] = useSearchParams()
  const query = params.get('q') || ''
  const [input, setInput] = useState(query)
  const [recent, setRecent] = useState(getRecentSearches)
  const results = useMemo(() => unifiedSearch(query, locale), [locale, query])
  const categories: Record<SearchCategory, string> = {
    region: locale === 'pt' ? 'Região vinícola' : locale === 'de' ? 'Weinregion' : 'Wine Region',
    grape: locale === 'pt' ? 'Casta' : locale === 'de' ? 'Rebsorte' : 'Grape Variety',
    guide: locale === 'pt' ? 'Guia de vinho' : locale === 'de' ? 'Weinführer' : 'Wine Guide',
    article: locale === 'pt' ? 'Artigo' : locale === 'de' ? 'Artikel' : 'Article',
  }
  useEffect(() => setInput(query), [query])
  function submit(event: FormEvent) {
    event.preventDefault()
    if (input.trim()) {
      rememberSearch(input)
      setRecent(getRecentSearches())
      trackEvent('search_performed', { query_length: input.trim().length, result_count: unifiedSearch(input, locale).length })
      setParams({ q: input.trim() })
    } else setParams({})
  }
  return (
    <>
      <PageHero eyebrow={t('search')} title={t('searchResults')} body={query ? `${results.length} ${t('results')} · “${query}”` : t('searchFor')}>
        <form onSubmit={submit} className="relative mt-7 max-w-2xl">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={20} />
          <input value={input} onChange={(event) => setInput(event.target.value)} className="h-14 w-full rounded-2xl border border-line bg-white pl-12 pr-24 outline-none focus:border-wine dark:border-white/15 dark:bg-white/[0.06]" placeholder={t('searchPlaceholder')} />
          <button className="absolute right-2 top-2 h-10 rounded-xl bg-wine px-4 text-sm font-bold text-white">{t('search')}</button>
        </form>
      </PageHero>
      <section className="page-shell py-9 sm:py-12">
        {!query ? (
          <div>
            {recent.length > 0 && <><p className="eyebrow mb-3">{locale === 'pt' ? 'Pesquisas recentes' : locale === 'de' ? 'Letzte Suchen' : 'Recent searches'}</p><div className="flex flex-wrap gap-2">{recent.map((item) => <button key={item} type="button" className="chip min-h-11 px-4" onClick={() => setParams({ q: item })}><Clock size={14} />{item}</button>)}</div></>}
            {!recent.length && <EmptyState title={t('searchFor')} body={t('adjustSearch')} />}
          </div>
        ) : !results.length ? <EmptyState title={`${t('noSearch')} “${query}”`} body={t('adjustSearch')} /> : (
          <div className="grid gap-3">
            {results.map((result) => (
              <Link key={`${result.category}-${result.id}`} to={result.to} className="group flex min-h-24 items-start gap-4 rounded-2xl border border-line bg-paper p-4 transition hover:border-wine dark:border-white/15 dark:bg-white/[0.03]">
                <span className="mt-0.5 rounded-full bg-wine/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-wine-light dark:bg-gold/10 dark:text-gold">{categories[result.category]}</span>
                <span className="min-w-0 flex-1"><strong className="font-display text-xl">{result.title}</strong><span className="mt-1 line-clamp-2 block text-sm leading-6 text-muted">{result.summary}</span></span>
                <ChevronRight className="mt-3 shrink-0 text-muted transition group-hover:translate-x-1" size={18} />
              </Link>
            ))}
          </div>
        )}
      </section>
    </>
  )
}

function PrivacyPage() {
  const { t } = useApp()
  return (
    <section className="page-shell max-w-3xl py-14 sm:py-20">
      <div className="mb-7 grid size-14 place-items-center rounded-2xl bg-leaf/10 text-leaf dark:text-leaf-light"><Heart size={25} /></div>
      <h1 className="font-display text-5xl font-semibold">{t('privacyTitle')}</h1>
      <p className="mt-6 text-lg leading-8 text-muted">{t('privacyBody')}</p>
      <Link to="/" className="button-primary mt-8"><ArrowLeft size={18} />{t('goHome')}</Link>
    </section>
  )
}

function NotFoundPage() {
  const { t } = useApp()
  return (
    <section className="page-shell grid min-h-[65vh] place-items-center py-16 text-center">
      <div>
        <p className="font-display text-8xl font-semibold text-wine/15 dark:text-gold/15">404</p>
        <h1 className="-mt-5 font-display text-4xl font-semibold">{t('pageNotFound')}</h1>
        <p className="mt-3 text-muted">{t('pageNotFoundBody')}</p>
        <Link to="/" className="button-primary mt-7">{t('goHome')}<ArrowRight size={18} /></Link>
      </div>
    </section>
  )
}

function AppRoutes() {
  const { t } = useApp()
  return (
    <Layout>
      <Suspense fallback={<div className="page-shell grid min-h-[45vh] place-items-center"><p className="eyebrow">{t('loading')}</p></div>}>
        <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/regioes" element={<RegionsPage />} />
        <Route path="/regioes/:id" element={<RegionDetailPage />} />
        <Route path="/castas" element={<GrapesPage />} />
        <Route path="/castas/:id" element={<GrapeDetailPage />} />
        <Route path="/guia" element={<GuidePage />} />
        <Route path="/guia/sommelier" element={<SommelierPage />} />
        <Route path="/guia/aromas" element={<AromaWheelPage />} />
        <Route path="/guia/historia" element={<HistoryPage />} />
        <Route path="/guia/:id" element={<ArticleDetailPage />} />
        <Route path="/ferramentas" element={<ToolsHubPage />} />
        <Route path="/ferramentas/prova" element={<GuidedTastingPage />} />
        <Route path="/ferramentas/escolher" element={<WineChooserPage />} />
        <Route path="/ferramentas/comparar" element={<GrapeComparePage />} />
        <Route path="/favoritos" element={<FavoritesPage />} />
        <Route path="/pesquisa" element={<SearchPage />} />
        <Route path="/privacidade" element={<PrivacyPage />} />
        <Route path="/404" element={<NotFoundPage />} />
        <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </Layout>
  )
}

interface ErrorBoundaryState { hasError: boolean }

export class ErrorBoundary extends Component<{ children: ReactNode }, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false }
  static getDerivedStateFromError() { return { hasError: true } }
  componentDidCatch(error: Error, info: ErrorInfo) { console.error(error, info) }
  render() {
    if (this.state.hasError) {
      return (
        <div className="grid min-h-dvh place-items-center bg-canvas p-6 text-center text-ink dark:bg-night dark:text-cream">
          <div><Wine className="mx-auto mb-5 text-wine-light" size={38} /><h1 className="font-display text-4xl font-semibold">Wine Atlas</h1><p className="mt-3 text-muted">Something went wrong. Refresh and try again.</p><button type="button" className="button-primary mt-6" onClick={() => location.reload()}>Refresh</button></div>
        </div>
      )
    }
    return this.props.children
  }
}

export default AppRoutes
