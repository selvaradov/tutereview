import { Request, Response, NextFunction } from 'express';
import { body, ValidationChain } from 'express-validator';
import sanitizeHtml from 'sanitize-html';
import questions from '../data/questions.json';
import papers from '../data/papers.json';

// Type definitions
interface Question {
  id: string;
  question: string;
  type: string;
  required: boolean;
  options?: string[];
  guidance?: string;
}

interface Paper {
  id: string;
  code: string;
  name: string;
  level: string;
}

interface PaperInfo {
  [paperId: string]: {
    subject: string;
    code: string;
    name: string;
    level: string;
  };
}

type Papers = {
  [subject: string]: Paper[];
};

// Asserting the type of imported JSON
const typedQuestions = questions as Question[];
const typedPapers = papers as Papers;

// Helper function to get valid paper information
const getValidPaperInfo = (): PaperInfo => {
  const paperInfo: PaperInfo = {};
  Object.entries(typedPapers).forEach(([subject, subjectPapers]) => {
    subjectPapers.forEach(paper => {
      paperInfo[paper.id] = {
        subject,
        code: paper.code,
        name: paper.name,
        level: paper.level
      };
    });
  });
  return paperInfo;
};

const validPaperInfo = getValidPaperInfo();

const ignoreOptions = ['subject', 'paper']; // For these questions we'll check the values for consistency later,
// so there's no need to enforce options in the switch case for `dropdown`

const getExpectedResponseKeys = (): string[] => {
  return typedQuestions.map(q => q.id).concat(['paperCode', 'paperName', 'paperLevel']);
};

const expectedResponseKeys = getExpectedResponseKeys();

// Validation middleware
const validateReview: ValidationChain[] = [
  // Check the responses object is an object and has only the expected keys
  body('responses').isObject().withMessage('Responses must be an object')
    .custom((responses: Record<string, any>) => {
      const unexpectedKeys = Object.keys(responses).filter(key => !expectedResponseKeys.includes(key));
      if (unexpectedKeys.length > 0) {
        throw new Error(`Unexpected fields in responses: ${unexpectedKeys.join(', ')}`);
      }
      return true;
    }),
  // Check the responses object has all required keys
  ...typedQuestions.map(question =>
    body(`responses.${question.id}`)
      .optional({ nullable: true, checkFalsy: true })
      .custom((value, { req }) => {
        if (value === undefined || value === null || value === '') {
          if (question.required) {
            throw new Error(`${question.id} is required`);
          }
          return true;
        }
      // Check the value is of the correct type and format
        switch (question.type) {
          case 'dropdown':
          case 'radio':
            if (!ignoreOptions.includes(question.id) && !question.options?.includes(value)) {
              console.log(value, question.options)
              throw new Error(`Invalid value for ${question.id}`);
            }
            break;
          case 'select':
            if (!Array.isArray(value) || !value.every(val => question.options?.includes(val))) {
              throw new Error(`Invalid value for ${question.id}`);
            }
            break;
          case 'rating':
            if (!Number.isInteger(value) || value < 1 || value > 5) {
              throw new Error(`Invalid value for ${question.id}`);
            }
            break;
          case 'text':
          case 'textarea':
            if (typeof value !== 'string') {
              throw new Error(`Invalid value for ${question.id}`);
            }
            break;
          default:
            throw new Error(`Invalid question type: ${question.type}`);
        }
        return true;
      })
  ),
  // Check the paper, subject, paperCode, paperName and paperLevel fields are valid and consistent
  body('responses.paper').custom((value: string, { req }) => {
    const paperInfo = validPaperInfo[value];
    if (!paperInfo) {
      throw new Error('Invalid paper');
    }
    if (paperInfo.subject !== req.body.responses.subject) {
      throw new Error('Paper does not match selected subject');
    }
    if (paperInfo.code !== req.body.responses.paperCode) {
      throw new Error('Paper code does not match selected paper');
    }
    if (paperInfo.name !== req.body.responses.paperName) {
      throw new Error('Paper name does not match selected paper');
    }
    if (paperInfo.level !== req.body.responses.paperLevel) {
      throw new Error('Paper level does not match selected paper');
    }
    return true;
  }),
];

// Sanitization middleware
const sanitizeReview = (req: Request, res: Response, next: NextFunction) => {
  if (req.body && req.body.responses) {
    for (const [key, value] of Object.entries(req.body.responses)) {
      if (typeof value === 'string') {
        req.body.responses[key] = sanitizeHtml(value, {
          allowedTags: [],
          allowedAttributes: {}
        });
      }
    }
  }
  next();
};

export { validateReview, sanitizeReview };