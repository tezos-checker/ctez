import React from 'react';
import { Autocomplete as MaterialAutocomplete, TextField, TextFieldProps } from '@material-ui/core';
import { FieldProps } from 'formik';

export type FormikAutocompleteProps = FieldProps &
  TextFieldProps & {
    options: string[];
  };
export const FormikAutocomplete: React.FC<FormikAutocompleteProps> = ({
  options = [],
  form: { setTouched, setFieldValue, touched, errors },
  field: { name },
  ...rest
}) => {
  return (
    <MaterialAutocomplete
      freeSolo
      options={options}
      onChange={(_, value) => setFieldValue(name, value)}
      renderInput={(params) => (
        <TextField
          {...params}
          {...rest}
          onChange={(e) => setFieldValue(name, e.target.value)}
          onBlur={() => setTouched({ [name]: true })}
          helperText={touched[name] ? errors[name] : ''}
          error={touched[name] && Boolean(errors[name])}
        />
      )}
    />
  );
};
