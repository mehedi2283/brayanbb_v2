app.get('/api/locations', authenticateToken, async (req, res) => {
  try {
    const token = await getAgencyToken();
    if (!token) {
      let storedTokens = await SubAccountToken.find({});
      if (req.user.role === 'client') {
        storedTokens = storedTokens.filter(t => t.locationId === req.user.locationId);
      }
      const storedLocations = storedTokens.map(t => ({ locationId: t.locationId, name: t.locationId }));
      return res.status(401).json({ error: 'No Agency API Key configured', storedLocations });
    }

    const response = await fetch('https://services.leadconnectorhq.com/locations/search', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        Version: '2021-07-28',
        Accept: 'application/json'
      }
    });

    const data = await response.json();
    if (!response.ok) {
      let storedTokens = await SubAccountToken.find({});
      if (req.user.role === 'client') {
        storedTokens = storedTokens.filter(t => t.locationId === req.user.locationId);
      }
      const storedLocations = storedTokens.map(t => ({ locationId: t.locationId, name: t.locationId }));
      return res.status(response.status).json({ ...data, storedLocations });
    }
    
    // If the user is a client, only return their specific location
    if (req.user.role === 'client') {
      const clientLocation = data.locations?.find(loc => loc.id === req.user.locationId);
      return res.json({ locations: clientLocation ? [clientLocation] : [] });
    }

    res.json(data);
  } catch (err) {
    console.error('Failed to fetch locations:', err);
    try {
      let storedTokens = await SubAccountToken.find({});
      if (req.user.role === 'client') {
        storedTokens = storedTokens.filter(t => t.locationId === req.user.locationId);
      }
      const storedLocations = storedTokens.map(t => ({ locationId: t.locationId, name: t.locationId }));
      res.status(500).json({ error: 'Failed to fetch locations', storedLocations });
    } catch (dbErr) {
      res.status(500).json({ error: 'Failed to fetch locations' });
    }
  }
});
