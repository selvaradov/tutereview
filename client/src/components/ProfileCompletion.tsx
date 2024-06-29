import React, { useState, useEffect } from 'react';
import { Formik, Form, Field, FormikHelpers } from 'formik';
import * as Yup from 'yup';
import Select, { SingleValue, Options } from 'react-select';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

interface Option {
  value: string;
  label: string;
}

interface FormValues {
  college: string;
  year: string;
  subject: string;
}

interface OptionsState {
  colleges: Options<{ value: string; label: string }>;
  years: Options<{ value: string; label: string }>;
  subjects: Options<{ value: string; label: string }>;
}


const ProfileSchema = Yup.object().shape({
  college: Yup.string().required('Required'),
  year: Yup.string().required('Required'),
  subject: Yup.string().required('Required'),
});

const baseURL = process.env.REACT_APP_API_URL;

const ProfileCompletion: React.FC = () => {
  const [options, setOptions] = useState<OptionsState>({ colleges: [], years: [], subjects: [] });
  const { checkAuthStatus, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const response = await axios.get<OptionsState>(`${baseURL}/user/options`, { withCredentials: true });
        setOptions(response.data);
      } catch (error) {
        console.error('Failed to fetch user options:', error);
      }
    };
    fetchOptions();
  }, []);

  useEffect(() => {
    if (user?.isProfileComplete) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleSubmit = async (values: FormValues, { setSubmitting }: FormikHelpers<FormValues>) => {
    try {
      await axios.post(`${baseURL}/user/update-profile`, values, { withCredentials: true });
      await checkAuthStatus();
      navigate('/');
    } catch (error) {
      console.error('Error updating profile:', error);
    }
    setSubmitting(false);
  };

  return (
    <div>
      <h2>Complete Your Profile</h2>
      <Formik
        initialValues={{ college: '', year: '', subject: '' }}
        validationSchema={ProfileSchema}
        onSubmit={handleSubmit}
      >
        {({ errors, touched, setFieldValue }) => (
          <Form>
            <div>
              <label htmlFor="college">College</label>
              <Field name="college">
                {({ field }: { field: any }) => (
                  <Select<Option>
                    options={options.colleges}
                    onChange={(option: SingleValue<Option>) => {
                      if (option) {
                        setFieldValue('college', option.value);
                      }
                    }}
                    value={options.colleges.find(option => option.value === field.value)}
                  />
                )}
              </Field>
              {errors.college && touched.college ? <div>{errors.college}</div> : null}
            </div>

            <div>
              <label htmlFor="year">Year</label>
              <Field name="year">
                {({ field }: { field: any }) => (
                  <Select<Option>
                    options={options.years}
                    onChange={(option: SingleValue<Option>) => {
                      if (option) {
                        setFieldValue('year', option.value);
                      }
                    }}
                    value={options.years.find(option => option.value === field.value)}
                  />
                )}
              </Field>
              {errors.year && touched.year ? <div>{errors.year}</div> : null}
            </div>

            <div>
              <label htmlFor="subject">Subject</label>
              <Field name="subject">
                {({ field }: { field: any }) => (
                  <Select<Option>
                    options={options.subjects}
                    onChange={(option: SingleValue<Option>) => {
                      if (option) {
                        setFieldValue('subject', option.value);
                      }
                    }}
                    value={options.subjects.find(option => option.value === field.value)}
                  />
                )}
              </Field>
              {errors.subject && touched.subject ? <div>{errors.subject}</div> : null}
            </div>

            <button type="submit" className="btn btn-primary mt-3">Submit</button>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default ProfileCompletion;