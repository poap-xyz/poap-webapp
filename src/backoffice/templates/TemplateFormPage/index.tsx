import React, { FC } from 'react';
import delve from 'dlv';
import { RouteComponentProps } from 'react-router-dom';

/* Components */
import { TemplateForm } from './components/TemplateForm';

export const TemplateFormPage: FC<RouteComponentProps> = ({ match }) => {
  const id = delve(match, 'params.id');
  return (
    <div className="container">
      <div className={'admin-table'}>
        <TemplateForm id={id} />
      </div>
    </div>
  );
};
