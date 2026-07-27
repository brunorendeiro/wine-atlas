import { useMemo, useState } from 'react'
import { Clock, MapPin, Minus, Plus, Search, ShieldCheck } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { distanceKm, regions, text } from '../lib/data'
import { searchLocations } from '../lib/locations'
import type { Grape, Region, Source } from '../types'

const copy = {
  pt: {
    manual: 'Escolher localização', placeholder: 'País, cidade ou região vinícola…', useDevice: 'Usar localização do dispositivo',
    nearby: 'Regiões vinícolas próximas', travel: 'de carro (estimativa)', selected: 'Localização escolhida',
    reviewed: 'Última revisão', sources: 'Fontes', confidence: 'Nível de confiança', high: 'Alto', medium: 'Médio',
    evidence: 'Consulta as fontes indicadas. As condições, classificações e regras locais podem mudar.',
    country: 'País', city: 'Cidade', region: 'Região', device: 'Dispositivo',
  },
  en: {
    manual: 'Choose location', placeholder: 'Country, city or wine region…', useDevice: 'Use device location',
    nearby: 'Nearby wine regions', travel: 'by car (estimate)', selected: 'Selected location',
    reviewed: 'Last reviewed', sources: 'Sources', confidence: 'Confidence level', high: 'High', medium: 'Medium',
    evidence: 'Consult the listed sources. Local conditions, classifications and rules may change.',
    country: 'Country', city: 'City', region: 'Region', device: 'Device',
  },
  de: {
    manual: 'Standort wählen', placeholder: 'Land, Stadt oder Weinregion…', useDevice: 'Gerätestandort verwenden',
    nearby: 'Weinregionen in der Nähe', travel: 'mit dem Auto (Schätzung)', selected: 'Gewählter Standort',
    reviewed: 'Zuletzt geprüft', sources: 'Quellen', confidence: 'Vertrauensniveau', high: 'Hoch', medium: 'Mittel',
    evidence: 'Bitte die angegebenen Quellen beachten. Lokale Bedingungen, Klassifikationen und Regeln können sich ändern.',
    country: 'Land', city: 'Stadt', region: 'Region', device: 'Gerät',
  },
} as const

export function LocationSelector() {
  const { locale, requestLocation, selectLocation, selectedLocation } = useApp()
  const t = copy[locale]
  const [query, setQuery] = useState('')
  const options = useMemo(() => searchLocations(query, locale), [locale, query])
  return (
    <div className="mt-6 max-w-xl rounded-2xl border border-white/20 bg-white/10 p-3 backdrop-blur">
      <label className="relative block">
        <span className="sr-only">{t.manual}</span>
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/60" size={18} />
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t.placeholder} className="h-12 w-full rounded-xl border border-white/20 bg-white/10 pl-10 pr-3 text-sm text-white outline-none placeholder:text-white/50 focus-visible:ring-2 focus-visible:ring-cream" />
      </label>
      {query && (
        <div className="mt-2 grid max-h-56 gap-1 overflow-y-auto" role="listbox">
          {options.map((option) => (
            <button key={option.id} type="button" role="option" aria-selected={selectedLocation?.id === option.id} className="flex min-h-11 items-center gap-2 rounded-xl px-3 text-left text-sm font-semibold hover:bg-white/10 focus-visible:bg-white/15" onClick={() => { selectLocation(option); setQuery('') }}>
              <MapPin size={15} /><span>{text(option.label, locale)}</span><span className="ml-auto text-[10px] uppercase tracking-wider text-white/50">{t[option.kind]}</span>
            </button>
          ))}
        </div>
      )}
      <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
        {selectedLocation && <span className="text-xs text-white/65">{t.selected}: <strong className="text-white">{text(selectedLocation.label, locale)}</strong></span>}
        <button type="button" className="min-h-11 text-xs font-bold text-cream underline-offset-4 hover:underline" onClick={requestLocation}>{t.useDevice}</button>
      </div>
    </div>
  )
}

export function NearbyRegionGrid({ current }: { current?: Region }) {
  const { locale, location } = useApp()
  const t = copy[locale]
  const origin = current?.coordinates ?? location
  if (!origin) return null
  const nearby = regions
    .filter((region) => region.id !== current?.id)
    .map((region) => ({ region, distance: distanceKm(origin, region.coordinates) }))
    .sort((a, b) => a.distance - b.distance)
    .slice(0, 4)
  return (
    <div>
      <h2 className="font-display text-3xl font-semibold">{t.nearby}</h2>
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {nearby.map(({ region, distance }) => {
          const travelHours = Math.max(0.5, distance * 1.25 / 75)
          return (
            <Link key={region.id} to={`/regioes/${region.id}`} className="group rounded-2xl border border-line p-4 transition hover:border-wine dark:border-white/15">
              <div className="flex items-center gap-3"><span className="size-3 rounded-full" style={{ background: region.color }} /><strong>{text(region.name, locale)}</strong><span className="ml-auto text-sm text-muted">{Math.round(distance)} km</span></div>
              <p className="mt-2 flex items-center gap-1 text-xs text-muted"><Clock size={13} />{travelHours < 1 ? '30–60 min' : `${Math.round(travelHours)} h`} {t.travel}</p>
            </Link>
          )
        })}
      </div>
    </div>
  )
}

export function RegionMap({ region }: { region: Region }) {
  const { locale } = useApp()
  const [zoom, setZoom] = useState(1)
  const labels = {
    pt: { map: 'Mapa interativo', current: 'Região atual', nearby: 'Região próxima', zoomIn: 'Aproximar mapa', zoomOut: 'Afastar mapa' },
    en: { map: 'Interactive map', current: 'Current region', nearby: 'Nearby region', zoomIn: 'Zoom in', zoomOut: 'Zoom out' },
    de: { map: 'Interaktive Karte', current: 'Aktuelle Region', nearby: 'Nahe Region', zoomIn: 'Vergrößern', zoomOut: 'Verkleinern' },
  }[locale]
  const baseBounds = mapBounds(region)
  const bounds = zoomBounds(baseBounds, region.coordinates, zoom)
  const points = regions
    .filter((item) => insideBounds(item.coordinates, bounds))
    .map((item) => ({ item, distance: distanceKm(region.coordinates, item.coordinates) }))
    .sort((a, b) => a.distance - b.distance)
    .slice(0, 8)
    .map(({ item }) => item)

  return (
    <figure>
      <div className="relative h-80 overflow-hidden rounded-[2rem] border border-line bg-[#dce8e3] shadow-sm dark:border-white/15 dark:bg-[#23342f]" aria-label={`${labels.map}: ${text(region.name, locale)}`}>
        <svg className="absolute inset-0 size-full" viewBox="0 0 1000 560" preserveAspectRatio="none" aria-hidden="true">
          <defs>
            <linearGradient id="wine-atlas-sea" x1="0" y1="0" x2="1" y2="1">
              <stop stopColor="#e8f1ed" />
              <stop offset="1" stopColor="#cadbd4" />
            </linearGradient>
            <pattern id="wine-atlas-grid" width="80" height="80" patternUnits="userSpaceOnUse">
              <path d="M80 0H0V80" fill="none" stroke="#516851" strokeOpacity=".12" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="1000" height="560" fill="url(#wine-atlas-sea)" />
          <rect width="1000" height="560" fill="url(#wine-atlas-grid)" />
          {mapLand.map((land) => (
            <polygon
              key={land.id}
              points={land.coordinates.map(([lng, lat]) => projectPoint({ lat, lng }, bounds)).join(' ')}
              fill={land.countryCodes.includes(region.countryCode) ? '#d8c99d' : '#f4edda'}
              stroke="#718173"
              strokeWidth="3"
              vectorEffect="non-scaling-stroke"
            />
          ))}
          {mapRivers.map((river) => (
            <polyline
              key={river.id}
              points={river.coordinates.map(([lng, lat]) => projectPoint({ lat, lng }, bounds)).join(' ')}
              fill="none"
              stroke="#86aeb8"
              strokeOpacity=".75"
              strokeWidth="2"
              vectorEffect="non-scaling-stroke"
            />
          ))}
        </svg>

        {points.map((item) => {
          const { left, top } = projectPercent(item.coordinates, bounds)
          const active = item.id === region.id
          return (
            <Link
              key={item.id}
              to={`/regioes/${item.id}`}
              aria-label={`${active ? labels.current : labels.nearby}: ${text(item.name, locale)}`}
              title={text(item.name, locale)}
              className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-full shadow-lg transition hover:scale-110 focus-visible:ring-4 focus-visible:ring-gold ${active ? 'z-10 grid size-12 place-items-center bg-wine text-white' : 'grid size-9 place-items-center border-2 border-wine bg-cream text-wine'}`}
              style={{ left: `${left}%`, top: `${top}%` }}
            >
              <MapPin size={active ? 22 : 17} aria-hidden="true" />
              {active && <span className="absolute left-1/2 top-full mt-1 -translate-x-1/2 whitespace-nowrap rounded-full bg-night/90 px-2.5 py-1 text-[11px] font-bold text-white">{text(item.name, locale)}</span>}
            </Link>
          )
        })}

        <div className="absolute right-3 top-3 grid overflow-hidden rounded-xl border border-line bg-canvas/95 shadow backdrop-blur dark:border-white/15 dark:bg-night/95">
          <button type="button" className="grid size-11 place-items-center border-b border-line text-ink hover:bg-paper disabled:opacity-35 dark:border-white/15 dark:text-white dark:hover:bg-white/10" aria-label={labels.zoomIn} disabled={zoom >= 2} onClick={() => setZoom((value) => Math.min(2, value + 0.5))}><Plus size={18} aria-hidden="true" /></button>
          <button type="button" className="grid size-11 place-items-center text-ink hover:bg-paper disabled:opacity-35 dark:text-white dark:hover:bg-white/10" aria-label={labels.zoomOut} disabled={zoom <= 1} onClick={() => setZoom((value) => Math.max(1, value - 0.5))}><Minus size={18} aria-hidden="true" /></button>
        </div>
        <figcaption className="absolute bottom-3 left-3 rounded-full bg-canvas/95 px-3 py-1.5 text-xs font-semibold shadow backdrop-blur dark:bg-night/95">
          {region.coordinates.lat.toFixed(2)}°, {region.coordinates.lng.toFixed(2)}°
        </figcaption>
      </div>
      <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-xs text-muted">
        <span className="inline-flex items-center gap-2"><span className="size-3 rounded-full bg-wine" />{labels.current}</span>
        <span className="inline-flex items-center gap-2"><span className="size-3 rounded-full border-2 border-wine bg-cream" />{labels.nearby}</span>
      </div>
    </figure>
  )
}

type MapBounds = { minLng: number; maxLng: number; minLat: number; maxLat: number }

const countryBounds: Record<string, MapBounds> = {
  PT: { minLng: -10.4, maxLng: -5.8, minLat: 36.5, maxLat: 42.4 },
  ES: { minLng: -10.2, maxLng: 4.2, minLat: 35.5, maxLat: 44.4 },
  FR: { minLng: -5.8, maxLng: 9.8, minLat: 41.2, maxLat: 51.5 },
  CH: { minLng: 5.4, maxLng: 10.8, minLat: 45.4, maxLat: 48.2 },
  IT: { minLng: 6, maxLng: 19, minLat: 36, maxLat: 48 },
}

function mapBounds(region: Region): MapBounds {
  if (region.coordinates.lng < -20) return { minLng: -29.8, maxLng: -24.2, minLat: 36.2, maxLat: 40.1 }
  if (region.coordinates.lng < -14) return { minLng: -18.2, maxLng: -15.2, minLat: 31.8, maxLat: 33.8 }
  return countryBounds[region.countryCode] ?? { minLng: -11, maxLng: 20, minLat: 35, maxLat: 52 }
}

function zoomBounds(bounds: MapBounds, center: Region['coordinates'], zoom: number): MapBounds {
  if (zoom === 1) return bounds
  const width = (bounds.maxLng - bounds.minLng) / zoom
  const height = (bounds.maxLat - bounds.minLat) / zoom
  return {
    minLng: center.lng - width / 2,
    maxLng: center.lng + width / 2,
    minLat: center.lat - height / 2,
    maxLat: center.lat + height / 2,
  }
}

function insideBounds(point: Region['coordinates'], bounds: MapBounds) {
  return point.lng >= bounds.minLng && point.lng <= bounds.maxLng && point.lat >= bounds.minLat && point.lat <= bounds.maxLat
}

function projectPoint(point: Region['coordinates'], bounds: MapBounds) {
  const x = (point.lng - bounds.minLng) / (bounds.maxLng - bounds.minLng) * 1000
  const y = (bounds.maxLat - point.lat) / (bounds.maxLat - bounds.minLat) * 560
  return `${x.toFixed(1)},${y.toFixed(1)}`
}

function projectPercent(point: Region['coordinates'], bounds: MapBounds) {
  return {
    left: (point.lng - bounds.minLng) / (bounds.maxLng - bounds.minLng) * 100,
    top: (bounds.maxLat - point.lat) / (bounds.maxLat - bounds.minLat) * 100,
  }
}

const mapLand: { id: string; countryCodes: string[]; coordinates: [number, number][] }[] = [
  { id: 'portugal', countryCodes: ['PT'], coordinates: [[-9.5, 42.1], [-8.2, 42], [-8.1, 41.2], [-6.8, 41], [-7.1, 39.7], [-7.5, 38.3], [-7.2, 37], [-8.9, 37], [-9.5, 38.7], [-9.1, 40.1], [-9.5, 42.1]] },
  { id: 'spain', countryCodes: ['ES'], coordinates: [[-9.3, 43.7], [-6.5, 43.6], [-3, 43.5], [0.5, 42.8], [3.2, 42.4], [2.9, 40.8], [0.5, 38.8], [-0.7, 37.1], [-5.6, 36], [-7.2, 37], [-7.5, 38.3], [-7.1, 39.7], [-6.8, 41], [-8.2, 42], [-9.3, 43.7]] },
  { id: 'france', countryCodes: ['FR'], coordinates: [[-4.8, 48.5], [-1.8, 46.8], [-1.5, 43.5], [2.9, 42.4], [7.5, 43.7], [7.6, 48.6], [4.8, 50.1], [1.6, 50.9], [-1.7, 49.7], [-4.8, 48.5]] },
  { id: 'central-europe', countryCodes: ['DE', 'CH'], coordinates: [[5.8, 47.9], [7.6, 48.6], [7.5, 53], [14.8, 53.8], [16.8, 48.6], [13.8, 46.3], [10.5, 46], [9.5, 47.5], [5.8, 47.9]] },
  { id: 'switzerland', countryCodes: ['CH'], coordinates: [[5.9, 47.5], [6.8, 46.2], [8.4, 45.8], [10.5, 46], [9.5, 47.5], [8.5, 47.8], [5.9, 47.5]] },
  { id: 'italy', countryCodes: ['IT'], coordinates: [[7.5, 46.2], [12.2, 47], [13.7, 45.7], [12.5, 44.2], [15.7, 41.9], [17.9, 40.5], [16.5, 39.7], [14.7, 41], [12.3, 42.3], [10, 43.8], [8.1, 44.1], [7.5, 46.2]] },
  { id: 'sicily', countryCodes: ['IT'], coordinates: [[12.4, 38.2], [15.7, 38.2], [15.2, 36.7], [12.7, 37.2], [12.4, 38.2]] },
  { id: 'sardinia', countryCodes: ['IT'], coordinates: [[8.1, 41.3], [9.8, 41.2], [9.5, 38.8], [8.2, 39.1], [8.1, 41.3]] },
  { id: 'azores', countryCodes: ['PT'], coordinates: [[-28.9, 38.9], [-27.5, 39.1], [-25, 37.3], [-25.8, 36.9], [-28.9, 38.9]] },
  { id: 'madeira', countryCodes: ['PT'], coordinates: [[-17.4, 32.9], [-16.6, 33.1], [-16.2, 32.6], [-17.1, 32.5], [-17.4, 32.9]] },
]

const mapRivers: { id: string; coordinates: [number, number][] }[] = [
  { id: 'douro', coordinates: [[-8.8, 41.15], [-7.8, 41.1], [-6.8, 41.4], [-5.5, 41.6], [-3.7, 41.7]] },
  { id: 'tagus', coordinates: [[-9.2, 38.7], [-8.1, 39.1], [-6.8, 39.6], [-4.8, 39.8], [-3.7, 40.1]] },
  { id: 'rhone', coordinates: [[4.8, 46.2], [4.9, 44.8], [4.7, 43.4]] },
  { id: 'rhine', coordinates: [[8, 47.6], [7.6, 49], [6.8, 50.5]] },
]

const sourceByCountry: Record<string, Source[]> = {
  PT: [{ title: 'Instituto da Vinha e do Vinho', url: 'https://www.ivv.gov.pt/' }, { title: 'Wines of Portugal', url: 'https://www.winesofportugal.com/' }],
  ES: [{ title: 'Organización Interprofesional del Vino de España', url: 'https://www.interprofesionaldelvino.es/' }],
  FR: [{ title: 'Institut national de l’origine et de la qualité', url: 'https://www.inao.gouv.fr/' }],
  DE: [{ title: 'Deutsches Weininstitut', url: 'https://www.deutscheweine.de/' }],
  CH: [{ title: 'Swiss Wine Promotion', url: 'https://www.swisswine.ch/' }],
  IT: [{ title: 'Ministero dell’agricoltura', url: 'https://www.masaf.gov.it/' }],
}

export function DataQuality({ reviewedAt = '2026-07-27', confidence = 'medium', sources, countryCode }: { reviewedAt?: string; confidence?: 'high' | 'medium'; sources?: Source[]; countryCode?: string }) {
  const { locale } = useApp()
  const t = copy[locale]
  const resolved = sources?.length ? sources : (countryCode && sourceByCountry[countryCode]) || [{ title: 'OIV — International Organisation of Vine and Wine', url: 'https://www.oiv.int/' }]
  return (
    <footer className="mt-14 border-t border-line pt-8 dark:border-white/15">
      <div className="flex flex-wrap gap-x-8 gap-y-3 text-sm">
        <p><strong>{t.reviewed}:</strong> <time dateTime={reviewedAt}>{new Intl.DateTimeFormat(locale, { dateStyle: 'long' }).format(new Date(`${reviewedAt}T12:00:00`))}</time></p>
        <p className="inline-flex items-center gap-1.5"><ShieldCheck size={16} className="text-leaf dark:text-leaf-light" /><strong>{t.confidence}:</strong> {t[confidence]}</p>
      </div>
      <p className="mt-3 text-sm text-muted">{t.evidence}</p>
      <h2 className="mt-6 text-sm font-bold uppercase tracking-widest">{t.sources}</h2>
      <ul className="mt-3 flex flex-wrap gap-2">
        {resolved.map((source) => <li key={source.url}><a className="chip inline-flex min-h-10 items-center hover:text-wine-light dark:hover:text-gold" href={source.url} target="_blank" rel="noreferrer">{source.title}</a></li>)}
      </ul>
    </footer>
  )
}

const level = { low: 1, light: 1, medium: 2, high: 3, full: 3 }

export function GrapeRadar({ grape }: { grape: Grape }) {
  const { locale } = useApp()
  const labels = {
    pt: ['Corpo', 'Acidez', 'Tanino', 'Fruta', 'Guarda'],
    en: ['Body', 'Acidity', 'Tannin', 'Fruit', 'Ageing'],
    de: ['Körper', 'Säure', 'Tannin', 'Frucht', 'Reife'],
  }[locale]
  const values = [level[grape.body], level[grape.acidity], level[grape.tannins], level[grape.fruit ?? 'high'], level[grape.ageing ?? (grape.acidity === 'high' ? 'high' : 'medium')]]
  const center = 120
  const radius = 78
  const point = (index: number, factor: number) => {
    const angle = -Math.PI / 2 + index * Math.PI * 2 / 5
    return `${center + Math.cos(angle) * radius * factor},${center + Math.sin(angle) * radius * factor}`
  }
  return (
    <figure className="rounded-[2rem] border border-line bg-paper p-5 dark:border-white/15 dark:bg-white/[0.03]">
      <svg viewBox="0 0 240 240" className="mx-auto w-full max-w-xs" role="img" aria-label={labels.map((label, index) => `${label} ${values[index]}/3`).join(', ')}>
        {[1, 2, 3].map((ring) => <polygon key={ring} points={labels.map((_, index) => point(index, ring / 3)).join(' ')} fill="none" stroke="currentColor" className="text-line dark:text-white/15" />)}
        {labels.map((_, index) => <line key={index} x1={center} y1={center} x2={point(index, 1).split(',')[0]} y2={point(index, 1).split(',')[1]} stroke="currentColor" className="text-line dark:text-white/15" />)}
        <polygon points={values.map((value, index) => point(index, value / 3)).join(' ')} fill={grape.color} fillOpacity=".28" stroke={grape.color} strokeWidth="3" />
        {values.map((value, index) => { const [cx, cy] = point(index, value / 3).split(','); return <circle key={index} cx={cx} cy={cy} r="4" fill={grape.color} /> })}
      </svg>
      <figcaption className="grid grid-cols-5 gap-1 text-center text-[10px] font-bold uppercase tracking-wide text-muted">{labels.map((label) => <span key={label}>{label}</span>)}</figcaption>
    </figure>
  )
}
