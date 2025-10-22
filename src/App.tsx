import { useEffect, useState } from "react"
import Navbar from "./components/Navbar"
import Home from "./pages/Home"
import Rutas from "./pages/Rutas"
import Alertas from "./pages/Alertas"
import SOSModal from "./components/SOSModal"
import { fetchRoutes, type Trail } from "./services/api"
import MapView from "./components/MapView"

export default function App() {
  const [tab, setTab] = useState<"home" | "rutas" | "alertas" | "sos">("home")
  const [sosOpen, setSosOpen] = useState(false)
  const [routes, setRoutes] = useState<Trail[]>([])
  const [focus, setFocus] = useState<{ lat: number; lng: number } | null>(null)

  // Cargar rutas al inicio
  useEffect(() => {
    fetchRoutes().then(setRoutes)
  }, [])

  const openSOS = () => setSosOpen(true)
  const handleSelectRoute = (coords: { lat: number; lng: number }) => {
    setFocus(coords)
    setTab("home") // vuelve al mapa automáticamente
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-green-800 text-white text-center py-3 shadow-md">
        <h1 className="text-lg font-bold tracking-wide">SenderoSV</h1>
      </header>

      <main className="flex-1 overflow-hidden pb-16">
        {tab === "home" && <MapView routes={routes} focus={focus} />}
        {tab === "rutas" && <Rutas onSelect={handleSelectRoute} />}
        {tab === "alertas" && <Alertas />}
        {tab === "sos" && <div className="p-4">Pulsa el botón SOS para enviar emergencia</div>}
      </main>

      <Navbar
        active={tab}
        onChange={(id) => (id === "sos" ? setSosOpen(true) : setTab(id as any))}
      />

      <SOSModal open={sosOpen} onClose={() => setSosOpen(false)} />
    </div>
  )
}
