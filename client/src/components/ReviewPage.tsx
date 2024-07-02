import React, { useState, useEffect } from 'react';
import { Formik, Form, useFormikContext, FormikValues } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import Select from 'react-select';
import { useNotification } from '../context/NotificationContext';
import PageLayout from './PageLayout';
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

interface FormFieldProps {
  question: Question;
  subjects: Subject;
}

const FormField: React.FC<FormFieldProps> = ({ question, subjects }) => {
  const { values, setFieldValue, errors, touched } = useFormikContext<FormikValues>();

  if (question.dependsOn && !question.dependsOn.condition(values[question.dependsOn.question])) {
    return null;
  }

  const isRequired = question.required;
  const hasError = errors[question.id] && touched[question.id];

  const renderField = () => {
    switch (question.type) {
      case 'dropdown':
        if (question.id === 'subject') {
          return (
            <Select
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
            />
          );
        } else if (question.id === 'paper') {
          const selectedSubject = values.subject as string;
          return (
            <Select
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
              placeholder={selectedSubject ? "Select papers" : "Choose subject first"}
              className={`react-select-container ${hasError ? 'is-invalid' : ''}`}
              classNamePrefix="react-select"
              isClearable
            />
          );
        }
        break;
      case 'text':
        return (
          <input
            type="text"
            id={question.id}
            name={question.id}
            onChange={(e) => setFieldValue(question.id, e.target.value)}
            className={`form-control ${hasError ? 'is-invalid' : ''}`}
          />
        );
      case 'radio':
        return (
          <div className={`radio-group ${hasError ? 'is-invalid' : ''}`}>
            {question.options?.map((option) => (
              <label key={option} className="radio-label">
                <input
                  type="radio"
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
      <label htmlFor={question.id} className="form-label fw-bold">
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
  const [isLoading, setIsLoading] = useState(true);
  const { showNotification } = useNotification();

  useEffect(() => {
    document.title = 'TuteReview - Submit a review';
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const questionsUrl = `${baseURL}/api/questions`;
        const subjectsUrl = `${baseURL}/api/subjects`;

        const [questionsResponse, subjectsResponse] = await Promise.all([
          axios.get<Question[]>(questionsUrl, { withCredentials: true }),
          axios.get<Subject>(subjectsUrl, { withCredentials: true }),
        ]);

        setQuestions(questionsResponse.data);
        setSubjects(subjectsResponse.data);
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
              <FormField key={question.id} question={question} subjects={subjects} />
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