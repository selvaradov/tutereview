import { Router, Request, Response, NextFunction } from 'express';
import { ParsedQs } from 'qs';
import { readJsonFile } from '../utils/fileOperations.js';
import { escapeRegex } from '../utils/sanitise.js';
import Review, { IProcessedReview } from '../models/review.js';
import User from '../models/user.js';
import * as crypto from 'crypto';
import { validateReview, sanitizeReview } from '../controllers/reviewController.js';
import { validationResult } from 'express-validator';

const router = Router();

// papers endpoint
router.get('/papers', async (req, res) => {
  try {
    const papersData = await readJsonFile('data/papers.json');
    res.json(papersData);
  } catch (error) {
    console.error('Error fetching papers:', error);
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

    const reviews = await Review.find(query, {submitter: 0, __v: 0 }); // Exclude sensitive fields

    // Hash IDs to avoid leaking timestamps and create isOld flag
    const processedReviews: IProcessedReview[] = reviews.map(review => {
      const reviewObj = review.toObject();
      const isOld = new Date().getTime() - new Date(reviewObj.submittedAt).getTime() > 3 * 365 * 24 * 60 * 60 * 1000;
      return {
        ...reviewObj,
        _id: crypto.createHash('sha256').update(reviewObj._id.toString()).digest('hex'),
        isOld,
      };
    });

    // Group reviews by paper and tutor to determine which colleges to display
    const groupedReviews = processedReviews.reduce((acc, review) => {
      const key = `${review.responses.paper}-${review.responses.tutor}`;
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(review);
      return acc;
    }, {} as Record<string, IProcessedReview[]>);

    // Prepare college filter for final reviews
    const requestedColleges = Array.isArray(req.query.college) 
      ? req.query.college.filter((c): c is string => typeof c === 'string')
      : typeof req.query.college === 'string' ? [req.query.college] : [];

    // List only colleges that have 3 or more recent reviews for a given paper-tutor combination
    const finalReviews = Object.values(groupedReviews)
    .filter(group => {
      if (requestedColleges.length === 0) return true;
      const recentCollegeCount = group.reduce((acc, review) => {
        if (!review.isOld) {
          acc[review.college] = (acc[review.college] || 0) + 1;
        }
        return acc;
      }, {} as Record<string, number>);
      return requestedColleges.some(college => (recentCollegeCount[college] || 0) >= 3);
    })
    .flatMap(group => {
      const recentCollegeCount = group.reduce((acc, review) => {
        if (!review.isOld) {
          acc[review.college] = (acc[review.college] || 0) + 1;
        }
        return acc;
      }, {} as Record<string, number>);

      const displayedColleges = Object.entries(recentCollegeCount)
        .filter(([_, count]) => count >= 3)
        .map(([college]) => college);

      return group.map(review => ({
        ...review,
        college: displayedColleges.length > 0 ? displayedColleges : undefined,
        submittedAt: undefined,
      }));
    });

      res.json({
        reviews: finalReviews,
        collegeFilterApplied: requestedColleges.length > 0
      });
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
router.post('/review', validateReview, sanitizeReview, async (req: Request, res: Response) => {
  if (!req.user) {
    console.error('Unexpected unauthorized request to submit review');
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const submitter = req.user.id;
  try {
    const user = await User.findById(submitter);
    if (!user) {
      console.error('User not found:', submitter);
      return res.status(404).json({ error: 'User not found' });
    }

    const existingReview = await Review.findOne({
      submitter,
      'responses.paper': req.body.responses.paper,
    });
    if (existingReview) {
      return res.status(400).json({ error: 'Duplicate review: You have already submitted a review for this paper.' });
    }

    const review = new Review({
      submitter,
      responses: req.body.responses,
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