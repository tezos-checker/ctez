import { TextField, TextFieldProps } from '@material-ui/core';
import { FieldProps } from 'formik';
import React from 'react';

export interface InternalFieldProps extends FieldProps {
  handleChange: (
    val: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>,
  ) => void | Promise<void>;
}

export type FormikTextFieldProps = InternalFieldProps & TextFieldProps;

export const FormikTextField: React.FC<FormikTextFieldProps> = ({
  form: { touched, errors, handleBlur, handleChange: formikHandleChange },
  field: { value, name },
  handleChange,
  ...rest
}) => {
  return (
    <TextField
      {...rest}
      name={name}
      value={value}
      helperText={touched[name] ? errors[name] : ''}
      error={touched[name] && Boolean(errors[name])}
      onChange={(val) => {
        formikHandleChange(val);
        handleChange && handleChange(val);
      }}
      onBlur={handleBlur}
    />
  );
};
