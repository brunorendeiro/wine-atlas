import regionsJson from '../src/data/regions.json'

const regions = regionsJson as Array<{
  id: string
  countryCode: string
  featured: boolean
  [key: string]: unknown
}>

function setCommonHeaders(res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=86400')
}

export default function handler(req: any, res: any) {
  setCommonHeaders(res)

  if (req.method === 'OPTIONS') {
    res.status(204).end()
    return
  }
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  const { country, featured } = req.query as Record<string, string | undefined>
  let data = regions

  if (typeof country === 'string') {
    data = data.filter((region) => region.countryCode.toLowerCase() === country.toLowerCase())
  }
  if (featured === 'true') {
    data = data.filter((region) => region.featured === true)
  }

  res.status(200).json({ count: data.length, data })
}
