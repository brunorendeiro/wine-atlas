import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { Favorite, Locale, SavedLocation } from '../types'
import { translate, type TranslationKey } from '../i18n'
import { trackEvent } from '../lib/analytics'

type Theme = 'light' | 'dark'
type LocationStatus = 'idle' | 'loading' | 'granted' | 'denied' | 'unavailable'

interface AppContextValue {
  locale: Locale
  setLocale: (locale: Locale) => void
  theme: Theme
  toggleTheme: () => void
  favorites: Favorite[]
  isFavorite: (favorite: Favorite) => boolean
  toggleFavorite: (favorite: Favorite) => void
  location: { lat: number; lng: number } | null
  locationStatus: LocationStatus
  requestLocation: () => void
  selectedLocation: SavedLocation | null
  selectLocation: (location: SavedLocation) => void
  t: (key: TranslationKey) => string
}

const AppContext = createContext<AppContextValue | null>(null)
const FAVORITES_KEY = 'wine-atlas-favorites'
const LOCALE_KEY = 'wine-atlas-locale'
const THEME_KEY = 'wine-atlas-theme'
const LOCATION_KEY = 'wine-atlas-selected-location'

function initialLocale(): Locale {
  const stored = localStorage.getItem(LOCALE_KEY)
  if (stored === 'pt' || stored === 'en' || stored === 'de') return stored
  const browser = navigator.language.slice(0, 2)
  return browser === 'de' || browser === 'en' ? browser : 'pt'
}

function initialTheme(): Theme {
  const stored = localStorage.getItem(THEME_KEY)
  if (stored === 'light' || stored === 'dark') return stored
  return matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function initialFavorites(): Favorite[] {
  try {
    return JSON.parse(localStorage.getItem(FAVORITES_KEY) || '[]') as Favorite[]
  } catch {
    return []
  }
}

function initialLocation(): SavedLocation | null {
  try {
    const value = JSON.parse(localStorage.getItem(LOCATION_KEY) || 'null') as SavedLocation | null
    return value?.coordinates && value?.label ? value : null
  } catch {
    return null
  }
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale)
  const [theme, setTheme] = useState<Theme>(initialTheme)
  const [favorites, setFavorites] = useState<Favorite[]>(initialFavorites)
  const [selectedLocation, setSelectedLocation] = useState<SavedLocation | null>(initialLocation)
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(() => initialLocation()?.coordinates ?? null)
  const [locationStatus, setLocationStatus] = useState<LocationStatus>(() => initialLocation() ? 'granted' : 'idle')

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
    document.documentElement.dataset.theme = theme
    localStorage.setItem(THEME_KEY, theme)
  }, [theme])

  useEffect(() => {
    document.documentElement.lang = locale
    localStorage.setItem(LOCALE_KEY, locale)
  }, [locale])

  function setLocale(next: Locale) {
    setLocaleState(next)
  }

  function toggleTheme() {
    setTheme((current) => (current === 'light' ? 'dark' : 'light'))
  }

  function isFavorite(favorite: Favorite) {
    return favorites.some((item) => item.type === favorite.type && item.id === favorite.id)
  }

  function toggleFavorite(favorite: Favorite) {
    setFavorites((current) => {
      const exists = current.some((item) => item.type === favorite.type && item.id === favorite.id)
      const next = exists
        ? current.filter((item) => item.type !== favorite.type || item.id !== favorite.id)
        : [...current, favorite]
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(next))
      trackEvent(exists ? 'favourite_removed' : 'favourite_added', { item_type: favorite.type, item_id: favorite.id })
      return next
    })
  }

  function requestLocation() {
    trackEvent('location_requested')
    if (!navigator.geolocation) {
      setLocationStatus('unavailable')
      return
    }
    setLocationStatus('loading')
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const next: SavedLocation = {
          id: 'device',
          label: { pt: 'Localização atual', en: 'Current location', de: 'Aktueller Standort' },
          kind: 'device',
          coordinates: { lat: coords.latitude, lng: coords.longitude },
        }
        setLocation(next.coordinates)
        setSelectedLocation(next)
        setLocationStatus('granted')
        trackEvent('location_granted')
      },
      (error) => {
        const denied = error.code === error.PERMISSION_DENIED
        setLocationStatus(denied ? 'denied' : 'unavailable')
        if (denied) trackEvent('location_denied')
      },
      { enableHighAccuracy: false, timeout: 12000, maximumAge: 10 * 60 * 1000 },
    )
  }

  function selectLocation(next: SavedLocation) {
    setLocation(next.coordinates)
    setSelectedLocation(next)
    setLocationStatus('granted')
    localStorage.setItem(LOCATION_KEY, JSON.stringify(next))
  }

  const value = useMemo<AppContextValue>(() => ({
    locale,
    setLocale,
    theme,
    toggleTheme,
    favorites,
    isFavorite,
    toggleFavorite,
    location,
    locationStatus,
    requestLocation,
    selectedLocation,
    selectLocation,
    t: (key) => translate(locale, key),
  }), [locale, theme, favorites, location, locationStatus, selectedLocation])

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const context = useContext(AppContext)
  if (!context) throw new Error('useApp must be used inside AppProvider')
  return context
}
