import { EmptyState, GrapeCard, RegionCard } from '../components/Cards'
import { PageHero, SectionHeading } from '../components/PagePrimitives'
import { useApp } from '../context/AppContext'
import { getGrape, getRegion } from '../lib/data'
import type { Grape, Region } from '../types'

export default function FavoritesPage() {
  const { favorites, t } = useApp()
  const favoriteRegions = favorites.filter((item) => item.type === 'region').map((item) => getRegion(item.id)).filter(Boolean) as Region[]
  const favoriteGrapes = favorites.filter((item) => item.type === 'grape').map((item) => getGrape(item.id)).filter(Boolean) as Grape[]
  return (
    <>
      <PageHero eyebrow={`${favorites.length} ${t('saved').toLowerCase()}`} title={t('favoritesTitle')} body={t('favoritesIntro')} />
      <section className="page-shell py-9 sm:py-12">
        {!favorites.length
          ? <EmptyState title={t('emptyFavorites')} body={t('emptyFavoritesBody')} action={t('startExploring')} to="/regioes" />
          : (
            <div className="grid gap-14">
              {favoriteRegions.length > 0 && <div><SectionHeading title={t('favoriteRegions')} /><div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{favoriteRegions.map((region) => <RegionCard key={region.id} region={region} />)}</div></div>}
              {favoriteGrapes.length > 0 && <div><SectionHeading title={t('favoriteGrapes')} /><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{favoriteGrapes.map((grape) => <GrapeCard key={grape.id} grape={grape} />)}</div></div>}
            </div>
          )}
      </section>
    </>
  )
}
