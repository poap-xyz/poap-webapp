import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import { OptionTypeBase } from 'react-select';
import { useToasts } from 'react-toast-notifications';

/* Helpers */
import { eventOptionType, PoapEvent, Checkout,  getEvents, getCheckouts } from '../../api';

/* Components */
import { Loading } from '../../components/Loading';
import FilterButton from '../../components/FilterButton';
import FilterReactSelect from '../../components/FilterReactSelect';
import FilterSelect from '../../components/FilterSelect';
import ReactPaginate from 'react-paginate';

/* Assets */
import { ReactComponent as EditIcon } from '../../images/edit.svg';
import checked from '../../images/checked.svg';
import error from '../../images/error.svg';

/* Types */
type PaginateAction = {
  selected: number;
};

const CheckoutList = () => {
  /* State */
  const [page, setPage] = useState<number>(0);
  const [total, setTotal] = useState<number>(0);
  const [limit, setLimit] = useState<number>(10);
  const [activeStatus, setActiveStatus] = useState<boolean | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<number | undefined>(undefined);
  const [events, setEvents] = useState<PoapEvent[]>([]);
  const [checkouts, setCheckouts] = useState<Checkout[]>([]);
  const [isFetching, setIsFetching] = useState<null | boolean>(null);

  const { addToast } = useToasts();

  const dateFormatter = (day: string) => format(new Date(day), 'dd-MMM HH:mm');

  /* Effects */
  useEffect(() => {
    fetchEvents();
  }, []); /* eslint-disable-line react-hooks/exhaustive-deps */
  useEffect(() => {
    if (checkouts.length > 0) fetchCheckouts();
  }, [page]); /* eslint-disable-line react-hooks/exhaustive-deps */
  useEffect(() => {
    setPage(0);
    fetchCheckouts();
  }, [selectedEvent, activeStatus, limit]); /* eslint-disable-line react-hooks/exhaustive-deps */

  /* Data functions */
  const fetchCheckouts = async () => {
    setIsFetching(true);
    try {
      const response = await getCheckouts(limit, page * limit, selectedEvent, activeStatus);
      if (response) {
        setCheckouts(response.checkouts);
        setTotal(response.total);
      }
    } catch (e) {
      addToast('Error while fetching checkouts', {
        appearance: 'error',
        autoDismiss: false,
      });
    } finally {
      setIsFetching(false);
    }
  };
  const fetchEvents = async () => {
    try {
      const events = await getEvents();
      setEvents(events);
    } catch (e) {
      addToast('Error while fetching events', {
        appearance: 'error',
        autoDismiss: false,
      });
    }
  };

  /* UI Handlers */
  const handleLimitChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>): void => {
    const { value } = e.target;
    setLimit(parseInt(value, 10));
  };
  const handleSelectChange = (option: OptionTypeBase): void => {
    setSelectedEvent(option.value);
  };
  const handleStatusChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>): void => {
    const { value } = e.target;
    let finalValue = value === '' ? null : value === 'true';
    setActiveStatus(finalValue);
  };
  const handlePageChange = (obj: PaginateAction) => setPage(obj.selected);

  /* UI Manipulation */
  let eventOptions: eventOptionType[] = [];
  if (events) {
    eventOptions = events.map((event) => {
      const label = `${event.name ? event.name : 'No name'} (${event.fancy_id}) - ${event.year}`;
      return { value: event.id, label: label, start_date: event.start_date };
    });
  }

  const tableHeaders = (
    <div className={'row table-header visible-md'}>
      <div className={'col-md-3'}>Event</div>
      <div className={'col-md-2'}>URL</div>
      <div className={'col-md-2 center'}>Start</div>
      <div className={'col-md-2 center'}>End</div>
      <div className={'col-md-1 center'}>Limit</div>
      <div className={'col-md-1 center'}>Active</div>
      <div className={'col-md-1 '} />
    </div>
  );

  return (
    <div className={'admin-table checkouts'}>
      <h2>Checkouts</h2>
      <div className="filters-container checkouts">
        <div className={'filter col-md-4 col-xs-12'}>
          <div className="filter-option">
            <FilterReactSelect options={eventOptions} onChange={handleSelectChange} placeholder={'Filter by Event'} />
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
          <Link to="/admin/checkouts/new">
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
        <div className={'checkout-table-section'}>
          {tableHeaders}
          <Loading />
        </div>
      )}

      {checkouts && checkouts.length === 0 && !isFetching && <div className={'no-results'}>No Checkouts found</div>}

      {checkouts && checkouts.length !== 0 && !isFetching && (
        <div className={'checkout-table-section'}>
          {tableHeaders}
          <div className={'admin-table-row checkout-table'}>
            {checkouts.map((checkout, i) => {
              const url = `/e/${checkout.fancy_id}`;
              return (
                <div className={`row ${i % 2 === 0 ? 'even' : 'odd'}`} key={checkout.id}>
                  <div className={'col-md-3 col-xs-12 ellipsis'}>
                    <span className={'visible-sm'}>Event: </span>
                    {checkout.event.name}
                  </div>

                  <div className={'col-md-2 col-xs-12'}>
                    <span className={'visible-sm'}>URL: </span>
                    <a href={url} target={'_blank'} rel="noopener noreferrer">
                      {url}
                    </a>
                  </div>

                  <div className={'col-md-2 col-xs-6 center'}>
                    <span className={'visible-sm'}>Start: </span>
                    {dateFormatter(checkout.start_time)}
                  </div>

                  <div className={'col-md-2 col-xs-6 center'}>
                    <span className={'visible-sm'}>End: </span>
                    {dateFormatter(checkout.end_time)}
                  </div>

                  <div className={'col-md-1 col-xs-6 center'}>
                    <span className={'visible-sm'}>Limit: </span>
                    {checkout.max_limit}
                  </div>

                  <div className={'col-md-1 col-xs-6 center status'}>
                    <span className={'visible-sm'}>Active: </span>
                    <img
                      src={checkout.is_active === 'true' ? checked : error}
                      alt={checkout.is_active === 'true' ? 'Active' : 'Inactive'}
                      className={'status-icon'}
                    />
                  </div>
                  <div className={'col-md-1 center event-edit-icon-container'}>
                    <Link to={`/admin/checkouts/${checkout.fancy_id}`}>
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

export default CheckoutList;
