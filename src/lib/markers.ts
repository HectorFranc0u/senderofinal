import L from "leaflet"

// Definimos iconos personalizados usando CSS o imágenes
export const markerByDifficulty = (difficulty: "baja" | "media" | "alta") => {
  const colors = {
    baja: "green",
    media: "orange",
    alta: "red",
    otra: "blue"
  }
  
  const color = colors[difficulty] || colors.otra

  // Usamos un DivIcon de Leaflet para crear un marcador coloreado simple con CSS
  return L.divIcon({
    className: "custom-marker",
    html: `<div style="
      background-color: ${color};
      width: 1.5rem;
      height: 1.5rem;
      border-radius: 50%;
      border: 2px solid white;
      box-shadow: 0 2px 4px rgba(0,0,0,0.3);
    "></div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12]
  })
}