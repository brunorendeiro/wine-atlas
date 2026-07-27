import { ArrowRight, LocateFixed, Map as MapIcon, MapPin } from 'lucide-react'
import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { ArticleCard, RegionCard } from '../components/Cards'
import { LocationSelector } from '../components/DiscoveryEnhancements'
import { SearchBar, SectionHeading } from '../components/PagePrimitives'
import { LocationIntro } from '../components/Overlays'
import { useApp } from '../context/AppContext'
import { articles, distanceKm, grapes, regions, text } from '../lib/data'

function LocationBlock() {
  const { locale, location, locationStatus, requestLocation, selectedLocation, t } = useApp()
  const nearby = useMemo(() => {
    if (!location) return []
    return regions
      .map((region) => ({ region, distance: distanceKm(location, region.coordinates) }))
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 4)
  }, [location])

  if (locationStatus === 'granted' && nearby.length) {
    return (
      <section className="section-space bg-leaf text-white" aria-labelledby="nearby-regions-title">
        <div className="page-shell">
          <div className="mb-7 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-leaf-light">{t('nearbyTitle')}</p>
              <h2 id="nearby-regions-title" className="font-display text-3xl font-semibold sm:text-4xl">{t('nearbyTitle')}</h2>
              <p className="mt-2 text-sm text-white/65">{selectedLocation ? text(selectedLocation.label, locale) : t('basedOn')} · {t('mapHint')}</p>
            </div>
            <div className="flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm">
              <MapPin size={16} aria-hidden="true" /> {text(nearby[0].region.name, locale)} · {Math.round(nearby[0].distance)} km
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {nearby.map(({ region, distance }) => <RegionCard key={region.id} region={region} distance={distance} />)}
          </div>
          <LocationSelector />
        </div>
      </section>
    )
  }

  const locationMessage = locationStatus === 'denied'
    ? t('locationDenied')
    : locationStatus === 'unavailable' ? t('locationUnavailable') : t('locationBody')

  return (
    <section className="page-shell section-space" aria-labelledby="location-title-card">
      <div className="relative overflow-hidden rounded-[2rem] bg-leaf px-6 py-9 text-white sm:px-10 sm:py-12">
        <div className="location-lines" aria-hidden="true" />
        <div className="relative max-w-xl">
          <div className="mb-5 grid size-12 place-items-center rounded-2xl bg-white/12"><LocateFixed size={23} aria-hidden="true" /></div>
          <h2 id="location-title-card" className="font-display text-3xl font-semibold sm:text-4xl">
            {locationStatus === 'denied' ? t('locationDeniedTitle') : t('locationTitle')}
          </h2>
          <p className="mt-3 leading-7 text-white/70">{locationMessage}</p>
          <button type="button" className="mt-6 inline-flex h-12 items-center gap-2 rounded-full bg-cream px-5 text-sm font-bold text-leaf shadow-lg transition hover:-translate-y-0.5" onClick={requestLocation} disabled={locationStatus === 'loading'}>
            <LocateFixed size={18} className={locationStatus === 'loading' ? 'animate-pulse' : ''} aria-hidden="true" />
            {locationStatus === 'loading' ? t('locating') : locationStatus === 'denied' || locationStatus === 'unavailable' ? t('tryAgain') : t('allowLocation')}
          </button>
          <LocationSelector />
          <p className="mt-3 text-xs text-white/50">{t('locationPrivate')}</p>
        </div>
      </div>
    </section>
  )
}

export default function HomePage() {
  const { t } = useApp()
  return (
    <>
      <LocationIntro />
      <section className="hero-section">
        <div className="page-shell relative grid min-h-[670px] items-center gap-10 py-16 lg:grid-cols-[1.15fr_.85fr] lg:py-24">
          <div className="relative z-10 max-w-3xl">
            <p className="eyebrow mb-4">{t('heroEyebrow')}</p>
            <h1 className="font-display text-[clamp(3.25rem,8vw,6.8rem)] font-semibold leading-[.98] tracking-[-0.055em]">
              <span className="block">{t('heroTitleA')}</span>
              <span className="block pt-[.06em] text-wine-light dark:text-gold">{t('heroTitleB')}</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-muted">{t('heroBody')}</p>
            <div className="mt-8"><SearchBar /></div>
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <a href="#location" className="button-primary"><LocateFixed size={18} aria-hidden="true" />{t('nearMe')}</a>
              <Link to="/regioes" className="button-secondary"><MapIcon size={18} aria-hidden="true" />{t('exploreAtlas')}</Link>
            </div>
          </div>
          <div className="hero-art" aria-hidden="true">
            <div className="hero-bottle"><span>WINE<br />ATLAS</span></div>
            <div className="hero-glass"><i /></div>
            <div className="hero-map-line hero-map-line-a" />
            <div className="hero-map-line hero-map-line-b" />
            <span className="hero-pin hero-pin-a"><MapPin /></span>
            <span className="hero-pin hero-pin-b"><MapPin /></span>
            <span className="hero-label hero-label-a">Douro · 41.16° N</span>
            <span className="hero-label hero-label-b">Lavaux · 46.49° N</span>
          </div>
        </div>
        <div className="page-shell pb-9">
          <div className="flex flex-wrap gap-x-8 gap-y-3 border-t border-line pt-5 text-xs font-bold uppercase tracking-widest text-muted dark:border-white/10">
            <span><strong className="text-ink dark:text-cream">{regions.length}</strong> {t('regionCount')}</span>
            <span><strong className="text-ink dark:text-cream">{grapes.length}</strong> {t('grapeCount')}</span>
            <span>PT · EN · DE</span>
          </div>
        </div>
      </section>

      <div id="location"><LocationBlock /></div>

      <section className="page-shell section-space">
        <SectionHeading title={t('featuredRegions')} body={t('featuredRegionsBody')} action={t('viewAll')} to="/regioes" />
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {regions.filter((region) => region.featured).slice(0, 6).map((region) => <RegionCard key={region.id} region={region} featured />)}
        </div>
        <Link to="/regioes" className="button-secondary mt-6 w-full sm:hidden">{t('viewAll')}<ArrowRight size={17} aria-hidden="true" /></Link>
      </section>

      <section className="border-y border-line bg-paper dark:border-white/10 dark:bg-night-soft">
        <div className="page-shell section-space">
          <SectionHeading title={t('learnWine')} body={t('learnWineBody')} action={t('viewAll')} to="/guia" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {articles.filter((article) => article.featured).map((article) => <ArticleCard key={article.id} article={article} />)}
          </div>
        </div>
      </section>
    </>
  )
}
