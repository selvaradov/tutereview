import { Router } from 'express';
import { readJsonFile } from '../utils/fileOperations.js';
import User from '../models/user.js';
import Review from '../models/review.js';

const router = Router();

// user options endpoint
router.get('/options', async (req, res) => {
  try {
    const collegesData = await readJsonFile('data/colleges.json');
    const subjectsData = await readJsonFile('data/subjects.json');
    const yearsData = await readJsonFile('data/years.json');

    const userOptions = {
      colleges: collegesData,
      years: yearsData.map((year: string, index: number) => ({
        value: (index + 1).toString(),
        label: year
      })),
      subjects: subjectsData
    };

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
  console.log(req.body);

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

// fetch reviews endpoint
router.get('/reviews', async (req, res) => {
  if (!req.user) {
    console.error('Unauthorized request to fetch user reviews');
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const reviews = await Review.find({ submitter: req.user.id }, { responses: 1, submittedAt: 1 })
      .sort({ submittedAt: -1 })
      .lean();

    res.json(reviews);
  } catch (error) {
    console.error('Error fetching user reviews:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;