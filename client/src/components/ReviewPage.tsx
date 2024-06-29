import React, { useState, useEffect } from 'react';
import { Formik, Form, Field, ErrorMessage, useFormikContext } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';

interface Question {
  id: string;
  question: string;
  required?: boolean;
  type: string;
  options?: string[];
}

interface Subject {
  [key: string]: Course[];
}

interface Course {
  code: string;
  name: string;
}

const baseURL = process.env.REACT_APP_API_URL;

const SubjectField: React.FC<{ question: Question; subjects: Subject }> = ({ question, subjects }) => {
  const { setFieldValue } = useFormikContext();

  return (
    <Field
      as="select"
      id={question.id}
      name={question.id}
      className="w-full p-2 border rounded"
      onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
        setFieldValue(question.id, e.target.value);
        setFieldValue('paper', '');
        setFieldValue('paperCode', '');
        setFieldValue('paperName', '');
      }}
    >
      <option value="">Select a subject</option>
      {Object.keys(subjects).map((subjectName) => (
        <option key={subjectName} value={subjectName}>
          {subjectName}
        </option>
      ))}
    </Field>
  );
};

const PaperField: React.FC<{ question: Question; subjects: Subject }> = ({ question, subjects }) => {
  const { values, setFieldValue } = useFormikContext<{ subject: string }>();

  return (
    <Field
      as="select"
      id={question.id}
      name={question.id}
      className="w-full p-2 border rounded"
      onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
        const [code, name] = e.target.selectedOptions[0].text.split(' - ', 2);
        setFieldValue(question.id, e.target.value);
        setFieldValue('paperCode', code || '');
        setFieldValue('paperName', name || '');
      }}
    >
      <option value="">Select a paper</option>
      {subjects[values.subject]?.map((course) => (
        <option key={course.code} value={course.code}>
          {`${course.code} - ${course.name}`}
        </option>
      ))}
    </Field>
  );
};

const ErrorMessageWrapper: React.FC<{ name: string }> = ({ name }) => (
  <ErrorMessage name={name}>
    {(msg) => <div className="text-danger small mt-1">{msg}</div>}
  </ErrorMessage>
);

const ReviewPage: React.FC = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [subjects, setSubjects] = useState<Subject>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const questionsUrl = `${baseURL}/api/questions`;
        const subjectsUrl = `${baseURL}/api/subjects`;

        const [questionsResponse, subjectsResponse] = await Promise.all([
          axios.get<Question[]>(questionsUrl, { withCredentials: true }),
          axios.get<Subject>(subjectsUrl, { withCredentials: true }),
        ]);

        const questionsData = questionsResponse.data;
        const subjectsData = subjectsResponse.data;

        setQuestions(questionsData);
        setSubjects(subjectsData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const initialValues = questions.reduce((acc, question) => {
    acc[question.id] = '';
    return acc;
  }, {} as { [key: string]: string });

  const validationSchema = Yup.object().shape(
    questions.reduce((acc, question) => {
      if (question.required) {
        acc[question.id] = Yup.string().required(`${question.question} is required`);
      }
      return acc;
    }, {} as { [key: string]: Yup.StringSchema })
  );

  const handleSubmit = async (values: { [key: string]: string }, { setSubmitting, resetForm }: { setSubmitting: (isSubmitting: boolean) => void; resetForm: () => void }) => {
    try {
      await axios.post(`${baseURL}/api/review`, values, {
        headers: {
          'Content-Type': 'application/json',
        },
        withCredentials: true,
      });

      alert('Review submitted successfully!');
      resetForm();
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('Failed to submit review. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading) {
    return <div className="container mt-4">Loading...</div>;
  }

  return (
    <div className="container mt-4">
      <h1 className="mb-4">Tutor Review Form</h1>
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting, errors, touched }) => (
          <Form>
            {questions.map((question: Question) => (
              <div key={question.id} className="mb-3">
                <label htmlFor={question.id} className="form-label">
                  {question.question}
                  {question.required && <span className="text-danger ms-1">*</span>}
                </label>
                {question.type === 'dropdown' && question.id === 'subject' && (
                  <SubjectField question={question} subjects={subjects} />
                )}
                {question.type === 'dropdown' && question.id === 'paper' && (
                  <PaperField question={question} subjects={subjects} />
                )}
                {question.type === 'text' && (
                  <Field
                    type="text"
                    id={question.id}
                    name={question.id}
                    className={`form-control ${errors[question.id] && touched[question.id] ? 'is-invalid' : ''}`}
                  />
                )}
                {question.type === 'radio' && (
                  <div>
                    {question.options?.map((option) => (
                      <div key={option} className="form-check">
                        <Field
                          type="radio"
                          name={question.id}
                          value={option}
                          className="form-check-input"
                          id={`${question.id}-${option}`}
                        />
                        <label className="form-check-label" htmlFor={`${question.id}-${option}`}>
                          {option}
                        </label>
                      </div>
                    ))}
                  </div>
                )}
                <ErrorMessageWrapper name={question.id} />
              </div>
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
    </div>
  );
};

export default ReviewPage;