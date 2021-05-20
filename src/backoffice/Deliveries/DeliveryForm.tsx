import React, { FC, useState, useEffect, useMemo } from 'react';
import { useHistory, RouteComponentProps } from 'react-router-dom';
import { useToasts } from 'react-toast-notifications';
import { Formik, Form, FormikActions } from 'formik';
import delve from 'dlv';

/* Helpers */
import { ROUTES } from 'lib/constants';
import { DeliverySchema } from '../../lib/schemas';
import {
  Delivery,
  DeliveryAddress,
  PoapEvent,
  getEvents,
  getDelivery,
  getDeliveryAddresses,
  createDelivery,
  updateDelivery,
} from '../../api';

/* Components */
import AddressesList from './AddressesList';
import { SubmitButton } from '../../components/SubmitButton';
import { EventField } from '../EventsPage';
import { Loading } from '../../components/Loading';

/* Types */
type DeliveryFormType = {
  slug: string;
  event_ids: string;
  card_title: string;
  card_text: string;
  page_title: string;
  page_text: string;
  metadata_title: string;
  metadata_description: string;
  image: string;
  page_title_image: string;
};

const DeliveryForm: FC<RouteComponentProps> = (props) => {
  const id = delve(props, 'match.params.id');
  const isEdition: boolean = !!id;

  /* State */
  const [delivery, setDelivery] = useState<Delivery | null>(null);
  const [addresses, setAddresses] = useState<DeliveryAddress[]>([]);
  const [addressesError, setAddressesError] = useState<string>('');
  const [listInput, setListInput] = useState<string>('');
  const [events, setEvents] = useState<PoapEvent[]>([]);
  const [activeDelivery, setActiveDelivery] = useState<boolean>(true);

  const initialValues = useMemo(() => {
    if (delivery) {
      const values: DeliveryFormType = {
        slug: delivery.slug,
        event_ids: delivery.event_ids,
        card_title: delivery.card_title,
        card_text: delivery.card_text,
        page_title: delivery.page_title,
        page_text: delivery.page_text,
        metadata_title: delivery.metadata_title,
        metadata_description: delivery.metadata_description,
        image: delivery.image,
        page_title_image: delivery.page_title_image,
      };
      return values;
    } else {
      const values: DeliveryFormType = {
        slug: '',
        event_ids: '',
        card_title: '',
        card_text: '',
        page_title: '',
        page_text: '',
        metadata_title: '',
        metadata_description: '',
        image: '',
        page_title_image: '',
      };
      return values;
    }
  }, [delivery]); /* eslint-disable-line react-hooks/exhaustive-deps */

  /* Libraries */
  const { addToast } = useToasts();
  const history = useHistory();

  /* Effects */
  useEffect(() => {
    if (isEdition) {
      fetchDelivery();
    }
    fetchEvents();
  }, []); /* eslint-disable-line react-hooks/exhaustive-deps */

  /* Data functions */
  const fetchDelivery = async () => {
    try {
      const _delivery = await getDelivery(id);
      setDelivery(_delivery);
      setActiveDelivery(_delivery.active);
      const _addresses = await getDeliveryAddresses(id);
      setAddresses(_addresses);
    } catch (e) {
      addToast('Error while fetching delivery', {
        appearance: 'error',
        autoDismiss: false,
      });
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

  /* UI Manipulation */
  const handleListChange = (ev: React.ChangeEvent<HTMLTextAreaElement>) => {
    setListInput(ev.target.value);
  };
  const toggleActiveDelivery = () => setActiveDelivery(!activeDelivery);

  // Edition Loading Component
  if (isEdition && !delivery) {
    return (
      <div className={'bk-container'}>
        <h2>Edit Delivery</h2>
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
        validationSchema={DeliverySchema}
        onSubmit={async (submittedValues: DeliveryFormType, actions: FormikActions<DeliveryFormType>) => {
          try {
            if (!listInput && !isEdition) {
              setAddressesError('An address list is required');
              actions.setSubmitting(false);
              return;
            }
            setAddressesError('');

            const {
              slug,
              event_ids,
              card_title,
              card_text,
              page_title,
              page_text,
              metadata_title,
              metadata_description,
              image,
              page_title_image,
            } = submittedValues;

            // Clean addresses
            const clean_addresses = [];
            try {
              const _addresses = listInput.split(/\n/);
              let ctr = 0;
              for (let each of _addresses) {
                ctr++;
                // Split by ;
                let parts = each.split(';');
                if (parts.length > 2) {
                  setAddressesError(`Line ${ctr} is incorrectly formed!`);
                  actions.setSubmitting(false);
                  return;
                }
                let _events: number[] = [];
                if (parts.length === 2 && parts[1].trim() !== '') {
                  _events = parts[1].split(',').map((e) => parseInt(e, 10));
                } else {
                  _events = event_ids.split(',').map((e) => parseInt(e, 10));
                }
                // Split by ,
                clean_addresses.push({
                  address: parts[0],
                  events: _events.filter((e) => !isNaN(e)),
                });
              }
            } catch (e) {
              console.log('Error parsing addresses');
              console.log(e);
              setAddressesError('Unexpected error parsing addresses list');
              actions.setSubmitting(false);
              return;
            }

            try {
              if (!isEdition) {
                await createDelivery(
                  slug,
                  event_ids,
                  card_title,
                  card_text,
                  page_title,
                  page_text,
                  metadata_title,
                  metadata_description,
                  image,
                  page_title_image,
                  clean_addresses,
                );
              } else {
                await updateDelivery(
                  id,
                  slug,
                  card_title,
                  card_text,
                  page_title,
                  page_text,
                  metadata_title,
                  metadata_description,
                  image,
                  page_title_image,
                  activeDelivery,
                );
              }
              history.push(ROUTES.deliveries.admin.path);
            } catch (e) {
              let _msg: React.ReactNode | string = e.message;
              try {
                if (e.message.startsWith('[')) {
                  let errors = JSON.parse(e.message);
                  _msg = (
                    <>
                      {errors.map((e: string) => (
                        <p>&bull; {e}</p>
                      ))}
                    </>
                  );
                }
              } catch (e) {
                console.log('Error parsing error > ', e);
              }
              addToast(_msg, {
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
          const addressPlaceholder = `address/ENS;id1,id2,id3
address/ENS`;

          return (
            <Form className={'delivery-admin-form'}>
              <h2>{isEdition ? 'Edit' : 'Create'} Delivery</h2>

              <div>
                <h3>General Info</h3>
                <div className={'col-xs-6'}>
                  <EventField title="Event IDs" disabled={isEdition} placeholder={'id1,id2,id3'} name="event_ids" />
                </div>
                <div className={'col-xs-6'}>
                  <EventField title="Delivery URL" name="slug" />
                </div>
              </div>
              <div>
                <h3>Home Page Card</h3>
                <div className={'col-xs-12'}>
                  <EventField title="Card Title" name="card_title" />
                </div>
                <div className={'col-xs-12'}>
                  <EventField title="Card Text" name="card_text" type="textarea" />
                </div>
              </div>
              <div>
                <h3>Delivery Page</h3>
                <div className={'col-xs-12'}>
                  <EventField title="Page Title" name="page_title" />
                </div>
                <div className={'col-xs-12'}>
                  <EventField title="Page Text" name="page_text" type="textarea" />
                </div>
              </div>
              <div>
                <h3>Page metadata</h3>
                <div className={'col-xs-12'}>
                  <EventField title="Metadata title" name="metadata_title" />
                </div>
                <div className={'col-xs-12'}>
                  <EventField title="Metadata Description" name="metadata_description" type="textarea" />
                </div>
              </div>
              <div>
                <h3>Images</h3>
                <div className={'col-xs-6'}>
                  <EventField title="Image URL" name="image" />
                </div>
                <div className={'col-xs-6'}>
                  <EventField title="Page Title image" name="page_title_image" />
                </div>
              </div>
              {!isEdition && (
                <div>
                  <h3>Addresses</h3>
                  <div className={'col-xs-12'}>
                    <div className="bk-form-row">
                      <label>List of addresses for Delivery</label>
                      <textarea
                        placeholder={addressPlaceholder}
                        className={`${addressesError ? 'error' : ''}`}
                        value={listInput}
                        onChange={handleListChange}
                      />
                      {addressesError && <p className={'bk-error'}>{addressesError}</p>}
                    </div>
                  </div>
                </div>
              )}
              {isEdition && (
                <div className={'col-md-12'}>
                  <div className={'checkbox-field'} onClick={toggleActiveDelivery}>
                    <input type="checkbox" checked={activeDelivery} readOnly />
                    <label>Active delivery</label>
                  </div>
                </div>
              )}
              <div className={'col-md-12'}>
                <SubmitButton text="Submit" isSubmitting={isSubmitting} canSubmit={true} />
              </div>
              {isEdition && addresses && events && <AddressesList addresses={addresses} events={events} />}
            </Form>
          );
        }}
      </Formik>
    </div>
  );
};

export default DeliveryForm;
