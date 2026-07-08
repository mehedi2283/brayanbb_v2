// Example backend code (index.js)
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// --- 1. Update your User Schema ---
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'client'], default: 'client' },
  tutorialCompleted: { type: Boolean, default: false } // <-- ADD THIS LINE
});
const User = mongoose.model('User', userSchema);

// --- Middleware for Auth ---
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.sendStatus(401);

  jwt.verify(token, process.env.JWT_SECRET || 'secret', (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// --- 2. Update your Login Route ---
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ email: user.email, role: user.role }, process.env.JWT_SECRET || 'secret');
    
    // Make sure you send back tutorialCompleted
    res.json({
      token,
      user: {
        email: user.email,
        role: user.role,
        tutorialCompleted: user.tutorialCompleted // <-- ADD THIS LINE
      }
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// --- 3. Add the Tutorial Complete Route ---
app.post('/api/users/tutorial', authenticateToken, async (req, res) => {
  try {
    const { email } = req.body;
    
    // Ensure users can only update their own status (optional security check)
    if (req.user.email !== email) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    await User.findOneAndUpdate(
      { email },
      { tutorialCompleted: true }
    );
    
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update tutorial status' });
  }
});

// --- Other routes (agency-key, locations, users, etc.) go below ---
// ...

const PORT = process.env.PORT || 5000;
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/ghl-dashboard')
  .then(() => {
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch(err => console.error(err));
