import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet"
import "leaflet/dist/leaflet.css"
import { useEffect } from "react"
import * as L from "leaflet"

function UserLocation() {
  const map = useMap()
  useEffect(() => {
    map.locate({ setView: true, maxZoom: 16 })
    map.on("locationfound", (e: L.LocationEvent) => {
      L.marker(e.latlng).addTo(map).bindPopup("Estás aquí").openPopup()
    })
  }, [map])
  return null
}

export default function MapView() {
  return (
    <div className="h-[calc(100vh-60px)] w-full">
      <MapContainer
        center={[13.6929, -89.2182]} // San Salvador
        zoom={10}
        className="h-full w-full z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <UserLocation />
      </MapContainer>
    </div>
  )
}
