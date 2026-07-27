import { useState } from 'react'
import aromaData from '../data/aroma-wheel.json'
import { useApp } from '../context/AppContext'
import { list, text } from '../lib/data'
import type { LocalizedList, LocalizedText } from '../types'

type AromaFamily = {
  id: string
  color: string
  name: LocalizedText
  description: LocalizedText
  descriptors: LocalizedList
}

const families = aromaData as AromaFamily[]

function point(cx: number, cy: number, radius: number, angle: number) {
  const radians = (angle - 90) * Math.PI / 180
  return { x: cx + radius * Math.cos(radians), y: cy + radius * Math.sin(radians) }
}

function segmentPath(index: number, total: number) {
  const gap = 1.5
  const start = index * 360 / total + gap
  const end = (index + 1) * 360 / total - gap
  const outerStart = point(180, 180, 158, start)
  const outerEnd = point(180, 180, 158, end)
  const innerEnd = point(180, 180, 76, end)
  const innerStart = point(180, 180, 76, start)
  return `M ${outerStart.x} ${outerStart.y} A 158 158 0 0 1 ${outerEnd.x} ${outerEnd.y} L ${innerEnd.x} ${innerEnd.y} A 76 76 0 0 0 ${innerStart.x} ${innerStart.y} Z`
}

export function AromaWheel() {
  const { locale, t } = useApp()
  const [selectedId, setSelectedId] = useState(families[0].id)
  const selected = families.find((family) => family.id === selectedId) ?? families[0]

  return (
    <div className="aroma-layout">
      <div className="aroma-wheel-wrap">
        <svg className="aroma-wheel" viewBox="0 0 360 360" role="group" aria-label={t('aromaWheelTitle')}>
          {families.map((family, index) => {
            const middle = (index + .5) * 360 / families.length
            const label = point(180, 180, 117, middle)
            const active = family.id === selected.id
            return (
              <g
                key={family.id}
                className={`aroma-segment ${active ? 'aroma-segment-active' : ''}`}
                role="button"
                tabIndex={0}
                aria-label={text(family.name, locale)}
                onClick={() => setSelectedId(family.id)}
                onMouseEnter={() => setSelectedId(family.id)}
                onKeyDown={(event) => (event.key === 'Enter' || event.key === ' ') && setSelectedId(family.id)}
              >
                <path d={segmentPath(index, families.length)} fill={family.color} />
                <text x={label.x} y={label.y} textAnchor="middle" dominantBaseline="middle">{text(family.name, locale)}</text>
              </g>
            )
          })}
          <circle cx="180" cy="180" r="65" className="aroma-wheel-center" />
          <text x="180" y="168" textAnchor="middle" className="aroma-wheel-kicker">{t('aroma')}</text>
          <text x="180" y="190" textAnchor="middle" className="aroma-wheel-selected">{text(selected.name, locale)}</text>
        </svg>
      </div>

      <div className="aroma-panel" style={{ '--aroma-accent': selected.color } as React.CSSProperties}>
        <p className="eyebrow mb-2">{t('aromaSelected')}</p>
        <h2 className="font-display text-3xl font-semibold">{text(selected.name, locale)}</h2>
        <p className="mt-3 leading-7 text-muted">{text(selected.description, locale)}</p>
        <div className="mt-6 flex flex-wrap gap-2">
          {list(selected.descriptors, locale).map((descriptor) => (
            <span key={descriptor} className="aroma-chip">{descriptor}</span>
          ))}
        </div>
        <p className="mt-6 border-t border-line pt-5 text-sm leading-6 text-muted dark:border-white/10">{t('aromaTip')}</p>
      </div>

      <div className="aroma-mobile-tabs" aria-label={t('aromaFamilies')}>
        {families.map((family) => (
          <button
            key={family.id}
            type="button"
            className={family.id === selected.id ? 'aroma-tab aroma-tab-active' : 'aroma-tab'}
            style={{ '--aroma-accent': family.color } as React.CSSProperties}
            onClick={() => setSelectedId(family.id)}
          >
            <span />{text(family.name, locale)}
          </button>
        ))}
      </div>
    </div>
  )
}
