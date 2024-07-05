import React, { useEffect, useState } from 'react';
import { Formik, Form, useFormikContext } from 'formik';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import axios from 'axios';
import Select from 'react-select';
import { Row, Col, Card } from 'react-bootstrap';
import * as Yup from 'yup';

interface Option {
  value: string;
  label: string;
}

interface OptionsState {
  colleges: Option[];
  years: Option[];
  courses: Option[];
}

interface FormValues {
  college: string;
  year: string;
  course: string;
}

interface FormFieldProps {
  fieldName: keyof FormValues;
  label: string;
  options: Option[];
}

const baseURL = process.env.REACT_APP_API_URL;

const FormField: React.FC<FormFieldProps> = ({ fieldName, label, options }) => {
  const { values, setFieldValue, errors, touched, submitCount } = useFormikContext<FormValues>();
  const { isProfileComplete } = useAuth();
  const hasError = errors[fieldName] && (touched[fieldName] || submitCount > 0);

  return (
    <div className="mb-4">
      <label htmlFor={fieldName} className="form-label fw-bold">
        {label}
        <span className="text-danger ms-1" style={{ userSelect: 'none' }}>*</span>
      </label>
      <Select
        options={options}
        onChange={(option: Option | null) => {
          if (option) {
            setFieldValue(fieldName, option.value);
          } else {
            setFieldValue(fieldName, '');
          }
        }}
        value={options.find(option => option.value === values[fieldName])}
        className={`react-select-container ${hasError ? 'is-invalid' : ''}`}
        classNamePrefix="react-select"
        isClearable
        isDisabled={isProfileComplete}
      />
      {hasError && (
        <div className="invalid-feedback d-block">{errors[fieldName]}</div>
      )}
    </div>
  );
};

const ProfileCompletion: React.FC = () => {
  const [options, setOptions] = useState<OptionsState>({ colleges: [], years: [], courses: [] });
  const [initialValues, setInitialValues] = useState<FormValues>({ college: '', year: '', course: '' });
  const { user, isProfileComplete, setUser } = useAuth();
  const navigate = useNavigate();
  const { showNotification } = useNotification();

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

    const fetchUserProfile = async () => {
      try {
        const response = await axios.get<FormValues>(`${baseURL}/user/profile`, { withCredentials: true });
        setInitialValues(response.data);
      } catch (error) {
        console.error('Failed to fetch user profile:', error);
      }
    };
    fetchUserProfile();
  }, []);

  const validationSchema = Yup.object().shape({
    college: Yup.string().required('This question is required'),
    year: Yup.string().required('This question is required'),
    course: Yup.string().required('This question is required'),
  });

  const handleSubmit = async (values: FormValues, { setSubmitting }: { setSubmitting: (isSubmitting: boolean) => void }) => {
    if (!isProfileComplete) {
      try {
        await axios.post(`${baseURL}/user/profile`, values, { withCredentials: true });
        if (user) {
          setUser({ ...user, isProfileComplete: true });
        }
        navigate('/');
        showNotification('Profile updated successfully!', 'success');
      } catch (error) {
        console.error('Error updating profile:', error);
        showNotification('Failed to update profile. Please try again.', 'error');
      } finally {
        setSubmitting(false);
      }
    }
  };

  return (
    <Row className="justify-content-center">
      <Col md={8} lg={6}>
        <Card>
          <Card.Body>
            <h2 className="text-center mb-4">{isProfileComplete ? 'Your profile' : 'Complete your profile'}</h2>
            <Formik
              initialValues={initialValues}
              validationSchema={validationSchema}
              onSubmit={handleSubmit}
              enableReinitialize={true}
            >
              {({ isSubmitting }) => (
                <Form noValidate>
                  <FormField fieldName="college" label="College" options={options.colleges} />
                  <FormField fieldName="year" label="Year" options={options.years} />
                  <FormField fieldName="course" label="Course" options={options.courses} />
                  {!isProfileComplete && (
                    <div className="d-grid">
                      <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                        {isSubmitting ? 'Submitting...' : 'Submit'}
                      </button>
                    </div>
                  )}
                </Form>
              )}
            </Formik>
            {isProfileComplete && (
              <p className="text-center text-muted">
                <small>
                  For security reasons, you can't update your profile information here. If these details change,
                  email <a href="mailto:support@tutereview.org">support@tutereview.org</a> and we'll help you out.
                </small>
              </p>
            )}
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
};

export default ProfileCompletion;