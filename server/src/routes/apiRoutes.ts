import { Router, Request, Response } from 'express';
import { ParsedQs } from 'qs';
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
type AllowedParamType = 'string' | 'array';

interface AllowedParamsSchema {
  [key: string]: AllowedParamType;
}
const allowedSearchParams: AllowedParamsSchema = {
  tutor: "string",
  subject: "string",
  paper: "array",
};

function isValidParam(value: unknown, expectedType: AllowedParamType): boolean {
  if (expectedType === 'string') {
    return typeof value === 'string';
  } else if (expectedType === 'array') {
    return Array.isArray(value) && value.every(item => typeof item === 'string');
  }
  return false;
}

function hasInvalidParams(queryParams: ParsedQs, schema: AllowedParamsSchema): boolean {
  return Object.entries(queryParams).some(([param, value]) => {
    const expectedType = schema[param];
    return !expectedType || !isValidParam(value, expectedType);
  });
}

router.get('/search', async (req: Request, res: Response) => {
  try {
    if (hasInvalidParams(req.query, allowedSearchParams)) {
      return res.status(400).json({ error: 'Invalid query parameters or formats provided.' });
    }

    const query: Record<string, any> = {};

    if (typeof req.query.tutor === 'string' && req.query.tutor.trim() !== '') {
      query['responses.tutor'] = { $regex: escapeRegex(req.query.tutor), $options: 'i' };
    }

    if (typeof req.query.subject === 'string' && req.query.subject.trim() !== '') {
      query['responses.subject'] = { $regex: escapeRegex(req.query.subject), $options: 'i' };
    }

    if (req.query.paper) {
      const papers = Array.isArray(req.query.paper) ? req.query.paper : [req.query.paper];
      query['responses.paperCode'] = { 
        $in: papers.filter((p): p is string => typeof p === 'string')
                   .map(p => new RegExp(escapeRegex(p), 'i'))
      };
    }

    const reviews = await Review.find(query, { _id: 0, submitter: 0, __v: 0 }); // Exclude sensitive fields
    res.json(reviews);
  } catch (err) {
    console.error('Error searching reviews:', err);
    res.status(500).json({ error: 'Error searching reviews.' });
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