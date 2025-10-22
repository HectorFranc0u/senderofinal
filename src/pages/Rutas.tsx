import { useEffect, useState } from "react"
import { fetchRoutes, type Trail } from "../services/api"

type Props = {
  onSelect: (coords: { lat: number; lng: number }) => void
}

export default function Rutas({ onSelect }: Props) {
  const [data, setData] = useState<Trail[]>([])

  useEffect(() => {
    fetchRoutes().then(setData)
  }, [])

  return (
    <div className="p-4 space-y-3 pb-24">
      <h2 className="text-lg font-bold mb-2">Rutas</h2>
      {data.map((r) => (
        <div
          key={r.id}
          onClick={() => onSelect(r.start)}
          className="border rounded-xl p-3 cursor-pointer hover:bg-green-50 transition"
        >
          <div className="font-semibold text-green-900">{r.name}</div>
          <div className="text-sm text-gray-700">
            Dificultad: {r.difficulty} • {r.lengthKm} km
          </div>
          <div className="text-xs text-gray-500">
            ({r.start.lat.toFixed(4)}, {r.start.lng.toFixed(4)})
          </div>
        </div>
      ))}
    </div>
  )
}
