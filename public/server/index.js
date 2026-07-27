export default {
  async fetch(request, env) {
    const response = await env.ASSETS.fetch(request)
    if (response.status !== 404 || request.method !== 'GET') return response

    const acceptsHtml = (request.headers.get('Accept') || '').includes('text/html')
    if (!acceptsHtml) return response

    const indexUrl = new URL(request.url)
    indexUrl.pathname = '/'
    return env.ASSETS.fetch(new Request(indexUrl, request))
  },
}
