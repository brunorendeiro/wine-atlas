import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useApp } from '../context/AppContext'

export default function NotFoundPage() {
  const { t } = useApp()
  return (
    <section className="page-shell grid min-h-[65vh] place-items-center py-16 text-center">
      <div>
        <p className="font-display text-8xl font-semibold text-wine/15 dark:text-gold/15">404</p>
        <h1 className="-mt-5 font-display text-4xl font-semibold">{t('pageNotFound')}</h1>
        <p className="mt-3 text-muted">{t('pageNotFoundBody')}</p>
        <Link to="/" className="button-primary mt-7">{t('goHome')}<ArrowRight size={18} aria-hidden="true" /></Link>
      </div>
    </section>
  )
}
