export interface Paper {
  code: string;
  name: string;
  level: string;
  id: string;
}

export interface SubjectToPapersMap {
  [key: string]: Paper[];
}

export type ResponseValue = string | number | string[];

export interface Review {
  _id: string;
  responses: {
    tutor: string;
    subject: string;
    paperCode: string;
    paperName: string;
    paperLevel: string;
    [key: string]: ResponseValue;
  };
  submittedAt: string;
  college?: string;
}

export interface SearchParams {
  tutor: string;
  subject: string;
  paper: string[];
  college: string[];
}

export interface Option<T = string> {
  label: string;
  value: T;
}

export interface GroupedReviews {
  [key: string]: {
    reviews: Review[];
    showFullResults: boolean;
  };
}

export interface DependencyCondition {
  question: string;
  condition: (value: any) => boolean;
}

export type QuestionType = 'dropdown' | 'text' | 'radio' | 'rating' | 'select';

export interface Question {
  id: string;
  question: string;
  required?: boolean;
  type: QuestionType;
  options?: string[];
  dependsOn?: DependencyCondition;
}

