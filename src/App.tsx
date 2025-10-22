import { useState } from 'react'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Rutas from './pages/Rutas'
import Alertas from './pages/Alertas'
import SOSModal from './components/SOSModal'

export default function App() {
  const [tab, setTab] = useState<'home'|'rutas'|'alertas'|'sos'>('home')
  const [sosOpen, setSosOpen] = useState(false)

  const openSOS = () => setSosOpen(true)

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-green-800 text-white text-center py-3 shadow-md">
        <h1 className="text-lg font-bold tracking-wide">SenderoSV</h1>
      </header>

      <main className="flex-1 overflow-hidden pb-16">
        {tab === 'home' && <Home onOpenSOS={openSOS} />}
        {tab === 'rutas' && <Rutas />}
        {tab === 'alertas' && <Alertas />}
        {tab === 'sos' && <div className="p-4">Pulsa el botón en Inicio o abre SOS aquí</div>}
      </main>

      <Navbar active={tab} onChange={(id) => id === 'sos' ? setSosOpen(true) : setTab(id as any)} />

      <SOSModal open={sosOpen} onClose={() => setSosOpen(false)} />
    </div>
  )
}
