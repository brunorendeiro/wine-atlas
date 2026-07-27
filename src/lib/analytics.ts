const GA_MEASUREMENT_ID = 'G-8PWRSDS62T'
const CONSENT_KEY = 'wine-atlas-analytics-consent'

declare global {
  interface Window {
    dataLayer: unknown[]
    gtag?: (...args: unknown[]) => void
  }
}

export type Consent = 'granted' | 'denied'

export function getStoredConsent(): Consent | null {
  const stored = window.localStorage.getItem(CONSENT_KEY)
  return stored === 'granted' || stored === 'denied' ? stored : null
}

export function loadAnalytics() {
  if (document.getElementById('ga4-script')) return
  const script = document.createElement('script')
  script.id = 'ga4-script'
  script.async = true
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`
  document.head.appendChild(script)

  window.dataLayer = window.dataLayer || []
  window.gtag = function gtag() {
    window.dataLayer.push(arguments)
  }
  window.gtag('js', new Date())
  window.gtag('config', GA_MEASUREMENT_ID, { anonymize_ip: true })
}

export function setConsent(value: Consent) {
  window.localStorage.setItem(CONSENT_KEY, value)
  if (value === 'granted') loadAnalytics()
}
