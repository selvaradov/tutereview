import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Formik, Form, useFormikContext, FormikValues } from 'formik';
import * as Yup from 'yup';
import axios, { AxiosResponse } from 'axios';
import Select from 'react-select';
import CreatableSelect from 'react-select/creatable';
import { useNotification } from '../context/NotificationContext';
import PageLayout from './PageLayout';
import { useProtectedApi } from '../hooks/useProtectedApi';
import './ReviewPage.css'

const baseURL = process.env.REACT_APP_API_URL;

interface DependencyCondition {
  question: string;
  condition: (value: any) => boolean;
}

interface Question {
  id: string;
  question: string;
  required?: boolean;
  type: string;
  options?: string[];
  dependsOn?: DependencyCondition;
}

interface Subject {
  [key: string]: Course[];
}

interface Course {
  code: string;
  name: string;
}

interface TutorOption {
  readonly label: string;
  readonly value: string;
}

interface FormFieldProps {
  question: Question;
  subjects: Subject;
  tutorOptions: TutorOption[];
}

type ApiResponse = [
  AxiosResponse<Question[]>,
  AxiosResponse<Subject>,
  AxiosResponse<{ name: string }[]>
];

const createOption = (label: string) => ({
  label,
  value: label,
});

const FormField: React.FC<FormFieldProps> = ({ question, subjects, tutorOptions }) => {
  const { values, setFieldValue, errors, touched } = useFormikContext<FormikValues>();
  const [isLoading, setIsLoading] = useState(false);

  const shouldRender = useMemo(() => {
    return !question.dependsOn || question.dependsOn.condition(values[question.dependsOn.question]);
  }, [question.dependsOn, values]);

  if (!shouldRender) {
    return null;
  }

  const isRequired = question.required;
  const hasError = errors[question.id] && touched[question.id];

  const handleCreate = (inputValue: string) => {
    setIsLoading(true);
    const newOption = createOption(inputValue); // This could be an async function later, hence the `isLoading` state
    console.log(newOption)
    setIsLoading(false);
    setFieldValue(question.id, newOption.value);
  };

  const renderField = () => {
    switch (question.type) {
      case 'dropdown':
        if (question.id === 'subject') {
          return (
            <Select
              inputId={question.id}
              aria-labelledby={`${question.id}-label`}
              options={Object.keys(subjects).map(subject => ({ value: subject, label: subject }))}
              onChange={(option: { value: string; label: string } | null) => {
                if (option) {
                  setFieldValue(question.id, option.value);
                } else {
                  setFieldValue(question.id, '');
                }
                setFieldValue('paper', '');
                setFieldValue('paperCode', '');
                setFieldValue('paperName', '');
              }}
              value={values.subject ? { value: values.subject, label: values.subject } : null}
              className={`react-select-container ${hasError ? 'is-invalid' : ''}`}
              classNamePrefix="react-select"
              isClearable
              placeholder="Select a subject"
            />
          );
        } else if (question.id === 'paper') {
          const selectedSubject = values.subject as string;
          return (
            <Select
              inputId={question.id}
              aria-labelledby={`${question.id}-label`}
              options={subjects[selectedSubject as keyof Subject]?.map(course => ({
                value: course.code,
                label: `${course.code} - ${course.name}`
              }))}
              onChange={(option: { value: string; label: string } | null) => {
                if (option) {
                  const [code, name] = option.label.split(' - ', 2);
                  setFieldValue(question.id, option.value);
                  setFieldValue('paperCode', code || '');
                  setFieldValue('paperName', name || '');
                } else {
                  setFieldValue(question.id, '');
                  setFieldValue('paperCode', '');
                  setFieldValue('paperName', '');
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
        }
        break;
      case 'text':
        if (question.id === 'tutor') {
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
        }
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
      case 'radio':
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
      <div className="mt-2">
        {renderField()}
      </div>
      {hasError && (
        <div className="invalid-feedback d-block">{errors[question.id] as string}</div>
      )}
    </div>
  );
};

const ReviewPage: React.FC = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [subjects, setSubjects] = useState<Subject>({});
  const [tutorOptions, setTutorOptions] = useState<TutorOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { showNotification } = useNotification();

  useEffect(() => {
    document.title = 'TuteReview - Submit a review';
  }, []);

  const fetchDataRef = useRef(useProtectedApi<ApiResponse>(
    () => {
      const questionsUrl = `${baseURL}/api/questions`;
      const subjectsUrl = `${baseURL}/api/subjects`;
      const tutorsUrl = `${baseURL}/api/tutors`;

      return Promise.all([
        axios.get<Question[]>(questionsUrl, { withCredentials: true }),
        axios.get<Subject>(subjectsUrl, { withCredentials: true }),
        axios.get<{ name: string }[]>(tutorsUrl, { withCredentials: true }),
      ]);
    },
    'Failed to load form data. Please try again.'
  ));

  const fetchData = useCallback(() => {
    return fetchDataRef.current();
  }, []);

  useEffect(() => {
    const loadData = async () => {
      const data = await fetchData();
      if (data) {
        const [questionsResponse, subjectsResponse, tutorsResponse] = data;
        setQuestions(questionsResponse.data);
        setSubjects(subjectsResponse.data);
        setTutorOptions(tutorsResponse.data.map((tutor: { name: string }) => createOption(tutor.name)));
      }
      setIsLoading(false);
    };
    loadData();
  }, [fetchData]);

  const initialValues = questions.reduce((acc, question) => {
    acc[question.id] = '';
    return acc;
  }, {} as Record<string, string>);

  const validationSchema = Yup.object().shape(
    questions.reduce((acc, question) => {
      if (question.required) {
        acc[question.id] = Yup.string().required('This question is required');
      }
      return acc;
    }, {} as Record<string, Yup.StringSchema>)
  );

  const handleSubmit = async (values: Record<string, string>, { setSubmitting, resetForm }: { setSubmitting: (isSubmitting: boolean) => void; resetForm: () => void }) => {
    try {
      await axios.post(`${baseURL}/api/review`, values, {
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
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting }) => (
          <Form className="mb-4">
            {questions.map((question: Question) => (
              <FormField key={question.id} question={question} subjects={subjects} tutorOptions={tutorOptions} />
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