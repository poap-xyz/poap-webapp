import React, { FC } from 'react';
import { Link } from 'react-router-dom';

// ui components
import FilterButton from 'components/FilterButton';

type Props = {
  setLimit: (value: number) => void;
  setName: (value: string) => void;
};

export const TemplatesFilters: FC<Props> = ({ setLimit, setName }) => {
  // handlers
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { value } = e.target;
    setName(value);
  };

  const handleLimitChange = (e: React.ChangeEvent<HTMLSelectElement>): void => {
    const { value } = e.target;
    setLimit(parseInt(value, 10));
  };

  return (
    <>
      <div className="filters-container templates space-between">
        <input type="text" placeholder="Search by name" onChange={handleNameChange} />
        <div className="action-buttons-container">
          <div className="action-button-container ">
            <Link to="/admin/template/form">
              <FilterButton text="Create" />
            </Link>
          </div>
        </div>
      </div>
      <div className={'secondary-filters'}>
        Results per page:
        <select onChange={handleLimitChange}>
          <option value={10}>10</option>
          <option value={100}>100</option>
          <option value={1000}>1000</option>
        </select>
      </div>
    </>
  );
};
