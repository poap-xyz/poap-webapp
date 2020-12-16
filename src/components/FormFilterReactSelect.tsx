import React from 'react';
import Select, { OptionTypeBase } from 'react-select';

const colourStyles = {
  control: (styles: any) => ({
    ...styles,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: 'white',
    '&:hover': { borderColor: '#6534ff' },
  }),
  menu: (styles: any) => ({ ...styles, zIndex: 100 }),
  input: (styles: any) => ({ ...styles, height: 36 }),
};

type FormFilterReactSelectProps = {
  options: any;
  placeholder: string;
  label: string;
  name: string;
  disabled: boolean;
  onChange: (option: OptionTypeBase) => void;
  value?: OptionTypeBase;
};

const FormFilterReactSelect: React.FC<FormFilterReactSelectProps> = ({
  options,
  name,
  placeholder,
  disabled,
  onChange,
  label,
  value,
}) => {
  return (
    <div>
      <label>{label}</label>
      <Select
        isDisabled={disabled}
        options={options}
        onChange={onChange}
        placeholder={value ? value.label : placeholder}
        className="rselect"
        name={name}
        styles={colourStyles}
      />
    </div>
  );
};

export default FormFilterReactSelect;
