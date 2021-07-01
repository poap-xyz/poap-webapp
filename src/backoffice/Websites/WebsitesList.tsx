import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useToasts } from 'react-toast-notifications';

/* Helpers */
import { getWebsites, Website } from '../../api';
import { ROUTES } from '../../lib/constants';

/* Components */
import { Loading } from '../../components/Loading';
import FilterButton from '../../components/FilterButton';
import FilterSelect from '../../components/FilterSelect';
import ReactPaginate from 'react-paginate';

/* Assets */
import { ReactComponent as EditIcon } from '../../images/edit.svg';
import checked from '../../images/checked.svg';
import error from '../../images/error.svg';
import { format } from 'date-fns';

/* Types */
type PaginateAction = {
  selected: number;
};

const WebsitesList = () => {
  /* State */
  const [page, setPage] = useState<number>(0);
  const [total, setTotal] = useState<number>(0);
  const [limit, setLimit] = useState<number>(10);
  const [activeStatus, setActiveStatus] = useState<boolean | null>(null);
  const [websites, setWebsites] = useState<Website[]>([]);
  const [isFetching, setIsFetching] = useState<null | boolean>(null);

  const { addToast } = useToasts();

  /* Effects */
  useEffect(() => {
    if (websites.length > 0) fetchWebsites();
  }, [page]); /* eslint-disable-line react-hooks/exhaustive-deps */
  useEffect(() => {
    setPage(0);
    fetchWebsites();
  }, [activeStatus, limit]); /* eslint-disable-line react-hooks/exhaustive-deps */

  /* Data functions */
  const fetchWebsites = async () => {
    setIsFetching(true);
    try {
      const response = await getWebsites(limit, page * limit, activeStatus);
      if (response) {
        setWebsites(response.websites);
        setTotal(response.total);
      }
    } catch (e) {
      addToast('Error while fetching websites', {
        appearance: 'error',
        autoDismiss: false,
      });
    } finally {
      setIsFetching(false);
    }
  };

  /* UI Handlers */
  const handleLimitChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>): void => {
    const { value } = e.target;
    setLimit(parseInt(value, 10));
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>): void => {
    const { value } = e.target;
    let finalValue = value === '' ? null : value === 'true';
    setActiveStatus(finalValue);
  };

  const handlePageChange = (obj: PaginateAction) => setPage(obj.selected);

  const tableHeaders = (
    <div className={'row table-header visible-md'}>
      <div className={'col-md-4 col-xs-3 '}>ClaimName</div>
      <div className={'col-md-2 col-xs-2 '}>Start Date</div>
      <div className={'col-md-2 col-xs-2 '}>End Date</div>
      <div className={'col-md-1 col-xs-2 '}>Claim/Total</div>
      <div className={'col-md-1 col-xs-1 visible-md center'}>Captcha</div>
      <div className={'col-md-1 col-xs-1 center'}>Active</div>
      <div className={'col-md-1 col-xs-1'} />
    </div>
  );

  return (
    <div className={'admin-table websites'}>
      <h2>Websites</h2>
      <div className="filters-container websites">
        <div className={'filter col-md-4 col-xs-12'}>
          <div className={'filter-group'}>
            <FilterSelect handleChange={handleStatusChange}>
              <option value="">Filter by status</option>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </FilterSelect>
          </div>
        </div>
        <div className={'filter col-md-3 col-xs-6'}>
          <div className={'filter-group'}>
            <FilterSelect handleChange={handleStatusChange}>
              <option value="">Filter by status</option>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </FilterSelect>
          </div>
        </div>
        <div className={'col-md-2'} />
        <div className={'filter col-md-3 col-xs-6 new-button'}>
          <Link to={ROUTES.websites.newForm.path}>
            <FilterButton text="Create new" />
          </Link>
        </div>
      </div>
      <div className={'secondary-filters'}>
        <div className={'secondary-filters--pagination'}>
          Results per page:
          <select onChange={handleLimitChange}>
            <option value={10}>10</option>
            <option value={100}>100</option>
            <option value={1000}>1000</option>
          </select>
        </div>
      </div>
      {isFetching && (
        <div className={'delivery-table-section'}>
          {tableHeaders}
          <Loading />
        </div>
      )}

      {websites && websites.length === 0 && !isFetching && <div className={'no-results'}>No Websites found</div>}

      {websites && websites.length !== 0 && !isFetching && (
        <div className={'website-table-section'}>
          {tableHeaders}
          <div className={'admin-table-row website-table'}>
            {websites.map((website, i) => {
              return (
                <div className={`row ${i % 2 === 0 ? 'even' : 'odd'}`} key={website.claimName}>
                  <div className={'col-md-4 col-xs-12 ellipsis'}>
                    <span className={'visible-sm'}>Claim Name: </span>
                    {website.claimName}
                  </div>

                  <div className={'col-md-2 col-xs-12 ellipsis'}>
                    <span className={'visible-sm'}>Start Date: </span>
                    {website.from? format(new Date(website.from), 'MM-dd-yyyy HH:MM') : '-'}
                  </div>

                  <div className={'col-md-2 col-xs-12 ellipsis'}>
                    <span className={'visible-sm'}>End Date: </span>
                    {website.to? format(new Date(website.to), 'MM-dd-yyyy HH:MM') : '-'}
                  </div>

                  <div className={'col-md-1 col-xs-12 ellipsis center'}>
                    <span className={'visible-sm'}>Claimed / Total: </span>
                    {website.deliveriesCount?.claimed + '/' + website.deliveriesCount?.total}
                  </div>

                  <div className={'col-md-1 visible-md center status'}>
                    <span className={'visible-sm'}>Captcha: </span>
                    <img
                      src={website.captcha ? checked : error}
                      alt={website.captcha ? 'Active' : 'Inactive'}
                      className={'status-icon'}
                    />
                  </div>

                  <div className={'col-md-1 col-xs-12 center status'}>
                    <span className={'visible-sm'}>Active: </span>
                    <img
                      src={website.active ? checked : error}
                      alt={website.active ? 'Active' : 'Inactive'}
                      className={'status-icon status-icon-websites'}
                    />
                  </div>

                  <div className={'col-md-1 col-xs-1 center event-edit-icon-container'}>
                    <Link to={`/admin/websites/edit/${website.claimName}`}>
                      <EditIcon />
                    </Link>
                  </div>

                </div>
              );
            })}
          </div>
          {total > limit && (
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
    </div>
  );
};

export default WebsitesList;
