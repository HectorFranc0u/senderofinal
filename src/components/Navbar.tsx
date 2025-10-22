type Props = {
  active: string
  onChange: (id: string) => void
}

export default function Navbar({ active, onChange }: Props) {
  const items = [
    { id: 'home', label: 'Inicio' },
    { id: 'rutas', label: 'Rutas' },
    { id: 'alertas', label: 'Alertas' },
    { id: 'sos', label: 'SOS' },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-green-900 text-white flex justify-around py-3 rounded-t-2xl shadow-lg">
      {items.map((it) => (
        <button
          key={it.id}
          onClick={() => onChange(it.id)}
          className={`flex flex-col items-center text-sm transition ${
            active === it.id ? 'text-lime-400' : 'text-gray-300'
          }`}
        >
          <span>{it.label}</span>
        </button>
      ))}
    </nav>
  )
}
