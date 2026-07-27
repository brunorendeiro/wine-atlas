import { ArrowRight, Search } from 'lucide-react'
import { useState, type FormEvent, type ReactNode } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { trackEvent } from '../lib/analytics'
import { rememberSearch } from '../lib/search'

export function SectionHeading({ eyebrow, title, body, action, to }: {
  eyebrow?: string
  title: string
  body?: string
  action?: string
  to?: string
}) {
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

export function PageHero({ eyebrow, title, body, children }: {
  eyebrow: string
  title: string
  body: string
  children?: ReactNode
}) {
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

export function SearchBar({ compact = false }: { compact?: boolean }) {
  const { t } = useApp()
  const [query, setQuery] = useState('')
  const navigate = useNavigate()

  function submit(event: FormEvent) {
    event.preventDefault()
    const clean = query.trim()
    if (!clean) return
    rememberSearch(clean)
    trackEvent('search_performed', { query_length: clean.length })
    navigate(`/pesquisa?q=${encodeURIComponent(clean)}`)
  }

  return (
    <form onSubmit={submit} className={`relative ${compact ? '' : 'max-w-2xl'}`} role="search">
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={20} aria-hidden="true" />
      <input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder={compact ? t('searchShort') : t('searchPlaceholder')}
        aria-label={t('search')}
        className="h-14 w-full rounded-2xl border border-line bg-white pl-12 pr-28 text-sm shadow-sm outline-none ring-wine/15 transition focus:border-wine focus:ring-4 dark:border-white/15 dark:bg-white/[0.06] sm:text-base"
      />
      <button type="submit" className="absolute right-2 top-2 h-10 rounded-xl bg-wine px-4 text-xs font-bold text-white transition hover:bg-wine-light sm:px-5 sm:text-sm">
        {t('search')}
      </button>
    </form>
  )
}

export function InfoCard({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-3xl border border-line bg-paper p-5 dark:border-white/10 dark:bg-white/[0.03]">
      <div className="mb-5 text-wine-light dark:text-gold" aria-hidden="true">{icon}</div>
      <p className="eyebrow mb-1">{label}</p>
      <p className="font-medium leading-6">{value}</p>
    </div>
  )
}

export function ProfileScale({ label, value }: {
  label: string
  value: 'low' | 'medium' | 'high' | 'light' | 'full'
}) {
  const { t } = useApp()
  const positions = { low: 1, light: 1, medium: 2, high: 3, full: 3 }
  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-sm">
        <span className="font-semibold">{label}</span>
        <span className="text-muted">{t(value)}</span>
      </div>
      <div className="grid grid-cols-3 gap-1.5" role="meter" aria-label={label} aria-valuemin={1} aria-valuemax={3} aria-valuenow={positions[value]}>
        {[1, 2, 3].map((item) => <span key={item} className={`h-2 rounded-full ${item <= positions[value] ? 'bg-wine dark:bg-gold' : 'bg-line dark:bg-white/10'}`} />)}
      </div>
    </div>
  )
}
