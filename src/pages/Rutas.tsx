import { type Trail } from "../services/api"
import { type UserPoint } from "../services/points"

type Props = {
  onSelect: (coords: { lat: number; lng: number }) => void
  officialRoutes?: Trail[]
  userRoutes?: UserPoint[]
  onEdit: (point: UserPoint) => void
  onDelete: (id: string) => void
}

export default function Rutas({ onSelect, officialRoutes = [], userRoutes = [], onEdit, onDelete }: Props) {
  return (
    <div className="p-4 space-y-6 pb-24 bg-gray-50 min-h-full">
      
      {/* OFICIALES */}
      <div>
        <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
          <span className="bg-green-600 w-3 h-3 rounded-full"></span>
          Rutas Verificadas
        </h2>
        <div className="space-y-3">
          {officialRoutes.map((r) => (
            <div
              key={r.id}
              onClick={() => onSelect(r.start)}
              className="bg-white border-l-4 border-green-500 rounded-lg p-3 shadow-sm cursor-pointer hover:shadow-md transition-all"
            >
              <div className="font-bold text-gray-800">{r.name}</div>
              <div className="text-sm text-gray-600 mt-1">
                Dificultad: <span className="font-medium capitalize">{r.difficulty}</span> • {r.lengthKm} km
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* COMUNIDAD */}
      <div>
        <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
          <span className="bg-blue-600 w-3 h-3 rounded-full"></span>
          Mis Rutas / Comunidad
        </h2>
        
        <div className="space-y-3">
          {userRoutes.map((u, idx) => (
            <div
              key={u.id || idx}
              // AQUÍ ESTÁ EL CAMBIO: Usamos u.path[0]
              onClick={() => u.path && u.path.length > 0 && onSelect(u.path[0])}
              className="bg-white border-l-4 border-blue-500 rounded-lg p-3 shadow-sm cursor-pointer hover:shadow-md transition-all relative group"
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

              {/* BOTONES ACCIÓN */}
              <div className="flex gap-3 mt-3 border-t pt-2 justify-end">
                <button 
                    onClick={(e) => { e.stopPropagation(); onEdit(u); }}
                    className="text-xs font-bold text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded border border-blue-200"
                >
                    ✏️ Editar
                </button>
                <button 
                    onClick={(e) => { e.stopPropagation(); if (u.id) onDelete(u.id); }}
                    className="text-xs font-bold text-red-600 hover:bg-red-50 px-3 py-1.5 rounded border border-red-200"
                >
                    🗑️ Borrar
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}