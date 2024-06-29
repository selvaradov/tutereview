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
router.post('/update-profile', async (req, res) => {
  if (!req.user) {
    console.error('Unauthorized request to update profile');
    return res.status(401).json({ error: 'Unauthorized' });
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

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'Profile updated successfully', user });
  } catch (error) {
    res.status(500).json({ message: 'Error updating profile', error });
  }
});

export default router;