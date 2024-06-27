import { Router, Request, Response } from 'express';
import { readJsonFile } from '../utils/fileOperations.js';
import { escapeRegex } from '../utils/sanitise.js';
import Review from '../models/review.js';

const router = Router();
const jsonData = await readJsonFile('data/form.json')

// form submission page
router.get('/review', async (req: Request, res: Response) => {
  res.render('pages/reviewForm', {
    questions: jsonData.questions,
    subjects: jsonData.subjects
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
  const { subject, paper, name: tutor, know: knowledge, explain: clarity, comments: additionalComments } = req.body;
  const submitter = req.user.id;
  const review = new Review({
    submitter,
    subject,
    paper,
    tutor,
    knowledge,
    clarity,
    additionalComments
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
    questions: jsonData.questions,
    subjects: jsonData.subjects
  });
});

// search endpoint
interface QueryParams {
  tutor?: object;
  subject?: object;
  paper?: object;
}

router.get('/api/search', async (req: Request, res: Response) => {
  try {
    const tutor = typeof req.query.tutor === 'string' ? req.query.tutor : undefined;
    const subject = typeof req.query.subject === 'string' ? req.query.subject : undefined;
    const paper = typeof req.query.paper === 'string' ? req.query.paper : undefined;

    const query: QueryParams = {};

    if (tutor) query.tutor = { $regex: escapeRegex(tutor), $options: 'i' };
    if (subject) query.subject = { $regex: escapeRegex(subject), $options: 'i' };
    if (paper) query.paper = { $regex: escapeRegex(paper), $options: 'i' };

    const reviews = await Review.find(query, { _id: 0, submitter: 0, __v: 0 }); // Exclude sensitive fields
    res.json(reviews);
  } catch (err) {
    console.error('Error searching reviews:', err);
    res.status(500).send('Error searching reviews.');
  }
});

export default router;