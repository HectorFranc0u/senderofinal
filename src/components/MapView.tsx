import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from "react-leaflet"
import "leaflet/dist/leaflet.css"
import { useEffect, useMemo } from "react"
import { type Trail } from "../services/api"
import { type UserPoint } from "../services/points"
import { markerByDifficulty } from "../lib/markers"

type MapViewProps = {
  routes?: Trail[]
  userPoints?: UserPoint[]
  focus?: { lat: number; lng: number } | null
  onMapClick?: (lat: number, lng: number) => void
  isSelectionMode?: boolean // Para cambiar estilo del cursor
}

// Detector de Clics
function ClickHandler({ onMapClick }: { onMapClick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng.lat, e.latlng.lng)
    },
  })
  return null
}

function CenterMap({ coords }: { coords: { lat: number; lng: number } | null }) {
  const map = useMap()
  useEffect(() => {
    if (coords) map.flyTo(coords, 14, { duration: 1.5 }) // Zoom más cercano al guardar
  }, [coords])
  return null
}

export default function MapView({ 
  routes = [], 
  userPoints = [], 
  focus = null, 
  onMapClick,
  isSelectionMode = false 
}: MapViewProps) {
  
  const icons = useMemo(() => ({
    baja: markerByDifficulty("baja"),
    media: markerByDifficulty("media"),
    alta: markerByDifficulty("alta"),
    other: markerByDifficulty("otra" as any),
  }), [])

  return (
    // Si estamos en modo selección, ponemos cursor de mira (crosshair)
    <div className={`h-[calc(100vh-120px)] w-full relative z-0 ${isSelectionMode ? 'cursor-crosshair' : ''}`}>
      <MapContainer
        center={[13.6929, -89.2182]}
        zoom={9}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; OpenStreetMap'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {onMapClick && <ClickHandler onMapClick={onMapClick} />}

        {/* RUTAS OFICIALES */}
        {routes.map((r) => {
          const icon = (icons as any)[r.difficulty] ?? icons.other
          return (
            <Marker key={`route-${r.id}`} position={[r.start.lat, r.start.lng]} icon={icon}>
              <Popup>
                <div className="font-bold">{r.name}</div>
                <div className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded inline-block mt-1">Ruta Verificada</div>
              </Popup>
            </Marker>
          )
        })}

        {/* PUNTOS DE USUARIO (Ahora se ven como Rutas) */}
        {userPoints.map((p, idx) => {
          // SEGURIDAD: Si por alguna razón el punto no tiene ubicación, no lo renderizamos para evitar pantalla blanca
          if (!p || !p.location || typeof p.location.lat !== 'number') return null;

          const icon = (icons as any)[p.difficulty] ?? icons.other
          
          return (
            <Marker key={`user-${p.id || idx}`} position={[p.location.lat, p.location.lng]} icon={icon}>
              <Popup>
                  <div className="font-bold text-blue-800">{p.name}</div>
                  <div className="text-xs text-gray-500 mb-1">Ruta de Comunidad</div>
                  
                  <span className={`text-xs font-bold px-2 py-0.5 rounded text-white
                    ${p.difficulty === 'alta' ? 'bg-red-500' : p.difficulty === 'media' ? 'bg-yellow-500' : 'bg-green-500'}
                  `}>
                    {p.difficulty ? p.difficulty.toUpperCase() : 'INFO'}
                  </span>
                  
                  {p.description && <div className="text-sm mt-2 border-t pt-1">{p.description}</div>}
              </Popup>
            </Marker>
          )
        })}

        <CenterMap coords={focus} />
      </MapContainer>
    </div>
  )
}