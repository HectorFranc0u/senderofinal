const express = require('express')
const cors = require('cors')

const app = express()
app.use(cors())
app.use(express.json())

// Mock: ALERTAS
const alerts = [
  { id: 1, type: 'clima', level: 'amarillo', title: 'Lluvias fuertes en Cordillera del Bálsamo', message: 'Precaución por terreno resbaladizo', ts: Date.now() },
  { id: 2, type: 'seguridad', level: 'rojo', title: 'Paso cerrado El Boquerón', message: 'Cuerpo de socorro en la zona', ts: Date.now() - 3600_000 },
]

// Mock: RUTAS OFICIALES
const routes = [
  { id: 'r1', name: 'El Boquerón', difficulty: 'media', lengthKm: 4.2, start: { lat: 13.734, lng: -89.290 } },
  { id: 'r2', name: 'Ruta de Las Flores', difficulty: 'baja', lengthKm: 7.8, start: { lat: 13.864, lng: -89.736 } },
  { id: 'r3', name: 'El Pital', difficulty: 'alta', lengthKm: 5.1, start: { lat: 14.380, lng: -89.129 } },
]

// Mock: PUNTOS DE USUARIO (Nueva funcionalidad)
let userPoints = []

app.get('/api/alerts', (req, res) => {
  res.json({ ok: true, data: alerts })
})

app.get('/api/routes', (req, res) => {
  res.json({ ok: true, data: routes })
})

// --- NUEVAS RUTAS PARA PUNTOS ---
app.get('/api/points', (req, res) => {
  res.json({ ok: true, data: userPoints })
})

app.post('/api/points', (req, res) => {
  const { name, description, type, location } = req.body
  
  if (!location || !name) {
    return res.status(400).json({ ok: false, error: 'Datos incompletos' })
  }

  const newPoint = {
    id: Date.now().toString(),
    name,
    description,
    type, // ej: 'mirador', 'peligro', 'agua'
    location, // { lat, lng }
    createdAt: new Date()
  }

  userPoints.push(newPoint)
  console.log('📍 Nuevo punto de usuario:', newPoint.name)
  res.json({ ok: true, data: newPoint })
})
// --------------------------------

app.post('/api/sos', (req, res) => {
  const { lat, lng, message } = req.body || {}
  console.log('📟 SOS recibido:', { lat, lng, message, at: new Date().toISOString() })
  res.json({ ok: true })
})

const PORT = process.env.PORT || 5174
app.listen(PORT, () => console.log(`✅ API SenderoSV escuchando en http://localhost:${PORT}`))