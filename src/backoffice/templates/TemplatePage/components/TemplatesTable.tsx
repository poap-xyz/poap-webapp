import React, { FC } from 'react';
import { Link } from 'react-router-dom';
import { Tooltip } from 'react-lightweight-tooltip';
import ReactPaginate from 'react-paginate';

// ui components
import { Loading } from 'components/Loading';

// types
import { Template, TemplatesResponse } from 'api';

// assets
import { ReactComponent as EditIcon } from 'images/edit.svg';

type Props = {
  isFetchingTemplates: boolean;
  templates: TemplatesResponse<Template> | null;
  total: number;
  limit: number;
  // TODO: type this handler
  handlePageChange: any;
  page: number;
};

export const TemplatesTable: FC<Props> = ({
  isFetchingTemplates,
  templates,
  total,
  limit,
  handlePageChange,
  page,
}) => {
  return (
    <>
      {isFetchingTemplates && <Loading />}

      {templates && total !== 0 && !isFetchingTemplates && (
        <div className={'qr-table-section'}>
          <div className={'row table-header visible-md'}>
            <div className={'col-md-1'} />
            <div className={'col-md-7'}>Name</div>
            <div className={'col-md-2 center'}>Logo</div>
            <div className={'col-md-2 center'}>Edit</div>
          </div>
          <div className={'admin-table-row qr-table'}>
            {templates?.event_templates?.map((template, index) => {
              return (
                <div className={`row ${index % 2 === 0 ? 'even' : 'odd'}`} key={template.id}>
                  <div className={'col-md-1'} />
                  <div className={'col-md-7 col-xs-12'}>
                    <span className={'visible-sm'}>Name: </span>
                    {template.name}
                  </div>

                  <div className={'col-md-2 col-xs-8 center'}>
                    <Tooltip
                      content={[
                        <div key={template.name + template.id} className={'event-table-tooltip'}>
                          <img
                            alt="Template logo"
                            src={template.title_image}
                            className={'tooltipped'}
                          />
                        </div>,
                      ]}
                    >
                      <img
                        alt="Template logo"
                        className={'logo-image'}
                        src={template.title_image}
                      />
                    </Tooltip>
                  </div>

                  <div className={'col-md-2 col-xs-4 center template-edit-icon-container'}>
                    <Link to={`/admin/template/form/${template.id}`}>
                      <EditIcon />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
          {total > limit * page && (
            <div className={'pagination'}>
              <ReactPaginate
                pageCount={Math.ceil(total / limit)}
                marginPagesDisplayed={2}
                pageRangeDisplayed={5}
                activeClassName={'active'}
                onPageChange={handlePageChange}
                forcePage={page}
              />
            </div>
          )}
        </div>
      )}
    </>
  );
};
