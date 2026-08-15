import grapesJson from '../src/data/grapes.json'

const grapes = grapesJson as Array<{
  id: string
  type: 'red' | 'white'
  heritage?: string
  regionIds: string[]
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

  const { type, region, heritage } = req.query as Record<string, string | undefined>
  let data = grapes

  if (typeof type === 'string') {
    data = data.filter((grape) => grape.type === type)
  }
  if (typeof region === 'string') {
    data = data.filter((grape) => grape.regionIds.includes(region))
  }
  if (typeof heritage === 'string') {
    data = data.filter((grape) => grape.heritage === heritage)
  }

  res.status(200).json({ count: data.length, data })
}
