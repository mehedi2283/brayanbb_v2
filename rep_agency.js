app.post('/api/agency-key', requireAdmin, async (req, res) => {
  const { agencyApiKey } = req.body;
  if (!agencyApiKey) return res.status(400).json({ error: 'agencyApiKey is required' });

  try {
    // Verify the key first by attempting to fetch locations
    const response = await fetch('https://services.leadconnectorhq.com/locations/search', {
      method: 'GET',
      headers: {
        Authorization: \`Bearer \${agencyApiKey}\`,
        Version: '2021-07-28',
        Accept: 'application/json'
      }
    });

    if (!response.ok) {
      return res.status(400).json({ error: 'Invalid Agency API Key. Verification failed.' });
    }

    // Save to database since it's verified
    await AgencyConfig.findOneAndUpdate(
      { id: 'default' },
      { agencyApiKey, updatedAt: Date.now() },
      { new: true, upsert: true }
    );
    res.json({ success: true, message: 'Agency API key verified and saved successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
