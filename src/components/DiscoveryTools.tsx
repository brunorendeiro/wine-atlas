import { useMemo, useState, type ReactNode } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronRight,
  Eye,
  Grape as GrapeIcon,
  RotateCcw,
  Search,
  Sparkles,
  Utensils,
  Wine,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import aromaJson from '../data/aroma-wheel.json'
import { getGrape, getRegion, grapes, list, text } from '../lib/data'
import type { Grape, Locale, LocalizedList, LocalizedText } from '../types'
import { GrapeCard } from './Cards'

type Level = 'low' | 'medium' | 'high'
type WineType = 'red' | 'white' | 'either'

const copy = {
  pt: {
    eyebrow: 'Ferramentas sem complicações',
    title: 'Descobre o vinho fazendo',
    intro: 'Pesquisa melhor, prova passo a passo, encontra um estilo para a mesa ou compara duas castas. Tudo acontece nesta página e nada fica guardado.',
    searchTitle: 'Pesquisa por aquilo que sentes',
    searchBody: 'Procura uma casta através de um aroma, prato, região, origem ou característica.',
    searchPlaceholder: 'Ex.: tabaco, salmão, alta acidez, Douro…',
    noResults: 'Ainda não encontrámos uma correspondência. Experimenta uma palavra mais simples.',
    tastingTitle: 'Prova guiada',
    tastingBody: 'Um percurso curto para observares o vinho sem precisares de saber as palavras todas.',
    chooserTitle: 'Ajuda-me a escolher',
    chooserBody: 'Diz o que vai para a mesa e recebe castas e estilos adequados, com a razão explicada.',
    compareTitle: 'Comparar castas',
    compareBody: 'Coloca duas castas lado a lado e percebe rapidamente onde se aproximam e onde diferem.',
    open: 'Abrir ferramenta',
    temporary: 'Sem conta · sem registo · sem dados guardados',
    back: 'Voltar às ferramentas',
    guidedEyebrow: 'Prova no teu ritmo',
    guidedTitle: 'Prova guiada',
    guidedIntro: 'Segue os passos pela ordem. As tuas escolhas existem apenas enquanto esta página estiver aberta.',
    previous: 'Anterior',
    next: 'Continuar',
    finish: 'Ver a minha prova',
    restart: 'Começar novamente',
    step: 'Passo',
    of: 'de',
    colourQuestion: 'Que tipo de vinho tens no copo?',
    appearanceQuestion: 'Como descreves a intensidade da cor?',
    aromaQuestion: 'Que aromas reconheces?',
    aromaHelp: 'Escolhe os que fizerem sentido. Não existem respostas erradas.',
    structureQuestion: 'Como sentes o vinho na boca?',
    conclusionQuestion: 'Qual é a tua conclusão?',
    bodyLabel: 'Corpo',
    acidityLabel: 'Acidez',
    tanninLabel: 'Taninos',
    enjoyAgain: 'Voltaria a beber',
    maybeAgain: 'Talvez voltasse a beber',
    notAgain: 'Não é o meu estilo',
    resultTitle: 'A tua impressão deste copo',
    resultNote: 'Isto não é uma nota nem uma avaliação profissional — é uma fotografia do que sentiste agora.',
    noneSelected: 'Não selecionado',
    chooserEyebrow: 'Da mesa para o copo',
    chooserIntro: 'Não recomendamos uma garrafa específica. Indicamos estilos e castas presentes no atlas que normalmente funcionam bem.',
    whatFood: 'O que vais comer?',
    preference: 'Tens preferência?',
    intensity: 'Que intensidade procuras?',
    any: 'Tanto faz',
    seeSuggestions: 'Ver sugestões',
    suggestions: 'Boas pistas para procurares',
    why: 'Porque funciona',
    service: 'Serviço',
    resetChoice: 'Alterar escolhas',
    compareEyebrow: 'Lado a lado',
    compareIntro: 'Compara perfil, aromas, serviço, copo e harmonizações usando os dados da Castapédia.',
    firstGrape: 'Primeira casta',
    secondGrape: 'Segunda casta',
    chooseGrape: 'Escolhe uma casta',
    origin: 'Origem',
    aromas: 'Aromas',
    pairings: 'À mesa',
    glass: 'Copo',
    regions: 'Regiões',
    sameGrape: 'Escolhe duas castas diferentes para obteres uma comparação útil.',
    discover: 'Conhecer casta',
    red: 'Tinto',
    white: 'Branco',
    rose: 'Rosé',
    sparkling: 'Espumante',
    pale: 'Clara',
    medium: 'Média',
    deep: 'Intensa',
    low: 'Baixo',
    high: 'Alto',
  },
  en: {
    eyebrow: 'Simple, useful tools',
    title: 'Discover wine by doing',
    intro: 'Search better, taste step by step, find a style for the table or compare two grapes. Everything happens on this page and nothing is saved.',
    searchTitle: 'Search by what you sense',
    searchBody: 'Find a grape through an aroma, dish, region, origin or characteristic.',
    searchPlaceholder: 'E.g. tobacco, salmon, high acidity, Douro…',
    noResults: 'No match yet. Try a simpler word.',
    tastingTitle: 'Guided tasting',
    tastingBody: 'A short path to observe wine without needing to know every word.',
    chooserTitle: 'Help me choose',
    chooserBody: 'Tell us what is on the table and get suitable styles and grapes, with a clear reason.',
    compareTitle: 'Compare grapes',
    compareBody: 'Put two grapes side by side and quickly see where they are alike and different.',
    open: 'Open tool',
    temporary: 'No account · no history · no saved data',
    back: 'Back to tools',
    guidedEyebrow: 'Taste at your pace',
    guidedTitle: 'Guided tasting',
    guidedIntro: 'Follow the steps in order. Your choices only exist while this page is open.',
    previous: 'Previous',
    next: 'Continue',
    finish: 'See my tasting',
    restart: 'Start again',
    step: 'Step',
    of: 'of',
    colourQuestion: 'What kind of wine is in your glass?',
    appearanceQuestion: 'How would you describe the colour intensity?',
    aromaQuestion: 'Which aromas do you recognise?',
    aromaHelp: 'Choose whatever makes sense. There are no wrong answers.',
    structureQuestion: 'How does the wine feel in your mouth?',
    conclusionQuestion: 'What is your conclusion?',
    bodyLabel: 'Body',
    acidityLabel: 'Acidity',
    tanninLabel: 'Tannins',
    enjoyAgain: 'Would drink again',
    maybeAgain: 'Might drink again',
    notAgain: 'Not my style',
    resultTitle: 'Your impression of this glass',
    resultNote: 'This is not a score or a professional assessment — it is a snapshot of what you sensed now.',
    noneSelected: 'Not selected',
    chooserEyebrow: 'From table to glass',
    chooserIntro: 'We do not recommend a specific bottle. We suggest styles and grapes in the atlas that usually work well.',
    whatFood: 'What are you eating?',
    preference: 'Any preference?',
    intensity: 'How intense should it be?',
    any: 'Either',
    seeSuggestions: 'See suggestions',
    suggestions: 'Good clues to look for',
    why: 'Why it works',
    service: 'Service',
    resetChoice: 'Change choices',
    compareEyebrow: 'Side by side',
    compareIntro: 'Compare profile, aromas, service, glass and pairings using the grape library.',
    firstGrape: 'First grape',
    secondGrape: 'Second grape',
    chooseGrape: 'Choose a grape',
    origin: 'Origin',
    aromas: 'Aromas',
    pairings: 'At the table',
    glass: 'Glass',
    regions: 'Regions',
    sameGrape: 'Choose two different grapes for a useful comparison.',
    discover: 'Explore grape',
    red: 'Red',
    white: 'White',
    rose: 'Rosé',
    sparkling: 'Sparkling',
    pale: 'Pale',
    medium: 'Medium',
    deep: 'Deep',
    low: 'Low',
    high: 'High',
  },
  de: {
    eyebrow: 'Einfache, nützliche Werkzeuge',
    title: 'Wein durch Ausprobieren entdecken',
    intro: 'Besser suchen, Schritt für Schritt verkosten, einen Stil zum Essen finden oder zwei Rebsorten vergleichen. Nichts wird gespeichert.',
    searchTitle: 'Nach deinem Eindruck suchen',
    searchBody: 'Finde Rebsorten über Aroma, Gericht, Region, Herkunft oder Eigenschaft.',
    searchPlaceholder: 'Z. B. Tabak, Lachs, hohe Säure, Douro…',
    noResults: 'Noch kein Treffer. Probiere einen einfacheren Begriff.',
    tastingTitle: 'Geführte Verkostung',
    tastingBody: 'Ein kurzer Weg, Wein aufmerksam zu betrachten — ganz ohne Fachwortschatz.',
    chooserTitle: 'Hilf mir wählen',
    chooserBody: 'Sag, was auf den Tisch kommt, und erhalte passende Stile und Rebsorten mit Erklärung.',
    compareTitle: 'Rebsorten vergleichen',
    compareBody: 'Stelle zwei Sorten gegenüber und erkenne Gemeinsamkeiten und Unterschiede.',
    open: 'Werkzeug öffnen',
    temporary: 'Kein Konto · kein Verlauf · keine Speicherung',
    back: 'Zurück zu den Werkzeugen',
    guidedEyebrow: 'In deinem Tempo',
    guidedTitle: 'Geführte Verkostung',
    guidedIntro: 'Folge den Schritten. Deine Auswahl besteht nur, solange diese Seite geöffnet ist.',
    previous: 'Zurück',
    next: 'Weiter',
    finish: 'Meine Verkostung ansehen',
    restart: 'Neu beginnen',
    step: 'Schritt',
    of: 'von',
    colourQuestion: 'Welche Art Wein ist im Glas?',
    appearanceQuestion: 'Wie intensiv ist die Farbe?',
    aromaQuestion: 'Welche Aromen erkennst du?',
    aromaHelp: 'Wähle, was für dich passt. Es gibt keine falschen Antworten.',
    structureQuestion: 'Wie wirkt der Wein im Mund?',
    conclusionQuestion: 'Wie lautet dein Fazit?',
    bodyLabel: 'Körper',
    acidityLabel: 'Säure',
    tanninLabel: 'Tannine',
    enjoyAgain: 'Würde ich wieder trinken',
    maybeAgain: 'Vielleicht wieder',
    notAgain: 'Nicht mein Stil',
    resultTitle: 'Dein Eindruck von diesem Glas',
    resultNote: 'Das ist keine Bewertung und kein professionelles Urteil — nur eine Momentaufnahme deiner Wahrnehmung.',
    noneSelected: 'Nicht ausgewählt',
    chooserEyebrow: 'Vom Tisch ins Glas',
    chooserIntro: 'Wir empfehlen keine bestimmte Flasche, sondern passende Stile und Rebsorten aus dem Atlas.',
    whatFood: 'Was isst du?',
    preference: 'Eine Präferenz?',
    intensity: 'Wie kräftig soll der Wein sein?',
    any: 'Egal',
    seeSuggestions: 'Vorschläge anzeigen',
    suggestions: 'Gute Anhaltspunkte',
    why: 'Warum es passt',
    service: 'Servieren',
    resetChoice: 'Auswahl ändern',
    compareEyebrow: 'Direkter Vergleich',
    compareIntro: 'Vergleiche Profil, Aromen, Servieren, Glas und Speisen mit den Daten der Rebsorten-Bibliothek.',
    firstGrape: 'Erste Rebsorte',
    secondGrape: 'Zweite Rebsorte',
    chooseGrape: 'Rebsorte wählen',
    origin: 'Herkunft',
    aromas: 'Aromen',
    pairings: 'Am Tisch',
    glass: 'Glas',
    regions: 'Regionen',
    sameGrape: 'Wähle zwei verschiedene Rebsorten für einen sinnvollen Vergleich.',
    discover: 'Rebsorte entdecken',
    red: 'Rot',
    white: 'Weiss',
    rose: 'Rosé',
    sparkling: 'Schaumwein',
    pale: 'Hell',
    medium: 'Mittel',
    deep: 'Intensiv',
    low: 'Niedrig',
    high: 'Hoch',
  },
} as const

function c(locale: Locale) {
  return copy[locale]
}

function ToolHero({ eyebrow, title, body, children }: { eyebrow: string; title: string; body: string; children?: ReactNode }) {
  return (
    <section className="border-b border-line bg-paper py-11 dark:border-white/10 dark:bg-night-soft sm:py-16">
      <div className="page-shell">
        <p className="eyebrow mb-3">{eyebrow}</p>
        <h1 className="max-w-4xl font-display text-4xl font-semibold leading-[1.08] tracking-tight sm:text-6xl">{title}</h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-muted sm:text-lg">{body}</p>
        {children}
      </div>
    </section>
  )
}

function ToolLink({ to, icon, title, body }: { to: string; icon: ReactNode; title: string; body: string }) {
  const { locale } = useApp()
  const t = c(locale)
  return (
    <Link to={to} className="group flex min-h-60 flex-col rounded-[1.75rem] border border-line bg-paper p-6 transition hover:-translate-y-1 hover:border-wine hover:shadow-xl dark:border-white/15 dark:bg-white/[0.04]">
      <div className="mb-8 grid size-12 place-items-center rounded-2xl bg-wine/10 text-wine-light dark:bg-gold/10 dark:text-gold">{icon}</div>
      <h2 className="font-display text-2xl font-semibold">{title}</h2>
      <p className="mt-2 flex-1 leading-7 text-muted">{body}</p>
      <span className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-wine-light dark:text-gold">{t.open}<ArrowRight className="transition group-hover:translate-x-1" size={17} /></span>
    </Link>
  )
}

export function ToolsHubPage() {
  const { locale } = useApp()
  const t = c(locale)
  const [query, setQuery] = useState('')
  const normalized = query.trim().toLocaleLowerCase(locale)
  const results = useMemo(() => {
    if (normalized.length < 2) return []
    return grapes.filter((grape) => {
      const regionNames = grape.regionIds.map(getRegion).filter(Boolean).map((region) => text(region!.name, locale))
      const profileTerms = {
        pt: {
          acidity: grape.acidity === 'high' ? 'acidez alta alta acidez' : grape.acidity === 'low' ? 'acidez baixa baixa acidez' : 'acidez média média acidez',
          body: grape.body === 'full' ? 'corpo alto encorpado' : grape.body === 'light' ? 'corpo leve' : 'corpo médio',
          tannins: grape.tannins === 'high' ? 'taninos altos' : grape.tannins === 'low' ? 'taninos baixos' : 'taninos médios',
        },
        en: {
          acidity: `${grape.acidity} acidity`,
          body: grape.body === 'full' ? 'full body full-bodied' : `${grape.body} body`,
          tannins: `${grape.tannins} tannins`,
        },
        de: {
          acidity: grape.acidity === 'high' ? 'hohe säure' : grape.acidity === 'low' ? 'niedrige säure' : 'mittlere säure',
          body: grape.body === 'full' ? 'kräftiger körper' : grape.body === 'light' ? 'leichter körper' : 'mittlerer körper',
          tannins: grape.tannins === 'high' ? 'hohe tannine' : grape.tannins === 'low' ? 'niedrige tannine' : 'mittlere tannine',
        },
      }[locale]
      const haystack = [
        text(grape.name, locale),
        ...grape.aliases,
        text(grape.origin, locale),
        text(grape.description, locale),
        ...list(grape.aromas, locale),
        ...list(grape.pairings, locale),
        ...regionNames,
        profileTerms.acidity,
        profileTerms.body,
        profileTerms.tannins,
      ].join(' ').toLocaleLowerCase(locale)
      return haystack.includes(normalized)
    }).slice(0, 9)
  }, [locale, normalized])

  return (
    <>
      <ToolHero eyebrow={t.eyebrow} title={t.title} body={t.intro}>
        <p className="mt-6 inline-flex items-center gap-2 rounded-full border border-line px-4 py-2 text-xs font-bold uppercase tracking-wider text-muted dark:border-white/15"><Eye size={15} />{t.temporary}</p>
      </ToolHero>
      <section className="page-shell py-10 sm:py-14">
        <div className="rounded-[1.75rem] border border-line bg-paper p-5 dark:border-white/15 dark:bg-white/[0.04] sm:p-7">
          <div className="grid gap-5 lg:grid-cols-[.7fr_1.3fr] lg:items-end">
            <div>
              <p className="eyebrow mb-2">{t.searchTitle}</p>
              <p className="leading-7 text-muted">{t.searchBody}</p>
            </div>
            <label className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={20} />
              <input value={query} onChange={(event) => setQuery(event.target.value)} className="h-14 w-full rounded-2xl border border-line bg-canvas pl-12 pr-4 outline-none focus:border-wine dark:border-white/15 dark:bg-night" placeholder={t.searchPlaceholder} />
            </label>
          </div>
          {normalized.length >= 2 && (
            <div className="mt-7 border-t border-line pt-7 dark:border-white/10">
              {results.length ? <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{results.map((grape) => <GrapeCard key={grape.id} grape={grape} />)}</div> : <p className="rounded-2xl bg-canvas p-5 text-sm text-muted dark:bg-night">{t.noResults}</p>}
            </div>
          )}
        </div>
        <div className="mt-7 grid gap-5 md:grid-cols-3">
          <ToolLink to="/ferramentas/prova" icon={<Wine />} title={t.tastingTitle} body={t.tastingBody} />
          <ToolLink to="/ferramentas/escolher" icon={<Utensils />} title={t.chooserTitle} body={t.chooserBody} />
          <ToolLink to="/ferramentas/comparar" icon={<GrapeIcon />} title={t.compareTitle} body={t.compareBody} />
        </div>
      </section>
    </>
  )
}

const aromaFamilies = aromaJson as { id: string; color: string; name: LocalizedText; descriptors: LocalizedList }[]

const optionClass = (active: boolean) => `rounded-2xl border px-4 py-3 text-left text-sm font-bold transition ${
  active
    ? 'border-wine bg-wine text-white dark:border-gold dark:bg-gold dark:text-night'
    : 'border-line bg-paper hover:border-wine dark:border-white/15 dark:bg-white/[0.04]'
}`

export function GuidedTastingPage() {
  const { locale } = useApp()
  const t = c(locale)
  const [step, setStep] = useState(0)
  const [wineType, setWineType] = useState('')
  const [appearance, setAppearance] = useState('')
  const [aromas, setAromas] = useState<string[]>([])
  const [structure, setStructure] = useState({ body: '', acidity: '', tannins: '' })
  const [conclusion, setConclusion] = useState('')
  const totalSteps = 5

  const toggleAroma = (value: string) => setAromas((current) => current.includes(value) ? current.filter((item) => item !== value) : [...current, value])
  const reset = () => {
    setStep(0)
    setWineType('')
    setAppearance('')
    setAromas([])
    setStructure({ body: '', acidity: '', tannins: '' })
    setConclusion('')
  }
  const valueLabel = (value: string) => value ? (t[value as keyof typeof t] ?? value) : t.noneSelected

  return (
    <>
      <ToolHero eyebrow={t.guidedEyebrow} title={t.guidedTitle} body={t.guidedIntro}>
        <Link to="/ferramentas" className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-wine-light dark:text-gold"><ArrowLeft size={17} />{t.back}</Link>
      </ToolHero>
      <section className="page-shell max-w-4xl py-10 sm:py-14">
        <div className="mb-7 flex items-center gap-4">
          <p className="shrink-0 text-xs font-bold uppercase tracking-widest text-muted">{t.step} {Math.min(step + 1, totalSteps)} {t.of} {totalSteps}</p>
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-line dark:bg-white/10"><div className="h-full rounded-full bg-wine transition-all dark:bg-gold" style={{ width: `${Math.min((step + 1) / totalSteps, 1) * 100}%` }} /></div>
        </div>
        <div className="rounded-[2rem] border border-line bg-paper p-6 dark:border-white/15 dark:bg-white/[0.04] sm:p-9">
          {step === 0 && <ChoiceStep title={t.colourQuestion} options={['red', 'white', 'rose', 'sparkling']} selected={wineType} onSelect={setWineType} labels={t} />}
          {step === 1 && <ChoiceStep title={t.appearanceQuestion} options={['pale', 'medium', 'deep']} selected={appearance} onSelect={setAppearance} labels={t} />}
          {step === 2 && (
            <div>
              <h2 className="font-display text-3xl font-semibold">{t.aromaQuestion}</h2>
              <p className="mt-2 text-muted">{t.aromaHelp}</p>
              <div className="mt-7 grid gap-5 sm:grid-cols-2">
                {aromaFamilies.map((family) => (
                  <div key={family.id} className="rounded-2xl border border-line p-4 dark:border-white/15">
                    <h3 className="font-bold" style={{ color: family.color }}>{text(family.name, locale)}</h3>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {list(family.descriptors, locale).map((descriptor) => <button key={descriptor} type="button" onClick={() => toggleAroma(descriptor)} className={optionClass(aromas.includes(descriptor))}>{descriptor}</button>)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {step === 3 && (
            <div>
              <h2 className="font-display text-3xl font-semibold">{t.structureQuestion}</h2>
              <div className="mt-7 grid gap-7">
                {([['body', t.bodyLabel], ['acidity', t.acidityLabel], ['tannins', t.tanninLabel]] as const).map(([key, label]) => (
                  <div key={key}>
                    <p className="mb-3 font-bold">{label}</p>
                    <div className="grid grid-cols-3 gap-2">{(['low', 'medium', 'high'] as Level[]).map((level) => <button type="button" key={level} className={optionClass(structure[key] === level)} onClick={() => setStructure((current) => ({ ...current, [key]: level }))}>{t[level]}</button>)}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {step === 4 && <ChoiceStep title={t.conclusionQuestion} options={['enjoyAgain', 'maybeAgain', 'notAgain']} selected={conclusion} onSelect={setConclusion} labels={t} />}
          {step === 5 && (
            <div>
              <div className="mb-6 grid size-12 place-items-center rounded-full bg-leaf/10 text-leaf dark:bg-leaf-light/10 dark:text-leaf-light"><Check /></div>
              <h2 className="font-display text-3xl font-semibold">{t.resultTitle}</h2>
              <p className="mt-2 leading-7 text-muted">{t.resultNote}</p>
              <dl className="mt-7 grid gap-3 sm:grid-cols-2">
                <Summary label={t.colourQuestion} value={valueLabel(wineType)} />
                <Summary label={t.appearanceQuestion} value={valueLabel(appearance)} />
                <Summary label={t.aromas} value={aromas.length ? aromas.join(' · ') : t.noneSelected} />
                <Summary label={t.bodyLabel} value={valueLabel(structure.body)} />
                <Summary label={t.acidityLabel} value={valueLabel(structure.acidity)} />
                <Summary label={t.tanninLabel} value={valueLabel(structure.tannins)} />
                <Summary label={t.conclusionQuestion} value={valueLabel(conclusion)} />
              </dl>
              <button type="button" onClick={reset} className="button-secondary mt-7"><RotateCcw size={17} />{t.restart}</button>
            </div>
          )}
        </div>
        {step < totalSteps && (
          <div className="mt-5 flex justify-between gap-3">
            <button type="button" className="button-secondary" disabled={step === 0} onClick={() => setStep((current) => Math.max(0, current - 1))}><ArrowLeft size={17} />{t.previous}</button>
            <button type="button" className="button-primary" onClick={() => setStep((current) => current + 1)}>{step === totalSteps - 1 ? t.finish : t.next}<ArrowRight size={17} /></button>
          </div>
        )}
      </section>
    </>
  )
}

function ChoiceStep({ title, options, selected, onSelect, labels }: { title: string; options: string[]; selected: string; onSelect: (value: string) => void; labels: Record<string, string> }) {
  return (
    <div>
      <h2 className="font-display text-3xl font-semibold">{title}</h2>
      <div className="mt-7 grid gap-3 sm:grid-cols-2">{options.map((option) => <button type="button" key={option} className={optionClass(selected === option)} onClick={() => onSelect(option)}>{labels[option]}</button>)}</div>
    </div>
  )
}

function Summary({ label, value }: { label: string; value: string }) {
  return <div className="rounded-2xl border border-line p-4 dark:border-white/15"><dt className="eyebrow mb-2">{label}</dt><dd className="font-semibold leading-6">{value}</dd></div>
}

const foodRules: { id: string; label: LocalizedText; reason: LocalizedText; grapeIds: string[] }[] = [
  {
    id: 'red-meat',
    label: { pt: 'Carne vermelha ou caça', en: 'Red meat or game', de: 'Rotes Fleisch oder Wild' },
    reason: { pt: 'Estrutura e taninos acompanham a intensidade e a gordura da carne.', en: 'Structure and tannin match the intensity and fat of the meat.', de: 'Struktur und Tannin passen zu Intensität und Fett des Fleisches.' },
    grapeIds: ['touriga-nacional', 'alicante-bouschet', 'syrah', 'baga', 'tinta-roriz'],
  },
  {
    id: 'poultry',
    label: { pt: 'Aves ou porco', en: 'Poultry or pork', de: 'Geflügel oder Schwein' },
    reason: { pt: 'Castas de corpo médio respeitam a carne e adaptam-se ao molho.', en: 'Medium-bodied grapes respect the meat and adapt to the sauce.', de: 'Mittelkräftige Sorten passen zum Fleisch und lassen Raum für die Sauce.' },
    grapeIds: ['tinta-roriz', 'pinot-noir', 'chardonnay', 'encruzado'],
  },
  {
    id: 'fish',
    label: { pt: 'Peixe ou marisco', en: 'Fish or seafood', de: 'Fisch oder Meeresfrüchte' },
    reason: { pt: 'Acidez e frescura limpam o palato sem esconder os sabores delicados.', en: 'Acidity and freshness clean the palate without hiding delicate flavours.', de: 'Säure und Frische reinigen den Gaumen, ohne feine Aromen zu verdecken.' },
    grapeIds: ['alvarinho', 'arinto', 'chasselas', 'encruzado', 'pinot-noir'],
  },
  {
    id: 'vegetable',
    label: { pt: 'Legumes ou pratos vegetarianos', en: 'Vegetables or vegetarian dishes', de: 'Gemüse oder vegetarische Gerichte' },
    reason: { pt: 'Perfis frescos, herbais ou terrosos ligam-se aos ingredientes sem os dominar.', en: 'Fresh, herbal or earthy profiles connect with the ingredients without dominating them.', de: 'Frische, kräutrige oder erdige Profile begleiten die Zutaten, ohne sie zu überdecken.' },
    grapeIds: ['sauvignon-blanc', 'arinto', 'pinot-noir', 'tinta-roriz'],
  },
  {
    id: 'cheese',
    label: { pt: 'Queijos ou enchidos', en: 'Cheese or cured meats', de: 'Käse oder Wurstwaren' },
    reason: { pt: 'Acidez, fruta e estrutura equilibram sal, gordura e intensidade.', en: 'Acidity, fruit and structure balance salt, fat and intensity.', de: 'Säure, Frucht und Struktur balancieren Salz, Fett und Intensität.' },
    grapeIds: ['baga', 'tinta-roriz', 'touriga-nacional', 'chasselas', 'riesling'],
  },
  {
    id: 'spicy',
    label: { pt: 'Comida picante ou aromática', en: 'Spicy or aromatic food', de: 'Scharfe oder aromatische Küche' },
    reason: { pt: 'Aromas intensos e pouco tanino evitam tornar o picante mais agressivo.', en: 'Expressive aromas and low tannin avoid making heat feel harsher.', de: 'Intensive Aromen und wenig Tannin lassen Schärfe nicht aggressiver wirken.' },
    grapeIds: ['riesling', 'gewurztraminer', 'alvarinho', 'pinot-noir'],
  },
]

export function WineChooserPage() {
  const { locale } = useApp()
  const t = c(locale)
  const [food, setFood] = useState(foodRules[0].id)
  const [preference, setPreference] = useState<WineType>('either')
  const [intensity, setIntensity] = useState<'light' | 'medium' | 'full'>('medium')
  const [show, setShow] = useState(false)
  const rule = foodRules.find((item) => item.id === food)!
  const candidates = rule.grapeIds.map(getGrape).filter(Boolean) as Grape[]
  const preferred = preference === 'either' ? candidates : candidates.filter((grape) => grape.type === preference)
  const matching = preferred.filter((grape) => grape.body === intensity)
  const suggestions = [...new Map(
    [...matching, ...preferred, ...candidates].map((grape) => [grape.id, grape]),
  ).values()].slice(0, 4)

  return (
    <>
      <ToolHero eyebrow={t.chooserEyebrow} title={t.chooserTitle} body={t.chooserIntro}>
        <Link to="/ferramentas" className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-wine-light dark:text-gold"><ArrowLeft size={17} />{t.back}</Link>
      </ToolHero>
      <section className="page-shell py-10 sm:py-14">
        <div className="grid gap-6 lg:grid-cols-[.8fr_1.2fr]">
          <div className="rounded-[2rem] border border-line bg-paper p-6 dark:border-white/15 dark:bg-white/[0.04]">
            <ChooserField label={t.whatFood}>{foodRules.map((item) => <button type="button" key={item.id} className={optionClass(food === item.id)} onClick={() => { setFood(item.id); setShow(false) }}>{text(item.label, locale)}</button>)}</ChooserField>
            <ChooserField label={t.preference}>{(['either', 'red', 'white'] as WineType[]).map((item) => <button type="button" key={item} className={optionClass(preference === item)} onClick={() => { setPreference(item); setShow(false) }}>{item === 'either' ? t.any : t[item]}</button>)}</ChooserField>
            <ChooserField label={t.intensity}>{(['light', 'medium', 'full'] as const).map((item) => <button type="button" key={item} className={optionClass(intensity === item)} onClick={() => { setIntensity(item); setShow(false) }}>{item === 'light' ? t.low : item === 'full' ? t.high : t.medium}</button>)}</ChooserField>
            <button type="button" className="button-primary mt-7 w-full" onClick={() => setShow(true)}>{t.seeSuggestions}<ArrowRight size={17} /></button>
          </div>
          <div className="min-h-96 rounded-[2rem] border border-line p-6 dark:border-white/15 sm:p-8">
            {!show ? (
              <div className="grid h-full min-h-80 place-items-center text-center">
                <div><Sparkles className="mx-auto mb-4 text-gold" size={34} /><p className="max-w-sm leading-7 text-muted">{t.chooserBody}</p></div>
              </div>
            ) : (
              <div>
                <p className="eyebrow mb-2">{t.suggestions}</p>
                <h2 className="font-display text-3xl font-semibold">{text(rule.label, locale)}</h2>
                <div className="mt-5 rounded-2xl bg-gold/10 p-4 text-sm leading-6"><strong>{t.why}:</strong> {text(rule.reason, locale)}</div>
                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  {suggestions.map((grape) => (
                    <Link key={grape.id} to={`/castas/${grape.id}`} className="rounded-2xl border border-line p-4 transition hover:border-wine dark:border-white/15">
                      <div className="flex items-center gap-3"><span className="size-3 rounded-full" style={{ background: grape.color }} /><h3 className="font-display text-xl font-semibold">{text(grape.name, locale)}</h3></div>
                      <p className="mt-2 text-sm text-muted">{text(grape.origin, locale)}</p>
                      <p className="mt-3 text-xs font-bold text-wine-light dark:text-gold">{t.service}: {text(grape.service, locale)}</p>
                    </Link>
                  ))}
                </div>
                <button type="button" className="button-secondary mt-6" onClick={() => setShow(false)}><RotateCcw size={17} />{t.resetChoice}</button>
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  )
}

function ChooserField({ label, children }: { label: string; children: ReactNode }) {
  return <fieldset className="mb-7"><legend className="mb-3 font-display text-xl font-semibold">{label}</legend><div className="grid gap-2">{children}</div></fieldset>
}

export function GrapeComparePage() {
  const { locale } = useApp()
  const t = c(locale)
  const sorted = [...grapes].sort((a, b) => text(a.name, locale).localeCompare(text(b.name, locale)))
  const [firstId, setFirstId] = useState(sorted[0]?.id ?? '')
  const [secondId, setSecondId] = useState(sorted[1]?.id ?? '')
  const first = getGrape(firstId)
  const second = getGrape(secondId)
  const same = firstId === secondId

  return (
    <>
      <ToolHero eyebrow={t.compareEyebrow} title={t.compareTitle} body={t.compareIntro}>
        <Link to="/ferramentas" className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-wine-light dark:text-gold"><ArrowLeft size={17} />{t.back}</Link>
      </ToolHero>
      <section className="page-shell py-10 sm:py-14">
        <div className="mb-7 grid gap-4 rounded-[1.75rem] border border-line bg-paper p-5 dark:border-white/15 dark:bg-white/[0.04] sm:grid-cols-2 sm:p-6">
          <GrapeSelect label={t.firstGrape} value={firstId} onChange={setFirstId} grapes={sorted} locale={locale} />
          <GrapeSelect label={t.secondGrape} value={secondId} onChange={setSecondId} grapes={sorted} locale={locale} />
        </div>
        {same ? <p className="rounded-2xl border border-gold/30 bg-gold/10 p-5 text-center font-semibold">{t.sameGrape}</p> : first && second ? (
          <div className="overflow-hidden rounded-[1.75rem] border border-line dark:border-white/15">
            <div className="grid grid-cols-[6rem_1fr_1fr] bg-wine p-4 text-white sm:grid-cols-[10rem_1fr_1fr]">
              <span />
              <h2 className="font-display text-xl font-semibold sm:text-2xl">{text(first.name, locale)}</h2>
              <h2 className="font-display text-xl font-semibold sm:text-2xl">{text(second.name, locale)}</h2>
            </div>
            <CompareRow label={t.origin} a={text(first.origin, locale)} b={text(second.origin, locale)} />
            <CompareRow label={t.bodyLabel} a={c(locale)[first.body === 'light' ? 'low' : first.body === 'full' ? 'high' : 'medium']} b={c(locale)[second.body === 'light' ? 'low' : second.body === 'full' ? 'high' : 'medium']} />
            <CompareRow label={t.acidityLabel} a={c(locale)[first.acidity]} b={c(locale)[second.acidity]} />
            <CompareRow label={t.tanninLabel} a={c(locale)[first.tannins]} b={c(locale)[second.tannins]} />
            <CompareRow label={t.aromas} a={list(first.aromas, locale).join(' · ')} b={list(second.aromas, locale).join(' · ')} />
            <CompareRow label={t.service} a={text(first.service, locale)} b={text(second.service, locale)} />
            <CompareRow label={t.glass} a={text(first.glass, locale)} b={text(second.glass, locale)} />
            <CompareRow label={t.pairings} a={list(first.pairings, locale).join(' · ')} b={list(second.pairings, locale).join(' · ')} />
            <CompareRow label={t.regions} a={regionList(first, locale)} b={regionList(second, locale)} />
            <div className="grid grid-cols-[6rem_1fr_1fr] gap-3 bg-paper p-4 dark:bg-white/[0.04] sm:grid-cols-[10rem_1fr_1fr]">
              <span />
              <Link className="inline-flex items-center gap-1 text-sm font-bold text-wine-light dark:text-gold" to={`/castas/${first.id}`}>{t.discover}<ChevronRight size={16} /></Link>
              <Link className="inline-flex items-center gap-1 text-sm font-bold text-wine-light dark:text-gold" to={`/castas/${second.id}`}>{t.discover}<ChevronRight size={16} /></Link>
            </div>
          </div>
        ) : null}
      </section>
    </>
  )
}

function GrapeSelect({ label, value, onChange, grapes: options, locale }: { label: string; value: string; onChange: (value: string) => void; grapes: Grape[]; locale: Locale }) {
  return (
    <label>
      <span className="mb-2 block text-xs font-bold uppercase tracking-widest text-muted">{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)} className="h-12 w-full rounded-xl border border-line bg-canvas px-3 font-semibold outline-none focus:border-wine dark:border-white/15 dark:bg-night">
        {options.map((grape) => <option key={grape.id} value={grape.id}>{text(grape.name, locale)}</option>)}
      </select>
    </label>
  )
}

function CompareRow({ label, a, b }: { label: string; a: string; b: string }) {
  return (
    <div className="grid grid-cols-[6rem_1fr_1fr] gap-3 border-t border-line p-4 text-sm leading-6 dark:border-white/10 sm:grid-cols-[10rem_1fr_1fr]">
      <p className="font-bold text-muted">{label}</p><p>{a}</p><p>{b}</p>
    </div>
  )
}

function regionList(grape: Grape, locale: Locale) {
  return grape.regionIds.map(getRegion).filter(Boolean).map((region) => text(region!.name, locale)).join(' · ')
}
