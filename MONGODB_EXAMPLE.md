# MongoDB Integration Example for GoHighLevel Sub-Account Tokens

This guide explains how to migrate the local storage token persistence to a secure MongoDB backend. Share this document with your developer.

## 1. MongoDB Schema Design

You will need a collection to store the Private Integration Tokens (PITs) for each sub-account securely. Optionally, you can also store the Agency API key in a separate collection.

### Schema Example (Node.js / Mongoose)

```javascript
const mongoose = require('mongoose');

// Schema for Sub-Account Level Configuration
const SubAccountTokenSchema = new mongoose.Schema({
  locationId: { type: String, required: true, unique: true, index: true },
  locationName: { type: String },
  pitToken: { type: String, required: true }, // The Private Integration Token
  updatedAt: { type: Date, default: Date.now }
});

// Optional: Schema for Agency Level Configuration (if needed)
const AgencyConfigSchema = new mongoose.Schema({
  agencyId: { type: String, required: true, unique: true },
  agencyApiKey: { type: String, required: true },
  updatedAt: { type: Date, default: Date.now }
});

const SubAccountToken = mongoose.model('SubAccountToken', SubAccountTokenSchema);
const AgencyConfig = mongoose.model('AgencyConfig', AgencyConfigSchema);

module.exports = { SubAccountToken, AgencyConfig };
```

> **Security Note:** In a production environment, you should encrypt the `pitToken` before saving it to MongoDB and decrypt it when reading it out, since it provides access to client data.

---

## 2. API Endpoints (Express.js)

Create REST endpoints on your backend server to securely get and update these tokens. This prevents exposing all tokens directly to the client browser.

```javascript
const express = require('express');
const router = express.Router();
const { SubAccountToken } = require('./models');

// GET all configured sub-account tokens
// (Used to populate the Sub-Accounts table in the dashboard)
router.get('/api/tokens', async (req, res) => {
  try {
    // Only fetch the locationId and locationName, do NOT send the actual pitToken to the client for security,
    // OR if you must show it/manage it on the client, you can send it here.
    const tokens = await SubAccountToken.find({}, 'locationId pitToken locationName');
    res.json(tokens);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET token for a specific sub-account
router.get('/api/tokens/:locationId', async (req, res) => {
  try {
    const tokenDoc = await SubAccountToken.findOne({ locationId: req.params.locationId });
    if (!tokenDoc) return res.status(404).json({ error: 'Token not found' });
    res.json({ token: tokenDoc.pitToken });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST (Upsert) token for a specific sub-account
// (Triggered when the user clicks "Apply Token" in the UI)
router.post('/api/tokens/:locationId', async (req, res) => {
  const { locationId } = req.params;
  const { pitToken, locationName } = req.body;

  try {
    const updatedToken = await SubAccountToken.findOneAndUpdate(
      { locationId },
      { pitToken, locationName, updatedAt: Date.now() },
      { new: true, upsert: true } // Creates the document if it doesn't exist
    );
    res.json(updatedToken);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
```

---

## 3. Frontend React Integration

In the React application (`App.tsx`), your developer will replace the `localStorage` logic with `fetch` requests to your new Node.js API.

### A. Saving a Token

When the user applies a token in the UI:

```typescript
// Replace the old localStorage approach:
// localStorage.setItem(`ghl_token_${locId}`, token);

// With an API call:
const saveTokenToMongo = async (locId: string, token: string, locName: string) => {
  try {
    await fetch(`/api/tokens/${locId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pitToken: token, locationName: locName })
    });
    console.log('Token saved securely to database.');
  } catch (error) {
    console.error('Failed to save token to MongoDB', error);
  }
};
```

### B. Loading Tokens on Startup

When the Sub-Accounts table mounts, load the tokens from the database instead of scanning `localStorage`:

```typescript
// Inside the SubAccountsView component:
const [tokens, setTokens] = useState<Record<string, string>>({});

useEffect(() => {
  const fetchAllTokens = async () => {
    try {
      const response = await fetch('/api/tokens');
      const data = await response.json();
      
      // Map the array from MongoDB into the key-value dictionary the UI expects
      const tokenMap: Record<string, string> = {};
      data.forEach((item: any) => {
        tokenMap[item.locationId] = item.pitToken;
      });
      
      setTokens(tokenMap);
    } catch (error) {
      console.error('Failed to load tokens from MongoDB', error);
    }
  };
  
  fetchAllTokens();
}, []);
```

### C. Backend API Proxy (Important)

For making actual GoHighLevel API calls, instead of the frontend calling `fetchCallLogs` directly and passing the token, the frontend should just tell the Node.js backend: *"Get call logs for Location X"*. 

The Node.js backend should look up the `pitToken` in MongoDB, and make the request to GoHighLevel itself. This completely hides the API keys from the browser network tab.

---

## 4. Total Required API Endpoints Summary

To fully implement this securely, your developer will need to build **4 to 5 total endpoints** on the Node.js backend:

**Token Management (Database):**
1. `GET /api/tokens` - Returns the list of configured sub-accounts to display in the dashboard table.
2. `POST /api/tokens/:locationId` - Saves or updates the PIT token for a specific sub-account when you click "Apply Token".

**GoHighLevel Proxy (External API):**
3. `GET /api/ghl/locations` - Uses the Agency API Key to fetch all locations (replaces the frontend `fetchLocations`).
4. `GET /api/ghl/call-logs/:locationId` - The backend looks up the PIT token for the given `locationId` in MongoDB, calls the GHL Voice API, and returns the data to the frontend (replaces the frontend `fetchCallLogs`).
