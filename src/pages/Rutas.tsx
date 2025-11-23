import { type UserPoint } from "../services/points"

type Props = {
  onSelect: (coords: { lat: number; lng: number }) => void
  allPoints: UserPoint[] 
  onEdit: (point: UserPoint) => void
  onDelete: (id: string) => void
  onReport: (point: UserPoint) => void 
}

export default function Rutas({ onSelect, allPoints, onEdit, onDelete, onReport }: Props) {
  
  const establecidas = allPoints.filter(p => p.category === 'establecida')
  const comunitarias = allPoints.filter(p => p.category !== 'establecida')

  const RouteCard = ({ point, isOfficial }: { point: UserPoint, isOfficial: boolean }) => {
    const borderClass = isOfficial ? "border-emerald-500" : "border-blue-500"
    const badgeColor = isOfficial ? "bg-emerald-100 text-emerald-800" : "bg-blue-100 text-blue-800"
    const badgeText = isOfficial ? "Verificada" : "Usuario"

    return (
      <div
        onClick={() => point.path && point.path.length > 0 && onSelect(point.path[0])}
        // ESTILOS DE TARJETA FLOTANTE
        className={`
            relative group mb-4 p-5 rounded-2xl bg-white 
            border-l-[6px] ${borderClass} 
            shadow-sm hover:shadow-xl transition-all duration-300 ease-out 
            transform hover:-translate-y-1 active:scale-[0.98] cursor-pointer
        `}
      >
          <div className="flex justify-between items-start">
              <div>
                <h3 className="font-bold text-gray-800 text-lg leading-tight">{point.name}</h3>
                
                <div className="text-xs font-semibold text-gray-500 mt-1 flex items-center gap-1">
                    📏 <span>{point.lengthKm || 0} km</span>
                </div>

                <div className="flex gap-2 mt-2">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${badgeColor} border border-transparent`}>
                        {badgeText}
                    </span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full text-white font-bold uppercase shadow-sm
                        ${point.difficulty === 'alta' ? 'bg-red-500' : point.difficulty === 'media' ? 'bg-yellow-500' : 'bg-emerald-500'}
                    `}>
                        {point.difficulty}
                    </span>
                </div>
              </div>
          </div>
          
          <div className="text-sm text-gray-600 mt-3 line-clamp-2 leading-relaxed opacity-90">
            {point.description || "Sin descripción disponible."}
          </div>
          
          {/* BOTONES */}
          <div className="flex gap-2 mt-4 pt-3 border-t border-gray-100 justify-end">
              <button 
                  onClick={(e) => { e.stopPropagation(); onReport(point); }}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold text-orange-600 bg-orange-50 hover:bg-orange-100 transition-colors"
              >
                  ⚠️ Reportar
              </button>

              <button 
                  onClick={(e) => { e.stopPropagation(); onEdit(point); }}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 transition-colors"
              >
                  ✏️ Editar
              </button>
              
              <button 
                  onClick={(e) => { e.stopPropagation(); if(point.id) onDelete(point.id); }}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 transition-colors"
              >
                  🗑️
              </button>
          </div>
      </div>
    )
  }

  return (
    <div className="p-5 space-y-8 pb-28 bg-gray-50/50 min-h-full">
      
      {/* SECCIÓN 1 */}
      <div>
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-emerald-900">
          <span className="text-2xl filter drop-shadow-sm">🌲</span> Rutas Establecidas
        </h2>
        {establecidas.length === 0 && <p className="text-gray-400 text-sm italic ml-2">Cargando...</p>}
        <div>{establecidas.map(p => <RouteCard key={p.id} point={p} isOfficial={true} />)}</div>
      </div>

      {/* SECCIÓN 2 */}
      <div>
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-blue-900">
          <span className="text-2xl filter drop-shadow-sm">👥</span> Rutas de la Comunidad
        </h2>
        
        {comunitarias.length === 0 && (
           <div className="text-gray-500 text-sm p-8 border-2 border-dashed border-gray-300 rounded-2xl text-center bg-white">
             <p>Aún no hay rutas personalizadas.</p>
           </div>
        )}

        <div>{comunitarias.map(p => <RouteCard key={p.id} point={p} isOfficial={false} />)}</div>
      </div>

    </div>
  )
}