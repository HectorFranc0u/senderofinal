import { type Trail } from "../services/api"
import { type UserPoint } from "../services/points"

type Props = {
  onSelect: (coords: { lat: number; lng: number }) => void
  // Ahora recibimos los datos desde el padre (App.tsx)
  officialRoutes?: Trail[]
  userRoutes?: UserPoint[]
}

export default function Rutas({ onSelect, officialRoutes = [], userRoutes = [] }: Props) {
  return (
    <div className="p-4 space-y-6 pb-24 bg-gray-50 min-h-full">
      
      {/* SECCIÓN 1: Rutas Oficiales */}
      <div>
        <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
          <span className="bg-green-600 w-3 h-3 rounded-full"></span>
          Rutas Verificadas
        </h2>
        <div className="space-y-3">
          {officialRoutes.length === 0 && <p className="text-gray-400 text-sm italic">Cargando rutas oficiales...</p>}
          
          {officialRoutes.map((r) => (
            <div
              key={r.id}
              onClick={() => onSelect(r.start)}
              className="bg-white border-l-4 border-green-500 rounded-lg p-3 shadow-sm cursor-pointer hover:shadow-md transition-all active:scale-[0.98]"
            >
              <div className="font-bold text-gray-800">{r.name}</div>
              <div className="text-sm text-gray-600 mt-1">
                Dificultad: <span className="font-medium capitalize">{r.difficulty}</span> • {r.lengthKm} km
              </div>
              <div className="text-xs text-gray-400 mt-1 font-mono">
                {r.start.lat.toFixed(4)}, {r.start.lng.toFixed(4)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SECCIÓN 2: Rutas de la Comunidad (Tus nuevos puntos) */}
      <div>
        <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
          <span className="bg-blue-600 w-3 h-3 rounded-full"></span>
          Comunidad
        </h2>
        
        <div className="space-y-3">
          {userRoutes.length === 0 && (
            <div className="text-gray-500 text-sm p-4 border border-dashed border-gray-300 rounded-lg text-center bg-white/50">
              No has agregado rutas todavía. <br/>
              <span className="text-xs">Ve al mapa y pulsa (+) para crear una.</span>
            </div>
          )}

          {userRoutes.map((u, idx) => (
            <div
              key={u.id || idx}
              onClick={() => onSelect(u.location)}
              className="bg-white border-l-4 border-blue-500 rounded-lg p-3 shadow-sm cursor-pointer hover:shadow-md transition-all active:scale-[0.98]"
            >
              <div className="flex justify-between items-start">
                <div className="font-bold text-gray-800">{u.name}</div>
                <span className={`text-[10px] px-2 py-0.5 rounded text-white font-bold uppercase tracking-wider
                  ${u.difficulty === 'alta' ? 'bg-red-500' : u.difficulty === 'media' ? 'bg-yellow-500' : 'bg-green-500'}
                `}>
                  {u.difficulty}
                </span>
              </div>
              
              {u.description && (
                <div className="text-sm text-gray-600 mt-1 line-clamp-2 italic">
                  "{u.description}"
                </div>
              )}
              
              <div className="text-xs text-blue-400 mt-2 font-medium">
                Agregado por ti
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}