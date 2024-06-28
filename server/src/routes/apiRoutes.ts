import { Router, Request, Response } from 'express';
import { readJsonFile } from '../utils/fileOperations.js';
import { escapeRegex } from '../utils/sanitise.js';
import Review from '../models/review.js';

const router = Router();

const questionData = await readJsonFile('data/questions.json')
const subjectData = await readJsonFile('data/subjects.json')

// subjects endpoint
router.get('/subjects', (req: Request, res: Response) => {
  res.json(subjectData);
});

// search endpoint
interface QueryParams {
  "responses.tutor"?: { $regex: RegExp, $options: string };
  "responses.subject"?: { $regex: RegExp, $options: string };
  "responses.paperCode"?: { $regex: RegExp, $options: string };
}

router.get('/search', async (req: Request, res: Response) => {
  try {
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
    res.status(500).send('Error searching reviews.');
  }
});

export default router;