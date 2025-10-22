import { useEffect, useState } from 'react'
import { fetchAlerts, type Alert } from '../services/api'

export default function Alertas() {
  const [data, setData] = useState<Alert[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAlerts().then((d) => { setData(d); setLoading(false) })
  }, [])

  if (loading) return <div className="p-4">Cargando alertas…</div>

  return (
    <div className="p-4 space-y-3 pb-24">
      <h2 className="text-lg font-bold mb-2">Alertas</h2>
      {data.map(a => (
        <div key={a.id} className="border rounded-xl p-3">
          <div className="flex justify-between">
            <span className="font-semibold">{a.title}</span>
            <span className={`text-xs uppercase ${a.level === 'rojo' ? 'text-red-600' : a.level === 'amarillo' ? 'text-yellow-600' : 'text-green-600'}`}>
              {a.level}
            </span>
          </div>
          <p className="text-sm text-gray-700">{a.message}</p>
          <p className="text-xs text-gray-500">{new Date(a.ts).toLocaleString()}</p>
        </div>
      ))}
    </div>
  )
}
