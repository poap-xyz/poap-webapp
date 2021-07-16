import React, { FC, useState, useEffect } from 'react';
import { OptionTypeBase } from 'react-select';
import { Link } from 'react-router-dom';

/* Libraries */
import ReactPaginate from 'react-paginate';
import ReactModal from 'react-modal';
import { Formik, Field } from 'formik';
import { useToasts } from 'react-toast-notifications';

/* Components */
import { Loading } from '../components/Loading';
import FilterSelect from '../components/FilterSelect';
import FilterReactSelect from '../components/FilterReactSelect';
import { SubmitButton } from '../components/SubmitButton';

/* Helpers */
import { eventOptionType, getQrRequests, PoapEvent, getEvents, setQrRequests, QrRequest } from '../api';

/* Assets */
import edit from 'images/edit.svg';
import editDisable from 'images/edit-disable.svg';
import checked from '../images/checked.svg';
import error from '../images/error.svg';
import dot from '../images/dot.svg';
import { timeSince } from '../lib/helpers';
import { useToggleState } from '../react-helpers';
import { format } from 'date-fns';

type PaginateAction = {
  selected: number;
};

// creation modal types
type CreationModalProps = {
  handleModalClose: () => void;
  fetchQrRequests: () => void;
  qrRequest: QrRequest | null;
};

type CreationModalFormikValues = {
  requested_codes: number;
};

const QrRequests: FC = () => {
  const dateFormatter = (dateString: string) => format(new Date(dateString), 'dd-MMM-yyyy');
  const [page, setPage] = useState<number>(0);
  const [limit, setLimit] = useState<number>(10);
  const [total, setTotal] = useState<number>(0);
  const [isFetchingQrCodes, setIsFetchingQrCodes] = useState<null | boolean>(null);
  const [reviewedStatus, setReviewedStatus] = useState<string>('');
  const [selectedEvent, setSelectedEvent] = useState<number | undefined>(undefined);
  const [initialFetch, setInitialFetch] = useState<boolean>(true);
  const [isCreationModalOpen, setIsCreationModalOpen] = useState<boolean>(false);
  const [qrRequests, setQrRequests] = useState<null | QrRequest[]>(null);
  const [selectedQrRequest, setSelectedQrRequest] = useState<null | QrRequest>(null);
  const [events, setEvents] = useState<PoapEvent[]>([]);
  const [dateFormatToggle, toggleDateFormat] = useToggleState(true);

  useEffect(() => {
    fetchEvents();
    fetchQrRequests();
    setInitialFetch(false);
  }, []); /* eslint-disable-line react-hooks/exhaustive-deps */

  useEffect(() => {
    if (!initialFetch) {
      fetchQrRequests();
    }
  }, [page]); /* eslint-disable-line react-hooks/exhaustive-deps */

  useEffect(() => {
    if (!initialFetch) {
      cleanQrRequestSelection();
      setPage(0);
      fetchQrRequests();
    }
  }, [selectedEvent, reviewedStatus, limit]); /* eslint-disable-line react-hooks/exhaustive-deps */

  const cleanQrRequestSelection = () => setQrRequests([]);

  const fetchQrRequests = async () => {
    setIsFetchingQrCodes(true);

    let event_id = undefined;
    if (selectedEvent !== undefined) event_id = selectedEvent > -1 ? selectedEvent : undefined;

    let _status = undefined;

    if (reviewedStatus) _status = reviewedStatus === 'reviewed';

    const response = await getQrRequests(limit, page * limit, _status, event_id);
    const { qr_requests, total } = response;

    setTotal(total);
    setQrRequests(qr_requests);
    setIsFetchingQrCodes(false);
  };

  const handleSelectChange = (option: OptionTypeBase): void => {
    setSelectedEvent(option.value);
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>): void => {
    const { value } = e.target;
    setReviewedStatus(value);
  };

  const handlePageChange = (obj: PaginateAction) => {
    setPage(obj.selected);
  };

  const handleLimitChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>): void => {
    const { value } = e.target;
    setLimit(parseInt(value, 10));
  };

  const handleCreationModalClick = (qr: QrRequest): void => {
    setSelectedQrRequest(qr);
    setIsCreationModalOpen(true);
  };

  const handleCreationModalRequestClose = (): void => {
    setSelectedQrRequest(null);
    setIsCreationModalOpen(false);
  };

  const fetchEvents = async () => {
    const events = await getEvents();
    setEvents(events);
  };

  let eventOptions: eventOptionType[] = [];

  if (events) {
    eventOptions = events.map((event) => {
      const label = `${event.name ? event.name : 'No name'} (${event.fancy_id}) - ${event.year}`;
      return { value: event.id, label: label, start_date: event.start_date };
    });
  }

  const formatDate = (dateString: string): string => {
    if (dateFormatToggle) {
      const date = new Date(dateString);
      return `${timeSince(date)} ago`;
    }
    return dateFormatter(dateString);
  };

  return (
    <div className={'admin-table qr'}>
      <h2>Manage QR Requests</h2>
      <div className={'filters-container qr'}>
        <div className={'filter col-md-4'}>
          <div className="filter-option">
            <FilterReactSelect options={eventOptions} onChange={handleSelectChange} placeholder={'Filter by Event'} />
          </div>
        </div>
        <div className={'filter col-md-3 col-xs-6'}>
          <div className={'filter-group'}>
            <FilterSelect handleChange={handleStatusChange}>
              <option value="">Filter by reviewed</option>
              <option value="reviewed">Reviewed</option>
              <option value="false">Not Reviewed</option>
            </FilterSelect>
          </div>
        </div>
        <ReactModal
          isOpen={isCreationModalOpen}
          onRequestClose={handleCreationModalRequestClose}
          shouldFocusAfterRender={true}
          shouldCloseOnEsc={true}
          shouldCloseOnOverlayClick={true}
          style={{ content: { overflow: 'visible' } }}
        >
          <CreationModal
            qrRequest={selectedQrRequest}
            handleModalClose={handleCreationModalRequestClose}
            fetchQrRequests={fetchQrRequests}
          />
        </ReactModal>
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

      {isFetchingQrCodes && <Loading />}

      {qrRequests && qrRequests.length !== 0 && !isFetchingQrCodes && (
        <div className={'qr-table-section'}>
          <div className={'row table-header visible-md'}>
            <div className={'col-md-1 center'}>#</div>
            <div className={'col-md-2'}>Event</div>
            <div className={'col-md-2 center'}>
              Created date
              <span onClick={toggleDateFormat}>
                <img src={dot} alt={'toggle format'} className={'toggle-icon'} />
              </span>
            </div>
            <div className={'col-md-1 center'}>Amount</div>
            <div className={'col-md-2'}>Review by</div>
            <div className={'col-md-2 center'}>
              Review date
              <span onClick={toggleDateFormat}>
                <img src={dot} alt={'toggle format'} className={'toggle-icon'} />
              </span>
            </div>
            <div className={'col-md-1 center'}>Reviewed</div>
            <div className={'col-md-1 center'}></div>
          </div>
          <div className={'admin-table-row qr-table'}>
            {qrRequests &&
              qrRequests.map((qr, i) => {
                return (
                  <div className={`row ${i % 2 === 0 ? 'even' : 'odd'}`} key={qr.id}>
                    <div className={'col-md-1 col-xs-4 center'}>
                      <span className={'visible-sm'}>#: </span>
                      {qr.id}
                    </div>

                    <div className={'col-md-2 ellipsis col-xs-12'}>
                      <span className={'visible-sm'}>Event: </span>
                      <Link to={`/admin/events/${qr.event.fancy_id}`} target="_blank" rel="noopener noreferrer">
                        {qr.event.name}
                      </Link>
                    </div>

                    <div className={'col-md-2 col-xs-12 center'}>
                      <span className={'visible-sm'}>Created Date: </span>
                      {formatDate(qr.created_date)}
                    </div>

                    <div className={'col-md-1 col-xs-12 center'}>
                      <span className={'visible-sm'}>Amount: </span>
                      {qr.accepted_codes} / {qr.requested_codes}
                    </div>

                    <div className={'col-md-2 col-xs-12 ellipsis'}>
                      <span className={'visible-sm'}>Review By: </span>
                      {qr.reviewed ? qr.reviewed_by : '-'}
                    </div>

                    <div className={'col-md-2 col-xs-12 center'}>
                      <span className={'visible-sm'}>Review Date:</span>
                      {qr.reviewed ? formatDate(qr.reviewed_date) : '-'}
                    </div>

                    <div className={`col-md-1 col-xs-8 center`}>
                      <span className={'visible-sm'}>Reviewed: </span>
                      <img
                        src={qr.reviewed ? checked : error}
                        alt={qr.reviewed ? `QR Reviewed` : 'QR not Reviewed'}
                        className={'status-icon'}
                      />
                    </div>

                    <div className={'col-md-1 col-xs-4 center'}>
                      {!qr.reviewed ? (
                        <img
                          src={edit}
                          alt={'Edit'}
                          className={'edit-icon'}
                          onClick={() => handleCreationModalClick(qr)}
                        />
                      ) : (
                        <img src={editDisable} alt={'Edit'} className={'edit-icon'} />
                      )}
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

      {qrRequests && qrRequests.length === 0 && !isFetchingQrCodes && (
        <div className={'no-results'}>No QR Requests found</div>
      )}
    </div>
  );
};

const CreationModal: React.FC<CreationModalProps> = ({ handleModalClose, qrRequest, fetchQrRequests }) => {
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const { addToast } = useToasts();

  const handleCreationModalSubmit = async (values: CreationModalFormikValues) => {
    setIsSubmitting(true);
    const { requested_codes } = values;
    if (qrRequest) {
      await setQrRequests(qrRequest.id, requested_codes)
        .then((_) => {
          setIsSubmitting(false);
          addToast('QR Request approved correctly', {
            appearance: 'success',
            autoDismiss: true,
          });
          fetchQrRequests();
          handleModalClose();
        })
        .catch((e) => {
          console.log(e);
          addToast(e.message, {
            appearance: 'error',
            autoDismiss: false,
          });
        });
    }
    setIsSubmitting(false);
  };

  const handleCreationModalClosing = () => handleModalClose();

  return (
    <Formik
      initialValues={{
        requested_codes: qrRequest?.requested_codes ? qrRequest?.requested_codes : 0,
      }}
      validateOnBlur={false}
      validateOnChange={false}
      onSubmit={handleCreationModalSubmit}
    >
      {({ handleSubmit }) => {
        return (
          <div className={'update-modal-container authentication_modal_container'}>
            <div className={'modal-top-bar'}>
              <h3>QR Create</h3>
            </div>
            <div className="select-container">
              <div className="bk-form-row">
                <h4>Requested Codes</h4>
                <Field type="number" name={'requested_codes'} placeholder={'Requested Codes'} />
              </div>
            </div>
            <div className="modal-content">
              <div className="modal-buttons-container creation-modal">
                <SubmitButton
                  text="Cancel"
                  isSubmitting={false}
                  canSubmit={true}
                  onClick={handleCreationModalClosing}
                />
                <SubmitButton text="Accept" isSubmitting={isSubmitting} canSubmit={true} onClick={handleSubmit} />
              </div>
            </div>
          </div>
        );
      }}
    </Formik>
  );
};

export { QrRequests };
