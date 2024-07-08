import React, { useState, useEffect, useMemo } from 'react';
import { Formik, Form, useFormikContext, FormikValues } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import Select from 'react-select';
import CreatableSelect from 'react-select/creatable';
import { useNotification } from '../context/NotificationContext';
import PageLayout from './PageLayout';
import './ReviewPage.css'

interface DependencyCondition {
  question: string;
  condition: (value: any) => boolean;
}

interface Question {
  id: string;
  question: string;
  required?: boolean;
  type: 'dropdown' | 'text' | 'radio' | 'rating' | 'select';
  options?: string[];
  dependsOn?: DependencyCondition;
}

interface SubjectToPapersMap {
  [key: string]: Paper[];
}

interface Paper {
  code: string;
  name: string;
  level: string;
  id: string;
}

interface TutorOption {
  readonly label: string;
  readonly value: string;
}

interface FormFieldProps {
  question: Question;
  papersBySubject: SubjectToPapersMap;
  tutorOptions: TutorOption[];
}

interface StarRatingProps {
  id: string;
  totalStars?: number;
}

interface CheckboxGroupProps {
  id: string;
  options: string[];
}


const createOption = (label: string) => ({
  label,
  value: label,
});

const SubjectDropdown: React.FC<{
  question: Question;
  papersBySubject: SubjectToPapersMap;
  hasError: boolean;
}> = ({ question, papersBySubject, hasError }) => {
  const { values, setFieldValue } = useFormikContext<FormikValues>();

  return (
    <Select
      inputId={question.id}
      aria-labelledby={`${question.id}-label`}
      options={Object.keys(papersBySubject).map(subject => ({ value: subject, label: subject }))}
      onChange={(option: { value: string; label: string } | null) => {
        if (option) {
          setFieldValue(question.id, option.value);
        } else {
          setFieldValue(question.id, '');
        }
        setFieldValue('paper', '');
        setFieldValue('paperCode', '');
        setFieldValue('paperName', '');
        setFieldValue('paperLevel', '');
      }}
      value={values.subject ? { value: values.subject, label: values.subject } : null}
      className={`react-select-container ${hasError ? 'is-invalid' : ''}`}
      classNamePrefix="react-select"
      isClearable
      placeholder="Select a subject"
    />
  );
};

const PaperDropdown: React.FC<{
  question: Question;
  papersBySubject: SubjectToPapersMap;
  hasError: boolean;
}> = ({ question, papersBySubject, hasError }) => {
  const { values, setFieldValue } = useFormikContext<FormikValues>();
  const selectedSubject = values.subject as string;

  return (
    <Select
      inputId={question.id}
      aria-labelledby={`${question.id}-label`}
      options={papersBySubject[selectedSubject as keyof SubjectToPapersMap]?.map(paper => ({
        value: paper.id,
        label: `${paper.code} - ${paper.name} (${paper.level})`
      }))}
      onChange={(option: { value: string; label: string } | null) => {
        if (option) {
          const [code, rest] = option.label.split(' - ', 2);
          const [name, level] = rest.split(' (');
          setFieldValue(question.id, option.value);
          setFieldValue('paperCode', code || '');
          setFieldValue('paperName', name || '');
          setFieldValue('paperLevel', level.slice(0, -1) || '');
        } else {
          setFieldValue(question.id, '');
          setFieldValue('paperCode', '');
          setFieldValue('paperName', '');
          setFieldValue('paperLevel', '');
        }
      }}
      value={values.paper ? { value: values.paper, label: `${values.paperCode} - ${values.paperName}` } : null}
      isDisabled={!selectedSubject}
      placeholder={selectedSubject ? "Select a paper" : "Choose subject first"}
      className={`react-select-container ${hasError ? 'is-invalid' : ''}`}
      classNamePrefix="react-select"
      isClearable
    />
  );
};

const TutorField: React.FC<{
  question: Question;
  tutorOptions: TutorOption[];
  hasError: boolean;
}> = ({ question, tutorOptions, hasError }) => {
  const { values, setFieldValue } = useFormikContext<FormikValues>();
  const [isLoading, setIsLoading] = useState(false);

  const handleCreate = (inputValue: string) => {
    setIsLoading(true);
    const newOption = createOption(inputValue); // This function needs to be defined or imported
    setIsLoading(false);
    setFieldValue(question.id, newOption.value);
  };

  return (
    <CreatableSelect
      inputId={question.id}
      aria-labelledby={`${question.id}-label`}
      options={tutorOptions}
      onChange={(newValue: TutorOption | null) => {
        if (newValue) {
          setFieldValue(question.id, newValue.value);
        } else {
          setFieldValue(question.id, '');
        }
      }}
      onCreateOption={handleCreate}
      value={values[question.id] ? { value: values[question.id], label: values[question.id] } : null}
      className={`react-select-container ${hasError ? 'is-invalid' : ''}`}
      classNamePrefix="react-select"
      isClearable
      isDisabled={isLoading}
      isLoading={isLoading}
      placeholder="Select or type a tutor name"
    />
  );
};

const TextField: React.FC<{
  question: Question;
  hasError: boolean;
}> = ({ question, hasError }) => {
  const { values, setFieldValue } = useFormikContext<FormikValues>();

  return (
    <input
      type="text"
      id={question.id}
      name={question.id}
      onChange={(e) => setFieldValue(question.id, e.target.value)}
      className={`form-control ${hasError ? 'is-invalid' : ''}`}
      value={values[question.id] || ''}
      aria-labelledby={`${question.id}-label`}
    />
  );
};

const RadioField: React.FC<{
  question: Question;
  hasError: boolean;
}> = ({ question, hasError }) => {
  const { values, setFieldValue } = useFormikContext<FormikValues>();

  return (
    <div
      className={`radio-group ${hasError ? 'is-invalid' : ''}`}
      role="radiogroup"
      aria-labelledby={`${question.id}-label`}
    >
      {question.options?.map((option, index) => (
        <label key={option} className="radio-label">
          <input
            type="radio"
            id={`${question.id}-${index}`}
            name={question.id}
            value={option}
            onChange={(e) => setFieldValue(question.id, e.target.value)}
            checked={values[question.id] === option}
          />
          <span className="radio-button"></span>
          {option}
        </label>
      ))}
    </div>
  );
};


const StarRating: React.FC<StarRatingProps> = ({ id, totalStars = 5 }) => {
  // https://dev.to/kartikbudhraja/creating-a-dynamic-star-rating-system-in-react-2c8
  const { values, setFieldValue } = useFormikContext<FormikValues>();
  const [hover, setHover] = useState<number | null>(null);

  return (
    <div style={{
      marginTop: "-0.5em",
      marginBottom: "-0.5em"
    }}>
      {[...Array(totalStars)].map((_, index) => {
        const currentRating = index + 1;

        return (
          <label key={index}>
            <input
              type="radio"
              name={id}
              value={currentRating}
              onChange={() => setFieldValue(id, currentRating)}
              checked={values[id] === currentRating}
              style={{ display: 'none' }}
            />
            <span
              className="star"
              style={{
                color: currentRating <= (hover || values[id] || 0) ? "#ffc107" : "#e4e5e9"
              }}
              onMouseEnter={() => setHover(currentRating)}
              onMouseLeave={() => setHover(null)}
            >
              ★
            </span>
          </label>
        );
      })}
    </div>
  );
};

const CheckboxGroup: React.FC<CheckboxGroupProps> = ({ id, options }) => {
  const { values, setFieldValue } = useFormikContext<FormikValues>();

  const handleChange = (option: string) => {
    const currentValues = values[id] || [];
    const newValues = currentValues.includes(option)
      ? currentValues.filter((value: string) => value !== option)
      : [...currentValues, option];
    setFieldValue(id, newValues);
  };

  return (
    <div className="checkbox-group" role="group" aria-labelledby={`${id}-label`}>
      {options.map((option, index) => (
        <label key={index} className="checkbox-label">
          <input
            type="checkbox"
            name={id}
            value={option}
            checked={(values[id] || []).includes(option)}
            onChange={() => handleChange(option)}
          />
          <span className="checkbox-button"></span>
          {option}
        </label>
      ))}
    </div>
  );
};


const FormField: React.FC<FormFieldProps> = ({ question, papersBySubject, tutorOptions }) => {
  const { values, errors, touched, submitCount } = useFormikContext<FormikValues>();

  const shouldRender = useMemo(() => {
    return !question.dependsOn || question.dependsOn.condition(values[question.dependsOn.question]);
  }, [question.dependsOn, values]);

  if (!shouldRender) {
    return null;
  }

  const isRequired = question.required;
  const hasError = !!(errors[question.id] && (touched[question.id] || submitCount > 0));

  const renderField = () => {
    switch (question.type) {
      case 'dropdown':
        if (question.id === 'subject') {
          return <SubjectDropdown question={question} papersBySubject={papersBySubject} hasError={hasError} />;
        } else if (question.id === 'paper') {
          return <PaperDropdown question={question} papersBySubject={papersBySubject} hasError={hasError} />;
        }
        break;
      case 'text':
        if (question.id === 'tutor') {
          return <TutorField question={question} tutorOptions={tutorOptions} hasError={hasError} />;
        }
        return <TextField question={question} hasError={hasError} />;
      case 'radio':
        return <RadioField question={question} hasError={hasError} />;
      case 'rating':
        return <StarRating id={question.id} />;
      case 'select':
        return <CheckboxGroup id={question.id} options={question.options || []} />;
      default:
        return null;
    }
  };

  return (
    <div className="mb-4">
      <label id={`${question.id}-label`} className="form-label fw-bold">
        {question.question}
        {isRequired && <span className="text-danger ms-1" style={{ userSelect: 'none' }}>*</span>}
      </label>
      <div className="mt-0">
        {renderField()}
      </div>
      {hasError && (
        <div className="invalid-feedback d-block">{errors[question.id] as string}</div>
      )}
    </div>
  );
};

type FormValues = Record<string, string | string[]>;

const ReviewPage: React.FC = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [papers, setPapers] = useState<SubjectToPapersMap>({});
  const [tutorOptions, setTutorOptions] = useState<TutorOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { showNotification } = useNotification();

  useEffect(() => {
    document.title = 'TuteReview - Submit a review';
  }, []);


  useEffect(() => {
    const fetchData = async () => {
      try {
        const [questionsResponse, subjectsResponse, tutorsResponse] = await Promise.all([
          axios.get<Question[]>('/api/questions', { withCredentials: true }),
          axios.get<SubjectToPapersMap>('/api/papers', { withCredentials: true }),
          axios.get<{ name: string }[]>('/api/tutors', { withCredentials: true }),
        ]);

        setQuestions(questionsResponse.data);
        setPapers(subjectsResponse.data);
        // if tutors list becomes too long, we can make async calls as the user types,
        // instead of loading them all initially (see react-select/async-creatable)
        setTutorOptions(tutorsResponse.data.map(tutor => createOption(tutor.name)));
      } catch (error) {
        console.error('Error fetching data:', error);
        showNotification('Failed to load form data. Please try again.', 'error');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [showNotification]);

  const initialValues = questions.reduce((acc, question) => {
    if (question.type === 'select') {
      acc[question.id] = [];
    } else {
      acc[question.id] = '';
    }
    return acc;
  }, {
    paperCode: '',
    paperName: '',
    paperLevel: '',
  } as Record<string, string | string[]>);

  const validationSchema = Yup.object().shape(
    questions.reduce((acc, question) => {
      if (question.required) {
        if (question.type === 'select') {
          // For multi-select fields
          acc[question.id] = Yup.array()
            .of(Yup.string())
            .min(1, 'Please select at least one option')
            .required('This question is required');
        } else {
          // For single-select fields and other types
          acc[question.id] = Yup.string().required('This question is required');
        }
      }
      return acc;
    }, {} as Record<string, Yup.AnySchema>) // NOTE bad typing here
  );

  const handleSubmit = async (values: FormValues, { setSubmitting, resetForm }: { setSubmitting: (isSubmitting: boolean) => void; resetForm: () => void }) => {
    try {
      await axios.post('/api/review', values, {
        headers: {
          'Content-Type': 'application/json',
        },
        withCredentials: true,
      });

      showNotification('Review submitted successfully!', 'success');
      resetForm();
      window.scrollTo(0, 0);
    } catch (error) {
      console.error('Error submitting review:', error);
      showNotification('Failed to submit review. Please try again.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <PageLayout title="Submit a review">
      <Formik
        initialValues={initialValues as FormValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting }) => (
          <Form className="mb-4">
            {questions.map((question: Question) => (
              <FormField key={question.id} question={question} papersBySubject={papers} tutorOptions={tutorOptions} />
            ))}
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn btn-primary"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Review'}
            </button>
          </Form>
        )}
      </Formik>
    </PageLayout>
  );
};

export default ReviewPage;