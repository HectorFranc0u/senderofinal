import { useEffect, useState } from "react"
import Navbar from "./components/Navbar"
import Rutas from "./pages/Rutas"
import Alertas from "./pages/Alertas"
import SOSModal from "./components/SOSModal"
import AddPointModal from "./components/AddPointModal"
import ReportModal from "./components/ReportModal"
import MapView from "./components/MapView"

import { 
  fetchPoints, saveUserPoint, deletePointApi, updatePointApi, type UserPoint 
} from "./services/points"
import { getHikingRoute } from "./services/ors"
import { reportAlert, fetchAlerts, type Alert } from "./services/alerts"

function calculateTotalDistance(path: { lat: number; lng: number }[]) {
    if (path.length < 2) return 0;
    const R = 6371; 
    let totalKm = 0;
    for (let i = 0; i < path.length - 1; i++) {
        const p1 = path[i];
        const p2 = path[i + 1];
        const dLat = (p2.lat - p1.lat) * (Math.PI / 180);
        const dLng = (p2.lng - p1.lng) * (Math.PI / 180);
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(p1.lat * (Math.PI / 180)) * Math.cos(p2.lat * (Math.PI / 180)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        totalKm += R * c;
    }
    return parseFloat(totalKm.toFixed(2));
}

type PointFormData = {
  name: string; description: string; difficulty: string; category: string;
}

export default function App() {
  const [tab, setTab] = useState<"home" | "rutas" | "alertas" | "sos">("home")
  const [sosOpen, setSosOpen] = useState(false)
  
  const [allPoints, setAllPoints] = useState<UserPoint[]>([])
  const [activeAlerts, setActiveAlerts] = useState<Alert[]>([]) 
  const [focus, setFocus] = useState<{ lat: number; lng: number } | null>(null)

  const [isSelectionMode, setIsSelectionMode] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingPoint, setEditingPoint] = useState<UserPoint | null>(null)
  const [isLoadingRoute, setIsLoadingRoute] = useState(false)
  const [tempPath, setTempPath] = useState<{ lat: number; lng: number }[]>([]) 
  const [tempDistance, setTempDistance] = useState<number>(0)

  const [isReportModalOpen, setIsReportModalOpen] = useState(false)
  const [reportRoute, setReportRoute] = useState<UserPoint | null>(null)

  const loadData = async () => {
    const [pointsData, alertsData] = await Promise.all([
      fetchPoints(),
      fetchAlerts()
    ])
    setAllPoints(pointsData)
    setActiveAlerts(alertsData)
  }

  useEffect(() => { loadData() }, [])

  const handleSelectRoute = (coords: { lat: number; lng: number }) => {
    setFocus(coords)
    setTab("home")
  }

  const startAddingRoute = () => {
    setTab("home")
    setIsSelectionMode(true)
    setTempPath([])
    setTempDistance(0)
  }

  const handleMapClick = (lat: number, lng: number) => {
    if (isSelectionMode) setTempPath(prev => [...prev, { lat, lng }])
  }

  const finishDrawing = async () => {
      if (tempPath.length < 2) { alert("Marca al menos 2 puntos"); return; }
      setIsLoadingRoute(true) 
      const result = await getHikingRoute(tempPath)
      setIsLoadingRoute(false)

      if (result) {
          setTempPath(result.path)
          setTempDistance(result.distance)
          setIsSelectionMode(false)
          setEditingPoint(null)
          setIsModalOpen(true)
      } else {
          if(confirm("No se pudo conectar con el satélite. ¿Guardar línea recta?")) {
             const manualDist = calculateTotalDistance(tempPath)
             setTempDistance(manualDist)
             setIsSelectionMode(false)
             setEditingPoint(null)
             setIsModalOpen(true)
          }
      }
  }

  const handleSavePoint = async (data: PointFormData) => {
    if (editingPoint && editingPoint.id) {
        const updatedData = { ...editingPoint, ...data } as UserPoint
        const result = await updatePointApi(updatedData)
        if (result) loadData()
    } 
    else if (tempPath.length > 0) {
        const newPoint: UserPoint = {
            name: data.name,
            description: data.description,
            difficulty: data.difficulty as any,
            category: data.category as any,
            path: tempPath,
            lengthKm: tempDistance, 
        }
        const saved = await saveUserPoint(newPoint)
        if (saved) {
            setAllPoints(prev => [...prev, saved])
            setFocus(saved.path ? saved.path[0] : null)
        }
    }
    setIsModalOpen(false)
    setTempPath([])
    setTempDistance(0)
    setEditingPoint(null)
  }

  const handleEditRequest = (point: UserPoint) => { setEditingPoint(point); setIsModalOpen(true) }
  const handleDeleteRequest = async (id: string) => { if(confirm("¿Borrar?")) { await deletePointApi(id); loadData() } }

  const handleReportRequest = (point: UserPoint) => {
      setReportRoute(point)
      setIsReportModalOpen(true)
  }

  const handleSendReport = async (data: { type: string, description: string, level: string }) => {
      if (!reportRoute || !reportRoute.id) return
      const success = await reportAlert({
          routeId: reportRoute.id,
          routeName: reportRoute.name,
          type: data.type as any,
          description: data.description,
          level: data.level as any
      })
      if (success) {
          alert("Reporte enviado.")
          setIsReportModalOpen(false)
          setReportRoute(null)
          loadData() 
      } else {
          alert("Error al enviar reporte.")
      }
  }

  return (
    <div className="min-h-screen flex flex-col relative bg-gray-100 font-sans text-gray-900">
      
      {/* HEADER CON DEGRADADO */}
      <header className="bg-gradient-to-r from-emerald-800 to-green-600 text-white text-center py-4 shadow-lg z-20 rounded-b-2xl relative">
        <h1 className="text-xl font-bold tracking-wide drop-shadow-md">SenderoSV 🇸🇻</h1>
        <div className="absolute top-0 left-0 w-full h-full bg-white/10 rounded-b-2xl pointer-events-none"></div>
      </header>

      <main className="flex-1 overflow-hidden pb-20 relative">
        
        {/* UI DIBUJO ELEGANTE */}
        {isSelectionMode && (
          <div className="absolute top-6 left-1/2 -translate-x-1/2 z-[1000] w-11/12 max-w-sm flex flex-col items-center gap-3 animate-in fade-in slide-in-from-top-4">
            
            <div className="bg-white/95 backdrop-blur text-gray-800 px-6 py-3 rounded-2xl shadow-xl border border-white/20 flex flex-col items-center w-full">
               <span className="text-xs font-bold text-green-600 uppercase tracking-wider mb-1">Modo Creador</span>
               <div className="font-bold text-lg">📍 Puntos marcados: {tempPath.length}</div>
               <p className="text-xs text-gray-400 text-center mt-1">Toca el mapa para trazar el camino</p>
            </div>
            
            {tempPath.length >= 2 && (
                <button 
                    onClick={finishDrawing}
                    disabled={isLoadingRoute}
                    className="w-full py-3 rounded-xl shadow-lg font-bold text-white bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 transition-all active:scale-95 flex justify-center items-center gap-2"
                >
                    {isLoadingRoute ? (
                      <>🔄 <span className="animate-pulse">Calculando...</span></>
                    ) : (
                      <>✨ Terminar y Guardar</>
                    )}
                </button>
            )}
          </div>
        )}

        {tab === "home" && (
          <MapView 
            userPoints={allPoints} 
            activeAlerts={activeAlerts} 
            focus={focus}
            onMapClick={handleMapClick}
            isSelectionMode={isSelectionMode}
            tempPath={tempPath}
            onEdit={handleEditRequest}
            onDelete={handleDeleteRequest}
          />
        )}

        {tab === "rutas" && (
          <Rutas 
            onSelect={handleSelectRoute} 
            allPoints={allPoints}
            onEdit={handleEditRequest}
            onDelete={handleDeleteRequest}
            onReport={handleReportRequest}
          />
        )}

        {tab === "alertas" && <Alertas />}
        
        {tab === "sos" && (
            <div className="flex flex-col items-center justify-center h-full p-6 text-center">
                <div className="bg-red-50 p-6 rounded-3xl mb-4">
                    <div className="text-6xl mb-4">🚨</div>
                    <h2 className="text-xl font-bold text-red-800 mb-2">Centro de Emergencia</h2>
                    <p className="text-gray-600">Pulsa el botón rojo de abajo solo en caso de emergencia real.</p>
                </div>
            </div>
        )}
        
        {/* BOTÓN FLOTANTE (+) MODERNO */}
        {tab === "home" && !isSelectionMode && (
          <button 
            onClick={startAddingRoute}
            className="absolute bottom-24 right-5 z-[900] w-16 h-16 bg-gradient-to-tr from-green-600 to-emerald-400 text-white rounded-full shadow-2xl flex items-center justify-center text-4xl hover:scale-110 active:scale-90 transition-transform duration-300 ring-4 ring-white/30"
          >
            +
          </button>
        )}

        {/* BOTÓN CANCELAR */}
        {tab === "home" && isSelectionMode && !isLoadingRoute && (
           <button 
             onClick={() => { setIsSelectionMode(false); setTempPath([]); }}
             className="absolute bottom-24 right-5 z-[900] px-6 h-12 bg-white text-red-500 border border-red-100 rounded-full shadow-lg font-bold flex items-center gap-2 hover:bg-red-50"
           >
             ✖ Cancelar
           </button>
        )}
      </main>

      <Navbar active={tab} onChange={(id) => (id === "sos" ? setSosOpen(true) : setTab(id as any))} />
      
      <SOSModal open={sosOpen} onClose={() => setSosOpen(false)} />
      
      <AddPointModal 
        isOpen={isModalOpen} 
        onClose={() => { setIsModalOpen(false); setEditingPoint(null); setTempPath([]); }} 
        onSave={handleSavePoint}
        initialData={editingPoint ? { 
            name: editingPoint.name, 
            description: editingPoint.description, 
            difficulty: editingPoint.difficulty,
            category: editingPoint.category 
        } : null}
      />

      <ReportModal 
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        route={reportRoute}
        onReport={handleSendReport}
      />
    </div>
  )
}