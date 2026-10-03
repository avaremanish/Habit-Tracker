import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;
const DB_PATH = path.join(__dirname, 'data', 'db.json');

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Ensure data directory exists
if (!fs.existsSync(path.join(__dirname, 'data'))) {
  fs.mkdirSync(path.join(__dirname, 'data'), { recursive: true });
}

// Read DB helper
const readDatabase = () => {
  try {
    if (fs.existsSync(DB_PATH)) {
      const content = fs.readFileSync(DB_PATH, 'utf-8');
      return JSON.parse(content);
    }
  } catch (err) {
    console.error('Error reading db.json:', err);
  }
  return null;
};

// Write DB helper
const writeDatabase = (data) => {
  try {
    const payload = {
      ...data,
      lastSyncedAt: new Date().toISOString(),
    };
    fs.writeFileSync(DB_PATH, JSON.stringify(payload, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error('Error writing to db.json:', err);
    return false;
  }
};

// GET /api/data
app.get('/api/data', (req, res) => {
  const dbData = readDatabase();
  if (dbData) {
    return res.json({ success: true, data: dbData });
  }
  return res.status(404).json({ success: false, message: 'Database file not found' });
});

// POST /api/data
app.post('/api/data', (req, res) => {
  const payload = req.body;
  if (!payload) {
    return res.status(400).json({ success: false, message: 'Invalid payload' });
  }
  const saved = writeDatabase(payload);
  if (saved) {
    return res.json({ success: true, message: 'Local database updated successfully' });
  }
  return res.status(500).json({ success: false, message: 'Failed to write to local database' });
});

app.listen(PORT, () => {
  console.log(`📡 Local Database Server running on http://localhost:${PORT}/api/data`);
  console.log(`📁 Persistence file: ${DB_PATH}`);
});
