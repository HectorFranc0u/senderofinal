import { useState, useEffect } from "react"

type AddPointModalProps = {
  isOpen: boolean
  onClose: () => void
  onSave: (data: { name: string; description: string; difficulty: string }) => void
  initialData?: { name: string; description: string; difficulty: string } | null
}

export default function AddPointModal({ isOpen, onClose, onSave, initialData }: AddPointModalProps) {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [difficulty, setDifficulty] = useState("baja")

  // Rellenar formulario si hay datos iniciales (Modo Edición)
  useEffect(() => {
    if (isOpen && initialData) {
      setName(initialData.name)
      setDescription(initialData.description || "")
      setDifficulty(initialData.difficulty || "baja")
    } else if (isOpen && !initialData) {
      // Limpiar formulario (Modo Creación)
      setName("")
      setDescription("")
      setDifficulty("baja")
    }
  }, [isOpen, initialData])

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault() // Evita recarga de página
    if (!name) return
    onSave({ name, description, difficulty })
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6">
        <h2 className="text-xl font-bold mb-1 text-gray-800">
            {initialData ? 'Editar Ruta' : 'Nueva Ruta'}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Nombre</label>
            <input 
              type="text" 
              className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-green-500 outline-none"
              value={name}
              onChange={e => setName(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Dificultad</label>
            <select 
              className="w-full border border-gray-300 rounded-lg p-2.5 bg-white"
              value={difficulty}
              onChange={e => setDifficulty(e.target.value)}
            >
              <option value="baja">🟢 Baja</option>
              <option value="media">🟡 Media</option>
              <option value="alta">🔴 Alta</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Descripción</label>
            <textarea 
              className="w-full border border-gray-300 rounded-lg p-2.5 outline-none resize-none"
              rows={3}
              value={description}
              onChange={e => setDescription(e.target.value)}
            ></textarea>
          </div>

          <div className="flex gap-3 pt-2">
            <button 
              type="button" 
              onClick={onClose}
              className="flex-1 py-2 px-4 border rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              className="flex-1 py-2 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 font-bold"
            >
              {initialData ? 'Actualizar' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}