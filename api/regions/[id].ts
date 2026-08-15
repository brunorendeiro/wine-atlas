import regionsJson from '../../src/data/regions.json'

const regions = regionsJson as Array<{ id: string; [key: string]: unknown }>

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

  const { id } = req.query as Record<string, string | undefined>
  const region = regions.find((r) => r.id === id)

  if (!region) {
    res.status(404).json({ error: `Region "${id}" not found` })
    return
  }

  res.status(200).json({ data: region })
}
