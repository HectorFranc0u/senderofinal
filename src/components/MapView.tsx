import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet"
import "leaflet/dist/leaflet.css"
import { useEffect, useMemo } from "react"
import * as L from "leaflet"
import { type Trail } from "../services/api"
import { markerByDifficulty } from "../lib/markers"

type MapViewProps = {
  routes?: Trail[]
  focus?: { lat: number; lng: number } | null
}

function CenterMap({ coords }: { coords: { lat: number; lng: number } | null }) {
  const map = useMap()
  useEffect(() => {
    if (coords) map.flyTo(coords, 13, { duration: 0.6 })
  }, [coords])
  return null
}

export default function MapView({ routes = [], focus = null }: MapViewProps) {
  // Cachea los iconos por dificultad para no recrearlos en cada render
  const icons = useMemo(
    () => ({
      baja: markerByDifficulty("baja"),
      media: markerByDifficulty("media"),
      alta: markerByDifficulty("alta"),
      other: markerByDifficulty("otra" as any),
    }),
    []
  )

  return (
    <div className="h-[calc(100vh-120px)] w-full">
      <MapContainer
        center={[13.6929, -89.2182]}
        zoom={9}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {routes.map((r) => {
          const icon =
            (icons as any)[r.difficulty] ?? icons.other

          return (
            <Marker
              key={r.id}
              position={[r.start.lat, r.start.lng]}
              icon={icon}
            >
              <Popup>
                <div className="space-y-1">
                  <div className="font-semibold">{r.name}</div>
                  <div className="text-sm text-gray-700">
                    Dificultad:{" "}
                    <span className={
                      r.difficulty === "alta" ? "text-red-600" :
                      r.difficulty === "media" ? "text-yellow-600" :
                      "text-green-600"
                    }>
                      {r.difficulty}
                    </span>
                    {" "}• {r.lengthKm} km
                  </div>
                  <div className="text-xs text-gray-500">
                    {r.start.lat.toFixed(4)}, {r.start.lng.toFixed(4)}
                  </div>
                </div>
              </Popup>
            </Marker>
          )
        })}

        <CenterMap coords={focus} />
      </MapContainer>
    </div>
  )
}
