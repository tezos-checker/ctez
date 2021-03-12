import NoSsr from '@material-ui/core/NoSsr';
import { FieldProps } from 'formik';
import CloseIcon from '@material-ui/icons/Close';
import styled from '@emotion/styled';
import { useAutocomplete, InputLabel, FormHelperText } from '@material-ui/core';
import { useEffect } from 'react';

const InputWrapper = styled.div`
  width: 100%;
  border: 1px solid #d9d9d9;
  background-color: #fff;
  border-radius: 4px;
  padding: 1px;
  display: flex;
  flex-wrap: wrap;

  &:hover {
    border-color: rgba(0, 0, 0, 0.87);
  }

  &.focused {
    border-color: rgb(0, 95, 204);
    box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
  }

  & input {
    font-size: 16px;
    height: 3.4375em;
    box-sizing: border-box;
    padding: 7.5px 4px 7.5px 12px;
    width: 0;
    min-width: 30px;
    flex-grow: 1;
    border: 0;
    margin: 0;
    outline: 0;
  }
`;

interface TagProps {
  key: number;
  'data-tag-index': number;
  tabIndex: -1;
  onDelete: (event: any) => void;
  label: string;
}

const Tag: React.FC<TagProps> = ({ label, onDelete, ...rest }) => (
  <div {...rest}>
    <span>{label}</span>
    <CloseIcon onClick={onDelete} />
  </div>
);

const StyledTag = styled(Tag)`
  display: flex;
  align-items: center;
  height: 24px;
  margin: 2px;
  line-height: 22px;
  background-color: #fafafa;
  border: 1px solid #e8e8e8;
  border-radius: 2px;
  box-sizing: content-box;
  padding: 0 4px 0 10px;
  outline: 0;
  overflow: hidden;

  &:focus {
    border-color: #40a9ff;
    background-color: #e6f7ff;
  }

  & span {
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  & svg {
    font-size: 12px;
    cursor: pointer;
    padding: 4px;
  }
`;

interface MultiInputTextFieldProps {
  label: string;
  placeholder?: string;
  disabled?: boolean;
}

export type FormikMultiTextFieldProps = MultiInputTextFieldProps & FieldProps;

export const MultiInputTextField: React.FC<FormikMultiTextFieldProps> = ({
  form: { touched, errors, setFieldValue, validateForm },
  field: { name },
  label,
  placeholder,
  disabled,
}) => {
  const {
    getRootProps,
    getInputLabelProps,
    getInputProps,
    getTagProps,
    value,
    focused,
    setAnchorEl,
  } = useAutocomplete({
    multiple: true,
    options: [],
    freeSolo: true,
  });

  useEffect(() => {
    setFieldValue(name, value);
  }, [value]);

  const showHelperText = touched[name] && Boolean(errors[name]);
  const hasError = touched[name] ? errors[name] : '';
  return (
    <NoSsr>
      <div {...getRootProps()}>
        <InputLabel {...getInputLabelProps()}>{label}</InputLabel>
        <InputWrapper ref={setAnchorEl} className={focused ? 'focused' : ''}>
          {value.map((option: string, index: number) => (
            <StyledTag label={option} {...getTagProps({ index })} key={index} />
          ))}
          <input
            {...getInputProps()}
            placeholder={value.length === 0 ? placeholder : undefined}
            disabled={disabled}
          />
        </InputWrapper>
        {(showHelperText || hasError) && (
          <FormHelperText error={!!errors[name]}>{errors[name]}</FormHelperText>
        )}
      </div>
    </NoSsr>
  );
};
