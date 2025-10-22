const express = require('express')
const cors = require('cors')

const app = express()
app.use(cors())
app.use(express.json())

// Mock: ALERTAS (ej. cierres, clima, seguridad)
const alerts = [
  { id: 1, type: 'clima', level: 'amarillo', title: 'Lluvias fuertes en Cordillera del Bálsamo', message: 'Precaución por terreno resbaladizo', ts: Date.now() },
  { id: 2, type: 'seguridad', level: 'rojo', title: 'Paso cerrado El Boquerón', message: 'Cuerpo de socorro en la zona', ts: Date.now() - 3600_000 },
]

// Mock: RUTAS (lat/lng aproximados ES)
const routes = [
  { id: 'r1', name: 'El Boquerón', difficulty: 'media', lengthKm: 4.2, start: { lat: 13.734, lng: -89.290 } },
  { id: 'r2', name: 'Ruta de Las Flores', difficulty: 'baja', lengthKm: 7.8, start: { lat: 13.864, lng: -89.736 } },
  { id: 'r3', name: 'El Pital', difficulty: 'alta', lengthKm: 5.1, start: { lat: 14.380, lng: -89.129 } },
]

app.get('/api/alerts', (req, res) => {
  res.json({ ok: true, data: alerts })
})

app.get('/api/routes', (req, res) => {
  res.json({ ok: true, data: routes })
})

app.post('/api/sos', (req, res) => {
  const { lat, lng, message } = req.body || {}
  console.log('📟 SOS recibido:', { lat, lng, message, at: new Date().toISOString() })
  // En una etapa real: persistir en DB, notificar, etc.
  res.json({ ok: true })
})

const PORT = process.env.PORT || 5174
app.listen(PORT, () => console.log(`✅ API SenderoSV escuchando en http://localhost:${PORT}`))
