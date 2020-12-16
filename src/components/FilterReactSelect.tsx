import React from 'react';
import Select, { OptionTypeBase } from 'react-select';

type FilterReactSelectProps = {
  options: any;
  placeholder: string;
  onChange: (option: OptionTypeBase) => void;
};

const colourStyles = {
  control: (styles: any) => ({
    ...styles,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: 'white',
    '&:hover': { borderColor: '#6534ff' },
  }),
  input: (styles: any) => ({ ...styles, height: 36 }),
};

const FilterReactSelect: React.FC<FilterReactSelectProps> = ({
  options,
  placeholder,
  onChange,
}) => (
  <Select
    options={options}
    onChange={onChange}
    placeholder={placeholder}
    className="rselect"
    styles={colourStyles}
  />
);

export default FilterReactSelect;
