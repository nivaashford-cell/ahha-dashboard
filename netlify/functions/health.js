export default async (req) => {
  return new Response(
    JSON.stringify({
      status: 'ok',
      app: 'Assured Home Health Agency Dashboard',
      timestamp: new Date().toISOString(),
    }),
    {
      headers: { 'Content-Type': 'application/json' },
    }
  )
}

export const config = {
  path: '/api/health',
}
