import { useState } from "react"

type AddPointModalProps = {
  isOpen: boolean
  onClose: () => void
  onSave: (data: { name: string; description: string; difficulty: string }) => void
}

export default function AddPointModal({ isOpen, onClose, onSave }: AddPointModalProps) {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [difficulty, setDifficulty] = useState("baja")

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault() // <--- ¡ESTA LÍNEA ES VITAL! Evita que la página se recargue.
    
    if (!name) return
    
    // Aseguramos que difficulty tenga un valor por defecto si está vacío
    onSave({ name, description, difficulty: difficulty || 'baja' })
    
    // Limpiar y cerrar...
    setName("")
    setDescription("")
    setDifficulty("baja")
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6 animate-in fade-in zoom-in duration-200">
        <h2 className="text-xl font-bold mb-1 text-gray-800">Nueva Ruta</h2>
        <p className="text-sm text-gray-500 mb-4">Comparte un sendero que conozcas.</p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Nombre de la Ruta</label>
            <input 
              type="text" 
              className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all"
              placeholder="Ej: Sendero Las Nubes"
              value={name}
              onChange={e => setName(e.target.value)}
              autoFocus
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Dificultad</label>
            <select 
              className="w-full border border-gray-300 rounded-lg p-2.5 bg-white focus:ring-2 focus:ring-green-500 outline-none"
              value={difficulty}
              onChange={e => setDifficulty(e.target.value)}
            >
              <option value="baja">🟢 Baja (Fácil)</option>
              <option value="media">🟡 Media (Moderada)</option>
              <option value="alta">🔴 Alta (Difícil)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Descripción</label>
            <textarea 
              className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-green-500 outline-none transition-all resize-none"
              rows={3}
              placeholder="Detalles sobre el camino..."
              value={description}
              onChange={e => setDescription(e.target.value)}
            ></textarea>
          </div>

          <div className="flex gap-3 pt-2">
            <button 
              type="button" 
              onClick={onClose}
              className="flex-1 py-2.5 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-colors"
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              className="flex-1 py-2.5 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 font-bold shadow-lg shadow-green-600/20 transition-all active:scale-95"
            >
              Guardar Ruta
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}