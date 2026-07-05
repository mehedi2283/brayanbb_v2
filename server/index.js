require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// Schema for Sub-Account Level Configuration
const SubAccountTokenSchema = new mongoose.Schema({
  locationId: { type: String, required: true, unique: true, index: true },
  pitToken: { type: String, required: true },
  updatedAt: { type: Date, default: Date.now }
});
const SubAccountToken = mongoose.model('SubAccountToken', SubAccountTokenSchema);

// Schema for Agency Level Configuration
const AgencyConfigSchema = new mongoose.Schema({
  id: { type: String, default: 'default' },
  agencyApiKey: { type: String, required: true },
  updatedAt: { type: Date, default: Date.now }
});
const AgencyConfig = mongoose.model('AgencyConfig', AgencyConfigSchema);

const app = express();
const PORT = process.env.PORT || 4001;

app.use(express.json());
app.use(cors()); // Allow frontend to talk to this backend

const mongoUri = process.env.MONGODB_URI;
if (!mongoUri) {
  console.error('Missing MONGODB_URI in environment variables');
  process.exit(1);
}

mongoose.connect(mongoUri)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

const getAuthToken = async (req) => {
  const agencyConfig = await AgencyConfig.findOne({ id: 'default' });
  if (agencyConfig && agencyConfig.agencyApiKey) {
    return agencyConfig.agencyApiKey;
  }
  return req.headers['x-ghl-token'] || process.env.GHL_API_KEY;
};

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Agency Config endpoints
app.get('/api/agency-key', async (req, res) => {
  try {
    const config = await AgencyConfig.findOne({ id: 'default' });
    res.json({ agencyApiKey: config ? config.agencyApiKey : '' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/agency-key', async (req, res) => {
  const { agencyApiKey } = req.body;
  try {
    const updatedConfig = await AgencyConfig.findOneAndUpdate(
      { id: 'default' },
      { agencyApiKey, updatedAt: Date.now() },
      { new: true, upsert: true }
    );
    res.json(updatedConfig);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Token endpoints
app.get('/api/tokens', async (req, res) => {
  try {
    const tokens = await SubAccountToken.find({}, 'locationId pitToken');
    res.json(tokens);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/tokens/:locationId', async (req, res) => {
  try {
    const tokenDoc = await SubAccountToken.findOne({ locationId: req.params.locationId });
    if (!tokenDoc) return res.status(404).json({ error: 'Token not found' });
    res.json({ token: tokenDoc.pitToken });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/tokens/:locationId', async (req, res) => {
  const { locationId } = req.params;
  const { pitToken } = req.body;

  try {
    const updatedToken = await SubAccountToken.findOneAndUpdate(
      { locationId },
      { pitToken, updatedAt: Date.now() },
      { new: true, upsert: true }
    );
    res.json(updatedToken);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Proxy to fetch locations
app.get('/api/locations', async (req, res) => {
  try {
    const token = await getAuthToken(req);
    if (!token) return res.status(401).json({ error: 'No Agency API Key configured' });

    const response = await fetch('https://services.leadconnectorhq.com/locations/search', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Version': '2021-07-28',
        'Accept': 'application/json'
      }
    });
    
    const data = await response.json();
    if (!response.ok) {
       return res.status(response.status).json(data);
    }
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch locations' });
  }
});

// Proxy to fetch call logs
app.get('/api/call-logs', async (req, res) => {
  const { locationId } = req.query;
  if (!locationId || typeof locationId !== 'string') {
    return res.status(400).json({ error: 'locationId is required' });
  }
  
  try {
    let tokenToUse = req.headers['x-ghl-token'];
    const dbToken = await SubAccountToken.findOne({ locationId });
    if (dbToken && dbToken.pitToken) {
      tokenToUse = dbToken.pitToken;
    }

    if (!tokenToUse) {
      return res.status(401).json({ error: 'No Private Integration Token configured for this Sub-Account. Please configure it in the Sub-Accounts tab.' });
    }

    const response = await fetch(`https://services.leadconnectorhq.com/voice-ai/dashboard/call-logs?locationId=${locationId}`, {
      headers: {
        'Authorization': `Bearer ${tokenToUse}`,
        'Version': 'v3',
        'Accept': 'application/json'
      }
    });
    
    const data = await response.json();
    if (!response.ok) {
       return res.status(response.status).json(data);
    }
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch call logs' });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Standalone backend server running on http://0.0.0.0:${PORT}`);
});
