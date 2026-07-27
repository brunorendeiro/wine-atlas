import { useEffect, useState, type FormEvent, type ReactNode } from 'react'
import {
  BookOpen,
  Compass,
  Grape,
  Heart,
  Menu,
  Search,
  SlidersHorizontal,
  Sparkles,
  Wine,
  X,
} from 'lucide-react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import type { Locale } from '../types'
import { CookieConsent } from './Overlays'

function Brand() {
  return (
    <Link to="/" className="group flex items-center gap-2.5" aria-label="Wine Atlas">
      <span className="grid size-9 place-items-center rounded-full bg-wine text-cream shadow-sm transition-transform group-hover:-rotate-6">
        <Grape size={19} strokeWidth={1.8} />
      </span>
      <span className="font-display text-xl font-semibold tracking-[-0.02em] text-ink dark:text-cream">
        Wine <span className="text-wine-light dark:text-gold">Atlas</span>
      </span>
    </Link>
  )
}

const navItems = [
  { to: '/', key: 'navHome', icon: Compass, end: true },
  { to: '/regioes', key: 'navRegions', icon: Compass, end: false },
  { to: '/castas', key: 'navGrapes', icon: Grape, end: false },
  { to: '/guia', key: 'navGuide', icon: BookOpen, end: true },
  { to: '/guia/sommelier', key: 'navSommelier', icon: Sparkles, end: true },
  { to: '/guia/aromas', key: 'navAromas', icon: Wine, end: true },
  { to: '/guia/historia', key: 'navHistory', icon: BookOpen, end: true },
  { to: '/ferramentas', key: 'navTools', icon: SlidersHorizontal, end: false },
  { to: '/favoritos', key: 'navFavorites', icon: Heart, end: false },
] as const

const mobileNavItems = navItems.filter(({ key }) => ['navHome', 'navRegions', 'navGrapes', 'navGuide', 'navTools'].includes(key))

export function Layout({ children }: { children: ReactNode }) {
  const { locale, setLocale, theme, toggleTheme, t } = useApp()
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [query, setQuery] = useState('')
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
    setMenuOpen(false)
    setSearchOpen(false)
  }, [location.pathname])

  function submitSearch(event: FormEvent) {
    event.preventDefault()
    if (!query.trim()) return
    navigate(`/pesquisa?q=${encodeURIComponent(query.trim())}`)
    setSearchOpen(false)
  }

  return (
    <div className="min-h-dvh overflow-x-hidden bg-canvas text-ink transition-colors dark:bg-night dark:text-cream">
      <a href="#main-content" className="skip-link">Skip to content</a>
      <header className="sticky top-0 z-40 border-b border-line/70 bg-canvas/88 backdrop-blur-xl dark:border-white/10 dark:bg-night/88">
        <div className="page-shell flex h-16 items-center justify-between gap-4 lg:h-[74px]">
          <Brand />
          <nav className="hidden items-center gap-1 xl:flex" aria-label="Main navigation">
            {navItems.map(({ to, key, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) => `nav-link ${isActive ? 'nav-link-active' : ''}`}
              >
                {t(key)}
              </NavLink>
            ))}
          </nav>
          <div className="flex items-center gap-1.5">
            <button type="button" className="icon-button" onClick={() => setSearchOpen(true)} aria-label={t('search')}>
              <Search size={19} />
            </button>
            <label className="relative hidden sm:block">
              <span className="sr-only">{t('language')}</span>
              <select
                className="h-10 cursor-pointer appearance-none rounded-full border border-line bg-transparent py-0 pl-3 pr-8 text-xs font-bold uppercase tracking-wider outline-none transition hover:border-wine focus-visible:ring-2 focus-visible:ring-wine/30 dark:border-white/15"
                value={locale}
                onChange={(event) => setLocale(event.target.value as Locale)}
              >
                <option value="pt">PT</option>
                <option value="en">EN</option>
                <option value="de">DE</option>
              </select>
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[9px]">⌄</span>
            </label>
            <button type="button" className="theme-wine-button" onClick={toggleTheme} aria-label={`${t('theme')}: ${theme === 'light' ? t('whiteWine') : t('redWine')}`}>
              <Wine size={18} fill={theme === 'dark' ? 'currentColor' : 'none'} />
              <span>{theme === 'light' ? t('whiteWine') : t('redWine')}</span>
            </button>
            <button type="button" className="icon-button xl:hidden" onClick={() => setMenuOpen(true)} aria-label={t('menu')}>
              <Menu size={20} />
            </button>
          </div>
        </div>
      </header>

      {menuOpen && (
        <div className="fixed inset-0 z-50 bg-night/45 backdrop-blur-sm xl:hidden" onClick={() => setMenuOpen(false)}>
          <div className="ml-auto flex h-full w-[88%] max-w-sm flex-col overflow-y-auto bg-canvas p-4 shadow-2xl dark:bg-night-soft sm:w-[84%] sm:p-5" onClick={(event) => event.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between">
              <Brand />
              <button type="button" className="icon-button" onClick={() => setMenuOpen(false)} aria-label={t('close')}><X size={20} /></button>
            </div>
            <nav className="grid grid-cols-2 gap-1.5">
              {navItems.map(({ to, key, icon: Icon, end }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  className={({ isActive }) => `flex min-h-11 items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold ${isActive ? 'bg-wine text-white' : 'hover:bg-wine/8'}`}
                >
                  <Icon className="shrink-0" size={18} /> <span className="truncate">{t(key)}</span>
                </NavLink>
              ))}
            </nav>
            <div className="mt-4 border-t border-line pt-4 dark:border-white/10">
              <p className="mb-2 text-xs font-bold uppercase tracking-widest text-muted">{t('language')}</p>
              <div className="grid grid-cols-3 gap-2">
                {(['pt', 'en', 'de'] as Locale[]).map((item) => (
                  <button
                    key={item}
                    type="button"
                    className={`rounded-xl border py-2 text-sm font-bold uppercase ${locale === item ? 'border-wine bg-wine text-white' : 'border-line dark:border-white/15'}`}
                    onClick={() => setLocale(item)}
                  >
                    {item}
                  </button>
                ))}
              </div>
              <p className="mb-2 mt-4 text-xs font-bold uppercase tracking-widest text-muted">{t('theme')}</p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  className={`theme-choice ${theme === 'light' ? 'theme-choice-active-light' : ''}`}
                  onClick={() => theme !== 'light' && toggleTheme()}
                >
                  <Wine size={18} /> {t('whiteWine')}
                </button>
                <button
                  type="button"
                  className={`theme-choice ${theme === 'dark' ? 'theme-choice-active-dark' : ''}`}
                  onClick={() => theme !== 'dark' && toggleTheme()}
                >
                  <Wine size={18} fill="currentColor" /> {t('redWine')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {searchOpen && (
        <div className="fixed inset-0 z-[60] bg-night/65 px-4 pt-[18vh] backdrop-blur-md" onClick={() => setSearchOpen(false)}>
          <div className="mx-auto max-w-2xl" onClick={(event) => event.stopPropagation()}>
            <form onSubmit={submitSearch} className="relative">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-muted" size={22} />
              <input
                autoFocus
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={t('searchPlaceholder')}
                className="h-16 w-full rounded-2xl border border-white/15 bg-white pl-14 pr-14 text-lg text-ink shadow-2xl outline-none ring-wine/20 transition focus:ring-4"
              />
              <button type="button" className="absolute right-3 top-1/2 grid size-10 -translate-y-1/2 place-items-center rounded-full hover:bg-black/5" onClick={() => setSearchOpen(false)} aria-label={t('close')}><X size={20} /></button>
            </form>
          </div>
        </div>
      )}

      <main id="main-content" className="min-h-[70vh] pb-24 lg:pb-0">{children}</main>

      <footer className="border-t border-line bg-paper px-0 pb-28 pt-10 dark:border-white/10 dark:bg-night-soft lg:mt-20 lg:py-10">
        <div className="page-shell flex flex-col items-center justify-between gap-6 text-center sm:flex-row sm:text-left">
          <div>
            <Brand />
            <p className="mt-2 text-sm text-muted">{t('footerTagline')}</p>
          </div>
          <div className="flex flex-col items-center gap-2 text-sm sm:items-end">
            <a href="https://vibe-portfolio-one.vercel.app/" target="_blank" rel="noreferrer" className="font-semibold text-wine-light underline-offset-4 hover:underline dark:text-gold">
              {t('createdBy')}
            </a>
            <div className="flex items-center gap-3 text-muted">
              <span>© {new Date().getFullYear()} Wine Atlas</span>
              <span aria-hidden="true">·</span>
              <Link to="/privacidade" className="hover:text-ink dark:hover:text-white">{t('privacy')}</Link>
            </div>
          </div>
        </div>
      </footer>

      <nav className="mobile-nav lg:hidden" aria-label="Mobile navigation">
        {mobileNavItems.map(({ to, key, icon: Icon, end }) => (
          <NavLink key={to} to={to} end={end} className={({ isActive }) => `mobile-nav-link ${isActive ? 'mobile-nav-active' : ''}`}>
            <Icon size={19} strokeWidth={1.8} />
            <span>{t(key)}</span>
          </NavLink>
        ))}
      </nav>
      <CookieConsent />
    </div>
  )
}
