import { ArrowRight, Wine } from 'lucide-react'
import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ArticleCard } from '../components/Cards'
import { DataQuality } from '../components/DiscoveryEnhancements'
import { PageHero } from '../components/PagePrimitives'
import { useApp } from '../context/AppContext'
import historyJson from '../data/history.json'
import { trackEvent } from '../lib/analytics'
import { articles, sommelierGuide, text } from '../lib/data'
import type { LocalizedText } from '../types'

const wineHistory = historyJson as { eyebrow: LocalizedText; title: LocalizedText; intro: LocalizedText }

export default function GuidePage() {
  const { locale, t } = useApp()
  useEffect(() => trackEvent('guide_opened', { guide_id: 'index' }), [])

  return (
    <>
      <PageHero eyebrow={t('guideEyebrow')} title={t('guideTitle')} body={t('guideIntro')} />
      <section className="page-shell py-9 sm:py-12">
        <Link to="/guia/sommelier" className="sommelier-feature group mb-7">
          <div className="sommelier-feature-art" aria-hidden="true"><Wine size={52} strokeWidth={1.25} /><span className="sommelier-feature-orbit" /></div>
          <div className="relative p-6 sm:p-8">
            <p className="mb-2 text-xs font-bold uppercase tracking-[.18em] text-gold">{text(sommelierGuide.eyebrow, locale)}</p>
            <h2 className="max-w-xl font-display text-3xl font-semibold sm:text-4xl">{text(sommelierGuide.title, locale)}</h2>
            <p className="mt-3 max-w-2xl leading-7 text-white/75">{text(sommelierGuide.intro, locale)}</p>
            <span className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-gold">{t('openGuide')}<ArrowRight className="transition-transform group-hover:translate-x-1" size={17} /></span>
          </div>
        </Link>
        <Link to="/guia/aromas" className="aroma-feature group mb-7">
          <div className="aroma-feature-wheel" aria-hidden="true"><span /><span /><span /><span /><span /><span /><span /><span /></div>
          <div>
            <p className="eyebrow mb-2">{t('aromaWheelEyebrow')}</p>
            <h2 className="font-display text-3xl font-semibold">{t('aromaWheelTitle')}</h2>
            <p className="mt-2 max-w-2xl leading-7 text-muted">{t('aromaWheelIntro')}</p>
            <span className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-wine-light dark:text-gold">{t('aromaOpen')}<ArrowRight size={17} /></span>
          </div>
        </Link>
        <Link to="/guia/historia" className="history-feature group mb-7">
          <div className="history-feature-mark" aria-hidden="true"><span>6000</span><i /><span>1756</span><i /><span>Hoje</span></div>
          <div>
            <p className="eyebrow mb-2">{text(wineHistory.eyebrow, locale)}</p>
            <h2 className="font-display text-3xl font-semibold">{text(wineHistory.title, locale)}</h2>
            <p className="mt-2 max-w-2xl leading-7 text-muted">{text(wineHistory.intro, locale)}</p>
            <span className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-wine-light dark:text-gold">{t('historyOpen')}<ArrowRight size={17} /></span>
          </div>
        </Link>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{articles.map((article) => <ArticleCard key={article.id} article={article} />)}</div>
        <DataQuality />
      </section>
    </>
  )
}
