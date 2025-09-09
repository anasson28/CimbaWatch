import express from 'express';
import dotenv from 'dotenv';

// Load environment variables from .env if present
dotenv.config();

// app config
const app = express();
const port = process.env.PORT || 4000;

// middleware
app.use(express.json());

// basic routes
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.get('/', (req, res) => {
  res.send('CimbaWatch Node server is running');
});

// start server
app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});

export default app;
