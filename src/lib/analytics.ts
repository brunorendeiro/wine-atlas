const GA_MEASUREMENT_ID = 'G-8PWRSDS62T'
const CONSENT_KEY = 'wine-atlas-analytics-consent'

declare global {
  interface Window {
    dataLayer: unknown[]
    gtag?: (...args: unknown[]) => void
  }
}

export type Consent = 'granted' | 'denied'
export type AnalyticsEvent =
  | 'location_requested' | 'location_granted' | 'location_denied'
  | 'search_performed' | 'region_opened' | 'grape_opened' | 'article_opened'
  | 'guide_opened' | 'recommendation_generated' | 'favourite_added'
  | 'favourite_removed' | 'tasting_started' | 'tasting_completed'
  | 'compare_grapes_used'

function ensureDataLayer() {
  window.dataLayer = window.dataLayer || []
  window.gtag = window.gtag || function gtag() { window.dataLayer.push(arguments) }
}

export function getStoredConsent(): Consent | null {
  const stored = window.localStorage.getItem(CONSENT_KEY)
  return stored === 'granted' || stored === 'denied' ? stored : null
}

export function initialiseConsentMode() {
  ensureDataLayer()
  window.gtag?.('consent', 'default', {
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
    analytics_storage: getStoredConsent() === 'granted' ? 'granted' : 'denied',
    functionality_storage: 'granted',
    security_storage: 'granted',
    wait_for_update: 500,
  })
}

export function loadAnalytics() {
  if (getStoredConsent() !== 'granted') return
  ensureDataLayer()
  if (!document.getElementById('ga4-script')) {
    const script = document.createElement('script')
    script.id = 'ga4-script'
    script.async = true
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`
    document.head.appendChild(script)
  }
  window.gtag?.('js', new Date())
  window.gtag?.('config', GA_MEASUREMENT_ID, {
    anonymize_ip: true,
    allow_google_signals: false,
    allow_ad_personalization_signals: false,
  })
}

export function setConsent(value: Consent) {
  ensureDataLayer()
  window.localStorage.setItem(CONSENT_KEY, value)
  window.gtag?.('consent', 'update', {
    analytics_storage: value,
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
  })
  if (value === 'granted') loadAnalytics()
}

const forbiddenKeys = /coordinate|latitude|longitude|note|email|name|address|user/i

export function trackEvent(event: AnalyticsEvent, parameters: Record<string, string | number | boolean> = {}) {
  if (getStoredConsent() !== 'granted') return
  const safe = Object.fromEntries(Object.entries(parameters).filter(([key]) => !forbiddenKeys.test(key)))
  window.gtag?.('event', event, safe)
}
