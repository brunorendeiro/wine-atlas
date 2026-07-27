import { ChevronRight, Clock, Search } from 'lucide-react'
import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { EmptyState } from '../components/Cards'
import { PageHero } from '../components/PagePrimitives'
import { useApp } from '../context/AppContext'
import { trackEvent } from '../lib/analytics'
import { getRecentSearches, rememberSearch, unifiedSearch, type SearchCategory } from '../lib/search'

export default function SearchPage() {
  const { locale, t } = useApp()
  const [params, setParams] = useSearchParams()
  const query = params.get('q') || ''
  const [input, setInput] = useState(query)
  const [recent, setRecent] = useState(getRecentSearches)
  const results = useMemo(() => unifiedSearch(query, locale), [locale, query])
  const categories: Record<SearchCategory, string> = {
    region: locale === 'pt' ? 'Região vinícola' : locale === 'de' ? 'Weinregion' : 'Wine Region',
    grape: locale === 'pt' ? 'Casta' : locale === 'de' ? 'Rebsorte' : 'Grape Variety',
    guide: locale === 'pt' ? 'Guia de vinho' : locale === 'de' ? 'Weinführer' : 'Wine Guide',
    article: locale === 'pt' ? 'Artigo' : locale === 'de' ? 'Artikel' : 'Article',
  }

  useEffect(() => setInput(query), [query])

  function submit(event: FormEvent) {
    event.preventDefault()
    const clean = input.trim()
    if (!clean) {
      setParams({})
      return
    }
    rememberSearch(clean)
    setRecent(getRecentSearches())
    const resultCount = unifiedSearch(clean, locale).length
    trackEvent('search_performed', { query_length: clean.length, result_count: resultCount })
    setParams({ q: clean })
  }

  return (
    <>
      <PageHero eyebrow={t('search')} title={t('searchResults')} body={query ? `${results.length} ${t('results')} · “${query}”` : t('searchFor')}>
        <form onSubmit={submit} className="relative mt-7 max-w-2xl" role="search">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={20} aria-hidden="true" />
          <input value={input} onChange={(event) => setInput(event.target.value)} aria-label={t('search')} className="h-14 w-full rounded-2xl border border-line bg-white pl-12 pr-24 outline-none focus:border-wine dark:border-white/15 dark:bg-white/[0.06]" placeholder={t('searchPlaceholder')} />
          <button className="absolute right-2 top-2 h-10 rounded-xl bg-wine px-4 text-sm font-bold text-white">{t('search')}</button>
        </form>
      </PageHero>
      <section className="page-shell py-9 sm:py-12" aria-live="polite">
        {!query ? (
          <div>
            {recent.length > 0 && (
              <>
                <p className="eyebrow mb-3">{locale === 'pt' ? 'Pesquisas recentes' : locale === 'de' ? 'Letzte Suchen' : 'Recent searches'}</p>
                <div className="flex flex-wrap gap-2">{recent.map((item) => <button key={item} type="button" className="chip min-h-11 px-4" onClick={() => setParams({ q: item })}><Clock size={14} aria-hidden="true" />{item}</button>)}</div>
              </>
            )}
            {!recent.length && <EmptyState title={t('searchFor')} body={t('adjustSearch')} />}
          </div>
        ) : !results.length ? <EmptyState title={`${t('noSearch')} “${query}”`} body={t('adjustSearch')} /> : (
          <div className="grid gap-3">
            {results.map((result) => (
              <Link key={`${result.category}-${result.id}`} to={result.to} className="group flex min-h-24 items-start gap-4 rounded-2xl border border-line bg-paper p-4 transition hover:border-wine dark:border-white/15 dark:bg-white/[0.03]">
                <span className="mt-0.5 rounded-full bg-wine/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-wine-light dark:bg-gold/10 dark:text-gold">{categories[result.category]}</span>
                <span className="min-w-0 flex-1"><strong className="font-display text-xl">{result.title}</strong><span className="mt-1 line-clamp-2 block text-sm leading-6 text-muted">{result.summary}</span></span>
                <ChevronRight className="mt-3 shrink-0 text-muted transition group-hover:translate-x-1" size={18} aria-hidden="true" />
              </Link>
            ))}
          </div>
        )}
      </section>
    </>
  )
}
