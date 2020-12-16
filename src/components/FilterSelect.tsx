import React from 'react';

type FilterSelectProps = {
  handleChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
};

const FilterSelect: React.FC<FilterSelectProps> = ({ children, handleChange }) => (
  <select className="filter-base filter-select" onChange={handleChange}>
    {children}
  </select>
);

export default FilterSelect;
