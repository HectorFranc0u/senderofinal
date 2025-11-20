const API_URL = "http://localhost:5174/api"

export type UserPoint = {
  id?: string
  name: string
  description: string
  difficulty: "baja" | "media" | "alta"
  // AHORA GUARDAMOS EL CAMINO COMPLETO
  path: { lat: number; lng: number }[] 
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

export async function deletePointApi(id: string): Promise<boolean> {
    try {
        const res = await fetch(`${API_URL}/points/${id}`, { method: 'DELETE' })
        const json = await res.json()
        return json.ok
    } catch (error) {
        console.error("Error eliminando:", error)
        return false
    }
}

export async function updatePointApi(point: UserPoint): Promise<UserPoint | null> {
    if (!point.id) return null
    try {
        const res = await fetch(`${API_URL}/points/${point.id}`, {
            method: 'PUT',
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                name: point.name,
                description: point.description,
                difficulty: point.difficulty,
                path: point.path // Enviamos el path
            }),
        })
        const json = await res.json()
        return json.ok ? json.data : null
    } catch (error) {
        console.error("Error actualizando:", error)
        return null
    }
}