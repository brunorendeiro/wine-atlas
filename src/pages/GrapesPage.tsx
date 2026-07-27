import { Search } from 'lucide-react'
import { useState } from 'react'
import { EmptyState, GrapeCard } from '../components/Cards'
import { PageHero, SearchBar } from '../components/PagePrimitives'
import { useApp } from '../context/AppContext'
import { grapes, matchesLocalized, normalize, text } from '../lib/data'

export default function GrapesPage() {
  const { locale, t } = useApp()
  const [search, setSearch] = useState('')
  const [type, setType] = useState<'all' | 'red' | 'white'>('all')
  const filtered = grapes
    .filter((grape) => {
      const matches = !search ||
        matchesLocalized(grape.name, search) ||
        matchesLocalized(grape.description, search) ||
        grape.aliases.some((alias) => normalize(alias).includes(normalize(search)))
      return matches && (type === 'all' || grape.type === type)
    })
    .sort((a, b) => text(a.name, locale).localeCompare(text(b.name, locale)))

  return (
    <>
      <PageHero eyebrow={t('encyclopediaEyebrow')} title={t('grapesTitle')} body={t('grapesIntro')}>
        <div className="mt-7 max-w-2xl"><SearchBar compact /></div>
      </PageHero>
      <section className="page-shell py-8 sm:py-10">
        <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <label className="relative w-full sm:max-w-sm">
            <span className="sr-only">{t('search')}</span>
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" size={17} aria-hidden="true" />
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder={t('searchShort')} className="filter-control pl-10" />
          </label>
          <div className="flex rounded-full border border-line bg-paper p-1 dark:border-white/10 dark:bg-white/[0.03]" role="group" aria-label={t('filterType')}>
            {(['all', 'red', 'white'] as const).map((item) => (
              <button key={item} type="button" onClick={() => setType(item)} aria-pressed={type === item} className={`min-h-11 rounded-full px-4 py-2 text-sm font-bold transition ${type === item ? 'bg-wine text-white' : 'text-muted hover:text-ink dark:hover:text-white'}`}>
                {t(item)}
              </button>
            ))}
          </div>
        </div>
        <p className="mb-5 text-sm text-muted" aria-live="polite"><strong className="text-ink dark:text-cream">{filtered.length}</strong> {t('results')}</p>
        {filtered.length
          ? <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{filtered.map((grape) => <GrapeCard key={grape.id} grape={grape} />)}</div>
          : <EmptyState title={t('noGrapes')} body={t('adjustSearch')} />}
      </section>
    </>
  )
}
