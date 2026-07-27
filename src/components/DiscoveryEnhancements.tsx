import { useMemo, useState } from 'react'
import { Clock, MapPin, Search, ShieldCheck } from 'lucide-react'
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
  const nearby = regions
    .filter((item) => item.id !== region.id)
    .map((item) => ({ item, distance: distanceKm(region.coordinates, item.coordinates) }))
    .sort((a, b) => a.distance - b.distance)
    .slice(0, 5)
  const points = [region, ...nearby.map(({ item }) => item)]
  const lats = points.map((item) => item.coordinates.lat)
  const lngs = points.map((item) => item.coordinates.lng)
  const minLat = Math.min(...lats) - 1
  const maxLat = Math.max(...lats) + 1
  const minLng = Math.min(...lngs) - 1
  const maxLng = Math.max(...lngs) + 1
  return (
    <div className="relative h-72 overflow-hidden rounded-[2rem] border border-line bg-leaf/8 dark:border-white/15 dark:bg-leaf/20" aria-label={`Map: ${text(region.name, locale)}`}>
      <div className="absolute inset-0 opacity-40" style={{ backgroundImage: 'linear-gradient(rgba(81,104,81,.18) 1px, transparent 1px), linear-gradient(90deg, rgba(81,104,81,.18) 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
      {points.map((item) => {
        const left = ((item.coordinates.lng - minLng) / (maxLng - minLng)) * 82 + 9
        const top = (1 - (item.coordinates.lat - minLat) / (maxLat - minLat)) * 72 + 12
        const active = item.id === region.id
        return <Link key={item.id} to={`/regioes/${item.id}`} aria-label={text(item.name, locale)} title={text(item.name, locale)} className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-full shadow-lg transition hover:scale-110 focus-visible:ring-4 ${active ? 'z-10 grid size-12 place-items-center bg-wine text-white' : 'grid size-8 place-items-center bg-cream text-wine'}`} style={{ left: `${left}%`, top: `${top}%` }}><MapPin size={active ? 22 : 16} /></Link>
      })}
      <div className="absolute bottom-3 left-3 rounded-full bg-canvas/90 px-3 py-1.5 text-xs font-semibold shadow backdrop-blur dark:bg-night/90">{region.coordinates.lat.toFixed(2)}°, {region.coordinates.lng.toFixed(2)}°</div>
    </div>
  )
}

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
