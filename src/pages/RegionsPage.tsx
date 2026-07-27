import { Search } from 'lucide-react'
import { useMemo, useState } from 'react'
import { EmptyState, RegionCard } from '../components/Cards'
import { PageHero } from '../components/PagePrimitives'
import { useApp } from '../context/AppContext'
import { countryFlag, list, matchesLocalized, regions, text } from '../lib/data'

export default function RegionsPage() {
  const { locale, t } = useApp()
  const [search, setSearch] = useState('')
  const [country, setCountry] = useState('all')
  const [wineType, setWineType] = useState('all')
  const countries = useMemo(() => [...new Map(regions.map((region) => [region.countryCode, text(region.country, locale)])).entries()], [locale])
  const wineTypes = useMemo(() => [...new Set(regions.flatMap((region) => list(region.wineTypes, locale)))].sort(), [locale])
  const filtered = regions.filter((region) => {
    const queryMatch = !search || matchesLocalized(region.name, search) || matchesLocalized(region.description, search)
    return queryMatch && (country === 'all' || region.countryCode === country) && (wineType === 'all' || list(region.wineTypes, locale).includes(wineType))
  })
  const hasFilters = search || country !== 'all' || wineType !== 'all'

  return (
    <>
      <PageHero eyebrow={`${regions.length} ${t('regionCount')}`} title={t('regionsTitle')} body={t('regionsIntro')} />
      <section className="page-shell py-8 sm:py-10">
        <div className="mb-7 grid gap-3 rounded-3xl border border-line bg-paper p-3 dark:border-white/10 dark:bg-white/[0.03] sm:grid-cols-3 sm:p-4">
          <label className="relative sm:col-span-1">
            <span className="sr-only">{t('search')}</span>
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" size={17} aria-hidden="true" />
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder={t('searchShort')} className="filter-control pl-10" />
          </label>
          <label>
            <span className="sr-only">{t('filterCountry')}</span>
            <select value={country} onChange={(event) => setCountry(event.target.value)} className="filter-control">
              <option value="all">{t('allCountries')}</option>
              {countries.map(([code, name]) => <option key={code} value={code}>{countryFlag(code)} {name}</option>)}
            </select>
          </label>
          <label>
            <span className="sr-only">{t('filterType')}</span>
            <select value={wineType} onChange={(event) => setWineType(event.target.value)} className="filter-control">
              <option value="all">{t('allWineTypes')}</option>
              {wineTypes.map((type) => <option key={type} value={type}>{type}</option>)}
            </select>
          </label>
        </div>
        <div className="mb-5 flex items-center justify-between text-sm text-muted" aria-live="polite">
          <span><strong className="text-ink dark:text-cream">{filtered.length}</strong> {t('results')}</span>
          {hasFilters && <button type="button" className="min-h-11 font-bold text-wine-light dark:text-gold" onClick={() => { setSearch(''); setCountry('all'); setWineType('all') }}>{t('clearFilters')}</button>}
        </div>
        {filtered.length
          ? <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{filtered.map((region) => <RegionCard key={region.id} region={region} />)}</div>
          : <EmptyState title={t('noRegions')} body={t('adjustSearch')} />}
      </section>
    </>
  )
}
