import { useEffect, useState } from 'react'
import { sendSOS } from '../services/api'

type Props = { open: boolean; onClose: () => void }

export default function SOSModal({ open, onClose }: Props) {
  const [lat, setLat] = useState<number | null>(null)
  const [lng, setLng] = useState<number | null>(null)
  const [message, setMessage] = useState('Necesito ayuda')

  useEffect(() => {
    if (open && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLat(pos.coords.latitude)
          setLng(pos.coords.longitude)
        },
        () => console.warn('No se pudo obtener ubicación'),
        { enableHighAccuracy: true }
      )
    }
  }, [open])

  if (!open) return null

  const canSend = lat != null && lng != null

  const handleSend = async () => {
    if (!canSend) return
    await sendSOS({ lat: lat!, lng: lng!, message })
    alert('📟 SOS enviado')
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-5 w-11/12 max-w-md space-y-3">
        <h2 className="text-xl font-bold">Enviar SOS</h2>
        <p className="text-sm text-gray-600">
          {canSend
            ? `Ubicación lista: ${lat!.toFixed(5)}, ${lng!.toFixed(5)}`
            : 'Obteniendo ubicación…'}
        </p>
        <textarea
          className="w-full border rounded-lg p-2"
          rows={3}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <div className="flex gap-2 justify-end">
          <button className="px-4 py-2 rounded-lg bg-gray-200" onClick={onClose}>Cancelar</button>
          <button
            disabled={!canSend}
            className={`px-4 py-2 rounded-lg text-white ${canSend ? 'bg-red-600' : 'bg-red-300'}`}
            onClick={handleSend}
          >
            Enviar
          </button>
        </div>
      </div>
    </div>
  )
}
