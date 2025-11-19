import { useEffect, useState } from "react"
import Navbar from "./components/Navbar"
import Rutas from "./pages/Rutas"
import Alertas from "./pages/Alertas"
import SOSModal from "./components/SOSModal"
import AddPointModal from "./components/AddPointModal"
import MapView from "./components/MapView"
import { fetchRoutes, type Trail } from "./services/api"
import { fetchUserPoints, saveUserPoint, type UserPoint } from "./services/points"

export default function App() {
  const [tab, setTab] = useState<"home" | "rutas" | "alertas" | "sos">("home")
  const [sosOpen, setSosOpen] = useState(false)
  
  // Datos
  const [routes, setRoutes] = useState<Trail[]>([])
  const [userPoints, setUserPoints] = useState<UserPoint[]>([])
  const [focus, setFocus] = useState<{ lat: number; lng: number } | null>(null)

  // Lógica de creación de rutas
  const [isSelectionMode, setIsSelectionMode] = useState(false) // Nuevo: Controla si estamos eligiendo lugar
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [tempCoords, setTempCoords] = useState<{ lat: number; lng: number } | null>(null)

  // Cargar datos
  useEffect(() => {
    fetchRoutes().then(setRoutes)
    fetchUserPoints().then(setUserPoints)
  }, [])

  // Enfocar ruta desde lista
  const handleSelectRoute = (coords: { lat: number; lng: number }) => {
    setFocus(coords)
    setTab("home")
  }

  // Activar modo selección (Botón +)
  const startAddingRoute = () => {
    setTab("home")
    setIsSelectionMode(true)
  }

  // 1. Clic en el mapa
  const handleMapClick = (lat: number, lng: number) => {
    if (isSelectionMode) {
      setTempCoords({ lat, lng })
      setIsSelectionMode(false) // Desactivar modo selección
      setIsModalOpen(true) // Abrir formulario
    }
  }

  // 2. Guardar formulario
  const handleSavePoint = async (data: { name: string; description: string; difficulty: string }) => {
    if (!tempCoords) return

    const newPoint: UserPoint = {
      name: data.name,
      description: data.description,
      difficulty: data.difficulty as any, // Ahora usamos difficulty
      location: tempCoords,
      type: 'ruta' // Internamente lo marcamos como ruta
    }

    const saved = await saveUserPoint(newPoint)
    
    if (saved) {
      setUserPoints(prev => [...prev, saved])
      setFocus(saved.location) // <--- CLAVE: Centrar mapa en el nuevo punto para verlo
    }
    
    setIsModalOpen(false)
    setTempCoords(null)
  }

  return (
    <div className="min-h-screen flex flex-col relative">
      <header className="bg-green-800 text-white text-center py-3 shadow-md z-10">
        <h1 className="text-lg font-bold tracking-wide">SenderoSV</h1>
      </header>

      <main className="flex-1 overflow-hidden pb-16 relative bg-gray-100">
        {/* Mensaje flotante cuando estamos eligiendo punto */}
        {isSelectionMode && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] bg-green-900/90 text-white px-4 py-2 rounded-full shadow-lg text-sm font-bold animate-bounce">
            📍 Toca el mapa para ubicar la ruta
          </div>
        )}

        {tab === "home" && (
          <MapView 
            routes={routes} 
            userPoints={userPoints} 
            focus={focus}
            onMapClick={handleMapClick}
            isSelectionMode={isSelectionMode} // Pasamos el estado al mapa para cambiar cursor
          />
        )}
        {tab === "rutas" && (
          <Rutas 
            onSelect={handleSelectRoute}
            officialRoutes={routes}      // Pasamos las rutas oficiales (estado 'routes' de App)
            userRoutes={userPoints}      // Pasamos las rutas creadas (estado 'userPoints' de App)
          />
        )}
        {tab === "alertas" && <Alertas />}
        {tab === "sos" && <div className="p-4 text-center mt-10 text-gray-500">Pulsa SOS abajo en caso de emergencia</div>}
        
        {/* Botón Flotante para Agregar (Solo visible en Home) */}
        {tab === "home" && !isSelectionMode && (
          <button 
            onClick={startAddingRoute}
            className="absolute bottom-20 right-4 z-[900] w-14 h-14 bg-green-600 hover:bg-green-700 text-white rounded-full shadow-lg flex items-center justify-center text-3xl shadow-green-600/40 transition-transform hover:scale-110 active:scale-95"
            title="Agregar nueva ruta"
          >
            +
          </button>
        )}

        {tab === "home" && isSelectionMode && (
           <button 
           onClick={() => setIsSelectionMode(false)}
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
        onClose={() => setIsModalOpen(false)} 
        onSave={handleSavePoint} 
      />
    </div>
  )
}