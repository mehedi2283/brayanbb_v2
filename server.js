require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 4001;

/*
|--------------------------------------------------------------------------
| Middleware
|--------------------------------------------------------------------------
*/

app.use(express.json({ limit: '10mb' }));

app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-ghl-token', 'x-admin-secret']
}));

/*
|--------------------------------------------------------------------------
| MongoDB Connection
|--------------------------------------------------------------------------
*/

const mongoUri = process.env.MONGODB_URI;

if (!mongoUri) {
  console.error('Missing MONGODB_URI in .env');
  process.exit(1);
}

mongoose.connect(mongoUri)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

/*
|--------------------------------------------------------------------------
| MongoDB Schemas
|--------------------------------------------------------------------------
*/

const SubAccountTokenSchema = new mongoose.Schema({
  locationId: { type: String, required: true, unique: true, index: true },
  pitToken: { type: String, required: true },
  updatedAt: { type: Date, default: Date.now }
});

const SubAccountToken = mongoose.model('SubAccountToken', SubAccountTokenSchema);

const AgencyConfigSchema = new mongoose.Schema({
  id: { type: String, default: 'default', unique: true },
  agencyApiKey: { type: String, required: true },
  updatedAt: { type: Date, default: Date.now }
});

const AgencyConfig = mongoose.model('AgencyConfig', AgencyConfigSchema);

/*
|--------------------------------------------------------------------------
| Admin Protection
|--------------------------------------------------------------------------
*/

function requireAdmin(req, res, next) {
  const adminSecret = process.env.ADMIN_SECRET;

  if (!adminSecret) {
    return res.status(500).json({ error: 'ADMIN_SECRET is missing in .env' });
  }

  const providedSecret = req.headers['x-admin-secret'];

  if (!providedSecret || providedSecret !== adminSecret) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  next();
}

/*
|--------------------------------------------------------------------------
| Helper Functions
|--------------------------------------------------------------------------
*/

async function getAgencyToken() {
  const config = await AgencyConfig.findOne({ id: 'default' });
  if (config && config.agencyApiKey) {
    return config.agencyApiKey;
  }
  return null;
}

async function getLocationToken(locationId) {
  const tokenDoc = await SubAccountToken.findOne({ locationId });
  if (!tokenDoc || !tokenDoc.pitToken) {
    return null;
  }
  return tokenDoc.pitToken;
}

function maskToken(token) {
  if (!token || typeof token !== 'string') return '';
  if (token.length <= 8) return '********';
  return `${token.slice(0, 4)}********${token.slice(-4)}`;
}

/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
*/

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend server is running' });
});

app.get('/api/agency-key/status', requireAdmin, async (req, res) => {
  try {
    const config = await AgencyConfig.findOne({ id: 'default' });
    res.json({
      hasAgencyKey: Boolean(config && config.agencyApiKey),
      maskedAgencyKey: config && config.agencyApiKey ? maskToken(config.agencyApiKey) : '',
      updatedAt: config ? config.updatedAt : null
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/agency-key', requireAdmin, async (req, res) => {
  const { agencyApiKey } = req.body;
  if (!agencyApiKey) return res.status(400).json({ error: 'agencyApiKey is required' });

  try {
    await AgencyConfig.findOneAndUpdate(
      { id: 'default' },
      { agencyApiKey, updatedAt: Date.now() },
      { new: true, upsert: true }
    );
    res.json({ success: true, message: 'Agency API key saved successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/tokens', requireAdmin, async (req, res) => {
  try {
    const tokens = await SubAccountToken.find({}, 'locationId pitToken updatedAt');
    const safeTokens = tokens.map((item) => ({
      locationId: item.locationId,
      hasToken: Boolean(item.pitToken),
      maskedToken: maskToken(item.pitToken),
      updatedAt: item.updatedAt
    }));
    res.json(safeTokens);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/tokens/:locationId/status', requireAdmin, async (req, res) => {
  const { locationId } = req.params;
  try {
    const tokenDoc = await SubAccountToken.findOne({ locationId });
    res.json({
      locationId,
      hasToken: Boolean(tokenDoc && tokenDoc.pitToken),
      maskedToken: tokenDoc ? maskToken(tokenDoc.pitToken) : '',
      updatedAt: tokenDoc ? tokenDoc.updatedAt : null
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/tokens/:locationId', requireAdmin, async (req, res) => {
  const { locationId } = req.params;
  const { pitToken } = req.body;
  if (!locationId) return res.status(400).json({ error: 'locationId is required' });
  if (!pitToken) return res.status(400).json({ error: 'pitToken is required' });

  try {
    await SubAccountToken.findOneAndUpdate(
      { locationId },
      { pitToken, updatedAt: Date.now() },
      { new: true, upsert: true }
    );
    res.json({ success: true, message: 'Sub-account PIT token saved successfully', locationId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/locations', async (req, res) => {
  try {
    const token = await getAgencyToken();
    if (!token) return res.status(401).json({ error: 'No Agency API Key configured' });

    const response = await fetch('https://services.leadconnectorhq.com/locations/search', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        Version: '2021-07-28',
        Accept: 'application/json'
      }
    });

    const data = await response.json();
    if (!response.ok) return res.status(response.status).json(data);
    res.json(data);
  } catch (err) {
    console.error('Failed to fetch locations:', err);
    res.status(500).json({ error: 'Failed to fetch locations' });
  }
});

app.get('/api/call-logs', async (req, res) => {
  const { locationId } = req.query;
  if (!locationId || typeof locationId !== 'string') return res.status(400).json({ error: 'locationId is required' });

  try {
    const pitToken = await getLocationToken(locationId);
    if (!pitToken) return res.status(401).json({ error: 'No Private Integration Token configured for this Sub-Account' });

    const url = `https://services.leadconnectorhq.com/voice-ai/dashboard/call-logs?locationId=${encodeURIComponent(locationId)}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${pitToken}`,
        Version: 'v3',
        Accept: 'application/json'
      }
    });

    const data = await response.json();
    if (!response.ok) return res.status(response.status).json(data);
    res.json(data);
  } catch (err) {
    console.error('Failed to fetch call logs:', err);
    res.status(500).json({ error: 'Failed to fetch call logs' });
  }
});

app.get('/api/agents', async (req, res) => {
  const { locationId } = req.query;
  if (!locationId || typeof locationId !== 'string') return res.status(400).json({ error: 'locationId is required' });

  try {
    const pitToken = await getLocationToken(locationId);
    if (!pitToken) return res.status(401).json({ error: 'No Private Integration Token configured for this Sub-Account' });

    const url = `https://services.leadconnectorhq.com/voice-ai/agents?locationId=${encodeURIComponent(locationId)}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${pitToken}`,
        Version: 'v3',
        Accept: 'application/json'
      }
    });

    const data = await response.json();
    if (!response.ok) return res.status(response.status).json(data);
    res.json(data);
  } catch (err) {
    console.error('Failed to fetch agents:', err);
    res.status(500).json({ error: 'Failed to fetch agents' });
  }
});

app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Backend server running on http://0.0.0.0:${PORT}`);
});
