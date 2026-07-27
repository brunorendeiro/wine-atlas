import { readFile, writeFile } from 'node:fs/promises'

const root = new URL('../', import.meta.url)
const regions = JSON.parse(await readFile(new URL('src/data/regions.json', root), 'utf8'))
const grapes = JSON.parse(await readFile(new URL('src/data/grapes.json', root), 'utf8'))
const articles = [
  ...JSON.parse(await readFile(new URL('src/data/articles.json', root), 'utf8')),
  ...JSON.parse(await readFile(new URL('src/data/guide-expansion.json', root), 'utf8')),
]
const base = 'https://wine-atlas.app'
const paths = [
  '', '/regioes', '/castas', '/guia', '/ferramentas', '/favoritos',
  ...regions.map(({ id }) => `/regioes/${id}`),
  ...grapes.map(({ id }) => `/castas/${id}`),
  ...articles.map(({ id }) => `/guia/${id}`),
]
const urls = paths.map((path) => `  <url><loc>${base}${path}</loc><lastmod>2026-07-27</lastmod></url>`).join('\n')
const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`
await writeFile(new URL('public/sitemap.xml', root), xml)
