import { ArrowLeft, ChevronRight, CircleGauge, Clock, Sparkles, Thermometer, Utensils, Wine } from 'lucide-react'
import { useEffect, type CSSProperties } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { FavoriteButton, GrapeCard } from '../components/Cards'
import { DataQuality, GrapeRadar } from '../components/DiscoveryEnhancements'
import { InfoCard, ProfileScale, SectionHeading } from '../components/PagePrimitives'
import { useApp } from '../context/AppContext'
import detailCopyJson from '../data/detail-copy.json'
import { trackEvent } from '../lib/analytics'
import { countryFlag, getGrape, getRegion, grapes, list, text } from '../lib/data'
import type { Locale, Region } from '../types'

const detailCopy = detailCopyJson as Record<Locale, Record<string, string>>

export default function GrapeDetailPage() {
  const { id } = useParams()
  const { locale, t } = useApp()
  const grape = id ? getGrape(id) : undefined

  useEffect(() => {
    if (id) trackEvent('grape_opened', { grape_id: id })
  }, [id])

  if (!grape) return <Navigate to="/404" replace />
  const grapeRegions = grape.regionIds.map(getRegion).filter(Boolean) as Region[]
  const d = detailCopy[locale]
  const profileValue = (value: 'low' | 'medium' | 'high' | undefined, fallback: 'low' | 'medium' | 'high') => t(value ?? fallback)
  const similar = grapes
    .filter((item) => item.id !== grape.id && item.type === grape.type)
    .map((item) => ({
      item,
      score: (item.body === grape.body ? 1 : 0) + (item.acidity === grape.acidity ? 1 : 0) + (item.tannins === grape.tannins ? 1 : 0),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
  const typicalWines = grape.typicalWines
    ? list(grape.typicalWines, locale)
    : [...new Set(grapeRegions.flatMap((region) => list(region.wineTypes, locale)))].slice(0, 4)

  return (
    <>
      <section className="page-shell py-9 sm:py-14">
        <Link to="/castas" className="mb-9 inline-flex items-center gap-2 text-sm font-semibold text-muted hover:text-ink dark:hover:text-white"><ArrowLeft size={17} aria-hidden="true" />{t('backGrapes')}</Link>
        <div className="grid gap-10 lg:grid-cols-[1fr_.8fr] lg:items-center">
          <div>
            <div className="mb-6 grape-mark grape-mark-large" style={{ '--grape-color': grape.color } as CSSProperties} aria-hidden="true"><span /><span /><span /><span /><span /><span /><span /></div>
            <p className="eyebrow mb-3">{t(grape.type)} · {text(grape.origin, locale)}</p>
            <h1 className="font-display text-5xl font-semibold leading-none tracking-tight sm:text-7xl">{text(grape.name, locale)}</h1>
            {grape.aliases.length > 0 && <p className="mt-3 text-sm text-muted">{t('alsoKnownAs')}: {grape.aliases.join(' · ')}</p>}
            <p className="mt-6 max-w-2xl text-lg leading-8 text-muted">{text(grape.description, locale)}</p>
            {(grape.aliases.length > 0 || grape.heritage || grape.rarity || grape.identityNote) && (
              <div className="mt-6 max-w-2xl rounded-2xl border border-line bg-paper/70 p-4 dark:border-white/15 dark:bg-white/[0.045]">
                <p className="mb-3 text-xs font-bold uppercase tracking-[.16em] text-wine-light dark:text-gold">{t('namesAndHeritage')}</p>
                <div className="mb-3 flex flex-wrap gap-2">
                  {grape.heritage && <span className="chip">{t(grape.heritage === 'native' ? 'nativeGrape' : grape.heritage === 'historic' ? 'historicGrape' : 'internationalGrape')}</span>}
                  {grape.rarity && <span className="chip">{t(grape.rarity === 'rare' ? 'rareGrape' : 'revivedGrape')}</span>}
                  {grape.aliases.map((alias) => <span key={alias} className="chip">{alias}</span>)}
                </div>
                <p className="text-sm leading-6 text-muted">{grape.identityNote ? text(grape.identityNote, locale) : t('namesVaryNote')}</p>
              </div>
            )}
            <div className="mt-7"><FavoriteButton type="grape" id={grape.id} compact={false} /></div>
          </div>
          <div>
            <GrapeRadar grape={grape} />
            <div className="mt-4 rounded-[2rem] border border-line bg-paper p-6 dark:border-white/10 dark:bg-white/[0.03] sm:p-8">
              <div className="mb-7 flex items-center gap-3"><CircleGauge className="text-wine-light dark:text-gold" aria-hidden="true" /><h2 className="font-display text-2xl font-semibold">{t('freshness')}</h2></div>
              <div className="grid gap-6">
                <ProfileScale label={t('body')} value={grape.body} />
                <ProfileScale label={t('acidity')} value={grape.acidity} />
                <ProfileScale label={t('tannins')} value={grape.tannins} />
              </div>
              <div className="mt-8 border-t border-line pt-6 dark:border-white/10">
                <p className="eyebrow mb-3">{t('aromas')}</p>
                <div className="flex flex-wrap gap-2">{list(grape.aromas, locale).map((aroma) => <span key={aroma} className="chip chip-large">{aroma}</span>)}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-line bg-paper dark:border-white/10 dark:bg-night-soft">
        <div className="page-shell grid gap-4 py-10 sm:grid-cols-3 sm:py-14">
          <InfoCard icon={<Thermometer />} label={t('serviceTemperature')} value={text(grape.service, locale)} />
          <InfoCard icon={<Wine />} label={t('idealGlass')} value={text(grape.glass, locale)} />
          <InfoCard icon={<Sparkles />} label={t('decanting')} value={text(grape.decanting, locale)} />
        </div>
      </section>

      <section className="page-shell grid gap-12 py-12 md:grid-cols-2 sm:py-16">
        <div>
          <SectionHeading title={t('recommendedDishes')} />
          <div className="grid gap-3">{list(grape.pairings, locale).map((pairing) => <div key={pairing} className="flex items-center gap-3 rounded-2xl border border-line p-4 dark:border-white/10"><Utensils size={17} className="text-wine-light dark:text-gold" aria-hidden="true" />{pairing}</div>)}</div>
        </div>
        <div>
          <SectionHeading title={t('grownIn')} />
          <div className="grid gap-3">{grapeRegions.map((region) => <Link key={region.id} to={`/regioes/${region.id}`} className="flex items-center gap-4 rounded-2xl border border-line p-4 transition hover:-translate-y-0.5 hover:border-wine dark:border-white/10"><span className="text-2xl">{countryFlag(region.countryCode)}</span><span className="font-semibold">{text(region.name, locale)}</span><ChevronRight className="ml-auto text-muted" size={18} aria-hidden="true" /></Link>)}</div>
        </div>
      </section>

      <section className="border-y border-line bg-paper dark:border-white/10 dark:bg-night-soft">
        <div className="page-shell py-12 sm:py-16">
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <InfoCard icon={<Wine />} label={d.typicalColour} value={grape.typicalColour ? text(grape.typicalColour, locale) : grape.type === 'red' ? t('red') : t('white')} />
            <InfoCard icon={<CircleGauge />} label={d.alcohol} value={profileValue(grape.alcohol, grape.body === 'full' ? 'high' : 'medium')} />
            <InfoCard icon={<Clock />} label={d.ageing} value={profileValue(grape.ageing, grape.acidity === 'high' || grape.tannins === 'high' ? 'high' : 'medium')} />
            <InfoCard icon={<Sparkles />} label={d.typicalWines} value={typicalWines.join(' · ') || d.variable} />
          </div>
          <div className="mt-12">
            <SectionHeading title={d.similar} />
            <div className="grid gap-4 sm:grid-cols-3">{similar.map(({ item }) => <GrapeCard key={item.id} grape={item} />)}</div>
          </div>
          <DataQuality reviewedAt={grape.reviewedAt} confidence={grape.confidence} sources={grape.sources} />
        </div>
      </section>
    </>
  )
}
