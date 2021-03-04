import React from 'react';
import { Autocomplete as MaterialAutocomplete, TextField, TextFieldProps } from '@material-ui/core';
import { FieldProps } from 'formik';
import { Baker } from '../../interfaces';

export type FormikAutocompleteProps = FieldProps &
  TextFieldProps & {
    options: Baker[];
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
      getOptionLabel={(option) => option.name ?? option.address}
      options={options}
      onChange={(_, value: any) => setFieldValue(name, value.address)}
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
