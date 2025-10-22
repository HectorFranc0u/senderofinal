// src/lib/markers.ts
import * as L from "leaflet"

type Diff = "baja" | "media" | "alta" | (string & {})

const colorByDiff: Record<Diff, string> = {
  baja: "#16a34a",  // verde
  media: "#ca8a04", // amarillo
  alta: "#dc2626",  // rojo
}

export function markerByDifficulty(difficulty: Diff) {
  const color = colorByDiff[difficulty] ?? "#2563eb" // azul por defecto
  const svg = encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="42" viewBox="0 0 32 42">
      <defs>
        <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="1" stdDeviation="1.5" flood-opacity="0.25"/>
        </filter>
      </defs>
      <path filter="url(#shadow)" fill="${color}" d="M16,0 C24,0 32,6.9 32,16.1 C32,25.3 19.6,39.1 16.9,41.9 C16.4,42.4 15.6,42.4 15.1,41.9 C12.4,39.1 0,25.3 0,16.1 C0,6.9 8,0 16,0 Z"/>
      <circle cx="16" cy="16" r="6.5" fill="#ffffff"/>
    </svg>
  `)

  return L.divIcon({
    className: "custom-pin",   // sin estilos extra; hoja en blanco
    html: `<img alt="" src="data:image/svg+xml;utf8,${svg}" />`,
    iconSize: [32, 42],
    iconAnchor: [16, 42],
    popupAnchor: [0, -38],
  })
}
