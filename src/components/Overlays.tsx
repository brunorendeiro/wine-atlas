import { useEffect, useState } from 'react'
import { LocateFixed, MapPin, ShieldCheck, X } from 'lucide-react'
import { getStoredConsent, loadAnalytics, setConsent } from '../lib/analytics'
import { useApp } from '../context/AppContext'

const LOCATION_PROMPT_KEY = 'wine-atlas-location-intro-seen'

export function LocationIntro() {
  const { locationStatus, requestLocation, t } = useApp()
  const [visible, setVisible] = useState(() => !localStorage.getItem(LOCATION_PROMPT_KEY))

  useEffect(() => {
    if (locationStatus === 'granted') setVisible(false)
  }, [locationStatus])

  if (!visible) return null

  function dismiss() {
    localStorage.setItem(LOCATION_PROMPT_KEY, 'true')
    setVisible(false)
  }

  function allow() {
    localStorage.setItem(LOCATION_PROMPT_KEY, 'true')
    requestLocation()
  }

  return (
    <div className="fixed inset-0 z-[80] grid place-items-end bg-night/55 p-0 backdrop-blur-sm sm:place-items-center sm:p-5">
      <section role="dialog" aria-modal="true" aria-labelledby="location-title" className="w-full max-w-md rounded-t-[2rem] bg-canvas p-6 shadow-2xl dark:bg-night-soft sm:rounded-[2rem] sm:p-8">
        <button type="button" onClick={dismiss} className="icon-button absolute right-5 top-5" aria-label={t('close')}><X size={19} /></button>
        <div className="mb-6 grid size-14 place-items-center rounded-2xl bg-wine text-white shadow-lg shadow-wine/20">
          <MapPin size={26} />
        </div>
        <p className="eyebrow mb-2">Wine Atlas</p>
        <h2 id="location-title" className="font-display text-3xl font-semibold">{t('locationTitle')}</h2>
        <p className="mt-3 leading-7 text-muted">{t('locationBody')}</p>
        <div className="mt-5 flex items-center gap-2 rounded-2xl bg-leaf/8 p-3 text-sm text-leaf dark:bg-leaf-light/10 dark:text-leaf-light">
          <ShieldCheck size={19} className="shrink-0" />
          <span>{t('locationPrivate')}</span>
        </div>
        <div className="mt-7 grid gap-2.5">
          <button type="button" onClick={allow} className="button-primary w-full" disabled={locationStatus === 'loading'}>
            <LocateFixed size={19} className={locationStatus === 'loading' ? 'animate-pulse' : ''} />
            {locationStatus === 'loading' ? t('locating') : t('allowLocation')}
          </button>
          <button type="button" onClick={dismiss} className="button-ghost w-full">{t('maybeLater')}</button>
        </div>
      </section>
    </div>
  )
}

export function CookieConsent() {
  const { t } = useApp()
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const consent = getStoredConsent()
    if (consent === 'granted') loadAnalytics()
    if (!consent) {
      const timer = window.setTimeout(() => setVisible(true), 900)
      return () => window.clearTimeout(timer)
    }
  }, [])

  if (!visible) return null
  return (
    <aside className="fixed bottom-24 left-3 right-3 z-50 mx-auto max-w-xl rounded-2xl border border-line bg-canvas p-4 shadow-2xl dark:border-white/15 dark:bg-night-soft lg:bottom-5" aria-label={t('analyticsTitle')}>
      <div className="flex gap-3">
        <ShieldCheck className="mt-0.5 shrink-0 text-leaf dark:text-leaf-light" size={21} />
        <div>
          <h2 className="text-sm font-bold">{t('analyticsTitle')}</h2>
          <p className="mt-1 text-xs leading-5 text-muted">{t('analyticsBody')}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button type="button" className="rounded-full bg-wine px-4 py-2 text-xs font-bold text-white" onClick={() => { setConsent('granted'); setVisible(false) }}>{t('acceptAnalytics')}</button>
            <button type="button" className="rounded-full border border-line px-4 py-2 text-xs font-bold dark:border-white/15" onClick={() => { setConsent('denied'); setVisible(false) }}>{t('rejectAnalytics')}</button>
          </div>
        </div>
      </div>
    </aside>
  )
}
