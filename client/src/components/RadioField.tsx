import { useFormikContext, FormikValues } from "formik";
import { Question } from "../types";
import './RadioField.css';

const RadioField: React.FC<{
  question: Question;
  hasError: boolean;
}> = ({ question, hasError }) => {
  const { values, setFieldValue } = useFormikContext<FormikValues>();

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
};

export default RadioField;