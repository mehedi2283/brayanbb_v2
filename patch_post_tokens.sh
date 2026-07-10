cat << 'INNER_EOF' > rep_post.js
app.post('/api/tokens/:locationId', requireAdmin, async (req, res) => {
  const { locationId } = req.params;
  const { pitToken, locationName } = req.body;
  if (!locationId) return res.status(400).json({ error: 'locationId is required' });
  if (!pitToken) return res.status(400).json({ error: 'pitToken is required' });

  try {
    const updateData = { pitToken, updatedAt: Date.now() };
    if (locationName) {
      updateData.locationName = locationName;
    }
    await SubAccountToken.findOneAndUpdate(
      { locationId },
      updateData,
      { new: true, upsert: true }
    );
    res.json({ success: true, message: 'Sub-account PIT token saved successfully', locationId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
INNER_EOF

# Replace lines 284-300 with rep_post.js
head -n 283 server.js > new_server3.js
cat rep_post.js >> new_server3.js
tail -n +301 server.js >> new_server3.js
mv new_server3.js server.js
