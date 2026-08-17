import 'dotenv/config';
import express from 'express';
import cors from 'cors';

// Crear aplicación Express
const app = express();
const puerto = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Ruta de salud
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Iniciar servidor
app.listen(puerto, () => {
  console.log(`Servidor ejecutándose en el puerto ${puerto}`);
});

export { app };
