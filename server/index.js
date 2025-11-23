const express = require('express')
const cors = require('cors')
const { db } = require('./firebase') 

const app = express()
app.use(cors())
app.use(express.json())

// Definición de Colecciones
const POINTS_COLLECTION = 'points';
const SOS_COLLECTION = 'sos_logs';
const ALERTS_COLLECTION = 'alerts';

// ==========================================
// 1. GESTIÓN DE PUNTOS (RUTAS)
// ==========================================

app.get('/api/points', async (req, res) => {
  try {
    const snapshot = await db.collection(POINTS_COLLECTION).get();
    const points = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    res.json({ ok: true, data: points });
  } catch (error) {
    res.status(500).json({ ok: false, error: error.message });
  }
});

app.post('/api/points', async (req, res) => {
  try {
    const { name, description, difficulty, path, location, category, lengthKm } = req.body;
    
    const hasPath = path && path.length > 0;
    const hasLocation = location && location.lat;

    if (!name || (!hasPath && !hasLocation)) {
      return res.status(400).json({ ok: false, error: 'Datos incompletos' });
    }

    const finalLocation = hasLocation ? location : (hasPath ? path[0] : null);

    const newPoint = {
      name,
      description: description || "",
      difficulty: difficulty || 'baja',
      category: category || 'personalizada',
      type: hasPath ? 'ruta' : 'punto',
      path: path || [],
      location: finalLocation,
      lengthKm: lengthKm || 0,
      createdAt: new Date().toISOString()
    };

    const docRef = await db.collection(POINTS_COLLECTION).add(newPoint);
    console.log(`✅ Ruta guardada: ${name}`);
    res.json({ ok: true, data: { id: docRef.id, ...newPoint } });

  } catch (error) {
    res.status(500).json({ ok: false, error: error.message });
  }
});

app.delete('/api/points/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await db.collection(POINTS_COLLECTION).doc(id).delete();
    console.log(`🗑️ Ruta eliminada: ${id}`);
    res.json({ ok: true, id });
  } catch (error) {
    res.status(500).json({ ok: false, error: error.message });
  }
});

app.put('/api/points/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;
    delete data.id; 
    await db.collection(POINTS_COLLECTION).doc(id).update(data);
    res.json({ ok: true, data: { id, ...data } });
  } catch (error) {
    res.status(500).json({ ok: false, error: error.message });
  }
});

// ==========================================
// 2. GESTIÓN DE ALERTAS (REPORTES)
// ==========================================

// OBTENER ALERTAS (SOLO ÚLTIMAS 48 HORAS)
app.get('/api/alerts', async (req, res) => {
  try {
    const snapshot = await db.collection(ALERTS_COLLECTION).orderBy('timestamp', 'desc').get();
    
    // Calculamos fecha límite (Hace 48 horas)
    const cutoffDate = new Date();
    cutoffDate.setHours(cutoffDate.getHours() - 48);

    const alerts = snapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .filter(alert => {
        // Filtramos: La fecha de la alerta debe ser mayor (más nueva) que el límite
        return new Date(alert.timestamp) > cutoffDate;
      });

    res.json({ ok: true, data: alerts });
  } catch (error) {
    res.status(500).json({ ok: false, error: error.message });
  }
});

app.post('/api/alerts', async (req, res) => {
  try {
    const { routeId, routeName, type, description, level } = req.body;

    if (!routeId || !type || !description) {
        return res.status(400).json({ ok: false, error: "Datos incompletos" });
    }

    const newAlert = {
        routeId,
        routeName,
        type,
        description,
        level,
        timestamp: new Date().toISOString()
    };

    const docRef = await db.collection(ALERTS_COLLECTION).add(newAlert);
    console.log(`⚠️ Alerta reportada en ${routeName}`);
    res.json({ ok: true, data: { id: docRef.id, ...newAlert } });

  } catch (error) {
    res.status(500).json({ ok: false, error: error.message });
  }
});

// ==========================================
// 3. GESTIÓN DE SOS
// ==========================================

app.post('/api/sos', async (req, res) => {
  try {
    const { lat, lng, message } = req.body || {};
    const sosLog = {
      lat,
      lng,
      message: message || "Emergencia sin mensaje",
      timestamp: new Date().toISOString(),
      status: 'active'
    };
    await db.collection(SOS_COLLECTION).add(sosLog);
    console.log('🚨 SOS REGISTRADO:', sosLog);
    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ ok: false });
  }
});

const PORT = process.env.PORT || 5174;
app.listen(PORT, () => console.log(`🔥 Servidor escuchando en puerto ${PORT}`));