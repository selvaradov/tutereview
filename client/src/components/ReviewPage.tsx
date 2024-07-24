import React, { useState, useEffect } from 'react';
import {
  Formik,
  Form as FormikForm,
  useFormikContext,
  FormikValues,
} from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import Select from 'react-select';
import CreatableSelect from 'react-select/creatable';
import { Form, Button, Alert } from 'react-bootstrap';
import { useNotification } from '../context/NotificationContext';
import { useLoading } from '../context/LoadingContext';
import { MissingOptionsMessage } from './Messages';
import PageLayout from './PageLayout';
import { SubjectToPapersMap, Question, Option, QuestionType } from '../types';
import StarRating from './StarRating';
import './ReviewPage.css';

const createOption = (label: string) => ({
  label,
  value: label,
});

const SubjectDropdown: React.FC<{
  question: Question;
  papersBySubject: SubjectToPapersMap;
  hasError: boolean;
}> = ({ question, papersBySubject, hasError }) => {
  const { values, setValues } = useFormikContext<FormikValues>();

  return (
    <Select
      inputId={question.id}
      aria-labelledby={`${question.id}-label`}
      options={Object.keys(papersBySubject).map((subject) => ({
        value: subject,
        label: subject,
      }))}
      onChange={(option: { value: string; label: string } | null) => {
        const updates = {
          [question.id]: option ? option.value : '',
          paper: '',
          paperCode: '',
          paperName: '',
          paperLevel: '',
        };

        setValues((prevValues) => ({
          ...prevValues,
          ...updates,
        }));
      }}
      value={
        values.subject ? { value: values.subject, label: values.subject } : null
      }
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
  const { values, setValues } = useFormikContext<FormikValues>();
  const selectedSubject = values.subject as string;

  return (
    <Select
      inputId={question.id}
      aria-labelledby={`${question.id}-label`}
      options={papersBySubject[
        selectedSubject as keyof SubjectToPapersMap
      ]?.map((paper) => ({
        value: paper.id,
        label: `${paper.code} - ${paper.name} [${paper.level}]`,
      }))}
      onChange={(option: { value: string; label: string } | null) => {
        let updates: Partial<FormikValues> = {
          [question.id]: '',
          paperCode: '',
          paperName: '',
          paperLevel: '',
        };

        if (option) {
          const [code, rest] = option.label.split(' - ', 2);
          const [name, level] = rest.split(' [');
          updates = {
            [question.id]: option.value,
            paperCode: code || '',
            paperName: name || '',
            paperLevel: level.slice(0, -1) || '',
          };
        }

        setValues((prevValues) => ({
          ...prevValues,
          ...updates,
        }));
      }}
      value={
        values.paper
          ? {
              value: values.paper,
              label: `${values.paperCode} - ${values.paperName}`,
            }
          : null
      }
      isDisabled={!selectedSubject}
      placeholder={selectedSubject ? 'Select a paper' : 'Choose subject first'}
      className={`react-select-container ${hasError ? 'is-invalid' : ''}`}
      classNamePrefix="react-select"
      isClearable
    />
  );
};

const TutorField: React.FC<{
  question: Question;
  tutorOptions: Option[];
  hasError: boolean;
}> = ({ question, tutorOptions, hasError }) => {
  const { values, setFieldValue } = useFormikContext<FormikValues>();
  const [isLoading, setIsLoading] = useState(false);

  const handleCreate = (inputValue: string) => {
    setIsLoading(true);
    const newOption = createOption(inputValue);
    setIsLoading(false);
    setFieldValue(question.id, newOption.value);
  };

  return (
    <CreatableSelect
      inputId={question.id}
      aria-labelledby={`${question.id}-label`}
      options={tutorOptions}
      onChange={(newValue: Option | null) => {
        if (newValue) {
          setFieldValue(question.id, newValue.value);
        } else {
          setFieldValue(question.id, '');
        }
      }}
      onCreateOption={handleCreate}
      value={
        values[question.id]
          ? { value: values[question.id], label: values[question.id] }
          : null
      }
      className={`react-select-container ${hasError ? 'is-invalid' : ''}`}
      classNamePrefix="react-select"
      isClearable
      isDisabled={isLoading}
      isLoading={isLoading}
      placeholder="Select or type a tutor name"
    />
  );
};

interface ReviewFormFieldProps {
  question: Question;
  papersBySubject: SubjectToPapersMap;
  tutorOptions: Option[];
}

const FormField: React.FC<ReviewFormFieldProps> = ({
  question,
  papersBySubject,
  tutorOptions,
}) => {
  const { values, errors, touched, submitCount, setFieldValue } =
    useFormikContext<FormikValues>();

  const isRequired = question.required;
  const hasError = !!(
    errors[question.id] &&
    (touched[question.id] || submitCount > 0)
  );

  const renderField = () => {
    switch (question.type) {
      case QuestionType.Dropdown:
        if (question.id === 'subject') {
          return (
            <SubjectDropdown
              question={question}
              papersBySubject={papersBySubject}
              hasError={hasError}
            />
          );
        } else if (question.id === 'paper') {
          return (
            <PaperDropdown
              question={question}
              papersBySubject={papersBySubject}
              hasError={hasError}
            />
          );
        }
        break;
      case QuestionType.Text:
        if (question.id === 'tutor') {
          return (
            <TutorField
              question={question}
              tutorOptions={tutorOptions}
              hasError={hasError}
            />
          );
        }
        return (
          <Form.Control
            type="text"
            id={question.id}
            name={question.id}
            isInvalid={hasError}
            onChange={(e) => setFieldValue(question.id, e.target.value)}
            value={values[question.id] || ''}
          />
        );
      case QuestionType.TextArea:
        return (
          <Form.Control
            as="textarea"
            rows={3}
            id={question.id}
            name={question.id}
            isInvalid={hasError}
            onChange={(e) => setFieldValue(question.id, e.target.value)}
            value={values[question.id] || ''}
            placeholder="Enter text here"
          />
        );
      case QuestionType.Radio:
        return (
          <div>
            {question.options?.map((option, index) => (
              <Form.Check
                key={index}
                type="radio"
                id={`${question.id}-${index}`}
                name={question.id}
                label={option}
                value={option}
                checked={values[question.id] === option}
                onChange={(e) => setFieldValue(question.id, e.target.value)}
                isInvalid={hasError}
              />
            ))}
          </div>
        );
      case QuestionType.Rating:
        return (
          <div>
            <StarRating
              rating={values[question.id]}
              interactive
              onChange={(rating) => setFieldValue(question.id, rating)}
              hasError={hasError}
            />
          </div>
        );
      case QuestionType.Select:
        return (
          <div>
            {question.options?.map((option, index) => (
              <Form.Check
                key={index}
                type="checkbox"
                id={`${question.id}-${index}`}
                name={question.id}
                label={option}
                value={option}
                checked={(values[question.id] || []).includes(option)}
                onChange={(e) => {
                  const currentValues = values[question.id] || [];
                  const newValues = e.target.checked
                    ? [...currentValues, option]
                    : currentValues.filter((value: string) => value !== option);
                  setFieldValue(question.id, newValues);
                }}
                isInvalid={hasError}
              />
            ))}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <Form.Group className="mb-3">
      <div id={`${question.id}-label`} className="fw-bold mb-2 question-label">
        <div className={`question-title ${isRequired ? 'required-field' : ''}`}>
          {question.question}
        </div>
        {question.guidance && (
          <div className="small text-muted question-guidance">
            {question.guidance}
          </div>
        )}
      </div>
      {renderField()}
      {hasError && (
        <Form.Control.Feedback type="invalid" style={{ display: 'block' }}>
          {errors[question.id] as string}
        </Form.Control.Feedback>
      )}
    </Form.Group>
  );
};

const FormErrorMessage: React.FC = () => {
  const { errors, submitCount } = useFormikContext();
  const hasErrors = Object.keys(errors).length > 0 && submitCount > 0;

  if (!hasErrors) return null;

  return (
    <Alert variant="danger" className="mt-3">
      Please correct the errors in the form before submitting.
    </Alert>
  );
};

type FormValues = Record<string, string | string[]>;

const ReviewPage: React.FC = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [papers, setPapers] = useState<SubjectToPapersMap>({});
  const [tutorOptions, setTutorOptions] = useState<Option[]>([]);
  const { showNotification } = useNotification();
  const { startLoading, stopLoading } = useLoading();

  useEffect(() => {
    document.title = 'TuteReview - Submit a review';
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      startLoading();
      try {
        const [questionsResponse, subjectsResponse, tutorsResponse] =
          await Promise.all([
            axios.get<Question[]>('/api/questions', { withCredentials: true }),
            axios.get<SubjectToPapersMap>('/api/papers', {
              withCredentials: true,
            }),
            axios.get<{ name: string }[]>('/api/tutors', {
              withCredentials: true,
            }),
          ]);

        setQuestions(questionsResponse.data);
        setPapers(subjectsResponse.data);
        // if tutors list becomes too long, we can make async calls as the user types,
        // instead of loading them all initially (see react-select/async-creatable)
        setTutorOptions(
          tutorsResponse.data.map((tutor) => createOption(tutor.name)),
        );
      } catch (error) {
        console.error('Error fetching data:', error);
        showNotification(
          'Failed to load form data. Please try again.',
          'error',
        );
      } finally {
        stopLoading();
      }
    };

    fetchData();
  }, [showNotification, startLoading, stopLoading]);

  const initialValues = questions.reduce(
    (acc, question) => {
      if (question.type === 'select') {
        acc[question.id] = [];
      } else {
        acc[question.id] = '';
      }
      return acc;
    },
    {
      paperCode: '',
      paperName: '',
      paperLevel: '',
    } as Record<string, string | string[]>,
  );

  const validationSchema = Yup.object().shape(
    questions.reduce(
      (acc, question) => {
        if (question.required) {
          if (question.type === 'select') {
            // For multi-select fields
            acc[question.id] = Yup.array()
              .of(Yup.string())
              .min(1, 'Please select at least one option')
              .required('This question is required');
          } else {
            // For single-select fields and other types
            acc[question.id] = Yup.string().required(
              'This question is required',
            );
          }
        }
        return acc;
      },
      {} as Record<string, Yup.AnySchema>,
    ), // NOTE bad typing here
  );

  const handleSubmit = async (
    values: FormValues,
    {
      setSubmitting,
      resetForm,
    }: {
      setSubmitting: (isSubmitting: boolean) => void;
      resetForm: () => void;
    },
  ) => {
    startLoading();
    try {
      await axios.post(
        '/api/review',
        { responses: values },
        {
          headers: {
            'Content-Type': 'application/json',
          },
          withCredentials: true,
        },
      );

      showNotification('Review submitted successfully!', 'success');
      resetForm();
      window.scrollTo(0, 0);
    } catch (error) {
      console.error('Error submitting review:', error);
      showNotification('Failed to submit review. Please try again.', 'error');
    } finally {
      setSubmitting(false);
      stopLoading();
    }
  };

  return (
    <PageLayout title="Submit a review">
      <MissingOptionsMessage />
      <Formik
        initialValues={initialValues as FormValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting }) => (
          <FormikForm>
            {questions.map((question: Question) => (
              <FormField
                key={question.id}
                question={question}
                papersBySubject={papers}
                tutorOptions={tutorOptions}
              />
            ))}
            <FormErrorMessage />
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Submit'}
            </Button>
          </FormikForm>
        )}
      </Formik>
    </PageLayout>
  );
};

export default ReviewPage;
