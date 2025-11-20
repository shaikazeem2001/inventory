const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Temporary endpoint to promote user to admin (for development only)
router.post('/promote-admin/:username', async (req, res) => {
  try {
    const { username } = req.params;
    const user = await User.findOne({ username });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    user.role = 'admin';
    await user.save();
    
    res.json({ 
      message: `User ${username} promoted to admin`,
      user: {
        username: user.username,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
