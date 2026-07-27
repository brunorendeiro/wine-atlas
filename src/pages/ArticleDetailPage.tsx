import { ArrowLeft } from 'lucide-react'
import { useEffect } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { DataQuality } from '../components/DiscoveryEnhancements'
import { GuideIcon } from '../components/GuideIcon'
import { useApp } from '../context/AppContext'
import { trackEvent } from '../lib/analytics'
import { getArticle, list, text } from '../lib/data'

export default function ArticleDetailPage() {
  const { id } = useParams()
  const { locale, t } = useApp()
  const article = id ? getArticle(id) : undefined

  useEffect(() => {
    if (id) trackEvent('article_opened', { article_id: id })
  }, [id])

  if (!article) return <Navigate to="/404" replace />
  return (
    <article>
      <section className="border-b border-line bg-paper dark:border-white/10 dark:bg-night-soft">
        <div className="page-shell max-w-4xl py-10 sm:py-16">
          <Link to="/guia" className="mb-10 inline-flex items-center gap-2 text-sm font-semibold text-muted hover:text-ink dark:hover:text-white"><ArrowLeft size={17} />{t('backGuide')}</Link>
          <div className="mb-7 grid size-14 place-items-center rounded-2xl bg-gold/15 text-gold-dark dark:text-gold"><GuideIcon name={article.icon} size={27} /></div>
          <p className="eyebrow mb-3">{text(article.eyebrow, locale)}</p>
          <h1 className="font-display text-4xl font-semibold leading-tight tracking-tight sm:text-6xl">{text(article.title, locale)}</h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-muted">{text(article.intro, locale)}</p>
        </div>
      </section>
      <section className="page-shell max-w-4xl py-10 sm:py-14">
        <h2 className="mb-6 font-display text-3xl font-semibold">{t('keyPoints')}</h2>
        <div className="grid gap-3">
          {list(article.tips, locale).map((tip, index) => (
            <div key={tip} className="flex gap-4 rounded-2xl border border-line bg-paper p-5 dark:border-white/10 dark:bg-white/[0.03]">
              <span className="grid size-7 shrink-0 place-items-center rounded-full bg-wine text-xs font-bold text-white">{index + 1}</span>
              <p className="pt-0.5 leading-6">{tip}</p>
            </div>
          ))}
        </div>
        <DataQuality reviewedAt={article.reviewedAt} confidence={article.confidence} sources={article.sources} />
      </section>
    </article>
  )
}
