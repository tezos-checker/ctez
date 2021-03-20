import React from 'react';
import {
  FormControl,
  FormLabel,
  FormControlLabel,
  Radio,
  RadioGroup as MaterialRadioGroup,
  RadioGroupProps,
} from '@material-ui/core';
import { FieldProps } from 'formik';

interface RadioOption {
  value: string | boolean | number;
  label: string;
  disabled?: boolean;
}

export interface InternalFieldProps extends FieldProps {
  groupLabel?: string;
  options: RadioOption[];
  handleChange: (event: React.ChangeEvent<HTMLInputElement>, value: string) => void | Promise<void>;
}

export type FormikRadioGroupProps = InternalFieldProps & RadioGroupProps;

export const FormikRadioGroup: React.FC<FormikRadioGroupProps> = ({
  form: { handleChange: formikHandleChange },
  field: { value, name },
  handleChange,
  options,
  groupLabel,
  ...rest
}) => {
  return (
    <FormControl component="fieldset">
      {groupLabel && <FormLabel component="legend">{groupLabel}</FormLabel>}
      <MaterialRadioGroup
        aria-label={name}
        name={name}
        value={value}
        onChange={formikHandleChange}
        {...rest}
      >
        {options.map(({ value: val, label, disabled }) => (
          <FormControlLabel
            key={label}
            value={val}
            disabled={disabled}
            control={<Radio />}
            label={label}
          />
        ))}
      </MaterialRadioGroup>
    </FormControl>
  );
};
