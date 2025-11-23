import { useEffect, useState } from "react"
import { fetchAlerts, type Alert } from "../services/alerts"

export default function Alertas() {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAlerts().then(data => {
        setAlerts(data)
        setLoading(false)
    })
  }, [])

  const getIcon = (type: string) => {
      switch(type) {
          case 'clima': return '⛈️';
          case 'obstruccion': return '🚧';
          case 'seguridad': return '👮';
          default: return '📢';
      }
  }

  const getColor = (level: string) => {
      switch(level) {
          case 'rojo': return 'bg-red-50 border-red-500 text-red-800';
          case 'amarillo': return 'bg-yellow-50 border-yellow-500 text-yellow-800';
          default: return 'bg-green-50 border-green-500 text-green-800';
      }
  }

  return (
    <div className="p-4 bg-gray-50 min-h-full pb-24">
      <h2 className="text-xl font-bold mb-6 text-gray-800 border-b pb-2">
        📢 Reportes de la Comunidad
      </h2>

      {loading && <p className="text-center text-gray-500">Cargando alertas...</p>}

      {!loading && alerts.length === 0 && (
          <div className="text-center py-10 bg-white rounded-lg shadow-sm">
              <div className="text-4xl mb-2">✅</div>
              <p className="text-gray-500">No hay alertas reportadas recientemente.</p>
          </div>
      )}

      <div className="space-y-4">
          {alerts.map(alert => (
              <div key={alert.id} className={`p-4 rounded-lg border-l-4 shadow-sm ${getColor(alert.level)}`}>
                  <div className="flex justify-between items-start mb-1">
                      <h3 className="font-bold text-lg flex items-center gap-2">
                          {getIcon(alert.type)} {alert.type.toUpperCase()}
                      </h3>
                      <span className="text-xs font-mono opacity-70">
                          {new Date(alert.timestamp).toLocaleDateString()}
                      </span>
                  </div>
                  <p className="font-semibold mb-1">
                      📍 Ruta: {alert.routeName}
                  </p>
                  <p className="text-sm opacity-90">
                      {alert.description}
                  </p>
              </div>
          ))}
      </div>
    </div>
  )
}