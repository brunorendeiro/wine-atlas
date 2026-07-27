import { ArrowUpRight, Bookmark, Heart, MapPin } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { countryFlag, list, text } from '../lib/data'
import type { Article, Grape, Region } from '../types'
import { GuideIcon } from './GuideIcon'

export function FavoriteButton({ type, id, compact = true }: { type: 'region' | 'grape'; id: string; compact?: boolean }) {
  const { isFavorite, toggleFavorite, t } = useApp()
  const favorite = isFavorite({ type, id })
  return (
    <button
      type="button"
      onClick={(event) => {
        event.preventDefault()
        event.stopPropagation()
        toggleFavorite({ type, id })
      }}
      className={compact ? `favorite-button ${favorite ? 'favorite-button-active' : ''}` : `button-secondary ${favorite ? '!border-wine !bg-wine/8 !text-wine-light dark:!border-gold dark:!text-gold' : ''}`}
      aria-label={favorite ? t('removeFavorite') : t('addFavorite')}
      aria-pressed={favorite}
    >
      <Heart size={compact ? 18 : 19} fill={favorite ? 'currentColor' : 'none'} />
      {!compact && <span>{favorite ? t('removeFavorite') : t('addFavorite')}</span>}
    </button>
  )
}

export function RegionCard({ region, distance, featured = false }: { region: Region; distance?: number; featured?: boolean }) {
  const { locale, t } = useApp()
  return (
    <article className={`card group relative overflow-hidden ${featured ? 'min-h-[320px]' : ''}`}>
      <div className="region-visual" style={{ '--region-color': region.color } as React.CSSProperties}>
        <span className="region-orbit region-orbit-one" />
        <span className="region-orbit region-orbit-two" />
        <span className="relative text-2xl drop-shadow-sm">{countryFlag(region.countryCode)}</span>
        {distance !== undefined && (
          <span className="relative ml-auto rounded-full bg-black/25 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur">
            {Math.round(distance)} km
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-5">
        <div className="mb-3 flex items-start justify-between gap-3">
          <div>
            <p className="eyebrow mb-1">{text(region.country, locale)}</p>
            <h3 className="font-display text-2xl font-semibold">{text(region.name, locale)}</h3>
          </div>
          <FavoriteButton type="region" id={region.id} />
        </div>
        <p className="line-clamp-3 text-sm leading-6 text-muted">{text(region.description, locale)}</p>
        <div className="mt-4 flex flex-wrap gap-1.5">
          {list(region.wineTypes, locale).slice(0, 3).map((type) => <span key={type} className="chip">{type}</span>)}
        </div>
        <Link to={`/regioes/${region.id}`} className="stretched-link mt-auto flex items-center gap-1 pt-5 text-sm font-bold text-wine-light dark:text-gold">
          {t('viewRegion')} <ArrowUpRight size={16} />
        </Link>
      </div>
    </article>
  )
}

export function GrapeCard({ grape, distance, contextRegion }: { grape: Grape; distance?: number; contextRegion?: Region }) {
  const { locale, t } = useApp()
  const locationLabel = contextRegion ? text(contextRegion.name, locale) : text(grape.origin, locale)
  const displayName = contextRegion && grape.regionalNames?.[contextRegion.id]
    ? text(grape.regionalNames[contextRegion.id], locale)
    : text(grape.name, locale)
  return (
    <article className="card grape-card group relative overflow-hidden">
      <div className="flex items-center gap-4 p-5 pb-3">
        <div className="grape-mark" style={{ '--grape-color': grape.color } as React.CSSProperties}>
          <span /><span /><span /><span /><span />
        </div>
        <div className="min-w-0 flex-1">
          <p className="eyebrow mb-1">{t(grape.type)}</p>
          <h3 className="truncate font-display text-xl font-semibold">{displayName}</h3>
          <p className="grape-location mt-1 flex items-center gap-1 text-xs"><MapPin size={12} />{locationLabel}</p>
        </div>
        <FavoriteButton type="grape" id={grape.id} />
      </div>
      <div className="px-5 pb-5">
        <p className="grape-description line-clamp-2 min-h-12 text-sm leading-6">{text(grape.description, locale)}</p>
        <div className="mt-4 flex items-center justify-between gap-3">
          <div className="flex flex-wrap gap-1.5">
            {list(grape.aromas, locale).slice(0, 2).map((aroma) => <span key={aroma} className="chip">{aroma}</span>)}
          </div>
          {distance !== undefined && <span className="shrink-0 text-xs font-bold text-wine-light dark:text-gold">{Math.round(distance)} km</span>}
        </div>
        <Link to={`/castas/${grape.id}`} className="stretched-link mt-5 inline-flex items-center gap-1 text-sm font-bold text-wine-light dark:text-gold">
          {t('viewGrape')} <ArrowUpRight size={16} />
        </Link>
      </div>
    </article>
  )
}

export function ArticleCard({ article }: { article: Article }) {
  const { locale, t } = useApp()
  return (
    <article className="card group relative flex min-h-56 flex-col p-5">
      <div className="mb-8 grid size-11 place-items-center rounded-2xl bg-gold/15 text-gold-dark dark:bg-gold/10 dark:text-gold">
        <GuideIcon name={article.icon} size={22} />
      </div>
      <p className="eyebrow mb-1">{text(article.eyebrow, locale)}</p>
      <h3 className="font-display text-xl font-semibold">{text(article.title, locale)}</h3>
      <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted">{text(article.summary, locale)}</p>
      <Link to={`/guia/${article.id}`} className="stretched-link mt-auto flex items-center gap-1 pt-5 text-sm font-bold text-wine-light dark:text-gold">
        {t('openGuide')} <ArrowUpRight size={16} />
      </Link>
    </article>
  )
}

export function EmptyState({ title, body, action, to }: { title: string; body: string; action?: string; to?: string }) {
  return (
    <div className="rounded-3xl border border-dashed border-line bg-paper/50 px-6 py-14 text-center dark:border-white/15 dark:bg-white/[0.03]">
      <div className="mx-auto mb-5 grid size-14 place-items-center rounded-full bg-wine/10 text-wine-light dark:text-gold">
        <Bookmark size={24} />
      </div>
      <h2 className="font-display text-2xl font-semibold">{title}</h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted">{body}</p>
      {action && to && <Link to={to} className="button-primary mt-6">{action}</Link>}
    </div>
  )
}
