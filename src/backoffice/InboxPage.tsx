import React, { useEffect, useState } from 'react';

// libraries
import classNames from 'classnames';
import { Formik, Form, Field, ErrorMessage, FieldProps, FormikActions } from 'formik';
import { useToasts } from 'react-toast-notifications';

/* Helpers */
import { getEvents, PoapEvent, sendNotification } from '../api';

/* Components */
import { SubmitButton } from '../components/SubmitButton';
import FilterSelect from '../components/FilterSelect';

// schema
import { InboxFormSchema } from '../lib/schemas';

/* Typings */
import { Name, NotificationType, RecipientType } from '../types';

type IInboxFormValues = {
  title: string;
  description: string;
  recipientFilter: RecipientType;
  notificationType: NotificationType;
  selectedEvent: number | null;
};

export const InboxPage: React.FC = () => {
  const [events, setEvents] = useState<PoapEvent[]>([]);
  const [notificationType, setNotificationType] = useState<string>('');
  const [recipientFilter, setRecipientFilter] = useState<string>('');
  const [selectedEvent, setSelectedEvent] = useState<number | null>(null);

  const { addToast } = useToasts();

  useEffect(() => {
    const async = async () => {
      const events = await getEvents();
      setEvents(events);
    };
    async();
  }, []);

  const initialValues: IInboxFormValues = {
    title: '',
    description: '',
    notificationType: '',
    recipientFilter: '',
    selectedEvent: null,
  };

  const handleSubmit = async (values: IInboxFormValues, actions: FormikActions<IInboxFormValues>) => {
    const { title, description, notificationType } = values;
    try {
      await sendNotification(title, description, notificationType, selectedEvent);
      setNotificationType('');
      setRecipientFilter('');
      setSelectedEvent(null);
      actions.resetForm(initialValues);
      addToast('Notification created successfully', {
        appearance: 'success',
      });
    } catch (err) {
      addToast(err.message, {
        appearance: 'error',
      });
    }
  };

  const handleRadio = (name: Name, value: RecipientType | NotificationType) => {
    if (name === 'notificationType') setNotificationType(value);
    if (name === 'recipientFilter') setRecipientFilter(value);
  };

  const handleEventSelect = (e: React.ChangeEvent<HTMLSelectElement>, setFieldValue: any) => {
    setSelectedEvent(Number(e.target.value));
    setFieldValue('selectedEvent', Number(e.target.value));
  };

  const handleNotificationTypeSelect = (e: React.ChangeEvent<HTMLSelectElement>, setFieldValue: any) => {
    const { value } = e.target;
    if (value === '' || value === 'inbox' || value === 'push') {
      handleRadio('notificationType', value);
      setFieldValue('notificationType', value);
    }
  };

  const handleRecipientSelect = (e: React.ChangeEvent<HTMLSelectElement>, setFieldValue: any) => {
    const { value } = e.target;
    if (value === '' || value === 'everyone' || value === 'event') {
      handleRadio('recipientFilter', value);
      setFieldValue('recipientFilter', value);
    }
  };

  return (
    <div className="bk-container">
      <h2>Create Notification</h2>
      <Formik
        enableReinitialize
        initialValues={initialValues}
        validationSchema={InboxFormSchema}
        onSubmit={handleSubmit}
        render={({ status, setFieldValue }) => {
          return (
            <Form>
              <Field
                name="title"
                render={({ field, form }: FieldProps) => (
                  <div className="bk-form-row">
                    <label htmlFor="title">Title</label>
                    <input
                      type="text"
                      name="title"
                      {...field}
                      className={classNames(!!form.errors[field.name] && 'error')}
                    />
                    <ErrorMessage name={'title'} component="p" className="bk-error" />
                  </div>
                )}
              />

              <div className="bk-form-row">
                <label htmlFor="description">Description</label>
                <Field
                  name="description"
                  render={({ field, form }: FieldProps) => (
                    <textarea
                      rows={10}
                      cols={24}
                      placeholder=""
                      className={classNames(!!form.errors[field.name] && 'error')}
                      {...field}
                    />
                  )}
                />
                <ErrorMessage name="description" component="p" className="bk-error" />
                <br />
              </div>

              <div className="row">
                <div className="col-md-3">
                  <FilterSelect handleChange={(e) => handleNotificationTypeSelect(e, setFieldValue)}>
                    <option value="">Select a type</option>
                    <option value="inbox">Inbox</option>
                    <option value="push">Push</option>
                  </FilterSelect>
                  <ErrorMessage name="notificationType" component="p" className="bk-error" />
                  <div>Selected: {notificationType}</div>
                </div>

                <div className="col-md-3">
                  <FilterSelect handleChange={e => handleRecipientSelect(e, setFieldValue)}>
                    <option value="">Select the recipient</option>
                    <option value="everyone">Send to everyone</option>
                    <option value="event">Send to specific event</option>
                  </FilterSelect>
                  <ErrorMessage name="recipientFilter" component="p" className="bk-error" />
                </div>

                <div className="col-md-3">
                  {recipientFilter === 'event' && events && (
                    <FilterSelect handleChange={e => handleEventSelect(e, setFieldValue)}>
                      <option value="">Select an event</option>
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

              <SubmitButton text="Send" isSubmitting={false} canSubmit={true} />

              {status && <div className={status.ok ? 'bk-msg-ok' : 'bk-msg-error'}>{status.msg}</div>}
            </Form>
          );
        }}
      />
    </div>
  );
};
