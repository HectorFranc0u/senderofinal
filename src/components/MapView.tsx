import { MapContainer, TileLayer, Marker, Popup, Tooltip, useMap, useMapEvents, Polyline } from "react-leaflet"
import "leaflet/dist/leaflet.css"
import { useEffect, useMemo, useState } from "react"
import { type UserPoint } from "../services/points"
import { type Alert } from "../services/alerts"
import { markerByDifficulty } from "../lib/markers"
import L, { type LatLngBoundsExpression } from "leaflet"

// --- CONFIGURACIÓN DE LÍMITES (EL SALVADOR) ---
const elSalvadorBounds: LatLngBoundsExpression = [
  [13.00, -90.50], 
  [14.60, -87.50]  
];

type MapViewProps = {
  userPoints?: UserPoint[]
  activeAlerts?: Alert[] 
  focus?: { lat: number; lng: number } | null
  onMapClick?: (lat: number, lng: number) => void
  isSelectionMode?: boolean
  tempPath?: { lat: number; lng: number }[]
  onEdit?: (point: UserPoint) => void
  onDelete?: (id: string) => void
}

// --- COMPONENTES INTERNOS DEL MAPA ---

// 1. Manejador de Clics en el mapa
function ClickHandler({ onMapClick }: { onMapClick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) { onMapClick(e.latlng.lat, e.latlng.lng) },
  })
  return null
}

// 2. Centrador automático (cuando seleccionas una ruta desde la lista)
function CenterMap({ coords }: { coords: { lat: number; lng: number } | null }) {
  const map = useMap()
  useEffect(() => {
    if (coords) map.flyTo(coords, 15, { duration: 1.5 })
  }, [coords])
  return null
}

// 3. NUEVO: Botón y Lógica de Geolocalización
function UserLocationControl() {
    const map = useMap()
    const [position, setPosition] = useState<{ lat: number, lng: number } | null>(null)
    const [loading, setLoading] = useState(false)

    // Icono del usuario (Punto Azul pulsante)
    const userIcon = L.divIcon({
        className: "user-location-marker",
        html: `
            <div class="relative flex h-4 w-4">
              <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span class="relative inline-flex rounded-full h-4 w-4 bg-blue-600 border-2 border-white shadow-md"></span>
            </div>
        `,
        iconSize: [16, 16],
        iconAnchor: [8, 8]
    })

    const locateUser = () => {
        setLoading(true)
        map.locate().on("locationfound", function (e) {
            setPosition(e.latlng)
            map.flyTo(e.latlng, 15) // Zoom al usuario
            setLoading(false)
        }).on("locationerror", function () {
            alert("No se pudo obtener tu ubicación. Revisa los permisos del GPS.")
            setLoading(false)
        })
    }

    // Intentar localizar al cargar por primera vez
    useEffect(() => {
        locateUser()
    }, []) // Se ejecuta solo al montar el componente

    return (
        <>
            {/* Marcador del Usuario */}
            {position && (
                <Marker position={position} icon={userIcon} zIndexOffset={1000}>
                    <Popup>Estás aquí</Popup>
                </Marker>
            )}

            {/* Botón Flotante de "Mi Ubicación" */}
            <div className="leaflet-bottom leaflet-right" style={{ bottom: '100px', right: '10px', pointerEvents: 'auto' }}>
                <button 
                    onClick={(e) => {
                        e.stopPropagation(); // Evita clics en el mapa
                        e.preventDefault();
                        locateUser();
                    }}
                    className="bg-white text-gray-700 p-3 rounded-full shadow-lg hover:bg-gray-50 active:bg-gray-100 transition-all border-2 border-gray-100 flex items-center justify-center"
                    title="Mi Ubicación"
                    style={{ width: '45px', height: '45px' }}
                >
                    {loading ? (
                        <span className="animate-spin h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full"></span>
                    ) : (
                        <span className="text-xl">📍</span>
                    )}
                </button>
            </div>
        </>
    )
}

// --- COMPONENTE PRINCIPAL ---

export default function MapView({ 
  userPoints = [], activeAlerts = [], focus = null, 
  onMapClick, isSelectionMode = false, tempPath = [],
  onEdit, onDelete
}: MapViewProps) {
  
  const icons = useMemo(() => ({
    baja: markerByDifficulty("baja"),
    media: markerByDifficulty("media"),
    alta: markerByDifficulty("alta"),
    other: markerByDifficulty("otra" as any),
  }), [])

  const alertIcon = useMemo(() => L.divIcon({
    html: '<div style="background:red; color:white; font-weight:bold; border-radius:50%; width:24px; height:24px; display:flex; justify-content:center; align-items:center; border:2px solid white; box-shadow:0 2px 4px rgba(0,0,0,0.3);">!</div>',
    className: '',
    iconSize: [24, 24],
    iconAnchor: [12, 40]
  }), [])

  return (
    <div className={`h-[calc(100vh-120px)] w-full relative z-0 ${isSelectionMode ? 'cursor-crosshair' : ''}`}>
      <MapContainer 
        center={[13.6929, -89.2182]} 
        zoom={9} 
        minZoom={8} 
        maxBounds={elSalvadorBounds} 
        maxBoundsViscosity={1.0} 
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer attribution='&copy; OpenStreetMap' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        
        {/* CONTROLES Y EVENTOS */}
        {onMapClick && <ClickHandler onMapClick={onMapClick} />}
        <CenterMap coords={focus} />
        
        {/* AQUI INSERTAMOS EL CONTROL DE UBICACIÓN */}
        <UserLocationControl />

        {/* DIBUJO TEMPORAL */}
        {tempPath.length > 0 && (
          <>
            <Polyline positions={tempPath} pathOptions={{ color: 'blue', dashArray: '10, 10', weight: 4, opacity: 0.6 }} />
            {tempPath.map((pos, i) => (
               <Marker key={`temp-${i}`} position={pos} icon={icons.other} opacity={0.7} />
            ))}
          </>
        )}

        {/* RUTAS GUARDADAS */}
        {userPoints.map((p, idx) => {
           if (!p || !p.path || p.path.length === 0) return null;

           const startPoint = p.path[0];
           const color = p.difficulty === 'alta' ? 'red' : p.difficulty === 'media' ? 'orange' : 'green';
           const icon = (icons as any)[p.difficulty] ?? icons.other

           const hasAlert = activeAlerts.some(alert => alert.routeId === p.id);
           const isOfficial = p.category === 'establecida';
           const labelColor = isOfficial ? 'text-green-800' : 'text-blue-800';
           const badgeText = isOfficial ? 'Oficial' : 'Comunidad';

           const DetailsContent = () => (
             <div className="text-center min-w-[160px]">
                <div className={`font-bold ${labelColor} text-lg leading-tight`}>{p.name}</div>
                
                {hasAlert && (
                    <div className="bg-red-100 text-red-700 text-[10px] font-bold px-2 py-1 rounded mt-1 border border-red-200">
                        ⚠️ Problemas reportados
                    </div>
                )}

                <div className="text-xs font-semibold text-gray-500 my-1">
                    📏 {p.lengthKm || 0} km
                </div>

                <div className="flex gap-2 justify-center mt-1">
                  <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded border border-gray-200 uppercase font-bold">
                     {badgeText}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded text-white uppercase bg-${color}-500`}>
                      {p.difficulty}
                  </span>
                </div>
                {p.description && <div className="text-xs text-gray-600 border-t mt-2 pt-1 text-left italic">"{p.description}"</div>}
             </div>
           );

           return (
             <div key={`point-${p.id || idx}`}>
                <Polyline positions={p.path} pathOptions={{ color: color, weight: 6, opacity: 0.8 }}>
                    <Tooltip sticky direction="top" opacity={1}>
                        <DetailsContent />
                    </Tooltip>
                </Polyline>
                
                <Marker position={[startPoint.lat, startPoint.lng]} icon={icon}>
                    <Tooltip direction="top" offset={[0, -35]} opacity={1} className="rounded-xl shadow-xl border-none">
                        <DetailsContent />
                    </Tooltip>

                    <Popup>
                        <div className="text-center min-w-[150px]">
                            <h3 className="font-bold text-gray-800 mb-2 text-lg">{p.name}</h3>
                            <div className="flex gap-2 justify-center pt-2 border-t mt-2">
                                <button 
                                    onClick={() => onEdit && onEdit(p)}
                                    className="flex-1 bg-blue-50 text-blue-600 text-xs font-bold py-2 px-3 rounded-lg border border-blue-200 hover:bg-blue-100 transition-colors"
                                >
                                    ✏️ Editar
                                </button>
                                <button 
                                    onClick={() => p.id && onDelete && onDelete(p.id)}
                                    className="flex-1 bg-red-50 text-red-600 text-xs font-bold py-2 px-3 rounded-lg border border-red-200 hover:bg-red-100 transition-colors"
                                >
                                    🗑️ Borrar
                                </button>
                            </div>
                        </div>
                    </Popup>
                </Marker>

                {hasAlert && (
                    <Marker position={[startPoint.lat, startPoint.lng]} icon={alertIcon} zIndexOffset={1000}>
                         <Tooltip direction="right" offset={[10, 0]} opacity={1}>
                            <div className="text-red-600 font-bold">⚠️ Atención</div>
                            <div className="text-xs">Alertas activas en esta ruta.</div>
                         </Tooltip>
                    </Marker>
                )}
             </div>
            )
        })}
        
      </MapContainer>
    </div>
  )
}