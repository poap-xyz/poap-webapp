import React, { FC, useState, useEffect } from 'react';
import { useToasts } from 'react-toast-notifications';
import { OptionTypeBase } from 'react-select';
import { isAfter } from 'date-fns';
import { Link } from 'react-router-dom';

/* Libraries */
import ReactPaginate from 'react-paginate';
import ReactModal from 'react-modal';
import { Formik, FormikActions, Form, Field, FieldProps } from 'formik';

/* Components */
import { Loading } from '../components/Loading';
import FormSelect from '../components/FormSelect';
import FilterSelect from '../components/FilterSelect';
import FilterReactSelect from '../components/FilterReactSelect';
import FilterButton from '../components/FilterButton';
import FilterChip from '../components/FilterChip';

/* Helpers */
import {
  eventOptionType,
  getQrCodes,
  PoapEvent,
  getQrRequests,
  qrCodesRangeAssign,
  qrCodesSelectionUpdate,
  QrCode,
  qrCodesListAssign,
  qrCreateMassive,
  generateRandomCodes,
  QrRequest
} from '../api';

// lib
import { authClient } from '../auth';

/* Assets */
import { ReactComponent as EditIcon } from 'images/edit.svg';

/* Schemas */
import {
  UpdateModalWithFormikRangeSchema,
  UpdateModalWithFormikSelectedQrsSchema,
  UpdateModalWithFormikListSchema,
} from '../lib/schemas';
import classNames from 'classnames';

type PaginateAction = {
  selected: number;
};

// update modal types
type UpdateByRangeModalProps = {
  events: eventOptionType[];
  selectedQrs: string[];
  refreshQrs: () => void;
  onSuccessAction: () => void;
  handleUpdateModalClosing: () => void;
  passphrase: string;
};

type UpdateModalFormikValues = {
  from: number | string;
  to: number | string;
  event: number;
  hashesList: string;
  isUnassigning: boolean;
};

// authentication modal types
type AuthenticationModalProps = {
  setPassphrase: (passphrase: string) => void;
  passphraseError: boolean;
};

type AuthenticationModalFormikValues = {
  passphrase: string;
};

// creation modal types
type CreationModalProps = {
  handleModalClose: () => void;
  refreshQrs: () => void;
  events: eventOptionType[];
};

type CreationModalFormikValues = {
  ids: string;
  hashes: string;
  delegated_mint: boolean;
  event: string;
};

type LinkCreationModalFormikValues = {
  event: string;
  amount: number;
};

const QrRequests: FC = () => {
  const [page, setPage] = useState<number>(0);
  const [limit, setLimit] = useState<number>(10);
  const [total, setTotal] = useState<number>(0);
  const [isFetchingQrCodes, setIsFetchingQrCodes] = useState<null | boolean>(null);
  const [qrCodes, setQrCodes] = useState<null | QrCode[]>(null);
  const [checkedAllQrs, setCheckedAllQrs] = useState<boolean>(false);
  const [reviewedStatus, setReviewedStatus] = useState<string>('');
  const [selectedEvent, setSelectedEvent] = useState<number | undefined>(undefined);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState<boolean>(false);
  const [initialFetch, setInitialFetch] = useState<boolean>(true);
  const [isCreationModalOpen, setIsCreationModalOpen] = useState<boolean>(false);
  const [isLinkCreationModalOpen, setIsLinkCreationModalOpen] = useState<boolean>(false);
  const [qrRequests, setQrRequests] = useState<null | QrRequest[]>(null);

  const { addToast } = useToasts();

  useEffect(() => {
    fetchQrRequests();
    setInitialFetch(false);
  }, []); /* eslint-disable-line react-hooks/exhaustive-deps */

  useEffect(() => {
    if (!initialFetch) {
      fetchQrRequests();
      setCheckedAllQrs(false);
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
    setIsFetchingQrCodes(true)

    let event_id = undefined;
    if (selectedEvent !== undefined) event_id = selectedEvent > -1 ? selectedEvent : undefined;

    let _status = undefined;

    if (reviewedStatus) _status = reviewedStatus === 'reviewed';

    const response = await getQrRequests(limit, page * limit,_status,event_id);
    const { qr_requests, total } = response

    setTotal(total);
    setQrRequests(qr_requests)
    setIsFetchingQrCodes(false)
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

  const handleUpdateModalClick = (): void => setIsUpdateModalOpen(true);

  const handleCreationModalClick = (): void => setIsCreationModalOpen(true);

  const handleLinkCreationModalClick = (): void => setIsLinkCreationModalOpen(true);

  const handleUpdateModalRequestClose = (): void => setIsUpdateModalOpen(false);

  const handleCreationModalRequestClose = (): void => setIsCreationModalOpen(false);

  const handleLinkCreationClose = (): void => setIsLinkCreationModalOpen(false);

  let eventOptions: eventOptionType[] = [];

  if (qrRequests) {
    eventOptions = qrRequests.map(({event}) => {
      const label = `${event.name ? event.name : 'No name'} (${event.fancy_id}) - ${event.year}`;
      return { value: event.id, label: label, start_date: event.start_date };
    });
  }

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
              <option value="">Not Reviewed</option>
            </FilterSelect>
          </div>
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

      {isFetchingQrCodes && <Loading />}

      {qrRequests && qrRequests.length !== 0 && !isFetchingQrCodes && (
        <div className={'qr-table-section'}>
          <div className={'row table-header visible-md'}>
            <div className={'col-md-1'}>#</div>
            <div className={'col-md-3'}>Event</div>
            <div className={'col-md-2'}>Mail</div>
            <div className={'col-md-2'}>Start Date</div>
            <div className={'col-md-2'}>Code amount</div>
            <div className={'col-md-2'}>Edit</div>
          </div>
          <div className={'admin-table-row qr-table'}>
            {qrRequests && qrRequests.map((qr, i) => {
              return (
                <div className={`row ${i % 2 === 0 ? 'even' : 'odd'}`} key={qr.id}>

                  <div className={'col-md-1 col-xs-4 start status'}>
                    <span className={'visible-sm'}>#: </span>
                    {qr.id}
                  </div>

                  <div className={'col-md-3 ellipsis col-xs-12 event-name'}>
                    <span className={'visible-sm'}>Event: </span>
                    <Link to={`/admin/events/${qr.event.fancy_id}`} target="_blank" rel="noopener noreferrer">
                      {qr.event.name}
                    </Link>
                  </div>

                  <div className={'col-md-2 col-xs-12'}>
                    <span className={'visible-sm'}>Mail: </span>
                    {qr.event.start_date}
                  </div>

                  <div className={'col-md-2 col-xs-4 status'}>
                    <span className={'visible-sm'}>Start Date: </span>
                    {qr.event.start_date}
                  </div>

                  <div className={'col-md-2 col-xs-4 status'}>
                    <span className={'visible-sm'}>Code amount: </span>
                    {qr.requested_codes}
                  </div>

                  <div className={'col-md-1 center event-edit-icon-container'}>
                    <Link to={"/admin/events/"}>
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

      {qrCodes && qrCodes.length === 0 && !isFetchingQrCodes && <div className={'no-results'}>No QR Requests codes found</div>}
    </div>
  );
};

const CreationModal: React.FC<CreationModalProps> = ({ handleModalClose, refreshQrs, events }) => {
  const [incorrectQrHashes, setIncorrectQrHashes] = useState<string[]>([]);
  const [incorrectQrIds, setIncorrectQrIds] = useState<string[]>([]);
  const [qrIds, setQrsIds] = useState<string[]>([]);
  const [qrHashes, setQrsHashes] = useState<string[]>([]);

  const { addToast } = useToasts();

  const hasSameQrsQuantity = qrHashes.length === qrIds.length && qrHashes.length > 0 && qrIds.length > 0;
  const hasNoIncorrectQrs =
    incorrectQrHashes.length === 0 && incorrectQrIds.length === 0 && (qrIds.length > 0 || qrHashes.length > 0);
  const hasHashesButNoIds = qrHashes.length > 0 && qrIds.length === 0;

  const shouldShowMatchErrorMessage = (!hasSameQrsQuantity || !hasHashesButNoIds) && hasNoIncorrectQrs;

  const handleCreationModalSubmit = (values: CreationModalFormikValues) => {
    const { hashes, ids, delegated_mint, event } = values;

    const hashRegex = /^[a-zA-Z0-9]{6}$/;
    const idRegex = /^[0-9]+$/;

    const _incorrectQrHashes: string[] = [];
    const _incorrectQrIds: string[] = [];

    const qrHashesFormatted = hashes
      .trim()
      .split('\n')
      .map((hash) => hash.trim().toLowerCase())
      .filter((hash) => {
        if (!hash.match(hashRegex) && hash !== '') _incorrectQrHashes.push(hash);

        return hash.match(hashRegex);
      });

    const qrIdsFormatted = ids
      .trim()
      .split('\n')
      .map((id) => id.trim())
      .filter((id) => {
        if (!id.match(idRegex) && id !== '') _incorrectQrIds.push(id);

        return id.match(idRegex);
      });

    const _hasSameQrsQuantity =
      qrHashesFormatted.length === qrIdsFormatted.length && qrHashesFormatted.length > 0 && qrIdsFormatted.length > 0;
    const _hasNoIncorrectQrs = _incorrectQrHashes.length === 0 && _incorrectQrIds.length === 0;
    const _hasHashesButNoIds = qrHashesFormatted.length > 0 && qrIdsFormatted.length === 0;

    setIncorrectQrHashes(_incorrectQrHashes);
    setIncorrectQrIds(_incorrectQrIds);

    if (!_incorrectQrHashes && !_incorrectQrIds) {
      setQrsHashes(qrHashesFormatted);
      setQrsIds(qrIdsFormatted);
    }

    if (_hasNoIncorrectQrs) {
      if (_hasHashesButNoIds || _hasSameQrsQuantity) {
        qrCreateMassive(qrHashesFormatted, qrIdsFormatted, delegated_mint, event)
          .then((_) => {
            addToast('QR codes updated correctly', {
              appearance: 'success',
              autoDismiss: true,
            });
            refreshQrs();
            handleCreationModalClosing();
          })
          .catch((e) => {
            console.log(e);
            addToast(e.message, {
              appearance: 'error',
              autoDismiss: false,
            });
          });
      }
    }
  };

  const handleCreationModalClosing = () => handleModalClose();

  return (
    <Formik
      initialValues={{
        hashes: '',
        ids: '',
        event: '',
        delegated_mint: false,
      }}
      validateOnBlur={false}
      validateOnChange={false}
      onSubmit={handleCreationModalSubmit}
    >
      {({ values, handleChange, handleSubmit }) => {
        return (
          <div className={'update-modal-container'}>
            <div className={'modal-top-bar'}>
              <h3>QR Create</h3>
            </div>
            <div className="creation-modal-content">
              <div>
                <textarea
                  className="modal-textarea"
                  name="hashes"
                  value={values.hashes}
                  onChange={handleChange}
                  placeholder="QRs hashes list"
                />
                {incorrectQrHashes.length > 0 && (
                  <span>
                    The following hashes are not valid, please fix them or remove them to submit again:{' '}
                    {`${incorrectQrHashes.join(', ')}`}
                  </span>
                )}
              </div>
              <div>
                <textarea
                  className="modal-textarea"
                  value={values.ids}
                  name="ids"
                  onChange={handleChange}
                  placeholder="QRs IDs list"
                />
                {incorrectQrIds.length > 0 && (
                  <span>
                    The following IDs are not valid, please fix them or remove them to submit again:{' '}
                    {`${incorrectQrIds.join(', ')}`}
                  </span>
                )}
              </div>
            </div>
            <div className="select-container">
              <Field component={FormSelect} name={'event'} options={events} placeholder={'Select an event'} />
              {shouldShowMatchErrorMessage && (
                <span>Quantity of IDs and hashes must match or send hashes with none IDs</span>
              )}
            </div>
            <div className="modal-content">
              <div className="modal-buttons-container creation-modal">
                <div className="modal-action-checkbox-container">
                  <Field type="checkbox" name="delegated_mint" id="delegated_mint_id" className={''} />
                  <label htmlFor="delegated_mint_id" className="">
                    Web 3 claim enabled
                  </label>
                </div>
                <div className="modal-action-buttons-container">
                  <FilterButton text="Cancel" handleClick={handleCreationModalClosing} />
                  <FilterButton text="Create" handleClick={handleSubmit} />
                </div>
              </div>
            </div>
          </div>
        );
      }}
    </Formik>
  );
};

export { QrRequests };
