import { FormikValues, useFormikContext } from "formik";
import './CheckboxGroup.css'

interface CheckboxGroupProps {
  id: string;
  options: string[];
}

const CheckboxGroup: React.FC<CheckboxGroupProps> = ({ id, options }) => {
  const { values, setFieldValue } = useFormikContext<FormikValues>();

  const handleChange = (option: string) => {
    const currentValues = values[id] || [];
    const newValues = currentValues.includes(option)
      ? currentValues.filter((value: string) => value !== option)
      : [...currentValues, option];
    setFieldValue(id, newValues);
  };

  return (
    <div className="checkbox-group" role="group" aria-labelledby={`${id}-label`}>
      {options.map((option, index) => (
        <label key={index} className="checkbox-label">
          <input
            type="checkbox"
            name={id}
            value={option}
            checked={(values[id] || []).includes(option)}
            onChange={() => handleChange(option)}
          />
          <span className="checkbox-button"></span>
          {option}
        </label>
      ))}
    </div>
  );
};

export default CheckboxGroup;