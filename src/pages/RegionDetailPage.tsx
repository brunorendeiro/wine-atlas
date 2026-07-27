import { ArrowLeft, Check, ChevronRight, CircleGauge, CloudSun, MapPin, Sparkles, Thermometer, Utensils, Wine } from 'lucide-react'
import { useEffect } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { FavoriteButton, GrapeCard } from '../components/Cards'
import { DataQuality, NearbyRegionGrid, RegionMap } from '../components/DiscoveryEnhancements'
import { InfoCard, SectionHeading } from '../components/PagePrimitives'
import { useApp } from '../context/AppContext'
import detailCopyJson from '../data/detail-copy.json'
import { trackEvent } from '../lib/analytics'
import { countryFlag, getGrape, getRegion, list, regions, text } from '../lib/data'
import type { Grape, Locale } from '../types'

const detailCopy = detailCopyJson as Record<Locale, Record<string, string>>

export default function RegionDetailPage() {
  const { id } = useParams()
  const { locale, t } = useApp()
  const region = id ? getRegion(id) : undefined

  useEffect(() => {
    if (id) trackEvent('region_opened', { region_id: id })
  }, [id])

  if (!region) return <Navigate to="/404" replace />
  const regionGrapes = region.grapeIds.map(getGrape).filter(Boolean) as Grape[]
  const otherRegionGrapes = (region.otherGrapeIds ?? []).map(getGrape).filter(Boolean) as Grape[]
  const d = detailCopy[locale]
  const related = regions
    .filter((item) => item.id !== region.id)
    .map((item) => ({
      item,
      relevance: (item.countryCode === region.countryCode ? 3 : 0) +
        list(item.wineTypes, locale).filter((style) => list(region.wineTypes, locale).includes(style)).length,
    }))
    .sort((a, b) => b.relevance - a.relevance)
    .slice(0, 3)

  return (
    <>
      <section className="relative overflow-hidden text-white" style={{ backgroundColor: region.color }}>
        <div className="detail-pattern" />
        <div className="absolute inset-y-0 right-0 hidden w-[44%] opacity-30 lg:block" aria-hidden="true">
          <svg viewBox="0 0 600 450" preserveAspectRatio="xMidYMid slice" className="h-full w-full">
            <path d="M0 320 Q120 180 250 270 T600 170 V450 H0Z" fill="#fff" opacity=".25" />
            <path d="M0 390 Q180 230 330 340 T600 260 V450 H0Z" fill="#171014" opacity=".3" />
            {Array.from({ length: 9 }, (_, index) => <path key={index} d={`M${index * 78 - 50} 450 Q${index * 72 + 30} 300 ${index * 76 + 115} 190`} fill="none" stroke="#fff" strokeWidth="2" opacity=".25" />)}
            <circle cx="455" cy="85" r="44" fill="#f3d99b" opacity=".65" />
          </svg>
        </div>
        <div className="page-shell relative py-10 sm:py-16 lg:pr-[38%]">
          <Link to="/regioes" className="mb-10 inline-flex items-center gap-2 text-sm font-semibold text-white/70 hover:text-white"><ArrowLeft size={17} aria-hidden="true" />{t('backRegions')}</Link>
          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <p className="mb-3 text-xs font-bold uppercase tracking-[.2em] text-white/65">{countryFlag(region.countryCode)} {text(region.country, locale)}</p>
              <h1 className="font-display text-5xl font-semibold tracking-tight sm:text-7xl">{text(region.name, locale)}</h1>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-white/75">{text(region.description, locale)}</p>
            </div>
            <FavoriteButton type="region" id={region.id} compact={false} />
          </div>
        </div>
      </section>

      <section className="page-shell py-10 sm:py-14">
        <div className="grid gap-5 md:grid-cols-3">
          <InfoCard icon={<CloudSun />} label={t('climate')} value={text(region.climate, locale)} />
          <InfoCard icon={<Thermometer />} label={t('serviceTemperature')} value={text(region.service, locale)} />
          <InfoCard icon={<Wine />} label={t('wineStyles')} value={list(region.wineTypes, locale).join(' · ')} />
        </div>
        <div className="mt-5 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          <InfoCard icon={<MapPin />} label={d.subregion} value={region.subregion ? text(region.subregion, locale) : d.variable} />
          <InfoCard icon={<Sparkles />} label={d.terroir} value={region.terroir ? text(region.terroir, locale) : text(region.climate, locale)} />
          <InfoCard icon={<CircleGauge />} label={d.elevation} value={region.elevation ? text(region.elevation, locale) : d.unavailable} />
          <InfoCard icon={<Wine />} label={d.harvest} value={region.harvest ? text(region.harvest, locale) : region.coordinates.lat >= 0 ? d.northHarvest : d.southHarvest} />
        </div>
      </section>

      <section className="page-shell pb-12 sm:pb-16">
        <SectionHeading title={d.map} />
        <RegionMap region={region} />
      </section>

      <section className="page-shell pb-12 sm:pb-16">
        <SectionHeading title={t('mainGrapes')} />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{regionGrapes.map((grape) => <GrapeCard key={grape.id} grape={grape} contextRegion={region} />)}</div>
        {otherRegionGrapes.length > 0 && (
          <div className="mt-12 border-t border-line pt-10 dark:border-white/10">
            <SectionHeading title={t('otherGrapes')} body={t('otherGrapesIntro')} />
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{otherRegionGrapes.map((grape) => <GrapeCard key={grape.id} grape={grape} contextRegion={region} />)}</div>
          </div>
        )}
      </section>

      <section className="border-y border-line bg-paper dark:border-white/10 dark:bg-night-soft">
        <div className="page-shell grid gap-10 py-12 md:grid-cols-2 sm:py-16">
          <div>
            <div className="mb-5 grid size-12 place-items-center rounded-2xl bg-wine/10 text-wine-light dark:text-gold"><Utensils size={22} aria-hidden="true" /></div>
            <h2 className="font-display text-3xl font-semibold">{t('pairings')}</h2>
            <div className="mt-5 grid gap-3">
              {list(region.pairings, locale).map((pairing) => <div key={pairing} className="flex items-center gap-3 rounded-2xl border border-line bg-canvas p-4 dark:border-white/10 dark:bg-night"><Check size={17} className="text-leaf dark:text-leaf-light" aria-hidden="true" />{pairing}</div>)}
            </div>
          </div>
          <div className="rounded-[2rem] bg-gold/12 p-7 sm:p-9 dark:bg-gold/10">
            <Sparkles className="mb-7 text-gold-dark dark:text-gold" aria-hidden="true" />
            <p className="eyebrow mb-2">{t('curiosity')}</p>
            <p className="font-display text-2xl leading-relaxed sm:text-3xl">{text(region.fact, locale)}</p>
          </div>
        </div>
      </section>

      <section className="page-shell py-12 sm:py-16">
        <div className="grid gap-12 lg:grid-cols-2">
          <NearbyRegionGrid current={region} />
          <div>
            <h2 className="font-display text-3xl font-semibold">{d.related}</h2>
            <div className="mt-5 grid gap-3">
              {related.map(({ item }) => <Link key={item.id} to={`/regioes/${item.id}`} className="flex min-h-14 items-center gap-3 rounded-2xl border border-line px-4 transition hover:border-wine dark:border-white/15"><span className="size-3 rounded-full" style={{ background: item.color }} /><strong>{text(item.name, locale)}</strong><ChevronRight className="ml-auto text-muted" size={18} aria-hidden="true" /></Link>)}
            </div>
          </div>
        </div>
        <DataQuality reviewedAt={region.reviewedAt} confidence={region.confidence} sources={region.sources} countryCode={region.countryCode} />
      </section>
    </>
  )
}
