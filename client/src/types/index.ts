export interface Paper {
  code: string;
  name: string;
  level: string;
  id: string;
}

export interface SubjectToPapersMap {
  [key: string]: Paper[];
}

export interface Review {
  _id: string;
  responses: {
    tutor: string;
    subject: string;
    paperCode: string;
    paperName: string;
    paperLevel: string;
    [key: string]: string | number | string[];
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

export interface SelectOption {
  value: string;
  label: string;
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

export interface Question {
  id: string;
  question: string;
  required?: boolean;
  type: 'dropdown' | 'text' | 'radio' | 'rating' | 'select';
  options?: string[];
  dependsOn?: DependencyCondition;
}


export interface TutorOption {
  readonly label: string;
  readonly value: string;
}


export interface ProfileOptionsState {
  colleges: SelectOption[];
  years: SelectOption[];
  courses: SelectOption[];
}

export interface ProfileFormValues {
  college: string;
  year: string;
  course: string;
}