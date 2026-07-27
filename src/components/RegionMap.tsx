import { geoGraticule10, geoMercator, geoPath } from 'd3-geo'
import { LocateFixed, Minus, Plus } from 'lucide-react'
import { useMemo, useRef, useState, type PointerEvent as ReactPointerEvent, type WheelEvent } from 'react'
import { Link } from 'react-router-dom'
import { feature } from 'topojson-client'
import countriesTopology from 'world-atlas/countries-110m.json'
import type { Feature, FeatureCollection, GeoJsonProperties, Geometry, Polygon } from 'geojson'
import type { GeometryCollection, Topology } from 'topojson-specification'
import { useApp } from '../context/AppContext'
import { distanceKm, regions, text } from '../lib/data'
import type { Region } from '../types'

const WIDTH = 1000
const HEIGHT = 780
type Bounds = [number, number, number, number]

const countryIds: Record<string, number> = {
  CH: 756,
  ES: 724,
  FR: 250,
  IT: 380,
  PT: 620,
}

const countryBounds: Record<string, Bounds> = {
  CH: [5.75, 45.65, 10.65, 47.95],
  ES: [-10.25, 35.6, 4.35, 44.25],
  FR: [-5.4, 41.2, 9.7, 51.3],
  IT: [6.2, 36.2, 18.8, 47.4],
  PT: [-10.1, 36.7, -6, 42.25],
}

const islandBounds: Record<string, Bounds> = {
  acores: [-29.8, 36.6, -24.6, 39.9],
  madeira: [-17.5, 32.35, -16, 33.25],
}

const topology = countriesTopology as unknown as Topology<{ countries: GeometryCollection<GeoJsonProperties> }>
const countries = feature(topology, topology.objects.countries) as unknown as FeatureCollection<Geometry, GeoJsonProperties>
const graticule = geoGraticule10()

function boundsFeature([minLng, minLat, maxLng, maxLat]: Bounds): Feature<Polygon> {
  return {
    type: 'Feature',
    properties: {},
    geometry: {
      type: 'Polygon',
      coordinates: [[
        [minLng, minLat],
        [minLng, maxLat],
        [maxLng, maxLat],
        [maxLng, minLat],
        [minLng, minLat],
      ]],
    },
  }
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

export function RegionMap({ region }: { region: Region }) {
  const { locale } = useApp()
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const drag = useRef<{ x: number; y: number; panX: number; panY: number } | null>(null)
  const labels = {
    pt: {
      map: 'Mapa interativo',
      current: 'Região atual',
      nearby: 'Regiões próximas no mapa',
      open: 'Abrir região',
      help: 'Arrasta para explorar e usa os controlos para aproximar.',
      zoomIn: 'Aproximar mapa',
      zoomOut: 'Afastar mapa',
      reset: 'Centrar mapa',
    },
    en: {
      map: 'Interactive map',
      current: 'Current region',
      nearby: 'Nearby regions on the map',
      open: 'Open region',
      help: 'Drag to explore and use the controls to zoom.',
      zoomIn: 'Zoom in',
      zoomOut: 'Zoom out',
      reset: 'Reset map',
    },
    de: {
      map: 'Interaktive Karte',
      current: 'Aktuelle Region',
      nearby: 'Nahe Regionen auf der Karte',
      open: 'Region öffnen',
      help: 'Zum Erkunden ziehen und mit den Steuerelementen zoomen.',
      zoomIn: 'Vergrößern',
      zoomOut: 'Verkleinern',
      reset: 'Karte zentrieren',
    },
  }[locale]

  const nearby = useMemo(() => regions
    .filter((item) => item.id !== region.id)
    .map((item) => ({ item, distance: distanceKm(region.coordinates, item.coordinates) }))
    .sort((a, b) => a.distance - b.distance)
    .slice(0, 7), [region])

  const projection = useMemo(() => {
    const bounds = islandBounds[region.id] ?? countryBounds[region.countryCode] ?? [-11, 35, 20, 52]
    return geoMercator().fitExtent([[45, 45], [WIDTH - 45, HEIGHT - 55]], boundsFeature(bounds))
  }, [region.countryCode, region.id])
  const path = useMemo(() => geoPath(projection), [projection])
  const activeCountryId = countryIds[region.countryCode]
  const mapRegions = [region, ...nearby.map(({ item }) => item)]

  function transformedPoint(item: Region) {
    const projected = projection([item.coordinates.lng, item.coordinates.lat]) ?? [WIDTH / 2, HEIGHT / 2]
    return {
      x: WIDTH / 2 + (projected[0] - WIDTH / 2) * zoom + pan.x,
      y: HEIGHT / 2 + (projected[1] - HEIGHT / 2) * zoom + pan.y,
    }
  }

  function updateZoom(next: number) {
    setZoom(clamp(next, 1, 2.5))
    if (next <= 1) setPan({ x: 0, y: 0 })
  }

  function onPointerDown(event: ReactPointerEvent<SVGSVGElement>) {
    event.currentTarget.setPointerCapture(event.pointerId)
    drag.current = { x: event.clientX, y: event.clientY, panX: pan.x, panY: pan.y }
  }

  function onPointerMove(event: ReactPointerEvent<SVGSVGElement>) {
    if (!drag.current) return
    const factor = WIDTH / Math.max(1, event.currentTarget.getBoundingClientRect().width)
    setPan({
      x: clamp(drag.current.panX + (event.clientX - drag.current.x) * factor, -320, 320),
      y: clamp(drag.current.panY + (event.clientY - drag.current.y) * factor, -240, 240),
    })
  }

  function stopDragging(event: ReactPointerEvent<SVGSVGElement>) {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId)
    drag.current = null
  }

  function onWheel(event: WheelEvent<SVGSVGElement>) {
    event.preventDefault()
    updateZoom(zoom + (event.deltaY < 0 ? 0.25 : -0.25))
  }

  return (
    <figure>
      <div
        className="atlas-region-map relative h-[23rem] overflow-hidden rounded-[2rem] border border-line bg-[#dce9e5] shadow-sm dark:border-white/15 dark:bg-[#1b2926]"
        role="application"
        aria-label={`${labels.map}: ${text(region.name, locale)}`}
      >
        <svg
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          preserveAspectRatio="none"
          className="absolute inset-0 size-full cursor-grab touch-none select-none active:cursor-grabbing"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={stopDragging}
          onPointerCancel={stopDragging}
          onWheel={onWheel}
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="atlas-sea" x1="0" y1="0" x2="1" y2="1">
              <stop stopColor="#e4efeb" />
              <stop offset="1" stopColor="#c9dcd6" />
            </linearGradient>
            <filter id="atlas-land-shadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="5" stdDeviation="5" floodColor="#24322d" floodOpacity=".16" />
            </filter>
          </defs>
          <rect width={WIDTH} height={HEIGHT} fill="url(#atlas-sea)" />
          <g transform={`translate(${WIDTH / 2 + pan.x} ${HEIGHT / 2 + pan.y}) scale(${zoom}) translate(${-WIDTH / 2} ${-HEIGHT / 2})`}>
            <path d={path(graticule) ?? undefined} fill="none" stroke="#6f8980" strokeWidth={1 / zoom} opacity=".16" />
            <g filter="url(#atlas-land-shadow)">
              {countries.features.map((country) => {
                const active = Number(country.id) === activeCountryId
                return (
                  <path
                    key={String(country.id)}
                    d={path(country) ?? undefined}
                    className={active ? 'fill-[#d8c99d] dark:fill-[#6f795e]' : 'fill-[#f3ecdc] dark:fill-[#34443d]'}
                    stroke={active ? '#665d44' : '#78877c'}
                    strokeWidth={(active ? 2.1 : 1.15) / zoom}
                    vectorEffect="non-scaling-stroke"
                  />
                )
              })}
            </g>
          </g>
        </svg>

        {mapRegions.map((item) => {
          const active = item.id === region.id
          const point = transformedPoint(item)
          const visible = point.x > -50 && point.x < WIDTH + 50 && point.y > -60 && point.y < HEIGHT + 60
          if (!visible) return null
          return (
            <Link
              key={item.id}
              to={`/regioes/${item.id}`}
              className={`atlas-map-marker${active ? ' atlas-map-marker-active' : ''}`}
              style={{ left: `${point.x / WIDTH * 100}%`, top: `${point.y / HEIGHT * 100}%` }}
              aria-label={`${active ? labels.current : labels.open}: ${text(item.name, locale)}`}
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z" />
                <circle cx="12" cy="10" r="2.8" />
              </svg>
              <span>{text(item.name, locale)}</span>
            </Link>
          )
        })}

        <div className="absolute right-3 top-3 grid overflow-hidden rounded-xl border border-line bg-canvas/95 shadow-lg backdrop-blur dark:border-white/15 dark:bg-night/95">
          <button type="button" className="atlas-map-control border-b border-line dark:border-white/15" aria-label={labels.zoomIn} disabled={zoom >= 2.5} onClick={() => updateZoom(zoom + 0.5)}><Plus size={18} aria-hidden="true" /></button>
          <button type="button" className="atlas-map-control border-b border-line dark:border-white/15" aria-label={labels.zoomOut} disabled={zoom <= 1} onClick={() => updateZoom(zoom - 0.5)}><Minus size={18} aria-hidden="true" /></button>
          <button type="button" className="atlas-map-control" aria-label={labels.reset} disabled={zoom === 1 && pan.x === 0 && pan.y === 0} onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }) }}><LocateFixed size={17} aria-hidden="true" /></button>
        </div>
      </div>

      <figcaption className="mt-3 flex flex-col gap-3 text-xs text-muted sm:flex-row sm:items-center sm:justify-between">
        <span>{labels.help}</span>
        <span>{region.coordinates.lat.toFixed(2)}°, {region.coordinates.lng.toFixed(2)}° · Natural Earth</span>
      </figcaption>
      <div className="mt-4" aria-labelledby="nearby-map-regions">
        <p id="nearby-map-regions" className="sr-only">{labels.nearby}</p>
        <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-2">
          {nearby.slice(0, 5).map(({ item, distance }) => (
            <Link key={item.id} to={`/regioes/${item.id}`} className="inline-flex min-h-11 shrink-0 items-center gap-2 rounded-full border border-line bg-paper px-4 text-xs font-bold transition hover:border-wine dark:border-white/15 dark:bg-white/[0.04]">
              <span className="size-2.5 rounded-full" style={{ backgroundColor: item.color }} />
              {text(item.name, locale)}
              <span className="font-normal text-muted">{Math.round(distance)} km</span>
            </Link>
          ))}
        </div>
      </div>
    </figure>
  )
}
