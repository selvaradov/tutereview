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
  subjects: Option[];
}

interface FormValues {
  college: string;
  year: string;
  subject: string;
}

interface FormFieldProps {
  fieldName: keyof FormValues;
  label: string;
  options: Option[];
}

const baseURL = process.env.REACT_APP_API_URL;

const FormField: React.FC<FormFieldProps> = ({ fieldName, label, options }) => {
  const { values, setFieldValue, errors, touched } = useFormikContext<FormValues>();

  const hasError = errors[fieldName] && touched[fieldName];

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
      />
      {hasError && (
        <div className="invalid-feedback d-block">{errors[fieldName] as string}</div>
      )}
    </div>
  );
};

const ProfileCompletion: React.FC = () => {
  const [options, setOptions] = useState<OptionsState>({ colleges: [], years: [], subjects: [] });
  const { checkAuthStatus, isProfileComplete } = useAuth();
  const navigate = useNavigate();
  const { showNotification } = useNotification();

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const response = await axios.get<OptionsState>(`${baseURL}/user/options`, { withCredentials: true });
        setOptions(response.data);
      } catch (error) {
        console.error('Failed to fetch user options:', error);
        showNotification('Failed to fetch user options. Please try again.', 'error');
      }
    };
    fetchOptions();
  }, [showNotification]);

  const initialValues: FormValues = { college: '', year: '', subject: '' };

  const validationSchema = Yup.object().shape({
    college: Yup.string().required('This question is required'),
    year: Yup.string().required('This question is required'),
    subject: Yup.string().required('This question is required'),
  });

  const handleSubmit = async (values: FormValues, { setSubmitting }: { setSubmitting: (isSubmitting: boolean) => void }) => {
    if (!isProfileComplete) {
      try {
        await axios.post(`${baseURL}/user/profile`, values, { withCredentials: true });
        await checkAuthStatus();
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
            >
              {({ isSubmitting }) => (
                <Form noValidate>
                  <FormField fieldName="college" label="College" options={options.colleges} />
                  <FormField fieldName="year" label="Year" options={options.years} />
                  <FormField fieldName="subject" label="Subject" options={options.subjects} />
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