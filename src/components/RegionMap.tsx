import 'leaflet/dist/leaflet.css'
import { LocateFixed, Minus, Plus } from 'lucide-react'
import { useMemo, useRef } from 'react'
import { CircleMarker, MapContainer, TileLayer, Tooltip, useMap } from 'react-leaflet'
import { useNavigate } from 'react-router-dom'
import type { Map as LeafletMap } from 'leaflet'
import { useApp } from '../context/AppContext'
import { distanceKm, regions, text } from '../lib/data'
import type { Region } from '../types'

const OSM_TILE_URL = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
const OSM_ATTRIBUTION = '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> contributors'
const DEFAULT_ZOOM = 8
const MIN_ZOOM = 5
const MAX_ZOOM = 13

function MapControls({ center }: { center: [number, number] }) {
  const map = useMap()
  return (
    <div className="absolute right-3 top-3 z-[1000] grid overflow-hidden rounded-xl border border-line bg-canvas/95 shadow-lg backdrop-blur dark:border-white/15 dark:bg-night/95">
      <button
        type="button"
        className="atlas-map-control border-b border-line dark:border-white/15"
        aria-label="Zoom in"
        onClick={() => map.zoomIn()}
      >
        <Plus size={18} aria-hidden="true" />
      </button>
      <button
        type="button"
        className="atlas-map-control border-b border-line dark:border-white/15"
        aria-label="Zoom out"
        onClick={() => map.zoomOut()}
      >
        <Minus size={18} aria-hidden="true" />
      </button>
      <button
        type="button"
        className="atlas-map-control"
        aria-label="Reset map"
        onClick={() => map.setView(center, DEFAULT_ZOOM)}
      >
        <LocateFixed size={17} aria-hidden="true" />
      </button>
    </div>
  )
}

export function RegionMap({ region }: { region: Region }) {
  const { locale } = useApp()
  const navigate = useNavigate()
  const mapRef = useRef<LeafletMap | null>(null)

  const labels = {
    pt: {
      map: 'Mapa interativo',
      current: 'Região atual',
      nearby: 'Regiões próximas no mapa',
      open: 'Abrir região',
      help: 'Arrasta para explorar e usa os controlos para aproximar.',
    },
    en: {
      map: 'Interactive map',
      current: 'Current region',
      nearby: 'Nearby regions on the map',
      open: 'Open region',
      help: 'Drag to explore and use the controls to zoom.',
    },
    de: {
      map: 'Interaktive Karte',
      current: 'Aktuelle Region',
      nearby: 'Nahe Regionen auf der Karte',
      open: 'Region öffnen',
      help: 'Zum Erkunden ziehen und mit den Steuerelementen zoomen.',
    },
  }[locale]

  const nearby = useMemo(() => regions
    .filter((item) => item.id !== region.id)
    .map((item) => ({ item, distance: distanceKm(region.coordinates, item.coordinates) }))
    .sort((a, b) => a.distance - b.distance)
    .slice(0, 7), [region])

  const center: [number, number] = [region.coordinates.lat, region.coordinates.lng]
  const mapRegions = [region, ...nearby.map(({ item }) => item)]

  return (
    <figure>
      <div
        className="atlas-region-map relative h-[23rem] overflow-hidden rounded-[2rem] border border-line bg-[#dce9e5] shadow-sm dark:border-white/15 dark:bg-[#1b2926]"
        role="application"
        aria-label={`${labels.map}: ${text(region.name, locale)}`}
      >
        <MapContainer
          center={center}
          zoom={DEFAULT_ZOOM}
          minZoom={MIN_ZOOM}
          maxZoom={MAX_ZOOM}
          zoomControl={false}
          className="size-full"
          ref={mapRef}
        >
          <TileLayer url={OSM_TILE_URL} attribution={OSM_ATTRIBUTION} />
          {mapRegions.map((item) => {
            const active = item.id === region.id
            return (
              <CircleMarker
                key={item.id}
                center={[item.coordinates.lat, item.coordinates.lng]}
                radius={active ? 10 : 7}
                pathOptions={{
                  color: '#1b2926',
                  weight: active ? 2.5 : 1.5,
                  fillColor: item.color,
                  fillOpacity: 1,
                }}
                eventHandlers={{ click: () => navigate(`/regioes/${item.id}`) }}
              >
                <Tooltip direction="top" offset={[0, -6]}>
                  {text(item.name, locale)}
                </Tooltip>
              </CircleMarker>
            )
          })}
          <MapControls center={center} />
        </MapContainer>
      </div>

      <figcaption className="mt-3 flex flex-col gap-3 text-xs text-muted sm:flex-row sm:items-center sm:justify-between">
        <span>{labels.help}</span>
        <span>{region.coordinates.lat.toFixed(2)}°, {region.coordinates.lng.toFixed(2)}° · OpenStreetMap</span>
      </figcaption>
      <div className="mt-4" aria-labelledby="nearby-map-regions">
        <p id="nearby-map-regions" className="sr-only">{labels.nearby}</p>
        <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-2">
          {nearby.slice(0, 5).map(({ item, distance }) => (
            <button
              key={item.id}
              type="button"
              onClick={() => navigate(`/regioes/${item.id}`)}
              className="inline-flex min-h-11 shrink-0 items-center gap-2 rounded-full border border-line bg-paper px-4 text-xs font-bold transition hover:border-wine dark:border-white/15 dark:bg-white/[0.04]"
            >
              <span className="size-2.5 rounded-full" style={{ backgroundColor: item.color }} />
              {text(item.name, locale)}
              <span className="font-normal text-muted">{Math.round(distance)} km</span>
            </button>
          ))}
        </div>
      </div>
    </figure>
  )
}
