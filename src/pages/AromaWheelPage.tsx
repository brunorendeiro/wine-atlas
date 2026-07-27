import { ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'
import { AromaWheel } from '../components/AromaWheel'
import { DataQuality } from '../components/DiscoveryEnhancements'
import { PageHero, SectionHeading } from '../components/PagePrimitives'
import { useApp } from '../context/AppContext'

export default function AromaWheelPage() {
  const { t } = useApp()
  const steps = [
    [t('aromaStep1Title'), t('aromaStep1Body')],
    [t('aromaStep2Title'), t('aromaStep2Body')],
    [t('aromaStep3Title'), t('aromaStep3Body')],
    [t('aromaStep4Title'), t('aromaStep4Body')],
    [t('aromaStep5Title'), t('aromaStep5Body')],
  ]
  return (
    <>
      <PageHero eyebrow={t('aromaWheelEyebrow')} title={t('aromaWheelTitle')} body={t('aromaWheelIntro')}>
        <Link to="/guia" className="mt-7 inline-flex items-center gap-2 text-sm font-bold text-wine-light dark:text-gold"><ArrowLeft size={17} />{t('backGuide')}</Link>
      </PageHero>
      <section className="page-shell pt-10 sm:pt-16">
        <SectionHeading title={t('aromaHowTitle')} body={t('aromaHowIntro')} />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {steps.map(([title, body], index) => (
            <article key={title} className="rounded-2xl border border-line bg-paper/70 p-4 dark:border-white/15 dark:bg-white/[0.045]">
              <span className="mb-4 grid size-8 place-items-center rounded-full bg-wine text-xs font-bold text-white dark:bg-gold dark:text-night">{index + 1}</span>
              <h2 className="font-display text-xl font-semibold">{title}</h2>
              <p className="mt-2 text-sm leading-6 text-muted dark:text-[#eadfe2]">{body}</p>
            </article>
          ))}
        </div>
      </section>
      <section className="page-shell py-10 sm:py-16"><AromaWheel /><DataQuality /></section>
    </>
  )
}
