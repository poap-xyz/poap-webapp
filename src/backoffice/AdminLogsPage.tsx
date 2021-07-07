import React, { FC, useState, useEffect } from 'react';

/* Helpers */
import { AdminLog, getAdminLogs, getAdminActions, AdminLogAction } from '../api';
/* Assets */
import FilterSelect from '../components/FilterSelect';
/* Components */
import { Loading } from '../components/Loading';
import DayPickerInput from 'react-day-picker/DayPickerInput';
import ReactPaginate from 'react-paginate';

type PaginateAction = {
  selected: number;
};

const AdminLogsPage: FC = () => {
  const ACTION_ALL = { action: 'ALL', description: 'All Actions' };
  const [page, setPage] = useState<number>(0);
  const [limit, setLimit] = useState<number>(10);
  const [total, setTotal] = useState<number>(0);
  const [logs, setLogs] = useState<null | AdminLog[]>(null);
  const [isFetchingLogs, setIsFetchingLogs] = useState<null | boolean>(null);
  const [actions, setActions] = useState<AdminLogAction[]>([ACTION_ALL]);
  const [email, setEmail] = useState<string>('');
  const [action, setAction] = useState<AdminLogAction>(actions[0]);
  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');
  const [responseStatus, setResponseStatus] = useState<number | undefined>(undefined);
  const [eventId, setEventId] = useState<number | undefined>(undefined);

  useEffect(() => {
    if (actions.length === 1) {
      fetchActions();
    }
  }, []); /* eslint-disable-line react-hooks/exhaustive-deps */

  useEffect(() => {
    fetchLogs();
  }, [page]); /* eslint-disable-line react-hooks/exhaustive-deps */

  useEffect(() => {
    setPage(0);
    fetchLogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [action, dateFrom, dateTo, email, action, responseStatus, eventId, limit]);

  const fetchLogs = () => {
    setIsFetchingLogs(true);
    setLogs(null);

    const actionString = action.action === 'ALL' ? '' : action.action;

    getAdminLogs(limit, page * limit, email, actionString, dateFrom, dateTo, responseStatus, eventId)
      .then((response) => {
        if (!response) {
          return;
        }
        setLogs(response.admin_logs);
        setTotal(response.total);
      })
      .catch((e) => console.log(e))
      .finally(() => setIsFetchingLogs(false));
  };

  const fetchActions = () => {
    getAdminActions()
      .then((response) => {
        if (!response) {
          return;
        }
        setActions(actions.concat(response.actions));
      })
      .catch((e) => console.log(e));
  };

  const handleActionChange = (e: React.ChangeEvent<HTMLSelectElement>): void => {
    const { value } = e.target;
    const selectedAction = actions.find((x) => x.action === value) || ACTION_ALL;
    setAction(selectedAction);
  };

  const handleDayFromChange = (day: Date): void => {
    setDateFrom(day.toISOString());
  };

  const handleDayToChange = (day: Date): void => {
    setDateTo(day.toISOString());
  };

  const handleLimitChange = (e: React.ChangeEvent<HTMLSelectElement>): void => {
    const { value } = e.target;
    setLimit(parseInt(value, 10));
  };

  const handlePageChange = (obj: PaginateAction) => {
    setPage(obj.selected);
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { value } = e.target;
    setEmail(value);
  };

  const handleEventIdChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { value } = e.target;
    setEventId(parseInt(value, 10));
  };

  const handleResponseCodeChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { value } = e.target;
    setResponseStatus(parseInt(value, 10));
  };

  return (
    <div className="admin-table admin-logs">
      <h2>Admin Logs</h2>
      <div>
        <div className={'filters-container admin-logs'}>
          <div className={'filter col-md-4'}>
            <input placeholder={'Event ID'} type={'number'} onChange={handleEventIdChange} />
          </div>
          <div className={'filter col-md-4'}>
            <input placeholder={'Email'} type={'email'} onChange={handleEmailChange} />
          </div>
          <div className={'filter col-md-4'}>
            <input placeholder={'Response'} type={'number'} onChange={handleResponseCodeChange} />
          </div>
        </div>
        <div className={'filters-container admin-logs'}>
          <div className={'filter col-md-4'}>
            <FilterSelect handleChange={handleActionChange}>
              {actions.map((action) => {
                return (
                  <option key={action.action} value={action.action}>
                    {action.description}
                  </option>
                );
              })}
            </FilterSelect>
          </div>
          <div className={'filter col-md-4'}>
            <DayPickerInput
              onDayChange={handleDayFromChange}
              placeholder={'Date From'}
              inputProps={{ readOnly: 'readonly' }}
            />
          </div>
          <div className={'filter col-md-4'}>
            <DayPickerInput
              onDayChange={handleDayToChange}
              placeholder={'Date To'}
              inputProps={{ readOnly: 'readonly' }}
            />
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
      </div>
      <div className={'row table-header visible-md'}>
        <div className={'col-md-3'}>Email</div>
        <div className={'col-md-3'}>Action</div>
        <div className={'col-md-3'}>Created Date</div>
        <div className={'col-md-1'}>Event ID</div>
        <div className={'col-md-1'}>Response</div>
        <div className={'col-md-1 center'}>IP</div>
      </div>
      <div className={'admin-table-row'}>
        {isFetchingLogs && <Loading />}

        {logs &&
          logs.map((log, i) => {
            const actionDesc = actions.find((x) => x.action === log.action)?.description;

            return (
              <div className={`row ${i % 2 === 0 ? 'even' : 'odd'}`} key={log.id}>
                <div className={'col-md-3'}>
                  <span className={'visible-sm'}>Email: </span>
                  {log.auth0_email}
                </div>
                <div className={'col-md-3'}>
                  <span className={'visible-sm'}>Action: </span>
                  {actionDesc}
                </div>
                <div className={'col-md-3'}>
                  <span className={'visible-sm'}>Created Date: </span>
                  {log.created_date}
                </div>
                <div className={'col-md-1'}>
                  <span className={'visible-sm'}>Event ID: </span>
                  {log.event_id}
                </div>
                <div className={'col-md-1'}>
                  <span className={'visible-sm'}>Response: </span>
                  {log.response_code}
                </div>
                <div className={'col-md-1 center'}>
                  <span className={'visible-sm'}>IP: </span>
                  {log.ip}
                </div>
              </div>
            );
          })}

        {logs && logs.length === 0 && !isFetchingLogs && <div className={'no-results'}>No logs found</div>}
      </div>
      {total > limit && (
        <div className={'pagination'}>
          <ReactPaginate
            pageCount={Math.ceil(total / limit)}
            marginPagesDisplayed={2}
            pageRangeDisplayed={5}
            forcePage={page}
            activeClassName={'active'}
            onPageChange={handlePageChange}
          />
        </div>
      )}
    </div>
  );
};
export { AdminLogsPage };
