import { ArrowLeft, Heart } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useApp } from '../context/AppContext'

export default function PrivacyPage() {
  const { t } = useApp()
  return (
    <section className="page-shell max-w-3xl py-14 sm:py-20">
      <div className="mb-7 grid size-14 place-items-center rounded-2xl bg-leaf/10 text-leaf dark:text-leaf-light"><Heart size={25} aria-hidden="true" /></div>
      <h1 className="font-display text-5xl font-semibold">{t('privacyTitle')}</h1>
      <p className="mt-6 text-lg leading-8 text-muted">{t('privacyBody')}</p>
      <Link to="/" className="button-primary mt-8"><ArrowLeft size={18} aria-hidden="true" />{t('goHome')}</Link>
    </section>
  )
}
