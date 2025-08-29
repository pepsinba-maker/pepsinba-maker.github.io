const express = require('express');
const admin = require('firebase-admin');
const app = express();
app.use(express.json());

const serviceAccount = JSON.parse(process.env.GOOGLE_APP);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

app.post('/api/offerta', async (req, res) => {
  const key = req.body.key;
  if (!key) return res.status(400).json({ error: 'Chiave mancante' });

  try {
    const snapshot = await db.collection('offerte').where('chiavePubblica', '==', key).get();
    if (snapshot.empty) {
      return res.status(404).json({ error: 'Offerta non trovata' });
    }

    const doc = snapshot.docs[0];
    const data = doc.data();

    // Cancella il documento one-time
    await doc.ref.delete();

    // Restituisce l'offerta cifrata (o i dati necessari)
    res.json({ offertaCifrata: data.offertaCifrata });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Errore server' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server in ascolto sulla porta ${PORT}`);
});

app.get('/api/offerta', async (req, res) => {
  const key = req.query.key;  // recupera la chiave dalla query string ?key=xxx
  if (!key) return res.status(400).json({ error: 'Chiave mancante' });

  try {
    const snapshot = await db.collection('offerte').where('chiavePubblica', '==', key).limit(1).get();
    if (snapshot.empty) {
      return res.status(404).json({ error: 'Offerta non trovata' });
    }

    const doc = snapshot.docs[0];
    const data = doc.data();

    // Cancella il documento one-time
    await doc.ref.delete();

    // Restituisci l'offerta cifrata
    res.json({ offertaCifrata: data.offertaCifrata });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Errore server' });
  }
});
