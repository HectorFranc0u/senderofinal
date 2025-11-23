const API_URL = "http://localhost:5174/api"

export type Alert = {
    id?: string
    routeId: string
    routeName: string
    type: 'clima' | 'obstruccion' | 'seguridad' | 'otro'
    description: string
    level: 'verde' | 'amarillo' | 'rojo'
    timestamp: string
}

export async function fetchAlerts(): Promise<Alert[]> {
    try {
        const res = await fetch(`${API_URL}/alerts`)
        const json = await res.json()
        return json.ok ? json.data : []
    } catch (error) {
        console.error("Error cargando alertas:", error)
        return []
    }
}

export async function reportAlert(alert: Omit<Alert, 'id' | 'timestamp'>): Promise<boolean> {
    try {
        const res = await fetch(`${API_URL}/alerts`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(alert)
        })
        const json = await res.json()
        return json.ok
    } catch (error) {
        console.error("Error enviando reporte:", error)
        return false
    }
}