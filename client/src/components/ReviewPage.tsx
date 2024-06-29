import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage, useFormikContext } from 'formik';
import * as Yup from 'yup';
import LogoutButton from './LogoutButton';
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

const ReviewPage: React.FC = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [subjects, setSubjects] = useState<Subject>({});

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
        console.log('Questions:', questionsData);
        console.log('Subjects:', subjectsData);

        setQuestions(questionsData);
        setSubjects(subjectsData);
      } catch (error) {
        console.error('Error fetching data:', error);
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

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Tutor Review Form</h1>
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
        enableReinitialize
      >
        {({ isSubmitting }) => (
          <Form>
            {questions.map((question: Question) => (
              <div key={question.id} className="mb-4">
                <label htmlFor={question.id} className="block mb-2">
                  {question.question}
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
                    className="w-full p-2 border rounded"
                  />
                )}
                {question.type === 'radio' && (
                  <div>
                    {question.options?.map((option) => (
                      <label key={option} className="block">
                        <Field
                          type="radio"
                          name={question.id}
                          value={option}
                          className="mr-2"
                        />
                        {option}
                      </label>
                    ))}
                  </div>
                )}
                <ErrorMessage name={question.id} component="div" className="text-red-500" />
              </div>
            ))}
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Review'}
            </button>
          </Form>
        )}
      </Formik>
      <LogoutButton />
      <nav className="mt-4">
        <ul>
          <li><Link to="/" className="text-blue-500 hover:underline">Go to Home Page</Link></li>
          <li><Link to="/search" className="text-blue-500 hover:underline">Go to Search Page</Link></li>
        </ul>
      </nav>
    </div>
  );
};

export default ReviewPage;