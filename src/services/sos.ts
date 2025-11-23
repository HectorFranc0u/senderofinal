const API_URL = "http://localhost:5174/api"

export async function sendSOS(lat: number, lng: number, message: string = "Emergencia solicitada") {
  try {
    const res = await fetch(`${API_URL}/sos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lat, lng, message })
    })
    return res.ok
  } catch (error) {
    console.error("Error enviando SOS:", error)
    return false
  }
}