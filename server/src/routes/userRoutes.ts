import { Router } from 'express';
import { readJsonFile } from '../utils/fileOperations.js';
import User from '../models/user.js';

const router = Router();

// user options endpoint
router.get('/options', async (req, res) => {
  try {
    const userOptions = await readJsonFile('data/userOptions.json');
    res.json(userOptions);
  } catch (error) {
    console.error('Error fetching user options:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// update profile endpoint
router.post('/profile', async (req, res) => {
  if (!req.user) {
    console.error('Unauthorized request to update profile');
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const user = await User.findById(req.user.id);

  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  if (user.isProfileComplete) {
    return res.status(403).json({ message: 'Profile is already complete and cannot be updated' });
  }

  const { college, year, subject } = req.body;

  try {
    const user = await User.findByIdAndUpdate(
      req.user.id,
      {
        college,
        year,
        subject,
        isProfileComplete: true,
      },
      { new: true }
    );

    res.json({ message: 'Profile updated successfully', user });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// fetch profile endpoint
router.get('/profile', async (req, res) => {
  if (!req.user) {
    console.error('Unauthorized request to fetch profile');
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      college: user.college,
      year: user.year,
      subject: user.subject,
    });
  } catch (error) {
    console.error('Error fetching user profile:', error)
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;