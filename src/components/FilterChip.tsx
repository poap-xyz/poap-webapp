import React from 'react';

import { FormikHandlers } from 'formik';

type HandleFormikChange = FormikHandlers['handleChange'];

type HandleClick = () => void;

type FilterChipProps = {
  name?: string;
  text: string;
  isActive: boolean;
  handleOnClick: HandleFormikChange | HandleClick;
};

const FilterChip: React.FC<FilterChipProps> = ({ text, isActive, handleOnClick }) => {
  return (
    <button
      className={`filter-base filter-chip ${isActive ? 'active' : ''}`}
      onClick={handleOnClick}
    >
      {text}
    </button>
  );
};

export default FilterChip;
