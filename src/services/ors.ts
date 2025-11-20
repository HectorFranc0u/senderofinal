// src/services/ors.ts

// ¡¡IMPORTANTE!!: Reemplaza esto con tu clave real de OpenRouteService
const API_KEY = "eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6IjFmNTMyNmU0ZTJjMzQyZDA5YmYwZWNiNjdiMzRjZTA2IiwiaCI6Im11cm11cjY0In0="; 

export async function getHikingRoute(points: { lat: number; lng: number }[]) {
  // Necesitamos al menos 2 puntos para calcular una ruta
  if (points.length < 2) return null;

  try {
    // 1. Convertimos tus puntos (lat, lng) al formato GeoJSON (lng, lat) que pide la API
    const coordinates = points.map(p => [p.lng, p.lat]);

    const response = await fetch(
      `https://api.openrouteservice.org/v2/directions/foot-hiking/geojson`, 
      {
        method: 'POST',
        headers: {
          'Authorization': API_KEY,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          coordinates: coordinates,
          elevation: false,
          instructions: false // No necesitamos "gire a la derecha", solo la línea
        })
      }
    );

    if (!response.ok) {
        const err = await response.text();
        console.error("Error API ORS:", err);
        throw new Error("Error en ORS");
    }

    const data = await response.json();
    
    // 2. Extraemos la geometría (la línea del camino)
    const geometry = data.features[0].geometry.coordinates;

    // 3. Convertimos DE NUEVO a formato Leaflet (lat, lng) para tu mapa
    // La API devuelve [lng, lat], invertimos el orden
    const leafletPath = geometry.map((coord: number[]) => ({
      lat: coord[1],
      lng: coord[0]
    }));

    return leafletPath;

  } catch (error) {
    console.error("Error calculando ruta:", error);
    return null;
  }
}