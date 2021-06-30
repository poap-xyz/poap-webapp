import React, { useCallback, useState, ReactElement, useEffect, useMemo, ChangeEvent, ReactNode } from 'react';
import { Link, Route, RouteComponentProps, Switch } from 'react-router-dom';
import classNames from 'classnames';
import { Formik, Form, Field, ErrorMessage, FieldProps, FormikActions, FormikHandlers } from 'formik';
import DayPickerInput from 'react-day-picker/DayPickerInput';
import 'react-day-picker/lib/style.css';
import { format } from 'date-fns';
import { useToasts } from 'react-toast-notifications';
import { useHistory } from 'react-router-dom';

import { authClient } from 'auth';

// libraries
import ReactPaginate from 'react-paginate';
import { Tooltip } from 'react-lightweight-tooltip';

/* Components */
import { SubmitButton } from '../components/SubmitButton';
import { Loading } from '../components/Loading';
import FilterButton from '../components/FilterButton';

// constants
import { ROUTES } from 'lib/constants';

// assets
import { ReactComponent as EditIcon } from 'images/edit.svg';
import sortDown from 'images/sort-down.png';
import sortUp from 'images/sort-up.png';
import infoButton from 'images/info-button.svg';

/* Helpers */
import { useAsync } from 'react-helpers';
import { PoapEventSchema } from 'lib/schemas';
import { generateSecretCode } from 'lib/helpers';
import {
  Template,
  PoapFullEvent,
  PoapEvent,
  getEvent,
  getEvents,
  updateEvent,
  createEvent,
  getTemplates,
} from '../api';
import FormFilterReactSelect from 'components/FormFilterReactSelect';

type EventEditValues = {
  name: string;
  year: number;
  id: number;
  description: string;
  start_date: string;
  end_date: string;
  expiry_date: string;
  city: string;
  country: string;
  event_url: string;
  event_template_id: number;
  image?: Blob;
  isFile: boolean;
  secret_code: string;
  email: string;
};

type DatePickerDay = 'start_date' | 'end_date' | 'expiry_date';

type SetFieldValue = (field: string, value: any) => void;

type HandleChange = FormikHandlers['handleChange'];

type DatePickerContainerProps = {
  text: string;
  dayToSetup: DatePickerDay;
  handleDayClick: (day: Date, dayToSetup: DatePickerDay, setFieldValue: SetFieldValue) => void;
  setFieldValue: SetFieldValue;
  disabledDays: RangeModifier | RangeModifier[] | undefined;
  placeholder?: string;
  helpText?: string;
  disabled: boolean;
  value: string | Date;
};

type PaginateAction = {
  selected: number;
};

type EventTableProps = {
  initialEvents: PoapEvent[];
  criteria: string;
  limit: number;
};

type EventFieldProps = {
  title: string | ReactNode;
  name: string;
  placeholder?: string;
  disabled?: boolean;
  type?: string;
  action?: () => void;
  checked?: boolean;
};

export type ImageContainerProps = {
  text: string;
  handleFileChange: Function;
  setFieldValue: Function;
  errors: any;
  name: string;
  shouldShowInfo?: boolean;
  customLabel?: ReactElement;
};
export interface RangeModifier {
  from: Date;
  to: Date;
}

export const EventsPage = () => (
  <Switch>
    <Route exact path={ROUTES.events.path} component={EventList} />

    <Route exact path={ROUTES.eventsNew.path} component={CreateEventForm} />

    <Route exact path={ROUTES.event.path} component={EditEventForm} />
  </Switch>
);

export const CreateEventForm: React.FC = () => <EventForm create />;

export const EditEventForm: React.FC<RouteComponentProps<{
  eventId: string;
}>> = ({ location, match }) => {
  const [event, setEvent] = useState<null | PoapEvent>(null);

  useEffect(() => {
    const fn = async () => {
      const event = await getEvent(match.params.eventId);
      setEvent(event);
    };
    fn();
  }, [location, match]);

  if (!event) {
    return <div>Loading...</div>;
  }

  return <EventForm event={event} />;
};

type TemplateOptionType = {
  value: string | number;
  label: string;
};

const EventForm: React.FC<{ create?: boolean; event?: PoapFullEvent }> = ({ create, event }) => {
  const [virtualEvent, setVirtualEvent] = useState<boolean>(event ? event.virtual_event : false);
  const [templateOptions, setTemplateOptions] = useState<Template[] | null>(null);

  const [multiDay, setMultiDay] = useState<boolean>(event ? event.start_date !== event.end_date : false);
  const history = useHistory();
  const veryOldDate = new Date('1900-01-01');
  const veryFutureDate = new Date('2200-01-01');
  const dateFormatter = (day: Date | number) => format(day, 'MM-dd-yyyy');
  const dateFormatterString = (date: string) => {
    const parts = date.split('-');
    return new Date(`${parts[2]}-${parts[0]}-${parts[1]}`);
  };

  const fetchTemplates = useCallback(() => getTemplates({ limit: 1000 }), []);
  const [templates, fetchingTemplates] = useAsync(fetchTemplates);

  useEffect(() => {
    if (templates) setTemplateOptions(templates?.event_templates);
  }, [templates]);

  const { addToast } = useToasts();

  const dateRegex = /\//gi;

  const isAdmin = authClient.isAuthenticated();

  const initialValues = useMemo(() => {
    if (event) {
      let { virtual_event, secret_code, start_date, end_date, expiry_date, ...eventKeys } = event;
      return {
        ...eventKeys,
        start_date: start_date.replace(dateRegex, '-'),
        end_date: end_date.replace(dateRegex, '-'),
        expiry_date: expiry_date.replace(dateRegex, '-'),
        isFile: false,
        secret_code: secret_code ? secret_code.toString().padStart(6, '0') : '',
        email: '',
      };
    } else {
      const now = new Date();
      const year = now.getFullYear();
      const values: EventEditValues = {
        name: '',
        year,
        id: 0,
        description: '',
        start_date: '',
        end_date: '',
        expiry_date: '',
        city: '',
        event_template_id: 0,
        country: '',
        event_url: '',
        image: new Blob(),
        isFile: true,
        secret_code: generateSecretCode(),
        email: '',
      };
      return values;
    }
  }, [event]); /* eslint-disable-line react-hooks/exhaustive-deps */

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>, setFieldValue: SetFieldValue, name: string) => {
    event.preventDefault();
    const { files } = event.target;

    if (!files || !files.length) return;

    const firstFile = files[0];
    setFieldValue(name, firstFile);
  };

  const toggleVirtualEvent = () => setVirtualEvent(!virtualEvent);
  const toggleMultiDay = (setFieldValue: SetFieldValue, start_date: string) => {
    if (start_date && multiDay) {
      setFieldValue('end_date', start_date);
    }
    setMultiDay(!multiDay);
  };

  const handleDayClick = (day: Date, dayToSetup: DatePickerDay, setFieldValue: SetFieldValue) => {
    setFieldValue(dayToSetup, dateFormatter(day));
    if (!multiDay && dayToSetup === 'start_date') {
      setFieldValue('end_date', dateFormatter(day));
      setFieldValue('expiry_date', dateFormatter(day.setMonth(day.getMonth() + 1)));
    }
    if (dayToSetup === 'end_date') {
      setFieldValue('expiry_date', dateFormatter(day.setMonth(day.getMonth() + 1)));
    }
  };

  const getMaxAllowExpiryDate = (end_date: string): Date => {
    // Maximum expiration date is one year after the event ended
    const max_expiry_date = new Date(end_date);
    max_expiry_date.setMonth(max_expiry_date.getMonth() + 12);
    return max_expiry_date;
  };

  const day = 60 * 60 * 24 * 1000;

  const warning = (
    <div className={'backoffice-tooltip'}>
      {' '}
      {create ? (
        <>
          Be sure to save the 6 digit <b>Edit Code</b> to make any further updateTemplates
        </>
      ) : (
        <>
          Be sure to complete the 6 digit <b>Edit Code</b> that was originally used
        </>
      )}
    </div>
  );
  const editLabel = (
    <>
      <b>Edit Code</b>
      <Tooltip content={warning}>
        <img alt="Informative message" src={infoButton} className={'info-button'} />
      </Tooltip>
    </>
  );

  const parseTemplateToOptions = (templates: Template[]): TemplateOptionType[] => {
    const options = templates.map((template: Template) => {
      const label = template.name ? template.name : 'No name';
      return { value: template.id, label };
    });
    return [{ value: 0, label: 'Standard template' }, ...options];
  };

  const templateSelectOptions = templateOptions ? parseTemplateToOptions(templateOptions) : [];
  return (
    <div className={'bk-container'}>
      <Formik
        initialValues={initialValues}
        enableReinitialize
        validateOnBlur={false}
        validateOnChange={false}
        validationSchema={PoapEventSchema}
        onSubmit={async (submittedValues: EventEditValues, actions: FormikActions<EventEditValues>) => {
          try {
            actions.setSubmitting(true);
            const formData = new FormData();
            const { isFile, ...othersKeys } = submittedValues;

            if (create && !isFile) {
              actions.setErrors({ isFile: 'An image is required' });
              actions.setSubmitting(false);
              return;
            }

            if (create && !submittedValues['email']) {
              actions.setErrors({ email: 'An email is required' });
              actions.setSubmitting(false);
              return;
            }

            Object.entries(othersKeys).forEach(([key, value]) => {
              formData.append(key, typeof value === 'number' ? String(value) : value);
            });

            formData.append('virtual_event', String(virtualEvent));

            if (create) {
              await createEvent(formData!);
            } else if (event) {
              await updateEvent(formData!, event.fancy_id);
            }

            history.push(ROUTES.events.path);
          } catch (err) {
            console.log(err);
            actions.setSubmitting(false);
            addToast(err.message, {
              appearance: 'error',
              autoDismiss: true,
            });
          }
        }}
      >
        {({ values, errors, isSubmitting, setFieldValue }) => {
          const handleTemplateSelectChange = (name: string) => (selectedOption: any) =>
            setFieldValue(name, selectedOption.value);
          return (
            <Form>
              {create ? (
                <>
                  <h2>Create Event</h2>
                  <EventField disabled={!create} title="Name of the POAP" name="name" />
                </>
              ) : (
                <>
                  <h2>
                    {event!.name} - {event!.year}
                  </h2>
                  <EventField disabled={false} title="Name" name="name" />
                </>
              )}
              <EventField disabled={false} title="Description" type="textarea" name="description" />
              <CheckboxField
                title="Virtual Event"
                name="virtual_event"
                action={toggleVirtualEvent}
                checked={virtualEvent}
              />
              <div className="bk-group">
                <EventField
                  disabled={false}
                  title={
                    <>
                      City <i>Optional</i>
                    </>
                  }
                  name="city"
                />
                <EventField
                  disabled={false}
                  title={
                    <>
                      Country <i>Optional</i>
                    </>
                  }
                  name="country"
                />
              </div>

              <CheckboxField
                title="Multi-day event"
                name="multi_day"
                action={() => toggleMultiDay(setFieldValue, values.start_date)}
                checked={multiDay}
              />
              <div className="bk-group">
                <DayPickerContainer
                  text="Start Date"
                  dayToSetup="start_date"
                  handleDayClick={handleDayClick}
                  setFieldValue={setFieldValue}
                  placeholder={values.start_date}
                  value={values.start_date !== '' ? new Date(dateFormatterString(values.start_date).getTime()) : ''}
                  disabled={false}
                  disabledDays={
                    values.end_date !== ''
                      ? {
                          from: new Date(dateFormatterString(values.end_date).getTime() + day),
                          to: veryFutureDate,
                        }
                      : undefined
                  }
                />
                <DayPickerContainer
                  text="End Date"
                  dayToSetup="end_date"
                  handleDayClick={handleDayClick}
                  setFieldValue={setFieldValue}
                  placeholder={values.end_date}
                  value={values.end_date !== '' ? new Date(dateFormatterString(values.end_date).getTime()) : ''}
                  disabled={!multiDay}
                  disabledDays={
                    values.start_date !== ''
                      ? {
                          from: veryOldDate,
                          to: new Date(dateFormatterString(values.start_date).getTime()),
                        }
                      : undefined
                  }
                />
                <DayPickerContainer
                  text="Expiry Date"
                  dayToSetup="expiry_date"
                  handleDayClick={handleDayClick}
                  setFieldValue={setFieldValue}
                  placeholder={values.expiry_date}
                  helpText="After this date, users will no longer be able to mint this event's POAP"
                  value={values.expiry_date !== '' ? new Date(dateFormatterString(values.expiry_date).getTime()) : ''}
                  disabled={!values.end_date}
                  disabledDays={
                    values.end_date !== ''
                      ? [
                          {
                            from: veryOldDate,
                            to: new Date(dateFormatterString(values.end_date).getTime()),
                          },
                          {
                            from: veryOldDate,
                            to: new Date(),
                          },
                          {
                            from: getMaxAllowExpiryDate(values.end_date),
                            to: veryFutureDate,
                          },
                        ]
                      : undefined
                  }
                />
              </div>
              <div className="bk-group">
                <EventField title="Website" name="event_url" />
                <FormFilterReactSelect
                  label="Template"
                  name="event_template_id"
                  placeholder={'Pick a template'}
                  onChange={handleTemplateSelectChange('event_template_id')}
                  options={templateSelectOptions}
                  disabled={fetchingTemplates}
                  value={templateSelectOptions?.find((option) => option.value === values['event_template_id'])}
                />
              </div>
              <div className="bk-group">
                <ImageContainer
                  text="Image of the POAP"
                  handleFileChange={handleFileChange}
                  setFieldValue={setFieldValue}
                  errors={errors}
                  name="image"
                />
                <div>
                  <EventField disabled={false} title={editLabel} name="secret_code" />
                  {create && (
                    <div className={'email-checkbox'}>
                      <EventField disabled={false} title={'Email'} name="email" />
                    </div>
                  )}
                  {!create && isAdmin && (
                    <div className={'email-checkbox'}>
                      {event && event.email && (
                        <>
                          <label>Email</label>
                          <input type={'text'} disabled value={event.email} />
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
              {event && event.image_url && (
                <div className={'image-edit-container'}>
                  <img alt={event.image_url} className={'image-edit'} src={event.image_url} />
                </div>
              )}
              <SubmitButton text="Save" isSubmitting={isSubmitting} canSubmit={true} />
            </Form>
          );
        }}
      </Formik>
    </div>
  );
};

const DayPickerContainer = ({
  text,
  dayToSetup,
  handleDayClick,
  setFieldValue,
  placeholder,
  disabledDays,
  disabled,
  value,
  helpText,
}: DatePickerContainerProps) => {
  const handleDayChange = (day: Date) => handleDayClick(day, dayToSetup, setFieldValue);
  let _value = value;
  if (value instanceof Date) {
    const offset = new Date().getTimezoneOffset();
    const offsetSign = offset < 0 ? -1 : 1;
    _value = new Date(value.valueOf() + offset * 60 * 1000 * offsetSign);
  }
  let formatText = <></>;
  if (helpText) {
    formatText = (
      <div className={'backoffice-tooltip'}>
        <span>
          {helpText}
        </span>
      </div>
    );
  }
  return (
    <div className={`date-picker-container ${dayToSetup === 'end_date' ? 'end-date-overlay' : ''}`}>
      <label>
        {text}
        {helpText && (
          <Tooltip content={formatText}>
            <img alt="Informative message" src={infoButton} className={'info-button'} />
          </Tooltip>
        )}
      </label>
      <DayPickerInput
        placeholder={placeholder}
        dayPickerProps={{ disabledDays }}
        onDayChange={handleDayChange}
        value={_value}
        inputProps={{ readOnly: 'readonly', disabled: disabled }}
      />
      <ErrorMessage name={dayToSetup} component="p" className="bk-error" />
    </div>
  );
};

export const ImageContainer = ({
  text,
  handleFileChange,
  setFieldValue,
  errors,
  shouldShowInfo = true,
  customLabel,
  name,
}: ImageContainerProps) => (
  <div className={classNames('date-picker-container', !shouldShowInfo && 'h78')}>
    {customLabel ? <span>{React.cloneElement(customLabel)}</span> : <label>{text}</label>}
    <input
      type="file"
      accept="image/png"
      className={classNames(Boolean(errors?.[name]) && 'error')}
      onChange={(e: ChangeEvent<HTMLInputElement>) => handleFileChange(e, setFieldValue, name)}
    />
    <ErrorMessage name={name} component="p" className="bk-error" />
    {shouldShowInfo && (
      <div className="input-field-helper">
        Badge specs:
        <ul>
          <li>Mandatory: PNG format</li>
          <li>Recommended: measures 500x500px, round shape, size less than 200KB</li>
        </ul>
      </div>
    )}
  </div>
);

export const EventField: React.FC<EventFieldProps> = ({ title, name, disabled = false, type, placeholder }) => {
  return (
    <Field
      name={name}
      render={({ field, form }: FieldProps) => (
        <div className="bk-form-row">
          <label>{title}</label>
          {type === 'textarea' && (
            <textarea
              {...field}
              wrap="soft"
              disabled={disabled}
              className={classNames(!!form.errors[name] && 'error')}
            />
          )}
          {type !== 'textarea' && (
            <input
              {...field}
              placeholder={placeholder ? placeholder : ''}
              type={type || 'text'}
              disabled={disabled}
              className={classNames(!!form.errors[name] && 'error')}
            />
          )}
          <ErrorMessage name={name} component="p" className="bk-error" />
        </div>
      )}
    />
  );
};

const CheckboxField: React.FC<EventFieldProps> = ({ title, action, checked }) => {
  return (
    <div className={'checkbox-field'} onClick={action}>
      <input type="checkbox" checked={checked} readOnly />
      <label>{title}</label>
    </div>
  );
};

export const EventList: React.FC = () => {
  const [criteria, setCriteria] = useState<string>('');
  const [limit, setLimit] = useState<number>(10);

  const [events, fetchingEvents, fetchEventsError] = useAsync(getEvents);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { value } = e.target;

    setCriteria(value.toLowerCase());
  };

  const handleLimitChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>): void => {
    const { value } = e.target;
    setLimit(parseInt(value, 10));
  };

  return (
    <div className={'bk-container'}>
      <h2>Events</h2>
      <div className="event-top-bar-container">
        <div className="left_content">
          <input type="text" placeholder="Search by name" onChange={handleNameChange} />
        </div>
        <div className="right_content">
          <Link to="/admin/events/new">
            <FilterButton text="Create new POAP" />
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
      {fetchingEvents && <Loading />}

      {fetchEventsError && <div>There was a problem fetching events</div>}

      {events && <EventTable criteria={criteria} initialEvents={events} limit={limit} />}
    </div>
  );
};

const EventTable: React.FC<EventTableProps> = ({ initialEvents, criteria, limit }) => {
  const [events, setEvents] = useState<PoapEvent[]>(initialEvents);
  const [total, setTotal] = useState<number>(events.length);
  const [page, setPage] = useState<number>(0);
  const [idSort, setIdSort] = useState<number>(-1);
  const [nameSort, setNameSort] = useState<number>(0);

  useEffect(() => {
    setEvents(initialEvents.filter(handleCriteriaFilter));
  }, [criteria]); /* eslint-disable-line react-hooks/exhaustive-deps */

  useEffect(() => {
    setTotal(events.length);
  }, [events]);

  useEffect(() => {
    setPage(0);
  }, [total]);

  const isAdmin = authClient.isAuthenticated();

  const handlePageChange = (obj: PaginateAction) => {
    setPage(obj.selected);
  };

  const eventsToShowManager = (events: PoapEvent[]): PoapEvent[] => {
    if (idSort !== 0) {
      events = events.sort((a, b) => {
        return a.id > b.id ? idSort : -1 * idSort;
      });
    }
    if (nameSort !== 0) {
      events = events.sort((a, b) => {
        return a.name > b.name ? nameSort : -1 * nameSort;
      });
    }
    if (events.length <= 10) return events;
    return events.slice(page * limit, page * limit + limit);
  };

  const handleCriteriaFilter = (event: PoapEvent): boolean =>
    event.name.toLowerCase().includes(criteria) || event.id.toString() === criteria;

  const handleIdSort = () => {
    if (idSort === 0) {
      setIdSort(1);
    } else {
      setIdSort(-1 * idSort);
    }
    setNameSort(0);
  };

  const handleNameSort = () => {
    if (nameSort === 0) {
      setNameSort(1);
    } else {
      setNameSort(-1 * nameSort);
    }
    setIdSort(0);
  };

  return (
    <div>
      <div className={'admin-table transactions'}>
        <div className={'row table-header visible-md'}>
          <div className={'col-md-1 center pointer'} onClick={handleIdSort}>
            #{idSort !== 0 && <img className={'img-sort'} src={idSort > 0 ? sortUp : sortDown} alt={'sort'} />}
          </div>
          <div className={`col-md-6 pointer`} onClick={handleNameSort}>
            Name of the POAP
            {nameSort !== 0 && <img className={'img-sort'} src={nameSort > 0 ? sortUp : sortDown} alt={'sort'} />}
          </div>
          <div className={'col-md-2 center'}>Start Date</div>
          <div className={'col-md-2 center'}>Image</div>
          {isAdmin && <div className={'col-md-1 center'}>Edit</div>}
        </div>
        <div className={'admin-table-row'}>
          {eventsToShowManager(events).map((event, i) => (
            <div className={`row ${i % 2 === 0 ? 'even' : 'odd'} relative`} key={event.id}>
              <div className={'col-md-1 center'}>
                <span className={'visible-sm visible-md'}>#</span>
                {event.id}
              </div>
              <div className={`col-md-6 ellipsis`}>
                <span className={'visible-sm'}>
                  Name of the POAP: <br />
                </span>
                <a href={event.event_url} title={event.name} target="_blank" rel="noopener noreferrer">
                  {event.name}
                </a>
              </div>
              <div className={'col-md-2 center'}>
                <span className={'visible-sm'}>Start date: </span>
                <span>{event.start_date}</span>
              </div>
              <div className={'col-md-2 center '}>
                <Tooltip
                  content={[
                    // eslint-disable-next-line
                    <div className={'event-table-tooltip'}>
                      <img alt={event.image_url} src={event.image_url} className={'tooltipped'} />
                    </div>,
                  ]}
                >
                  <img alt={event.image_url} className={'logo-image'} src={event.image_url} />
                </Tooltip>
              </div>
              <div className={'col-md-1 center event-edit-icon-container'}>
                <Link to={`/admin/events/${event.fancy_id}`}>
                  <EditIcon />
                </Link>
              </div>
            </div>
          ))}
        </div>
        <div className={'pagination'}>
          {events && events.length > 10 && (
            <ReactPaginate
              pageCount={Math.ceil(total / limit)}
              marginPagesDisplayed={2}
              pageRangeDisplayed={limit}
              forcePage={page}
              activeClassName={'active'}
              onPageChange={handlePageChange}
            />
          )}
        </div>
      </div>
    </div>
  );
};
