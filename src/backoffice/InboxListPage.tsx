import React, { FC, useState, useEffect, ChangeEvent } from 'react';
import { useToasts } from 'react-toast-notifications';

/* Libraries */
import ReactModal from 'react-modal';
import ReactPaginate from 'react-paginate';

/* Helpers */
import { Notification, getNotifications, getEvents, PoapEvent } from '../api';

/* Components */
import { Loading } from '../components/Loading';
import FilterSelect from '../components/FilterSelect';

/* Assets */
import { ReactComponent as PlusIcon } from '../images/plus.svg';

/* Typings */
import { Name, NotificationType, RecipientType } from '../types';

const PAGE_SIZE = 10;

type PaginateAction = {
  selected: number;
};

const InboxListPage: FC = () => {
  const [page, setPage] = useState<number>(0);
  const [total, setTotal] = useState<number>(0);
  const [shouldResetPage, setShouldResetPage] = useState<boolean>(false);
  const [notificationType, setNotificationType] = useState<string>('');
  const [recipientFilter, setRecipientFilter] = useState<string>('');
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [selectedEvent, setSelectedEvent] = useState<number | undefined>(undefined);
  const [modalText, setModalText] = useState<string>('');
  const [modalTitle, setModalTitle] = useState<string>('');
  const [isFetchingNotifications, setIsFetchingNotifications] = useState<null | boolean>(null);
  const [notifications, setNotifications] = useState<null | Notification[]>(null);
  const [events, setEvents] = useState<PoapEvent[]>([]);

  const { addToast } = useToasts();

  useEffect(() => {}, [notificationType]);

  useEffect(() => {}, [recipientFilter]);

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    page !== 0 ? setPage(0) : fetchNotifications();
  }, [notificationType]); /* eslint-disable-line react-hooks/exhaustive-deps */

  useEffect(() => {
    setShouldResetPage(true);
  }, [recipientFilter, selectedEvent]);

  useEffect(() => {
    if (shouldResetPage === false) return;
    setShouldResetPage(false);

    if (recipientFilter === 'event' && selectedEvent === undefined) return;
    setSelectedEvent(undefined);

    page !== 0 ? setPage(0) : fetchNotifications();
  }, [shouldResetPage]); /* eslint-disable-line react-hooks/exhaustive-deps */

  useEffect(() => {
    fetchNotifications();
  }, [page]); /* eslint-disable-line react-hooks/exhaustive-deps */

  const fetchEvents = async () => {
    const events = await getEvents();
    setEvents(events);
  };

  const fetchNotifications = async () => {
    setIsFetchingNotifications(true);

    try {
      const response = await getNotifications(
        PAGE_SIZE,
        page * PAGE_SIZE,
        notificationType,
        recipientFilter,
        selectedEvent
      );
      if (!response) return;
      setNotifications(response.notifications);
      setTotal(response.total);
    } catch (e) {
      addToast(e.message, {
        appearance: 'error',
        autoDismiss: true,
      });
    } finally {
      setIsFetchingNotifications(false);
    }
  };

  const handlePageChange = (obj: PaginateAction) => {
    setPage(obj.selected);
  };

  const handleRadio = (name: Name, value: NotificationType | RecipientType) => {
    if (name === 'notificationType') setNotificationType(value);
    if (name === 'recipientFilter') setRecipientFilter(value);
  };

  const handleEventSelect = (e: ChangeEvent<HTMLSelectElement>) => {
    setSelectedEvent(Number(e.target.value));
  };

  const handleModal = (notification?: { title: string; description: string }) => {
    if (!modalOpen && notification) {
      setModalTitle(notification.title);
      setModalText(notification.description);
    }
    setModalOpen(!modalOpen);
  };

  const handleNotificationTypeSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { value } = e.target;

    if (value === '') handleRadio('notificationType', value);
    if (value === 'inbox') handleRadio('notificationType', value);
    if (value === 'push') handleRadio('notificationType', value);
  };

  const handleRecipientSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { value } = e.target;

    if (value === '') handleRadio('recipientFilter', value);
    if (value === 'everyone') handleRadio('recipientFilter', value);
    if (value === 'event') handleRadio('recipientFilter', value);
  };

  return (
    <div className="admin-table notifications">
      <h2>Notifications</h2>
      <div>
        <div className="filters-container inbox row notifications-filters">
          <div className="col-md-3 ">
            <FilterSelect handleChange={handleNotificationTypeSelect}>
              <option value="">Select a type</option>
              <option value="inbox">Inbox</option>
              <option value="push">Push</option>
            </FilterSelect>
          </div>

          <div className="col-md-3">
            <FilterSelect handleChange={handleRecipientSelect}>
              <option value="">Select the recipient</option>
              <option value="everyone">Sent to everyone</option>
              <option value="event">Filter recipient</option>
            </FilterSelect>
          </div>

          <div className="col-md-3">
            {recipientFilter === 'event' && (
              <FilterSelect handleChange={handleEventSelect}>
                <option value="">Select an option</option>
                {events &&
                  events.map((event: PoapEvent) => {
                    const label = `${event.name} (${event.fancy_id}) - ${event.year}`;
                    return (
                      <option key={event.id} value={event.id}>
                        {label}
                      </option>
                    );
                  })}
              </FilterSelect>
            )}
          </div>
        </div>
      </div>
      {isFetchingNotifications && <Loading />}

      {notifications && notifications.length !== 0 && !isFetchingNotifications && (
        <div>
          <div className={'row table-header visible-md'}>
            <div className={'col-md-1 center'}>#</div>
            <div className={'col-md-4'}>Title</div>
            <div className={'col-md-2'}>Type</div>
            <div className={'col-md-4'}>Event</div>
            <div className={'col-md-1'} />
          </div>
          <div className={'admin-table-row'}>
            {notifications.map((notification, i) => {
              return (
                <div className={`row ${i % 2 === 0 ? 'even' : 'odd'}`} key={notification.id}>
                  <div className={'col-md-1 center'}>
                    <span className={'visible-sm'}>#</span>
                    {notification.id}
                  </div>

                  <div className={'col-md-4 ellipsis'}>
                    <span className={'visible-sm'}>Title: </span>
                    {notification.title}
                  </div>

                  <div className={'col-md-2'}>
                    <span className={'visible-sm'}>Type: </span>
                    <span className={'capitalize'}>{notification.type}</span>
                  </div>

                  <div className={'col-md-4 ellipsis'}>
                    <span className={'visible-sm'}>Event: </span>
                    {notification.event && notification.event.name
                      ? notification.event.name
                      : '-'}
                  </div>

                  <div className={'col-md-1 description'}>
                    <PlusIcon
                      className={'plus-edit-icon'}
                      onClick={() =>
                        handleModal({
                          title: notification.title,
                          description: notification.description,
                        })
                      }
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {notifications && notifications.length === 0 && !isFetchingNotifications && (
        <div className={'no-results'}>No notifications found</div>
      )}

      {total > 0 && (
        <div className={'pagination'}>
          <ReactPaginate
            pageCount={Math.ceil(total / PAGE_SIZE)}
            marginPagesDisplayed={2}
            pageRangeDisplayed={5}
            activeClassName={'active'}
            onPageChange={handlePageChange}
            forcePage={page}
          />
        </div>
      )}
      <ReactModal isOpen={modalOpen} shouldFocusAfterRender={true}>
        <div className="admin-list-modal">
          {modalTitle && <h3 className={'title'}>{modalTitle}</h3>}
          {modalText && <div className={'description'}>{modalText}</div>}
          <div onClick={() => handleModal()} className={'close-modal'}>
            Close
          </div>
        </div>
      </ReactModal>
    </div>
  );
};

export { InboxListPage };
