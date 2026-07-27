import { ArrowLeft, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'
import { DataQuality } from '../components/DiscoveryEnhancements'
import { PageHero } from '../components/PagePrimitives'
import { useApp } from '../context/AppContext'
import historyJson from '../data/history.json'
import { text } from '../lib/data'
import type { LocalizedText } from '../types'

const wineHistory = historyJson as {
  eyebrow: LocalizedText
  title: LocalizedText
  intro: LocalizedText
  events: { period: LocalizedText; place: LocalizedText; title: LocalizedText; body: LocalizedText }[]
}

export default function HistoryPage() {
  const { locale, t } = useApp()
  return (
    <>
      <PageHero eyebrow={text(wineHistory.eyebrow, locale)} title={text(wineHistory.title, locale)} body={text(wineHistory.intro, locale)}>
        <Link to="/guia" className="mt-7 inline-flex items-center gap-2 text-sm font-bold text-wine-light dark:text-gold"><ArrowLeft size={17} />{t('backGuide')}</Link>
      </PageHero>
      <section className="page-shell py-10 sm:py-16">
        <div className="mb-10 rounded-2xl border border-gold/30 bg-gold/10 p-4 text-sm leading-6 text-gold-dark dark:text-[#f0d59e]">
          <Sparkles className="mr-2 inline-block align-text-bottom" size={18} />{t('historyEvidence')}
        </div>
        <div className="wine-history">
          {wineHistory.events.map((event, index) => (
            <article key={`${event.period.pt}-${index}`} className="history-event">
              <div className="history-node"><span>{String(index + 1).padStart(2, '0')}</span></div>
              <div className="history-card">
                <p className="eyebrow mb-2">{text(event.period, locale)} · {text(event.place, locale)}</p>
                <h2 className="font-display text-2xl font-semibold sm:text-3xl">{text(event.title, locale)}</h2>
                <p className="mt-3 leading-7 text-muted">{text(event.body, locale)}</p>
              </div>
            </article>
          ))}
        </div>
        <DataQuality />
      </section>
    </>
  )
}
