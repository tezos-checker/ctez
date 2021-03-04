import { TextField } from '@material-ui/core';
import { DateTimePicker, DateTimePickerProps } from '@material-ui/pickers';
import { FieldProps } from 'formik';
import React from 'react';

export type FormikDateTimePickerProps = DateTimePickerProps & FieldProps;

export const FormikDateTimePicker: React.FC<FormikDateTimePickerProps> = ({
  form: { setFieldValue, touched, errors, setFieldTouched, validateForm },
  field: { value, name },
  ...rest
}) => {
  const currentError = errors[name];
  const toShowError = Boolean(currentError && touched[name]);
  return (
    <DateTimePicker
      allowKeyboardControl
      clearable
      {...rest}
      value={value}
      onChange={(val) => {
        setFieldValue(name, val, false);
        validateForm();
      }}
      renderInput={(props) => (
        <TextField
          name={name}
          {...props}
          error={toShowError}
          helperText={toShowError ? currentError ?? props.helperText : undefined}
          onBlur={(e) => {
            setFieldTouched(name, true, false);
            validateForm();
          }}
        />
      )}
    />
  );
};
