type NavbarProps = {
  active: "home" | "rutas" | "alertas" | "sos"
  onChange: (id: string) => void
}

export default function Navbar({ active, onChange }: NavbarProps) {
  const NavItem = ({ id, icon, label }: { id: string; icon: string; label: string }) => {
    const isActive = active === id
    return (
      <button
        onClick={() => onChange(id)}
        className={`flex flex-col items-center justify-center w-full py-2 transition-all duration-300 rounded-xl ${
          isActive 
            ? "text-white scale-110 bg-white/10 shadow-sm" 
            : "text-green-100 hover:text-white hover:bg-white/5"
        }`}
      >
        <span className="text-2xl mb-0.5 filter drop-shadow-md">{icon}</span>
        <span className={`text-[10px] font-medium tracking-wide ${isActive ? "font-bold opacity-100" : "opacity-80"}`}>
          {label}
        </span>
      </button>
    )
  }

  return (
    <nav className="fixed bottom-0 w-full z-50 pb-safe">
      {/* Contenedor con el degradado igual al Header */}
      <div className="bg-gradient-to-r from-emerald-800 to-green-600 rounded-t-2xl shadow-[0_-4px_20px_-5px_rgba(0,0,0,0.2)] border-t border-white/20 backdrop-blur-md">
        
        <div className="flex justify-around items-center max-w-md mx-auto py-2 px-2">
          <NavItem id="home" icon="🗺️" label="Mapa" />
          <NavItem id="rutas" icon="🥾" label="Rutas" />
          <NavItem id="alertas" icon="📢" label="Alertas" />
          <NavItem id="sos" icon="🚨" label="SOS" />
        </div>
        
      </div>
      
      {/* Relleno para móviles con 'safe area' (iPhone X+) */}
      <div className="h-safe bg-green-600"></div>
    </nav>
  )
}