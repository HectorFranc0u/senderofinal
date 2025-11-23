import { useState } from "react"
import { type UserPoint } from "../services/points"

type Props = {
    isOpen: boolean
    onClose: () => void
    route: UserPoint | null
    onReport: (data: { type: string, description: string, level: string }) => void
}

export default function ReportModal({ isOpen, onClose, route, onReport }: Props) {
    const [type, setType] = useState("obstruccion")
    const [level, setLevel] = useState("amarillo")
    const [description, setDescription] = useState("")

    if (!isOpen || !route) return null

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        onReport({ type, description, level })
        setDescription("")
        setType("obstruccion")
        setLevel("amarillo")
    }

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[9999] p-4 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6 animate-in fade-in zoom-in">
                <h2 className="text-xl font-bold mb-2 text-gray-800 flex items-center gap-2">
                    ⚠️ Reportar Problema
                </h2>
                <p className="text-sm text-gray-500 mb-4">
                    Reportando sobre: <span className="font-bold text-gray-700">{route.name}</span>
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Tipo de Problema</label>
                        <select className="w-full border rounded-lg p-2 bg-white" value={type} onChange={e => setType(e.target.value)}>
                            <option value="obstruccion">🚧 Obstrucción / Camino bloqueado</option>
                            <option value="clima">⛈️ Clima / Lluvias / Deslave</option>
                            <option value="seguridad">👮 Seguridad</option>
                            <option value="otro">ℹ️ Otro</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Gravedad</label>
                        <select className="w-full border rounded-lg p-2 bg-white" value={level} onChange={e => setLevel(e.target.value)}>
                            <option value="amarillo">⚠️ Precaución (Amarillo)</option>
                            <option value="rojo">⛔ Peligro / No pasar (Rojo)</option>
                            <option value="verde">✅ Informativo (Verde)</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Descripción</label>
                        <textarea 
                            className="w-full border rounded-lg p-2 resize-none" 
                            rows={3} 
                            placeholder="Ej: Árbol caído bloqueando el paso..."
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            required
                        />
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={onClose} className="flex-1 py-2 border rounded-lg hover:bg-gray-50">Cancelar</button>
                        <button type="submit" className="flex-1 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 font-bold">Enviar Reporte</button>
                    </div>
                </form>
            </div>
        </div>
    )
}