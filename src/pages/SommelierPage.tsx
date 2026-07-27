import { ArrowLeft, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'
import { DataQuality } from '../components/DiscoveryEnhancements'
import { GuideIcon } from '../components/GuideIcon'
import { PageHero, SectionHeading } from '../components/PagePrimitives'
import { useApp } from '../context/AppContext'
import { list, sommelierGuide, text } from '../lib/data'

export default function SommelierPage() {
  const { locale, t } = useApp()
  return (
    <>
      <PageHero eyebrow={text(sommelierGuide.eyebrow, locale)} title={text(sommelierGuide.title, locale)} body={text(sommelierGuide.intro, locale)}>
        <Link to="/guia" className="mt-7 inline-flex items-center gap-2 text-sm font-bold text-wine-light dark:text-gold"><ArrowLeft size={17} />{t('backGuide')}</Link>
      </PageHero>
      <section className="page-shell py-10 sm:py-16">
        <div className="mb-8 rounded-2xl border border-gold/30 bg-gold/10 p-4 text-sm leading-6 text-gold-dark dark:text-[#f0d59e]">
          <Sparkles className="mr-2 inline-block align-text-bottom" size={18} />{text(sommelierGuide.note, locale)}
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {sommelierGuide.steps.map((step, index) => (
            <article key={step.id} className="sommelier-step">
              <div className="flex items-start gap-4">
                <div className="sommelier-step-icon"><GuideIcon name={step.icon} size={22} /></div>
                <div><p className="eyebrow mb-1">{String(index + 1).padStart(2, '0')}</p><h2 className="font-display text-2xl font-semibold">{text(step.title, locale)}</h2></div>
              </div>
              <p className="mt-5 leading-7 text-muted">{text(step.body, locale)}</p>
              <p className="mt-4 border-t border-line pt-4 text-sm font-semibold text-wine-light dark:border-white/15 dark:text-gold">{text(step.action, locale)}</p>
            </article>
          ))}
        </div>
      </section>
      <section className="border-y border-line bg-paper dark:border-white/10 dark:bg-night-soft">
        <div className="page-shell py-12 sm:py-16">
          <SectionHeading title={text(sommelierGuide.glassesTitle, locale)} body={text(sommelierGuide.glassesIntro, locale)} />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {sommelierGuide.glasses.map((item) => (
              <article key={item.id} className="glass-card">
                <div className={`glass-shape glass-${item.id}`} aria-hidden="true"><span className="glass-bowl"><i /></span><span className="glass-stem" /><span className="glass-foot" /></div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <div><h3 className="font-display text-xl font-semibold">{text(item.title, locale)}</h3><p className="mt-1 text-xs leading-5 text-muted">{text(item.examples, locale)}</p></div>
                    <span className="shrink-0 rounded-full bg-wine/8 px-2.5 py-1 text-xs font-bold text-wine-light dark:bg-gold/10 dark:text-gold">{item.temperature}</span>
                  </div>
                  <p className="mt-4 text-sm font-bold">{text(item.glass, locale)}</p>
                  <p className="mt-1 text-sm leading-6 text-muted">{text(item.why, locale)}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
      <section className="page-shell py-12 sm:py-16">
        <SectionHeading title={text(sommelierGuide.rulesTitle, locale)} />
        <div className="grid gap-3 md:grid-cols-2">
          {list(sommelierGuide.rules, locale).map((rule, index) => (
            <div key={rule} className="flex items-start gap-3 rounded-2xl border border-line p-4 dark:border-white/15">
              <span className="grid size-7 shrink-0 place-items-center rounded-full bg-leaf/10 text-xs font-bold text-leaf dark:bg-leaf-light/10 dark:text-leaf-light">{index + 1}</span>
              <p className="pt-0.5 leading-6">{rule}</p>
            </div>
          ))}
        </div>
        <DataQuality />
      </section>
    </>
  )
}
