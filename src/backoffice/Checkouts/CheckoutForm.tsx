import React, { FC, useState, useEffect, useMemo } from 'react';
import { useHistory, RouteComponentProps } from 'react-router-dom';
import { useToasts } from 'react-toast-notifications';
import { Formik, Form, FormikActions } from 'formik';
import { format, parse, isAfter } from 'date-fns';
import delve from 'dlv';

/* Helpers */
import { ROUTES } from 'lib/constants';
import { CheckoutSchema } from '../../lib/schemas';
import { Checkout, PoapEvent, getEvents, getCheckout, createCheckout, editCheckout } from '../../api';

/* Components */
import DatePicker, { SetFieldValue, DatePickerDay } from '../../components/DatePicker';
import FormFilterReactSelect from '../../components/FormFilterReactSelect';
import { SubmitButton } from '../../components/SubmitButton';
import { EventField } from '../EventsPage';
import { Loading } from '../../components/Loading';

/* Assets */

/* Types */
type CheckoutFormType = {
  event_id: number;
  fancy_id: string;
  max_limit: number;
  timezone: number;
  start_date: string;
  start_time: string;
  end_date: string;
  end_time: string;
};
type SelectOptionType = {
  value: string | number;
  label: string;
};

const timezones: SelectOptionType[] = [
  { value: -12, label: '(GMT-12:00) International Date Line West' },
  { value: -11, label: '(GMT-11:00) Midway Island, Samoa' },
  { value: -10, label: '(GMT-10:00) Hawaii' },
  { value: -9, label: '(GMT-09:00) Alaska' },
  { value: -8, label: '(GMT-08:00) Pacific Time (US & Canada)' },
  { value: -8, label: '(GMT-08:00) Tijuana, Baja California' },
  { value: -7, label: '(GMT-07:00) Arizona' },
  { value: -7, label: '(GMT-07:00) Chihuahua, La Paz, Mazatlan' },
  { value: -7, label: '(GMT-07:00) Mountain Time (US & Canada)' },
  { value: -6, label: '(GMT-06:00) Central America' },
  { value: -6, label: '(GMT-06:00) Central Time (US & Canada)' },
  { value: -6, label: '(GMT-06:00) Guadalajara, Mexico City, Monterrey' },
  { value: -6, label: '(GMT-06:00) Saskatchewan' },
  { value: -5, label: '(GMT-05:00) Bogota, Lima, Quito, Rio Branco' },
  { value: -5, label: '(GMT-05:00) Eastern Time (US & Canada)' },
  { value: -5, label: '(GMT-05:00) Indiana (East)' },
  { value: -4, label: '(GMT-04:00) Atlantic Time (Canada)' },
  { value: -4, label: '(GMT-04:00) Caracas, La Paz' },
  { value: -4, label: '(GMT-04:00) Manaus' },
  { value: -4, label: '(GMT-04:00) Santiago' },
  { value: -3, label: '(GMT-03:00) Brasilia' },
  { value: -3, label: '(GMT-03:00) Buenos Aires, Georgetown' },
  { value: -3, label: '(GMT-03:00) Greenland' },
  { value: -3, label: '(GMT-03:00) Montevideo' },
  { value: -2, label: '(GMT-02:00) Mid-Atlantic' },
  { value: -1, label: '(GMT-01:00) Cape Verde Is.' },
  { value: -1, label: '(GMT-01:00) Azores' },
  { value: 0, label: '(GMT+00:00) Casablanca, Monrovia, Reykjavik' },
  { value: 0, label: '(GMT+00:00) Greenwich Mean Time : Dublin, Edinburgh, Lisbon, London' },
  { value: 1, label: '(GMT+01:00) Amsterdam, Berlin, Bern, Rome, Stockholm, Vienna' },
  { value: 1, label: '(GMT+01:00) Belgrade, Bratislava, Budapest, Ljubljana, Prague' },
  { value: 1, label: '(GMT+01:00) Brussels, Copenhagen, Madrid, Paris' },
  { value: 1, label: '(GMT+01:00) Sarajevo, Skopje, Warsaw, Zagreb' },
  { value: 1, label: '(GMT+01:00) West Central Africa' },
  { value: 2, label: '(GMT+02:00) Amman' },
  { value: 2, label: '(GMT+02:00) Athens, Bucharest, Istanbul' },
  { value: 2, label: '(GMT+02:00) Beirut' },
  { value: 2, label: '(GMT+02:00) Cairo' },
  { value: 2, label: '(GMT+02:00) Harare, Pretoria' },
  { value: 2, label: '(GMT+02:00) Helsinki, Kyiv, Riga, Sofia, Tallinn, Vilnius' },
  { value: 2, label: '(GMT+02:00) Jerusalem' },
  { value: 2, label: '(GMT+02:00) Minsk' },
  { value: 2, label: '(GMT+02:00) Windhoek' },
  { value: 3, label: '(GMT+03:00) Kuwait, Riyadh, Baghdad' },
  { value: 3, label: '(GMT+03:00) Moscow, St. Petersburg, Volgograd' },
  { value: 3, label: '(GMT+03:00) Nairobi' },
  { value: 3, label: '(GMT+03:00) Tbilisi' },
  { value: 4, label: '(GMT+04:00) Abu Dhabi, Muscat' },
  { value: 4, label: '(GMT+04:00) Baku' },
  { value: 4, label: '(GMT+04:00) Yerevan' },
  { value: 5, label: '(GMT+05:00) Yekaterinburg' },
  { value: 5, label: '(GMT+05:00) Islamabad, Karachi, Tashkent' },
  { value: 6, label: '(GMT+06:00) Almaty, Novosibirsk' },
  { value: 6, label: '(GMT+06:00) Astana, Dhaka' },
  { value: 7, label: '(GMT+07:00) Bangkok, Hanoi, Jakarta' },
  { value: 7, label: '(GMT+07:00) Krasnoyarsk' },
  { value: 8, label: '(GMT+08:00) Beijing, Chongqing, Hong Kong, Urumqi' },
  { value: 8, label: '(GMT+08:00) Kuala Lumpur, Singapore' },
  { value: 8, label: '(GMT+08:00) Irkutsk, Ulaan Bataar' },
  { value: 8, label: '(GMT+08:00) Perth' },
  { value: 8, label: '(GMT+08:00) Taipei' },
  { value: 9, label: '(GMT+09:00) Osaka, Sapporo, Tokyo' },
  { value: 9, label: '(GMT+09:00) Seoul' },
  { value: 9, label: '(GMT+09:00) Yakutsk' },
  { value: 10, label: '(GMT+10:00) Brisbane' },
  { value: 10, label: '(GMT+10:00) Canberra, Melbourne, Sydney' },
  { value: 10, label: '(GMT+10:00) Hobart' },
  { value: 10, label: '(GMT+10:00) Guam, Port Moresby' },
  { value: 10, label: '(GMT+10:00) Vladivostok' },
  { value: 11, label: '(GMT+11:00) Magadan, Solomon Is., New Caledonia' },
  { value: 12, label: '(GMT+12:00) Auckland, Wellington' },
  { value: 12, label: '(GMT+12:00) Fiji, Kamchatka, Marshall Is.' },
  { value: 13, label: '(GMT+13:00) Nuku alofa' },
];

const CheckoutForm: FC<RouteComponentProps> = (props) => {
  const fancyId = delve(props, 'match.params.fancyId');
  const isEdition: boolean = !!fancyId;

  /* State */
  const [checkout, setCheckout] = useState<Checkout | null>(null);
  const [events, setEvents] = useState<PoapEvent[]>([]);
  const [isFetching, setIsFetching] = useState<null | boolean>(null);
  const [activeCheckout, setActiveCheckout] = useState<boolean>(true);

  const initialValues = useMemo(() => {
    if (checkout) {
      const _startDateTime = checkout.start_time.split(' ');
      const _endDateTime = checkout.end_time.split(' ');

      const values: CheckoutFormType = {
        event_id: checkout.event.id,
        fancy_id: checkout.fancy_id,
        max_limit: checkout.max_limit,
        start_date: _startDateTime[0],
        start_time: _startDateTime[1].substr(0, 5),
        timezone: 0,
        end_date: _endDateTime[0],
        end_time: _endDateTime[1].substr(0, 5),
      };
      return values;
    } else {
      const values: CheckoutFormType = {
        event_id: 0,
        fancy_id: '',
        max_limit: 100,
        start_date: '',
        start_time: '',
        timezone: 0,
        end_date: '',
        end_time: '',
      };
      return values;
    }
  }, [checkout]); /* eslint-disable-line react-hooks/exhaustive-deps */

  /* Libraries */
  const { addToast } = useToasts();
  const history = useHistory();

  /* Effects */
  useEffect(() => {
    if (isEdition) {
      fetchCheckout();
    }
    fetchEvents();
  }, []); /* eslint-disable-line react-hooks/exhaustive-deps */

  /* Data functions */
  const fetchCheckout = async () => {
    try {
      const _checkout = await getCheckout(fancyId);
      setCheckout(_checkout);
      if (_checkout.is_active === 'false') setActiveCheckout(false);
    } catch (e) {
      addToast('Error while fetching checkout', {
        appearance: 'error',
        autoDismiss: false,
      });
    }
  };
  const fetchEvents = async () => {
    setIsFetching(true);
    try {
      const events = await getEvents();
      setEvents(events);
    } catch (e) {
      addToast('Error while fetching events', {
        appearance: 'error',
        autoDismiss: false,
      });
    } finally {
      setIsFetching(false);
    }
  };
  const parseEvents = (events: PoapEvent[]): SelectOptionType[] => {
    const options = events.map((event: PoapEvent) => {
      return { value: event.id, label: event.name };
    });
    return [{ value: 0, label: 'Select an event' }, ...options];
  };
  const dateFormatter = (day: Date | number) => format(day, 'MM-dd-yyyy');
  const dateFormatterString = (date: string) => {
    const parts = date.split('-');
    return new Date(`${parts[2]}-${parts[0]}-${parts[1]}`);
  };

  /* UI Manipulation */
  const toggleActiveCheckout = () => setActiveCheckout(!activeCheckout);
  const handleDayClick = (day: Date, dayToSetup: DatePickerDay, setFieldValue: SetFieldValue) => {
    setFieldValue(dayToSetup, dateFormatter(day));
  };
  let eventOptions: SelectOptionType[] = [];
  if (events) eventOptions = parseEvents(events);
  const day = 60 * 60 * 24 * 1000;

  // Edition Loading Component
  if (isEdition && !checkout) {
    return (
      <div className={'bk-container'}>
        <h2>Edit Checkout</h2>
        <Loading />
      </div>
    );
  }

  return (
    <div className={'bk-container'}>
      <Formik
        initialValues={initialValues}
        enableReinitialize
        validateOnBlur={false}
        validateOnChange={false}
        validationSchema={CheckoutSchema}
        onSubmit={async (submittedValues: CheckoutFormType, actions: FormikActions<CheckoutFormType>) => {
          try {
            actions.setSubmitting(true);

            const {
              event_id,
              fancy_id,
              start_date,
              start_time,
              end_date,
              end_time,
              timezone,
              max_limit,
            } = submittedValues;

            // Validate event
            if (event_id === 0) {
              actions.setErrors({ event_id: 'Please, select an event' });
              actions.setSubmitting(false);
              return;
            }

            // Evaluate date consistency
            const _startDateTime = parse(`${start_date} ${start_time}`, 'MM-dd-yyyy HH:mm', new Date());
            const _endDateTime = parse(`${end_date} ${end_time}`, 'MM-dd-yyyy HH:mm', new Date());

            if (isAfter(_startDateTime, _endDateTime)) {
              addToast('Start date & time should be before End date & time', {
                appearance: 'error',
                autoDismiss: true,
              });
              actions.setSubmitting(false);
              return;
            }

            // Format date
            const timezoneSign: string = timezone < 0 ? '-' : '+';
            const absTimezone = Math.abs(timezone);
            const timezoneFilled: string = absTimezone < 10 ? `0${absTimezone}` : `${absTimezone}`;

            const _startDate = format(parse(start_date, 'MM-dd-yyyy', new Date()), 'dd-MMM-yyyy');
            const _endDate = format(parse(end_date, 'MM-dd-yyyy', new Date()), 'dd-MMM-yyyy');

            const formattedStart = `${_startDate} ${start_time}:00${timezoneSign}${timezoneFilled}`;
            const formattedEnd = `${_endDate} ${end_time}:00${timezoneSign}${timezoneFilled}`;

            try {
              if (!isEdition) {
                await createCheckout(event_id, fancy_id, formattedStart, formattedEnd, max_limit, timezone);
              } else {
                await editCheckout(
                  event_id,
                  fancy_id,
                  formattedStart,
                  formattedEnd,
                  max_limit,
                  timezone,
                  activeCheckout.toString(),
                );
              }
              history.push(ROUTES.checkouts.admin.path);
            } catch (e) {
              addToast(e.message, {
                appearance: 'error',
                autoDismiss: false,
              });
              actions.setSubmitting(false);
            }
          } catch (err) {
            actions.setSubmitting(false);
            addToast(err.message, {
              appearance: 'error',
              autoDismiss: true,
            });
          }
        }}
      >
        {({ values, errors, isSubmitting, setFieldValue }) => {
          const handleSelectChange = (name: string) => (selectedOption: any) =>
            setFieldValue(name, selectedOption.value);

          let startDateLimit =
            values.end_date !== ''
              ? {
                  from: new Date(dateFormatterString(values.end_date).getTime() + day),
                  to: new Date('2030-01-01'),
                }
              : undefined;
          let endDateLimit =
            values.start_date !== ''
              ? {
                  from: new Date('2021-01-01'),
                  to: new Date(dateFormatterString(values.start_date).getTime()),
                }
              : undefined;

          return (
            <Form>
              <h2>{isEdition ? 'Edit' : 'Create'} Checkout</h2>

              <div className={'col-md-12'}>
                <FormFilterReactSelect
                  label="Event"
                  name="event_id"
                  placeholder={'Pick an event'}
                  onChange={handleSelectChange('event_id')}
                  options={eventOptions}
                  disabled={!!isFetching}
                  value={eventOptions?.find((option) => option.value === values['event_id'])}
                />
              </div>
              <div>
                <div className={'col-md-8'}>
                  {/*<div>https://app.poap.xyz/e/</div>*/}
                  <EventField disabled={isEdition} title="URL" name="fancy_id" />
                </div>
                <div className={'col-md-4'}>
                  <EventField disabled={false} title="Limit" name="max_limit" />
                </div>
              </div>
              <div>
                <div className={'col-md-4'}>
                  <DatePicker
                    text="Start Date"
                    dayToSetup="start_date"
                    handleDayClick={handleDayClick}
                    setFieldValue={setFieldValue}
                    placeholder={values.start_date}
                    value={values.start_date !== '' ? new Date(values.start_date) : ''}
                    disabled={false}
                    disabledDays={startDateLimit}
                  />
                  <EventField disabled={false} title="" name="start_time" type="time" />
                </div>
                <div className={'col-md-4'}>
                  <DatePicker
                    text="End Date"
                    dayToSetup="end_date"
                    handleDayClick={handleDayClick}
                    setFieldValue={setFieldValue}
                    placeholder={values.end_date}
                    value={values.end_date !== '' ? new Date(values.end_date) : ''}
                    disabled={false}
                    disabledDays={endDateLimit}
                  />
                  <EventField disabled={false} title="" name="end_time" type="time" />
                </div>
                <div className={'col-md-4'}>
                  <FormFilterReactSelect
                    label="Timezone"
                    name="timezone"
                    placeholder={''}
                    onChange={handleSelectChange('timezone')}
                    options={timezones}
                    disabled={false}
                    value={timezones?.find((option) => option.value === values['timezone'])}
                  />
                </div>
              </div>
              {isEdition && (
                <div className={'col-md-12'}>
                  <div className={'checkbox-field'} onClick={toggleActiveCheckout}>
                    <input type="checkbox" checked={activeCheckout} readOnly />
                    <label>Active checkout</label>
                  </div>
                </div>
              )}
              <div className={'col-md-12'}>
                <SubmitButton text="Submit" isSubmitting={isSubmitting} canSubmit={true} />
              </div>
            </Form>
          );
        }}
      </Formik>
    </div>
  );
};

export default CheckoutForm;
