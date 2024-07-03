import { Router } from 'express';
import { ParsedQs } from 'qs';
import { readJsonFile } from '../utils/fileOperations.js';
import { escapeRegex } from '../utils/sanitise.js';
import Review from '../models/review.js';
import User from '../models/user.js';

const router = Router();

// subjects endpoint
router.get('/subjects', async (req, res) => {
  try {
    const subjectData = await readJsonFile('data/subjects.json');
    res.json(subjectData);
  } catch (error) {
    console.error('Error fetching subjects:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// questions endpoint
router.get('/questions', async (req, res) => {
  try {
    const questionData = await readJsonFile('data/questions.json');
    res.json(questionData);
  } catch (error) {
    console.error('Error fetching questions:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// colleges endpoint
router.get('/colleges', async (req, res) => {
  try {
    const collegeData = await readJsonFile('data/colleges.json');
    res.json(collegeData);
  } catch (error) {
    console.error('Error fetching colleges:', error);
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
  college: "array",
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

router.get('/search', async (req, res) => {
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

    if (req.query.college) {
      const colleges = Array.isArray(req.query.college) ? req.query.college : [req.query.college];
      query['college'] = {
        $in: colleges.filter((c): c is string => typeof c === 'string')
          .map(c => new RegExp(escapeRegex(c), 'i'))
      };
    }

    const reviews = await Review.find(query, { _id: 0, submitter: 0, __v: 0 }); // Exclude sensitive fields
    res.json(reviews);
  } catch (err) {
    console.error('Error searching reviews:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// tutors endpoint
const allowedTutorParams: AllowedParamsSchema = {
  search: "string",
};

router.get('/tutors', async (req, res) => {
  try {
    if (hasInvalidParams(req.query, allowedTutorParams)) {
      return res.status(400).json({ error: 'Invalid query parameters or formats provided.' });
    }

    const searchTerm = typeof req.query.search === 'string' ? req.query.search : '';
    const regex = new RegExp(escapeRegex(searchTerm), 'i');

    const tutors = await Review.aggregate([
      { $match: { 'responses.tutor': { $regex: regex } } },
      { $group: { _id: '$responses.tutor' } }, // Deduplicate
      { $addFields: { lowerCaseName: { $toLower: '$_id' } } },
      { $sort: { lowerCaseName: 1 } }, // Case-insensitive sorting
      { $project: { name: '$_id', _id: 0 } } // Swap `_id` to `name`
    ]);

    res.json(tutors);
  } catch (err) {
    console.error('Error fetching tutors:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});


// review endpoint
router.post('/review', async (req, res) => {
  if (!req.user) {
    console.error('Unexpected unauthorized request to submit review');
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const submitter = req.user.id;
  try {
    const user = await User.findById(submitter);
    if (!user) {
      console.error('User not found:', submitter);
      return res.status(404).json({ error: 'User not found' });
    }

    const review = new Review({
      submitter,
      responses: req.body, // TODO validate and sanitise (e.g. we're keeping in `paper` which duplicates `paperCode`)
      // people could theoretically send an option that isn't supported by the frontend if they do so manually
      college: user.college
    });

    await review.save();
    res.json({ message: 'Review submitted successfully!' });
  } catch (err) {
    console.error('Error submitting review:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;