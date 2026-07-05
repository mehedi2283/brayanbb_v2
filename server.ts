import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

// Schema for Sub-Account Level Configuration
const SubAccountTokenSchema = new mongoose.Schema({
  locationId: { type: String, required: true, unique: true, index: true },
  pitToken: { type: String, required: true }, // The Private Integration Token
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

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  const mongoUri = process.env.MONGODB_URI || 'mongodb+srv://brayanbb:1358549@cluster0.w5am0gy.mongodb.net/ghl-dashboard?appName=Cluster0';
  mongoose.connect(mongoUri)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));

  // Provided token from the user, fallback to env variable if we set one
  const getAuthToken = async (req: express.Request) => {
    const agencyConfig = await AgencyConfig.findOne({ id: 'default' });
    if (agencyConfig && agencyConfig.agencyApiKey) {
      return agencyConfig.agencyApiKey;
    }
    return req.headers['x-ghl-token'] || process.env.GHL_API_KEY || 'pit-5988b1f2-2c89-497d-ba07-342d4f155ba0';
  };

  // Basic health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  // Agency Config endpoints
  app.get('/api/agency-key', async (req, res) => {
    try {
      const config = await AgencyConfig.findOne({ id: 'default' });
      res.json({ agencyApiKey: config ? config.agencyApiKey : '' });
    } catch (error: any) {
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
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Token endpoints
  app.get('/api/tokens', async (req, res) => {
    try {
      const tokens = await SubAccountToken.find({}, 'locationId pitToken');
      res.json(tokens);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/tokens/:locationId', async (req, res) => {
    try {
      const tokenDoc = await SubAccountToken.findOne({ locationId: req.params.locationId });
      if (!tokenDoc) return res.status(404).json({ error: 'Token not found' });
      res.json({ token: tokenDoc.pitToken });
    } catch (error: any) {
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
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Proxy to fetch locations
  // Depending on whether it's an agency token or sub-account token,
  // GET /locations usually works for getting the associated location(s).
  // If it's a sub-account token, it might just return the single location.
  app.get('/api/locations', async (req, res) => {
    try {
      // In v2, /locations endpoint can be fetched directly or /locations/search.
      // We'll try the v2 /locations/search or just use v2 /locations?companyId=...
      // Another common way for Sub-Account tokens is just GET /locations/{locationId}
      // But we don't know the location ID. 
      // Let's try GET /locations or /locations/search
      const response = await fetch('https://services.leadconnectorhq.com/locations/search', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${await getAuthToken(req)}`,
          'Version': '2021-07-28',
          'Accept': 'application/json'
        }
      });
      
      let data = await response.json();
      
      // If it fails with 401/404, we might just be using a location token that doesn't have access to search.
      if (!response.ok) {
         console.error('Locations search failed:', data);
         // For the dashboard to not break, we might return a dummy location so it can attempt to fetch call logs
         // if it's a sub-account token, maybe we can fetch the token's info? There's a GET /oauth/token/info but this is PIT.
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
      // Look up token in DB first
      let tokenToUse = req.headers['x-ghl-token'] as string;
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

  // Proxy to fetch agents securely
  app.get('/api/agents', async (req, res) => {
    const { locationId } = req.query;
    if (!locationId || typeof locationId !== 'string') {
      return res.status(400).json({ error: 'locationId is required' });
    }
    
    try {
      let tokenToUse = req.headers['x-ghl-token'] as string;
      const dbToken = await SubAccountToken.findOne({ locationId });
      if (dbToken && dbToken.pitToken) {
        tokenToUse = dbToken.pitToken;
      }

      if (!tokenToUse) {
        return res.status(401).json({ error: 'No Private Integration Token configured' });
      }

      const response = await fetch(`https://services.leadconnectorhq.com/voice-ai/agents?locationId=${locationId}`, {
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
      res.status(500).json({ error: 'Failed to fetch agents' });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
