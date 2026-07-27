import { Component, lazy, Suspense, type ErrorInfo, type ReactNode } from 'react'
import { Wine } from 'lucide-react'
import { Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import { useApp } from './context/AppContext'

const HomePage = lazy(() => import('./pages/HomePage'))
const RegionsPage = lazy(() => import('./pages/RegionsPage'))
const RegionDetailPage = lazy(() => import('./pages/RegionDetailPage'))
const GrapesPage = lazy(() => import('./pages/GrapesPage'))
const GrapeDetailPage = lazy(() => import('./pages/GrapeDetailPage'))
const GuidePage = lazy(() => import('./pages/GuidePage'))
const SommelierPage = lazy(() => import('./pages/SommelierPage'))
const AromaWheelPage = lazy(() => import('./pages/AromaWheelPage'))
const HistoryPage = lazy(() => import('./pages/HistoryPage'))
const ArticleDetailPage = lazy(() => import('./pages/ArticleDetailPage'))
const FavoritesPage = lazy(() => import('./pages/FavoritesPage'))
const SearchPage = lazy(() => import('./pages/SearchPage'))
const PrivacyPage = lazy(() => import('./pages/PrivacyPage'))
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'))
const ToolsHubPage = lazy(() => import('./pages/ToolsHubPage'))
const GuidedTastingPage = lazy(() => import('./pages/GuidedTastingPage'))
const WineChooserPage = lazy(() => import('./pages/WineChooserPage'))
const GrapeComparePage = lazy(() => import('./pages/GrapeComparePage'))

function RouteFallback() {
  const { t } = useApp()
  return (
    <div className="page-shell grid min-h-[45vh] place-items-center" role="status">
      <p className="eyebrow">{t('loading')}</p>
    </div>
  )
}

export default function AppRoutes() {
  return (
    <Layout>
      <Suspense fallback={<RouteFallback />}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/regioes" element={<RegionsPage />} />
          <Route path="/regioes/:id" element={<RegionDetailPage />} />
          <Route path="/castas" element={<GrapesPage />} />
          <Route path="/castas/:id" element={<GrapeDetailPage />} />
          <Route path="/guia" element={<GuidePage />} />
          <Route path="/guia/sommelier" element={<SommelierPage />} />
          <Route path="/guia/aromas" element={<AromaWheelPage />} />
          <Route path="/guia/historia" element={<HistoryPage />} />
          <Route path="/guia/:id" element={<ArticleDetailPage />} />
          <Route path="/ferramentas" element={<ToolsHubPage />} />
          <Route path="/ferramentas/prova" element={<GuidedTastingPage />} />
          <Route path="/ferramentas/escolher" element={<WineChooserPage />} />
          <Route path="/ferramentas/comparar" element={<GrapeComparePage />} />
          <Route path="/favoritos" element={<FavoritesPage />} />
          <Route path="/pesquisa" element={<SearchPage />} />
          <Route path="/privacidade" element={<PrivacyPage />} />
          <Route path="/404" element={<NotFoundPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </Layout>
  )
}

interface ErrorBoundaryState { hasError: boolean }

export class ErrorBoundary extends Component<{ children: ReactNode }, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error(error, info)
  }

  render() {
    if (!this.state.hasError) return this.props.children
    const locale = document.documentElement.lang
    const message = locale === 'pt'
      ? ['Algo correu mal', 'Não foi possível abrir esta parte do atlas. Atualiza a página e tenta novamente.', 'Atualizar']
      : locale === 'de'
        ? ['Etwas ist schiefgelaufen', 'Dieser Teil des Atlas konnte nicht geöffnet werden. Bitte aktualisiere die Seite.', 'Aktualisieren']
        : ['Something went wrong', 'We could not open this part of the atlas. Refresh the page and try again.', 'Refresh']
    return (
      <div className="grid min-h-dvh place-items-center bg-canvas p-6 text-center text-ink dark:bg-night dark:text-cream">
        <div>
          <Wine className="mx-auto mb-5 text-wine-light" size={38} aria-hidden="true" />
          <h1 className="font-display text-4xl font-semibold">{message[0]}</h1>
          <p className="mt-3 text-muted">{message[1]}</p>
          <button type="button" className="button-primary mt-6" onClick={() => window.location.reload()}>{message[2]}</button>
        </div>
      </div>
    )
  }
}
