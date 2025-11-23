import { useState, useEffect } from "react"

type AddPointModalProps = {
  isOpen: boolean
  onClose: () => void
  onSave: (data: { name: string; description: string; difficulty: string; category: string }) => void
  initialData?: { name: string; description: string; difficulty: string; category: string } | null
}

export default function AddPointModal({ isOpen, onClose, onSave, initialData }: AddPointModalProps) {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [difficulty, setDifficulty] = useState("baja")
  const [category, setCategory] = useState("personalizada") // Default

  useEffect(() => {
    if (isOpen && initialData) {
      setName(initialData.name)
      setDescription(initialData.description || "")
      setDifficulty(initialData.difficulty || "baja")
      setCategory(initialData.category || "personalizada")
    } else if (isOpen && !initialData) {
      setName("")
      setDescription("")
      setDifficulty("baja")
      setCategory("personalizada")
    }
  }, [isOpen, initialData])

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name) return
    onSave({ name, description, difficulty, category })
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6">
        <h2 className="text-xl font-bold mb-4 text-gray-800">
            {initialData ? 'Editar Ruta' : 'Guardar Ruta'}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Nombre</label>
            <input 
              className="w-full border border-gray-300 rounded-lg p-2.5"
              value={name} onChange={e => setName(e.target.value)} required autoFocus
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Dificultad</label>
                <select 
                  className="w-full border border-gray-300 rounded-lg p-2.5 bg-white"
                  value={difficulty} onChange={e => setDifficulty(e.target.value)}
                >
                  <option value="baja">🟢 Baja</option>
                  <option value="media">🟡 Media</option>
                  <option value="alta">🔴 Alta</option>
                </select>
            </div>
            <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Categoría</label>
                <select 
                  className="w-full border border-gray-300 rounded-lg p-2.5 bg-white"
                  value={category} onChange={e => setCategory(e.target.value)}
                >
                  <option value="personalizada">👤 Personal</option>
                  <option value="establecida">🏆 Establecida</option>
                </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Descripción</label>
            <textarea 
              className="w-full border border-gray-300 rounded-lg p-2.5 resize-none" rows={3}
              value={description} onChange={e => setDescription(e.target.value)}
            ></textarea>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2 border rounded-lg hover:bg-gray-50">Cancelar</button>
            <button type="submit" className="flex-1 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-bold">Guardar</button>
          </div>
        </form>
      </div>
    </div>
  )
}