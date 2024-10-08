export interface Paper {
  code: string;
  name: string;
  level: string;
  id: string;
}

export type SubjectToPapersMap = Record<string, Paper[]>;

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
  isOld: boolean;
  college?: string[];
}

export interface SearchParams {
  tutor: string;
  subject: string;
  paper: string[];
  college: string[];
}

export interface SearchResults {
  reviews: Review[];
  collegeFilterApplied: boolean;
}

export interface Option<T = string> {
  label: string;
  value: T;
}

export type GroupedReviews = Record<
  string,
  {
    reviews: Review[];
    showFullResults: boolean;
    colleges?: string[];
  }
>;

export enum QuestionType {
  Dropdown = 'dropdown',
  Text = 'text',
  TextArea = 'textarea',
  Radio = 'radio',
  Rating = 'rating',
  Select = 'select',
}

export interface Question {
  id: string;
  question: string;
  required?: boolean;
  type: QuestionType;
  options?: string[];
  guidance?: string;
}
