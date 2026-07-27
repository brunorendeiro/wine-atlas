import { ExternalLink, Hourglass, ShieldCheck, UserRound, Wine } from 'lucide-react'
import { useId } from 'react'
import { useApp } from '../context/AppContext'
import copyJson from '../data/region-wine-culture-copy.json'
import { text } from '../lib/data'
import type { Locale, RegionWineCulture as RegionWineCultureData } from '../types'
import { SectionHeading } from './PagePrimitives'

const copy = copyJson as Record<Locale, Record<string, string>>

function yearLabel(value: number, locale: Locale) {
  const t = copy[locale]
  return `${value} ${value === 1 ? t.year : t.years}`
}

function AgeingCurve({ ageing }: { ageing: RegionWineCultureData['wine']['ageing'] }) {
  const { locale } = useApp()
  const t = copy[locale]
  const gradientId = useId().replace(/:/g, '')
  const left = 38
  const right = 562
  const bottom = 176
  const x = (year: number) => left + (year / ageing.hold) * (right - left)
  const path = [
    `M ${x(0)} ${bottom}`,
    `C ${x(ageing.ready * 0.35)} 160, ${x(ageing.ready * 0.72)} 127, ${x(ageing.ready)} 112`,
    `C ${x((ageing.ready + ageing.peakStart) / 2)} 74, ${x(ageing.peakStart * 0.92)} 50, ${x(ageing.peakStart)} 48`,
    `C ${x(ageing.peakStart + (ageing.peakEnd - ageing.peakStart) * 0.35)} 39, ${x(ageing.peakEnd - (ageing.peakEnd - ageing.peakStart) * 0.2)} 39, ${x(ageing.peakEnd)} 50`,
    `C ${x(ageing.peakEnd + (ageing.hold - ageing.peakEnd) * 0.4)} 66, ${x(ageing.hold * 0.9)} 129, ${x(ageing.hold)} 156`,
  ].join(' ')
  const ticks = [0, ageing.ready, ageing.peakStart, ageing.peakEnd, ageing.hold]
    .filter((value, index, values) => values.indexOf(value) === index)

  return (
    <figure className="mt-7 min-w-0 rounded-3xl border border-line bg-canvas p-4 sm:p-5 dark:border-white/10 dark:bg-night">
      <figcaption>
        <h3 className="font-display text-xl font-semibold">{t.curve}</h3>
        <p className="mt-1 text-sm text-muted">{t.curveIntro}</p>
      </figcaption>
      <div className="mt-4 max-w-full overflow-x-auto">
        <svg
          viewBox="0 0 600 230"
          className="min-w-[34rem] text-wine dark:text-gold"
          role="img"
          aria-label={`${t.chartLabel}. ${t.ready}: ${yearLabel(ageing.ready, locale)}. ${t.peak}: ${yearLabel(ageing.peakStart, locale)}–${yearLabel(ageing.peakEnd, locale)}. ${t.mature}: ${yearLabel(ageing.hold, locale)}.`}
        >
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="currentColor" stopOpacity=".28" />
              <stop offset="100%" stopColor="currentColor" stopOpacity=".02" />
            </linearGradient>
          </defs>
          <rect x={x(ageing.peakStart)} y="24" width={Math.max(24, x(ageing.peakEnd) - x(ageing.peakStart))} height="152" rx="12" className="fill-gold/15 dark:fill-gold/10" />
          {[48, 112, 176].map((y) => <line key={y} x1={left} y1={y} x2={right} y2={y} stroke="currentColor" strokeOpacity=".12" strokeDasharray="4 7" />)}
          <path d={`${path} L ${x(ageing.hold)} ${bottom} L ${x(0)} ${bottom} Z`} fill={`url(#${gradientId})`} />
          <path d={path} fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
          <line x1={left} y1={bottom} x2={right} y2={bottom} stroke="currentColor" strokeOpacity=".35" />
          {ticks.map((year) => (
            <g key={year}>
              <line x1={x(year)} y1={bottom} x2={x(year)} y2={bottom + 7} stroke="currentColor" strokeOpacity=".55" />
              <text x={x(year)} y={bottom + 25} textAnchor={year === 0 ? 'start' : year === ageing.hold ? 'end' : 'middle'} fill="currentColor" fontSize="12" fontWeight="700">{year}</text>
            </g>
          ))}
          <circle cx={x(ageing.ready)} cy="112" r="6" fill="currentColor" />
          <text x={x(ageing.ready)} y="99" textAnchor="middle" fill="currentColor" fontSize="11" fontWeight="700">{t.ready}</text>
          <text x={(x(ageing.peakStart) + x(ageing.peakEnd)) / 2} y="19" textAnchor="middle" fill="currentColor" fontSize="11" fontWeight="700">{t.peak}</text>
          <text x={right} y="149" textAnchor="end" fill="currentColor" fontSize="11" fontWeight="700">{t.mature}</text>
          <text x={left} y="220" fill="currentColor" fillOpacity=".68" fontSize="11">{t.freshness}</text>
          <text x={right} y="220" textAnchor="end" fill="currentColor" fillOpacity=".68" fontSize="11">{t.complexity}</text>
        </svg>
      </div>
      <div className="mt-3 grid gap-2 text-sm sm:grid-cols-3">
        <p className="rounded-xl bg-paper px-3 py-2 dark:bg-white/[0.04]"><strong>{t.ready}:</strong> {yearLabel(ageing.ready, locale)}</p>
        <p className="rounded-xl bg-gold/12 px-3 py-2 dark:bg-gold/10"><strong>{t.peak}:</strong> {ageing.peakStart}–{ageing.peakEnd} {t.years}</p>
        <p className="rounded-xl bg-paper px-3 py-2 dark:bg-white/[0.04]"><strong>{t.mature}:</strong> {yearLabel(ageing.hold, locale)}</p>
      </div>
      <p className="mt-4 flex gap-2 text-xs leading-5 text-muted">
        <Hourglass className="mt-0.5 shrink-0" size={15} aria-hidden="true" />
        {t.disclaimer}
      </p>
    </figure>
  )
}

function SourceLink({ href, title }: { href: string; title: string }) {
  const { locale } = useApp()
  return (
    <a className="mt-5 inline-flex min-h-11 items-center gap-2 text-sm font-bold text-wine-light underline-offset-4 hover:underline dark:text-gold" href={href} target="_blank" rel="noreferrer">
      {copy[locale].source}: {title}
      <ExternalLink size={15} aria-hidden="true" />
    </a>
  )
}

export function RegionWineCulture({ data }: { data: RegionWineCultureData }) {
  const { locale } = useApp()
  const t = copy[locale]

  return (
    <section className="border-y border-line bg-paper dark:border-white/10 dark:bg-night-soft">
      <div className="page-shell py-12 sm:py-16">
        <SectionHeading title={t.title} body={t.intro} />
        <div className="grid gap-5 lg:grid-cols-[1.35fr_.65fr]">
          <article className="min-w-0 rounded-[2rem] border border-line bg-canvas p-5 sm:p-7 dark:border-white/10 dark:bg-night">
            <div className="flex items-start gap-3">
              <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-wine/10 text-wine-light dark:bg-gold/10 dark:text-gold"><Wine size={21} aria-hidden="true" /></span>
              <div>
                <p className="eyebrow">{t.style}</p>
                <h2 className="mt-1 font-display text-2xl font-semibold">{text(data.wine.style, locale)}</h2>
              </div>
            </div>
            <p className="mt-5 leading-7 text-muted">{text(data.wine.profile, locale)}</p>
            <h3 className="mt-6 text-sm font-bold uppercase tracking-widest">{t.bottles}</h3>
            <ul className="mt-3 grid gap-2 sm:grid-cols-2">
              {data.wine.examples.map((wine) => <li key={wine} className="rounded-2xl border border-line bg-paper px-4 py-3 font-semibold dark:border-white/10 dark:bg-white/[0.04]">{wine}</li>)}
            </ul>
            <AgeingCurve ageing={data.wine.ageing} />
            <SourceLink href={data.wine.source.url} title={data.wine.source.title} />
          </article>

          <article className="rounded-[2rem] bg-wine p-6 text-white sm:p-8 dark:bg-wine-dark">
            <span className="grid size-12 place-items-center rounded-2xl bg-white/10 text-cream"><UserRound size={22} aria-hidden="true" /></span>
            <p className="mt-8 text-xs font-bold uppercase tracking-[.18em] text-white/60">{t.person}</p>
            <h2 className="mt-2 font-display text-3xl font-semibold">{data.person.name}</h2>
            <p className="mt-2 font-semibold text-cream">{text(data.person.role, locale)}</p>
            <p className="mt-5 leading-7 text-white/75">{text(data.person.note, locale)}</p>
            <a className="mt-7 inline-flex min-h-11 items-center gap-2 text-sm font-bold text-cream underline-offset-4 hover:underline" href={data.person.source.url} target="_blank" rel="noreferrer">
              {t.source}: {data.person.source.title}
              <ExternalLink size={15} aria-hidden="true" />
            </a>
            <p className="mt-8 flex items-center gap-2 border-t border-white/15 pt-5 text-xs text-white/60">
              <ShieldCheck size={15} aria-hidden="true" />
              {t.confidence}: {t[data.confidence]}
            </p>
          </article>
        </div>
      </div>
    </section>
  )
}
