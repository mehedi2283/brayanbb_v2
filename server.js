require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const app = express();
const PORT = process.env.PORT || 4001;
const JWT_SECRET = process.env.JWT_SECRET || 'ghl-dashboard-super-secret-key-123';

/*
|--------------------------------------------------------------------------
| Middleware
|--------------------------------------------------------------------------
*/

app.use(express.json({ limit: '10mb' }));

app.use(cors({
  origin: '*', // Allow all origins so AI Studio works. For production, set FRONTEND_URL
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

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'client'], default: 'client' },
  locationId: { type: String } // Only required for clients
});

const User = mongoose.model('User', UserSchema);

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
| Auth Middleware
|--------------------------------------------------------------------------
*/

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ error: 'Access denied. No token provided.' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid token.' });
    req.user = user;
    next();
  });
}

function requireAdmin(req, res, next) {
  authenticateToken(req, res, () => {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required.' });
    }
    next();
  });
}

/*
|--------------------------------------------------------------------------
| Auth Routes
|--------------------------------------------------------------------------
*/

// One-time setup to create the first admin if none exists
app.post('/api/auth/setup', async (req, res) => {
  try {
    const adminCount = await User.countDocuments({ role: 'admin' });
    if (adminCount > 0) {
      return res.status(400).json({ error: 'Admin already exists. Use the login route.' });
    }

    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const admin = new User({ email, password: hashedPassword, role: 'admin' });
    await admin.save();
    
    res.json({ success: true, message: 'First admin created successfully. You can now login.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: 'Invalid credentials' });

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return res.status(400).json({ error: 'Invalid credentials' });

    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role, locationId: user.locationId },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: { email: user.email, role: user.role, locationId: user.locationId }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/users', requireAdmin, async (req, res) => {
  try {
    const users = await User.find({}, '-password'); // Exclude passwords
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/users', requireAdmin, async (req, res) => {
  const { email, password, role, locationId } = req.body;
  try {
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ error: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ email, password: hashedPassword, role: role || 'client', locationId });
    await user.save();
    res.json({ success: true, message: 'User created successfully', user: { email: user.email, role: user.role, locationId: user.locationId } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/users/:email', requireAdmin, async (req, res) => {
  try {
    await User.findOneAndDelete({ email: req.params.email });
    res.json({ success: true, message: 'User deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

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
| Config & Token Routes (Admin Only)
|--------------------------------------------------------------------------
*/

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

/*
|--------------------------------------------------------------------------
| Protected GHL Routes
|--------------------------------------------------------------------------
*/

app.get('/api/locations', authenticateToken, async (req, res) => {
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
    
    // If the user is a client, only return their specific location
    if (req.user.role === 'client') {
      const clientLocation = data.locations?.find(loc => loc.id === req.user.locationId);
      return res.json({ locations: clientLocation ? [clientLocation] : [] });
    }

    res.json(data);
  } catch (err) {
    console.error('Failed to fetch locations:', err);
    res.status(500).json({ error: 'Failed to fetch locations' });
  }
});

app.get('/api/call-logs', authenticateToken, async (req, res) => {
  const { locationId } = req.query;
  if (!locationId || typeof locationId !== 'string') return res.status(400).json({ error: 'locationId is required' });

  // Security check: Clients can only access their own location
  if (req.user.role === 'client' && req.user.locationId !== locationId) {
    return res.status(403).json({ error: 'Forbidden. You can only view your own location.' });
  }

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

app.get('/api/agents', authenticateToken, async (req, res) => {
  const { locationId } = req.query;
  if (!locationId || typeof locationId !== 'string') return res.status(400).json({ error: 'locationId is required' });

  // Security check: Clients can only access their own location
  if (req.user.role === 'client' && req.user.locationId !== locationId) {
    return res.status(403).json({ error: 'Forbidden' });
  }

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
