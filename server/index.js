const express = require('express')
const cors = require('cors')

const app = express()
app.use(cors())
app.use(express.json()) // IMPORTANTE: Permite leer JSON

// Mocks de datos
let alerts = [
  { id: 1, type: 'clima', level: 'amarillo', title: 'Lluvias fuertes', message: 'Precaución', ts: Date.now() },
]

let routes = [
  { id: 'r1', name: 'El Boquerón', difficulty: 'media', lengthKm: 4.2, start: { lat: 13.734, lng: -89.290 } },
  { id: 'r2', name: 'Ruta de Las Flores', difficulty: 'baja', lengthKm: 7.8, start: { lat: 13.864, lng: -89.736 } },
]

let userPoints = []

app.get('/api/alerts', (req, res) => res.json({ ok: true, data: alerts }))
app.get('/api/routes', (req, res) => res.json({ ok: true, data: routes }))
app.get('/api/points', (req, res) => res.json({ ok: true, data: userPoints }))

// --- CREAR (Ruta Robusta) ---
app.post('/api/points', (req, res) => {
  console.log("📥 Recibiendo datos:", req.body); // <-- ESTO NOS AYUDARÁ A VER EL ERROR EN CONSOLA

  const { name, description, difficulty, path, location } = req.body;
  
  // VALIDACIÓN FLEXIBLE: Aceptamos 'path' (ruta) O 'location' (punto)
  const hasPath = path && path.length > 0;
  const hasLocation = location && location.lat;

  if (!name || (!hasPath && !hasLocation)) {
    console.log("❌ Rechazado: Faltan datos");
    return res.status(400).json({ ok: false, error: 'Falta el nombre o la ruta' });
  }

  // Si nos mandan path, usamos el primer punto como ubicación base
  const finalLocation = hasLocation ? location : (hasPath ? path[0] : null);

  const newPoint = {
    id: Date.now().toString(),
    name,
    description,
    difficulty: difficulty || 'baja',
    type: hasPath ? 'ruta' : 'punto',
    path: path || [],      // Guardamos el camino
    location: finalLocation, // Guardamos el punto de inicio
    createdAt: new Date()
  };

  userPoints.push(newPoint);
  console.log('✅ Guardado:', newPoint.name);
  res.json({ ok: true, data: newPoint });
});

// --- ELIMINAR ---
app.delete('/api/points/:id', (req, res) => {
  const { id } = req.params
  const initialLength = userPoints.length
  userPoints = userPoints.filter(p => p.id !== id)
  
  if (userPoints.length < initialLength) {
      res.json({ ok: true, id })
  } else {
      res.status(404).json({ ok: false, error: "No encontrado" })
  }
})

// --- ACTUALIZAR ---
app.put('/api/points/:id', (req, res) => {
  const { id } = req.params
  const { name, description, difficulty, path } = req.body // Aceptamos path
  
  const pointIndex = userPoints.findIndex(p => p.id === id)
  
  if (pointIndex !== -1) {
      userPoints[pointIndex] = {
          ...userPoints[pointIndex],
          name,
          description,
          difficulty,
          // Si mandan nuevo path lo actualizamos, si no, dejamos el anterior
          path: path || userPoints[pointIndex].path 
      }
      res.json({ ok: true, data: userPoints[pointIndex] })
  } else {
      res.status(404).json({ ok: false, error: "Punto no encontrado" })
  }
})

const PORT = process.env.PORT || 5174
app.listen(PORT, () => console.log(`✅ API Reiniciada y lista en puerto ${PORT}`))