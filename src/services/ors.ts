// ¡¡IMPORTANTE!!: Reemplaza esto con tu clave real de OpenRouteService
const API_KEY = "eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6IjFmNTMyNmU0ZTJjMzQyZDA5YmYwZWNiNjdiMzRjZTA2IiwiaCI6Im11cm11cjY0In0"; 

export async function getHikingRoute(points: { lat: number; lng: number }[]) {
  if (points.length < 2) return null;

  try {
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
          instructions: false
        })
      }
    );

    if (!response.ok) throw new Error("Error API ORS");

    const data = await response.json();
    
    // 1. Obtener Geometría (Ruta)
    const geometry = data.features[0].geometry.coordinates;
    const leafletPath = geometry.map((coord: number[]) => ({
      lat: coord[1],
      lng: coord[0]
    }));

    // 2. Obtener Distancia (en metros -> km)
    const distMeters = data.features[0].properties.summary.distance;
    const distKm = parseFloat((distMeters / 1000).toFixed(2));

    return { path: leafletPath, distance: distKm };

  } catch (error) {
    console.error("Error calculando ruta:", error);
    return null;
  }
}