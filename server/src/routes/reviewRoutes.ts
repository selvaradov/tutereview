import { Router, Request, Response } from 'express';
import { readJsonFile } from '../utils/fileOperations.js';
import Review from '../models/review.js';

const router = Router();

const questionData = await readJsonFile('data/questions.json')
const subjectData = await readJsonFile('data/subjects.json')

// form submission page
router.get('/review', async (req: Request, res: Response) => {
  res.render('pages/reviewForm', {
    questions: questionData,
    subjects: subjectData
  });
});

// form submission endpoint
function assertHasUser(req: Request): asserts req is Request & { user: Express.User } {
  if (!req.user) {
    throw new Error("Request object without user found unexpectedly");
  }
}

router.post('/review', async (req: Request, res: Response) => {
  assertHasUser(req);
  const submitter = req.user.id;
  const review = new Review({
    submitter,
    responses: req.body, // TODO validate and sanitise (e.g. we're keeping in `paper` which duplicates `paperCode`)
  });

  try {
    await review.save();
    res.send('Review submitted successfully!');
  } catch (err) {
    console.error('Error submitting review:', err);
    res.status(500).send('Error submitting review.');
  }
});

// search page
router.get('/search', (req: Request, res: Response) => {
  res.render('pages/searchReviews', {
    results: null, // Initially, no search results
    questions: questionData,
    subjects: subjectData
  });
});

export default router;