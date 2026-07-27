import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { Favorite, Locale } from '../types'
import { translate, type TranslationKey } from '../i18n'

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
  t: (key: TranslationKey) => string
}

const AppContext = createContext<AppContextValue | null>(null)
const FAVORITES_KEY = 'wine-atlas-favorites'
const LOCALE_KEY = 'wine-atlas-locale'
const THEME_KEY = 'wine-atlas-theme'

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

export function AppProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale)
  const [theme, setTheme] = useState<Theme>(initialTheme)
  const [favorites, setFavorites] = useState<Favorite[]>(initialFavorites)
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [locationStatus, setLocationStatus] = useState<LocationStatus>('idle')

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
      return next
    })
  }

  function requestLocation() {
    if (!navigator.geolocation) {
      setLocationStatus('unavailable')
      return
    }
    setLocationStatus('loading')
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setLocation({ lat: coords.latitude, lng: coords.longitude })
        setLocationStatus('granted')
      },
      (error) => setLocationStatus(error.code === error.PERMISSION_DENIED ? 'denied' : 'unavailable'),
      { enableHighAccuracy: false, timeout: 12000, maximumAge: 10 * 60 * 1000 },
    )
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
    t: (key) => translate(locale, key),
  }), [locale, theme, favorites, location, locationStatus])

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const context = useContext(AppContext)
  if (!context) throw new Error('useApp must be used inside AppProvider')
  return context
}
