export type Alert = {
  id: number
  type: 'clima' | 'seguridad' | string
  level: 'verde' | 'amarillo' | 'rojo' | string
  title: string
  message: string
  ts: number
}

export type Trail = {
  id: string
  name: string
  difficulty: 'baja' | 'media' | 'alta' | string
  lengthKm: number
  start: { lat: number; lng: number }
}

export async function fetchAlerts(): Promise<Alert[]> {
  const r = await fetch('/api/alerts')
  const j = await r.json()
  return j.data || []
}

export async function fetchRoutes(): Promise<Trail[]> {
  const r = await fetch('/api/routes')
  const j = await r.json()
  return j.data || []
}

export async function sendSOS(payload: { lat: number; lng: number; message: string }) {
  const r = await fetch('/api/sos', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  const j = await r.json()
  return j
}
