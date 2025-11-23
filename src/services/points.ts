// src/services/points.ts
const API_URL = "http://localhost:5174/api"

export type UserPoint = {
  id?: string
  name: string
  description: string
  difficulty: "baja" | "media" | "alta"
  category: "establecida" | "personalizada"
  path?: { lat: number; lng: number }[]
  location?: { lat: number; lng: number }
  lengthKm?: number
}

export async function fetchPoints(): Promise<UserPoint[]> {
  try {
    const res = await fetch(`${API_URL}/points`)
    const json = await res.json()
    return json.ok ? json.data : []
  } catch (error) {
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
  } catch (error) { return null }
}

export async function deletePointApi(id: string): Promise<boolean> {
    try {
        const res = await fetch(`${API_URL}/points/${id}`, { method: 'DELETE' })
        return res.ok
    } catch (error) { return false }
}

export async function updatePointApi(point: UserPoint): Promise<UserPoint | null> {
    if (!point.id) return null
    try {
        const res = await fetch(`${API_URL}/points/${point.id}`, {
            method: 'PUT',
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(point),
        })
        const json = await res.json()
        return json.ok ? json.data : null
    } catch (error) { return null }
}