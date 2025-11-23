import { useState } from "react"
// CORRECCIÓN: Importamos desde el nuevo servicio específico para SOS
import { sendSOS } from "../services/sos"

type SOSModalProps = {
  open: boolean
  onClose: () => void
}

// Estados para manejar la interfaz paso a paso
type SOSStatus = "idle" | "locating" | "sending" | "success" | "error"

export default function SOSModal({ open, onClose }: SOSModalProps) {
  const [status, setStatus] = useState<SOSStatus>("idle")
  const [errorMessage, setErrorMessage] = useState("")

  if (!open) return null

  const handleActivateSOS = () => {
    setStatus("locating")
    setErrorMessage("")

    if (!navigator.geolocation) {
      setStatus("error")
      setErrorMessage("Tu navegador no soporta geolocalización.")
      return
    }

    // 1. Obtener Ubicación GPS del dispositivo
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords
        
        // 2. Una vez tenemos coordenadas, enviamos al Backend
        setStatus("sending")
        
        // Llamamos a la función del servicio sos.ts
        const success = await sendSOS(latitude, longitude, "⚠️ EMERGENCIA: Usuario solicitó ayuda.")
        
        if (success) {
          setStatus("success")
        } else {
          setStatus("error")
          setErrorMessage("No se pudo conectar con el servidor de emergencia.")
        }
      },
      (error) => {
        setStatus("error")
        // Manejo de errores de GPS
        switch(error.code) {
            case error.PERMISSION_DENIED:
                setErrorMessage("Permiso de ubicación denegado. Por favor activa el GPS.")
                break;
            case error.POSITION_UNAVAILABLE:
                setErrorMessage("No se pudo determinar tu ubicación actual.")
                break;
            case error.TIMEOUT:
                setErrorMessage("Se agotó el tiempo de espera del GPS.")
                break;
            default:
                setErrorMessage("Error desconocido al obtener GPS.")
        }
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    )
  }

  // Reiniciar el modal si hubo error
  const reset = () => {
    setStatus("idle")
    setErrorMessage("")
  }

  return (
    <div className="fixed inset-0 bg-red-900/90 backdrop-blur-sm flex items-center justify-center z-[9999] p-6 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden relative">
        
        {/* Encabezado de Emergencia */}
        <div className="bg-red-600 p-4 text-white text-center">
          <h2 className="text-2xl font-black uppercase tracking-widest">S.O.S.</h2>
          <p className="text-red-100 text-xs">Sistema de Respuesta de Emergencia</p>
        </div>

        <div className="p-8 flex flex-col items-center text-center">
          
          {/* 1. ESTADO INICIAL: BOTÓN DE PÁNICO */}
          {status === "idle" && (
            <>
              <p className="text-gray-600 mb-8 font-medium leading-relaxed">
                Al presionar el botón, se enviará tu ubicación exacta a nuestra base de datos de emergencia.
              </p>
              
              <button 
                onClick={handleActivateSOS}
                className="relative group w-44 h-44 rounded-full bg-red-600 flex items-center justify-center shadow-xl active:scale-95 transition-transform duration-200"
              >
                {/* Efecto de pulso animado */}
                <span className="absolute w-full h-full rounded-full bg-red-600 opacity-75 animate-ping"></span>
                <span className="relative text-white font-black text-2xl z-10 leading-none">
                  ENVIAR<br/>AYUDA
                </span>
              </button>
              
              <p className="mt-8 text-xs text-red-400 uppercase font-bold tracking-wide">
                Solo usar en emergencias reales
              </p>
            </>
          )}

          {/* 2. PROCESANDO: GPS O ENVIANDO */}
          {(status === "locating" || status === "sending") && (
            <div className="py-10">
              <div className="w-20 h-20 border-4 border-red-100 border-t-red-600 rounded-full animate-spin mb-6 mx-auto"></div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                {status === "locating" ? "Obteniendo Coordenadas..." : "Enviando Alerta..."}
              </h3>
              <p className="text-sm text-gray-500 px-4">
                No cierres esta ventana. Estamos conectando con el satélite.
              </p>
            </div>
          )}

          {/* 3. ÉXITO */}
          {status === "success" && (
            <div className="py-6 w-full">
              <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-5xl mx-auto mb-6 shadow-sm">
                ✓
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">¡Alerta Recibida!</h3>
              <p className="text-gray-600 mb-8 text-sm">
                Tu ubicación ha sido registrada en el sistema central.
              </p>
              <button 
                onClick={onClose} 
                className="w-full py-3.5 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors"
              >
                Cerrar
              </button>
            </div>
          )}

          {/* 4. ERROR */}
          {status === "error" && (
            <div className="py-6 w-full">
              <div className="w-24 h-24 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-5xl mx-auto mb-6">
                ✕
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Error de Envío</h3>
              <p className="text-red-500 font-medium mb-8 text-sm px-4 bg-red-50 py-3 rounded-lg border border-red-100">
                {errorMessage}
              </p>
              <div className="flex gap-3 w-full">
                <button 
                    onClick={onClose} 
                    className="flex-1 py-3 border border-gray-300 text-gray-600 font-bold rounded-xl hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button 
                    onClick={reset} 
                    className="flex-1 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 shadow-lg shadow-red-200"
                >
                  Reintentar
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Botón cerrar esquina (solo si no está procesando) */}
        {status === 'idle' && (
            <button 
                onClick={onClose}
                className="absolute top-3 right-3 text-white/70 hover:text-white text-xl font-bold p-2"
            >
                ✕
            </button>
        )}
      </div>
    </div>
  )
}