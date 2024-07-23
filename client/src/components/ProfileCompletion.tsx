import React, { useEffect, useState } from 'react';
import { Formik, Form as FormikForm, useFormikContext } from 'formik';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { useLoading } from '../context/LoadingContext';
import axios from 'axios';
import Select from 'react-select';
import { Row, Col, Card, Form } from 'react-bootstrap';
import * as Yup from 'yup';
import { Option } from '../types';

interface ProfileOptions {
  colleges: Option[];
  years: Option[];
  courses: Option[];
}

interface ProfileFormValues {
  college: string;
  year: string;
  course: string;
}

interface ProfileFormFieldProps {
  fieldName: keyof ProfileFormValues;
  label: string;
  options: Option[];
  guidance?: string;
}

const FormField: React.FC<ProfileFormFieldProps> = ({ fieldName, label, options, guidance }) => {
  const { values, setFieldValue, errors, touched, submitCount } = useFormikContext<ProfileFormValues>();
  const { isProfileComplete } = useAuth();
  const hasError = errors[fieldName] && (touched[fieldName] || submitCount > 0);

  return (
    <Form.Group className="mb-4">
      <Form.Label htmlFor={fieldName} className="fw-bold">
        {label}
        <span className="text-danger ms-1" style={{ userSelect: 'none' }}>*</span>
        {guidance && (
          <div><Form.Text>{guidance}</Form.Text></div>
        )}
      </Form.Label>
      <Select
        options={options}
        onChange={(option: Option | null) => {
          setFieldValue(fieldName, option ? option.value : '');
        }}
        value={options.find(option => option.value === values[fieldName])}
        className={`react-select-container ${hasError ? 'is-invalid' : ''}`}
        classNamePrefix="react-select"
        isClearable
        isDisabled={isProfileComplete}
        inputId={fieldName}
      />
      {hasError && (
        <Form.Control.Feedback type="invalid" style={{ display: 'block' }}>
          {errors[fieldName]}
        </Form.Control.Feedback>
      )}
    </Form.Group>
  );
};

const ProfileCompletion: React.FC = () => {
  const [options, setOptions] = useState<ProfileOptions>({ colleges: [], years: [], courses: [] });
  const [initialValues, setInitialValues] = useState<ProfileFormValues>({ college: '', year: '', course: '' });
  const { user, isProfileComplete, setUser } = useAuth();
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const { startLoading, stopLoading } = useLoading();

  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1; // getMonth() returns 0-11 for Jan-Dec
  const isLongVacationPeriod = currentMonth >= 6 && currentMonth <= 9;

  useEffect(() => {
    const fetchData = async () => {
      startLoading();
      try {
        const [optionsResponse, profileResponse] = await Promise.all([
          axios.get<ProfileOptions>('/user/options', { withCredentials: true }),
          axios.get<ProfileFormValues>('/user/profile', { withCredentials: true })
        ]);
        setOptions(optionsResponse.data);
        setInitialValues(profileResponse.data);
      } catch (error) {
        console.error('Failed to fetch data:', error);
        showNotification('Failed to load profile data. Please try again.', 'error');
      } finally {
        stopLoading();
      }
    };
    fetchData();
  }, [showNotification, startLoading, stopLoading]);

  const validationSchema = Yup.object().shape({
    college: Yup.string().required('This question is required'),
    year: Yup.string().required('This question is required'),
    course: Yup.string().required('This question is required'),
  });

  const handleSubmit = async (values: ProfileFormValues, { setSubmitting }: { setSubmitting: (isSubmitting: boolean) => void }) => {
    startLoading();
    if (!isProfileComplete) {
      try {
        await axios.post('/user/profile', values, { withCredentials: true });
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
        stopLoading();
      }
    }
  };

  return (
    <Row className="justify-content-center">
      <Col md={8} lg={6}>
        <Card>
          <Card.Body>
            <h2 className="text-center mb-3">{isProfileComplete ? 'Your profile' : 'Complete your profile'}</h2>
            <Formik
              initialValues={initialValues}
              validationSchema={validationSchema}
              onSubmit={handleSubmit}
              enableReinitialize={true}
            >
              {({ isSubmitting }) => (
                <FormikForm noValidate>
                  <FormField fieldName="college" label="College" options={options.colleges} />
                  <FormField
                    fieldName="year"
                    label="Year"
                    options={options.years}
                    guidance={isLongVacationPeriod ? "Please tell us the year you've just finished, not the one you're going into." : undefined}
                  />
                  <FormField fieldName="course" label="Course" options={options.courses} />
                  {!isProfileComplete && (
                    <div className="d-grid">
                      <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                        {isSubmitting ? 'Submitting...' : 'Submit'}
                      </button>
                    </div>
                  )}
                </FormikForm>
              )}
            </Formik>
            {isProfileComplete && (
              <p className="text-center text-muted">
                <small>
                  For security reasons, you can't update your profile information here. If these details change,
                  email <a href="mailto:tutereview.org+support@gmail.com">tutereview.org+support@gmail.com</a> and we'll help you out.
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