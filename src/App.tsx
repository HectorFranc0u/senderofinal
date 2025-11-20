import { useEffect, useState } from "react"
import Navbar from "./components/Navbar"
import Rutas from "./pages/Rutas"
import Alertas from "./pages/Alertas"
import SOSModal from "./components/SOSModal"
import AddPointModal from "./components/AddPointModal"
import MapView from "./components/MapView"
import { fetchRoutes, type Trail } from "./services/api"
import { 
  fetchUserPoints, 
  saveUserPoint, 
  deletePointApi, 
  updatePointApi, 
  type UserPoint 
} from "./services/points"
import { getHikingRoute } from "./services/ors" // Importamos el servicio de mapas

// Definición de tipos fuera de la función
type PointFormData = {
  name: string;
  description: string;
  difficulty: string;
}

export default function App() {
  const [tab, setTab] = useState<"home" | "rutas" | "alertas" | "sos">("home")
  const [sosOpen, setSosOpen] = useState(false)
  
  // Datos
  const [routes, setRoutes] = useState<Trail[]>([])
  const [userPoints, setUserPoints] = useState<UserPoint[]>([])
  const [focus, setFocus] = useState<{ lat: number; lng: number } | null>(null)

  // Estados de Interfaz y Dibujo
  const [isSelectionMode, setIsSelectionMode] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingPoint, setEditingPoint] = useState<UserPoint | null>(null)
  const [isLoadingRoute, setIsLoadingRoute] = useState(false) // Cargando API

  // ARRAY DE DIBUJO: Aquí acumulamos los clics del usuario
  const [tempPath, setTempPath] = useState<{ lat: number; lng: number }[]>([]) 

  const loadData = async () => {
    const [r, u] = await Promise.all([fetchRoutes(), fetchUserPoints()])
    setRoutes(r)
    setUserPoints(u)
  }

  useEffect(() => { loadData() }, [])

  const handleSelectRoute = (coords: { lat: number; lng: number }) => {
    setFocus(coords)
    setTab("home")
  }

  // --- LÓGICA DE DIBUJO EN MAPA ---

  const startAddingRoute = () => {
    setTab("home")
    setIsSelectionMode(true)
    setTempPath([]) // Limpiamos cualquier dibujo previo
  }

  const handleMapClick = (lat: number, lng: number) => {
    if (isSelectionMode) {
      // Agregamos puntos al array temporal
      setTempPath(prev => [...prev, { lat, lng }])
    }
  }

  // Función que se llama al pulsar "Terminar y Calcular"
  const finishDrawing = async () => {
      if (tempPath.length < 2) {
          alert("Debes marcar al menos 2 puntos (Inicio y Fin).");
          return;
      }

      setIsLoadingRoute(true) 

      // 1. Intentamos obtener la ruta real de OpenRouteService
      const calculatedPath = await getHikingRoute(tempPath)
      
      setIsLoadingRoute(false)

      if (calculatedPath) {
          // ÉXITO: Reemplazamos los clics rectos por la curva real
          setTempPath(calculatedPath)
          setIsSelectionMode(false)
          setEditingPoint(null)
          setIsModalOpen(true)
      } else {
          // FALLO: Preguntamos si quiere guardar la línea recta
          if(confirm("No se pudo calcular el sendero automático (Revisa tu API Key). ¿Guardar como línea recta manual?")) {
             setIsSelectionMode(false)
             setEditingPoint(null)
             setIsModalOpen(true)
          }
      }
  }

  // --- GUARDADO ---

  const handleSavePoint = async (data: PointFormData) => {
    // A. EDITAR
    if (editingPoint && editingPoint.id) {
        const updatedData = { ...editingPoint, ...data } as UserPoint
        const result = await updatePointApi(updatedData)
        if (result) loadData()
    } 
    // B. CREAR NUEVO (Usamos tempPath)
    else if (tempPath.length > 0) {
        const newPoint: UserPoint = {
            name: data.name,
            description: data.description,
            difficulty: data.difficulty as any,
            path: tempPath, // Guardamos TODO el camino generado
        }
        const saved = await saveUserPoint(newPoint)
        
        if (saved) {
            setUserPoints(prev => [...prev, saved])
            setFocus(saved.path[0])
        }
    }

    setIsModalOpen(false)
    setTempPath([])
    setEditingPoint(null)
  }

  const handleEditRequest = (point: UserPoint) => {
      setEditingPoint(point)
      setIsModalOpen(true)
  }

  const handleDeleteRequest = async (id: string) => {
      if(!window.confirm("¿Eliminar ruta?")) return;
      const success = await deletePointApi(id)
      if (success) loadData() 
  }

  return (
    <div className="min-h-screen flex flex-col relative">
      <header className="bg-green-800 text-white text-center py-3 shadow-md z-10">
        <h1 className="text-lg font-bold tracking-wide">SenderoSV</h1>
      </header>

      <main className="flex-1 overflow-hidden pb-16 relative bg-gray-100">
        
        {/* INTERFAZ FLOTANTE DE DIBUJO */}
        {isSelectionMode && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] flex flex-col items-center gap-2 animate-in fade-in slide-in-from-top-4 w-full px-4">
            <div className="bg-green-900/95 text-white px-4 py-2 rounded-full shadow-lg text-sm font-bold text-center backdrop-blur-sm">
              📍 Marca Inicio y Fin ({tempPath.length} pts)
            </div>
            
            {tempPath.length >= 2 && (
                <button 
                    onClick={finishDrawing}
                    disabled={isLoadingRoute}
                    className={`px-6 py-2 rounded-full shadow-xl font-bold text-sm text-white transition-all active:scale-95 border-2 border-white/20
                        ${isLoadingRoute ? 'bg-gray-600 cursor-wait' : 'bg-yellow-500 hover:bg-yellow-600'}
                    `}
                >
                    {isLoadingRoute ? '🔄 Conectando satélite...' : '✨ Calcular Ruta'}
                </button>
            )}
          </div>
        )}

        {tab === "home" && (
          <MapView 
            routes={routes} 
            userPoints={userPoints} 
            focus={focus}
            onMapClick={handleMapClick}
            isSelectionMode={isSelectionMode}
            tempPath={tempPath}
          />
        )}

        {tab === "rutas" && (
          <Rutas 
            onSelect={handleSelectRoute} 
            officialRoutes={routes} 
            userRoutes={userPoints}
            onEdit={handleEditRequest}
            onDelete={handleDeleteRequest}
          />
        )}

        {tab === "alertas" && <Alertas />}
        {tab === "sos" && <div className="p-4 text-center mt-10 text-gray-500">Pulsa SOS abajo en caso de emergencia</div>}
        
        {/* Botón Flotante (+) */}
        {tab === "home" && !isSelectionMode && (
          <button 
            onClick={startAddingRoute}
            className="absolute bottom-20 right-4 z-[900] w-14 h-14 bg-green-600 hover:bg-green-700 text-white rounded-full shadow-lg flex items-center justify-center text-3xl shadow-green-600/40 transition-transform hover:scale-110 active:scale-95"
          >
            +
          </button>
        )}

        {/* Botón Cancelar */}
        {tab === "home" && isSelectionMode && !isLoadingRoute && (
           <button 
           onClick={() => { setIsSelectionMode(false); setTempPath([]); }}
           className="absolute bottom-20 right-4 z-[900] px-4 h-12 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-lg font-bold shadow-red-500/30"
         >
           Cancelar
         </button>
        )}
      </main>

      <Navbar
        active={tab}
        onChange={(id) => (id === "sos" ? setSosOpen(true) : setTab(id as any))}
      />

      <SOSModal open={sosOpen} onClose={() => setSosOpen(false)} />
      
      <AddPointModal 
        isOpen={isModalOpen} 
        onClose={() => { setIsModalOpen(false); setEditingPoint(null); setTempPath([]); }} 
        onSave={handleSavePoint}
        initialData={editingPoint ? { 
            name: editingPoint.name, 
            description: editingPoint.description, 
            difficulty: editingPoint.difficulty 
        } : null}
      />
    </div>
  )
}