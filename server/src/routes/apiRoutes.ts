import { Router, Request, Response } from 'express';
import { readJsonFile } from '../utils/fileOperations.js';
import { escapeRegex } from '../utils/sanitise.js';
import Review from '../models/review.js';

const router = Router();

// subjects endpoint
router.get('/subjects', async (req: Request, res: Response) => {
  try {
    const subjectData = await readJsonFile('data/subjects.json');
    res.json(subjectData);
  } catch (error) {
    console.error('Error fetching subjects:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// questions endpoint
router.get('/questions', async (req: Request, res: Response) => {
  try {
    const questionData = await readJsonFile('data/questions.json');
    res.json(questionData);
  } catch (error) {
    console.error('Error fetching questions:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// search endpoint
interface QueryParams {
  "responses.tutor"?: { $regex: RegExp, $options: string };
  "responses.subject"?: { $regex: RegExp, $options: string };
  "responses.paperCode"?: { $regex: RegExp, $options: string };
}

router.get('/search', async (req: Request, res: Response) => {
  try {
    const allowedParams = ['tutor', 'subject', 'paper'];
    const queryParams = Object.keys(req.query);

    const hasUnexpectedParam = queryParams.some(param => !allowedParams.includes(param));
    if (hasUnexpectedParam) {
      return res.status(400).json({error: 'Unexpected query parameters provided.'});
    }

    const tutor = typeof req.query.tutor === 'string' ? req.query.tutor : undefined;
    const subject = typeof req.query.subject === 'string' ? req.query.subject : undefined;
    const paperCode = typeof req.query.paper === 'string' ? req.query.paper : undefined;

    const query: QueryParams = {};

    if (tutor) query['responses.tutor'] = { $regex: escapeRegex(tutor), $options: 'i' };
    if (subject) query['responses.subject'] = { $regex: escapeRegex(subject), $options: 'i' };
    if (paperCode) query['responses.paperCode'] = { $regex: escapeRegex(paperCode), $options: 'i' };

    const reviews = await Review.find(query, { _id: 0, submitter: 0, __v: 0 }); // Exclude sensitive fields
    res.json(reviews);
  } catch (err) {
    console.error('Error searching reviews:', err);
    res.status(500).json({error: 'Error searching reviews.'});
  }
});

// review endpoint
router.post('/review', async (req: Request, res: Response) => {
  if (!req.user) {
    console.error('Unauthorized request to submit review');
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const submitter = req.user.id;
  const review = new Review({
    submitter,
    responses: req.body, // TODO validate and sanitise (e.g. we're keeping in `paper` which duplicates `paperCode`)
  });
  try {
    await review.save();
    res.json({ message: 'Review submitted successfully!' });
  } catch (err) {
    console.error('Error submitting review:', err);
    res.status(500).json({ error: 'Error submitting review.' });
  }
});

export default router;