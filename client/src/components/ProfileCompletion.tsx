import React, { useEffect } from 'react';
import { Formik, Form, Field, ErrorMessage, FormikProps, getIn } from 'formik';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import Select, { SingleValue } from 'react-select';
import { Row, Col, Card, Form as BootstrapForm } from 'react-bootstrap';
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

const ProfileSchema = Yup.object().shape({
  college: Yup.string().required('Required'),
  year: Yup.string().required('Required'),
  subject: Yup.string().required('Required'),
});

const isFieldRequired = (
  fieldName: string,
  validationSchema : Yup.ObjectSchema<FormValues>,
): boolean => {
  const fieldDescription = getIn(validationSchema.describe().fields, fieldName);
  return !!fieldDescription.tests.find((test: { name: string }) => test.name === 'required');
};

const baseURL = process.env.REACT_APP_API_URL;

const ProfileCompletion: React.FC = () => {
  const [options, setOptions] = React.useState<OptionsState>({ colleges: [], years: [], subjects: [] });
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

  const handleSubmit = async (values: FormValues) => {
    try {
      await axios.post(`${baseURL}/user/update-profile`, values, { withCredentials: true });
      await checkAuthStatus();
      navigate('/');
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const renderField = (fieldName: string, label: string, options: Option[], formikProps: FormikProps<FormValues>) => {
    const { errors, touched, setFieldValue } = formikProps;
    const isRequired = isFieldRequired(fieldName, ProfileSchema);

    return (
      <BootstrapForm.Group className="mb-3">
        <BootstrapForm.Label className="fw-bold">
          {label}
          {isRequired && <span className="text-danger" style={{ userSelect: 'none' }}> *</span>}
        </BootstrapForm.Label>
        <Field name={fieldName}>
          {({ field }: { field: any }) => (
            <Select<Option>
              options={options}
              onChange={(option: SingleValue<Option>) => {
                if (option) {
                  setFieldValue(fieldName, option.value);
                }
              }}
              value={options.find(option => option.value === field.value)}
              className="basic-select"
              classNamePrefix="select"
              aria-label={label}
              aria-invalid={!!(errors[fieldName as keyof FormValues] && touched[fieldName as keyof FormValues])}
              aria-describedby={`${fieldName}-error`}
            />
          )}
        </Field>
        <ErrorMessage name={fieldName}>
          {(msg) => <div id={`${fieldName}-error`} className="text-danger">{msg}</div>}
        </ErrorMessage>
      </BootstrapForm.Group>
    );
  };

  return (
    <>
      <Row className="justify-content-center">
        <Col md={8} lg={6}>
          <Card>
            <Card.Body>
              <h2 className="text-center mb-4">Complete Your Profile</h2>
              <Formik
                initialValues={{ college: '', year: '', subject: '' }}
                validationSchema={ProfileSchema}
                onSubmit={handleSubmit}
              >
                {(formikProps) => (
                  <Form>
                    {renderField('college', 'College', options.colleges, formikProps)}
                    {renderField('year', 'Year', options.years, formikProps)}
                    {renderField('subject', 'Subject', options.subjects, formikProps)}
                    <div className="d-grid">
                      <button type="submit" className="btn btn-primary">Submit</button>
                    </div>
                  </Form>
                )}
              </Formik>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </>
  );
};

export default ProfileCompletion;