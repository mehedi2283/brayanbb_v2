app.post('/api/users/tutorial', authenticateToken, async (req, res) => {
  try {
    // Only allow users to update their own tutorial status unless admin
    if (req.user.role !== 'admin' && req.user.email !== req.body.email) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    
    await User.findOneAndUpdate(
      { email: req.body.email },
      { tutorialCompleted: true }
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
