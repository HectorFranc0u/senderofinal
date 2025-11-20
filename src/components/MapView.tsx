import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents, Polyline } from "react-leaflet"
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
  isSelectionMode?: boolean
  tempPath?: { lat: number; lng: number }[]
}

function ClickHandler({ onMapClick }: { onMapClick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) { onMapClick(e.latlng.lat, e.latlng.lng) },
  })
  return null
}

function CenterMap({ coords }: { coords: { lat: number; lng: number } | null }) {
  const map = useMap()
  useEffect(() => {
    if (coords) map.flyTo(coords, 14, { duration: 1.5 })
  }, [coords])
  return null
}

export default function MapView({ 
  routes = [], userPoints = [], focus = null, 
  onMapClick, isSelectionMode = false, tempPath = []
}: MapViewProps) {
  
  const icons = useMemo(() => ({
    baja: markerByDifficulty("baja"),
    media: markerByDifficulty("media"),
    alta: markerByDifficulty("alta"),
    other: markerByDifficulty("otra" as any),
  }), [])

  return (
    <div className={`h-[calc(100vh-120px)] w-full relative z-0 ${isSelectionMode ? 'cursor-crosshair' : ''}`}>
      <MapContainer center={[13.6929, -89.2182]} zoom={9} style={{ height: "100%", width: "100%" }}>
        <TileLayer attribution='&copy; OpenStreetMap' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        
        {onMapClick && <ClickHandler onMapClick={onMapClick} />}

        {/* 1. DIBUJO TEMPORAL (Línea azul mientras dibujas) */}
        {tempPath.length > 0 && (
          <>
            <Polyline positions={tempPath} pathOptions={{ color: 'blue', dashArray: '10, 10', weight: 4, opacity: 0.6 }} />
            {/* Muestra puntos intermedios mientras dibujas */}
            {tempPath.map((pos, i) => (
               <Marker key={`temp-${i}`} position={pos} icon={icons.other} opacity={0.7} />
            ))}
          </>
        )}

        {/* 2. RUTAS OFICIALES (Marcadores verdes/rojos) */}
        {routes.map((r) => {
          const icon = (icons as any)[r.difficulty] ?? icons.other
          return (
            <Marker key={`route-${r.id}`} position={[r.start.lat, r.start.lng]} icon={icon}>
              <Popup>
                <div className="font-bold">{r.name}</div>
                <div className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded inline-block mt-1">Oficial</div>
              </Popup>
            </Marker>
          )
        })}

        {/* 3. RUTAS DE USUARIO (Tu corrección está aquí) */}
        {userPoints.map((p, idx) => {
           // VALIDACIÓN: Si no hay camino, no intentamos renderizar nada
           if (!p || !p.path || p.path.length === 0) return null;

           // OBTENER EL INICIO: Tomamos la primera coordenada del array
           const startPoint = p.path[0];
           
           // Definir color según dificultad
           const color = p.difficulty === 'alta' ? 'red' : p.difficulty === 'media' ? 'orange' : 'green';
           const icon = (icons as any)[p.difficulty] ?? icons.other

           return (
             <div key={`user-group-${p.id || idx}`}>
                {/* A. La línea del camino (Ruta) */}
                <Polyline positions={p.path} pathOptions={{ color: color, weight: 5 }} />
                
                {/* B. El Marcador (Punto) - ¡AQUÍ ES DONDE FALLABA! */}
                {/* Usamos startPoint.lat y startPoint.lng explícitamente */}
                <Marker position={[startPoint.lat, startPoint.lng]} icon={icon}>
                    <Popup>
                        <div className="font-bold text-blue-800">{p.name}</div>
                        <div className="text-xs text-gray-500 mb-1">Ruta de Comunidad</div>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded text-white uppercase bg-${color}-500`}>
                            {p.difficulty}
                        </span>
                        {p.description && <div className="text-sm mt-2 border-t pt-1">{p.description}</div>}
                    </Popup>
                </Marker>
             </div>
            )
        })}
        <CenterMap coords={focus} />
      </MapContainer>
    </div>
  )
}