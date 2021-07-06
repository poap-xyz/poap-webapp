import React, { FC, useState, useEffect } from 'react';

/* Helpers */
import { AdminLog, getAdminLogs, getAdminActions, AdminLogAction } from '../api';
/* Assets */
import FilterSelect from '../components/FilterSelect';
/* Components */
import { Loading } from '../components/Loading';

const AdminLogsPage: FC = () => {
  const ACTION_ALL = { action: 'ALL', description: 'All Actions' };
  const [page, setPage] = useState<number>(0);
  const [limit, setLimit] = useState<number>(10);
  const [total, setTotal] = useState<number>(0);
  const [logs, setLogs] = useState<null | AdminLog[]>(null);
  const [isFetchingLogs, setIsFetchingLogs] = useState<null | boolean>(null);
  const [actions, setActions] = useState<AdminLogAction[]>([ACTION_ALL]);
  const [isFetchingActions, setIsFetchingActions] = useState<null | boolean>(null);
  const [email, setEmail] = useState<null | string>(null);
  const [action, setAction] = useState<AdminLogAction>(actions[0]);
  const [responseStatus, setResponseStatus] = useState<null | number>(null);
  const [dateFrom, setDateFrom] = useState<null | string>(null);
  const [dateTo, setDateTo] = useState<null | string>(null);
  const [eventId, setEventId] = useState<null | number>(null);

  useEffect(() => {
    if (actions.length === 1) {
      fetchActions();
    }
  }, []); /* eslint-disable-line react-hooks/exhaustive-deps */
  useEffect(() => {
    fetchLogs();
  }, [action]); /* eslint-disable-line react-hooks/exhaustive-deps */
  const fetchLogs = () => {
    setIsFetchingLogs(true);
    setLogs(null);

    const actionString = action.action === 'ALL' ? null : action.action;

    getAdminLogs(limit, page * limit, email, actionString, responseStatus, dateFrom, dateTo, eventId)
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
    setIsFetchingActions(true);

    getAdminActions()
      .then((response) => {
        if (!response) {
          return;
        }
        setActions(actions.concat(response.actions));
      })
      .catch((e) => console.log(e))
      .finally(() => setIsFetchingActions(false));
  };
  const handleActionChange = (e: React.ChangeEvent<HTMLSelectElement>): void => {
    const { value } = e.target;
    const selectedAction = actions.find((x) => x.action === value) || ACTION_ALL;
    setAction(selectedAction);
  };

  return (
    <div className="admin-table admin-logs">
      <h2>Admin Logs</h2>
      <div>
        <div className={'filters-container admin-logs'}>
          <div className={'right-content'}>
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
      </div>
    </div>
  );
};
export { AdminLogsPage };
