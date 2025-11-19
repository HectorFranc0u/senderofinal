// src/services/points.ts

// Asegúrate de que el puerto coincida con tu server (5174)
const API_URL = "http://localhost:5174/api"

export type UserPoint = {
  id?: string
  name: string
  description: string
  difficulty: "baja" | "media" | "alta"
  type?: string // Opcional, por compatibilidad
  location: { lat: number; lng: number }
}

export async function fetchUserPoints(): Promise<UserPoint[]> {
  try {
    const res = await fetch(`${API_URL}/points`)
    const json = await res.json()
    return json.ok ? json.data : []
  } catch (error) {
    console.error("Error fetching points:", error)
    return []
  }
}

export async function saveUserPoint(point: UserPoint): Promise<UserPoint | null> {
  try {
    const res = await fetch(`${API_URL}/points`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(point),
    })
    const json = await res.json()
    return json.ok ? json.data : null
  } catch (error) {
    console.error("Error saving point:", error)
    return null
  }
}