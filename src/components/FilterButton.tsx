import React from 'react';

type FilterButtonProps = {
  text: string;
  handleClick?: () => void;
  type?: 'button' | 'submit';
};

const FilterButton: React.FC<FilterButtonProps> = ({ text, handleClick, type = 'button' }) => (
  <button type={type} className="filter-base filter-button" onClick={handleClick}>
    {text}
  </button>
);

export default FilterButton;
