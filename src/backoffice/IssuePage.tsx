import React from 'react';
import classNames from 'classnames';
import { ErrorMessage, Field, Form, Formik, FormikActions, FieldProps } from 'formik';

/* Helpers */
import { convertToGWEI } from '../lib/helpers';
import { IssueForEventFormValueSchema, IssueForUserFormValueSchema } from '../lib/schemas';
import {
  getEvents,
  getSigners,
  mintEventToManyUsers,
  AdminAddress,
  PoapEvent,
  mintUserToManyEvents,
} from '../api';
/* Components */
import { SubmitButton } from '../components/SubmitButton';
import FormSelect from '../components/FormSelect';

interface IssueForEventPageState {
  events: PoapEvent[];
  initialValues: IssueForEventFormValues;
  signers: AdminAddress[];
}

interface IssueForEventFormValues {
  eventId: number;
  addressList: string;
  signer: string;
}

export class IssueForEventPage extends React.Component<{}, IssueForEventPageState> {
  state: IssueForEventPageState = {
    events: [],
    initialValues: {
      eventId: 0,
      addressList: '',
      signer: '',
    },
    signers: [],
  };

  async componentDidMount() {
    const events = await getEvents();
    const signers = await getSigners();

    const signer = signers.length > 0 ? signers[0].signer : '';

    this.setState(old => {
      return {
        ...old,
        events,
        initialValues: {
          ...old.initialValues,
          eventId: events[0].id,
          signer,
        },
        signers,
      };
    });
  }

  onSubmit = async (
    values: IssueForEventFormValues,
    actions: FormikActions<IssueForEventFormValues>
  ) => {
    const addresses = values.addressList
      .trim()
      .split('\n')
      .map(adr => adr.trim());

    let error = false;
    addresses.forEach(address => {
      if (address.indexOf('.') === -1 && !address.match(/^0x[0-9a-fA-F]{40}$/)) error = true;
    });
    if (error) {
      actions.setStatus({
        ok: false,
        msg: `Not a valid address or ENS list`,
      });
      actions.setSubmitting(false);
      return;
    }

    try {
      actions.setStatus(null);
      await mintEventToManyUsers(values.eventId, addresses, values.signer);
      actions.setStatus({
        ok: true,
        msg: `All Done`,
      });
    } catch (err) {
      actions.setStatus({
        ok: false,
        msg: `Mint Failed: ${err.message}`,
      });
    } finally {
      actions.setSubmitting(false);
    }
  };

  render() {
    let { events } = this.state;
    if (events.length === 0) {
      return <div className="bk-msg-error">No Events</div>;
    }

    const eventOptions = events.map(event => {
      const label = `${event.name ? event.name : 'No name'} (${event.fancy_id}) - ${event.year}`;
      return {value: event.id, label: label};
    })

    return (
      <div className={'bk-container'}>
        <Formik
          enableReinitialize
          initialValues={this.state.initialValues}
          onSubmit={this.onSubmit}
          validationSchema={IssueForEventFormValueSchema}
          render={({ dirty, isValid, isSubmitting, status }) => {
            return (
              <Form>
                <div className="bk-form-row">
                  <label htmlFor="eventId">Choose Event:</label>
                  <Field
                    component={FormSelect}
                    name={"eventId"}
                    options={eventOptions}
                    placeholder={'Select an event'}
                  />
                  <ErrorMessage name="eventId" component="p" className="bk-error" />
                </div>
                <div className="bk-form-row">
                  <label htmlFor="addressList">Beneficiaries Addresses</label>
                  <Field
                    name="addressList"
                    render={({ field, form }: FieldProps) => (
                      <textarea
                        rows={10}
                        cols={24}
                        placeholder="Write a list of addresses. Each Separated by a new line"
                        className={classNames(!!form.errors[field.name] && 'error')}
                        {...field}
                      />
                    )}
                  />
                  {}
                  <ErrorMessage name="addressList" component="p" className="bk-error" />
                  <br />
                </div>
                <div className="bk-form-row">
                  <label htmlFor="signer">Choose Address:</label>
                  <Field name="signer" component="select">
                    {this.state.signers.map(signer => {
                      const label = `${signer.id} - ${signer.signer} (${signer.role}) - Pend: ${
                        signer.pending_tx
                      } - Gas: ${convertToGWEI(signer.gas_price)}`;
                      return (
                        <option key={signer.id} value={signer.signer}>
                          {label}
                        </option>
                      );
                    })}
                  </Field>
                  <ErrorMessage name="signer" component="p" className="bk-error" />
                </div>
                {status && (
                  <div className={status.ok ? 'bk-msg-ok' : 'bk-msg-error'}>{status.msg}</div>
                )}
                <SubmitButton
                  text="Mint"
                  isSubmitting={isSubmitting}
                  canSubmit={isValid && dirty}
                />
              </Form>
            );
          }}
        />
      </div>
    );
  }
}

interface IssueForUserPageState {
  events: PoapEvent[];
  initialValues: IssueForUserFormValues;
  signers: AdminAddress[];
}

interface IssueForUserFormValues {
  eventIds: number[];
  address: string;
  signer: string;
}

export class IssueForUserPage extends React.Component<{}, IssueForUserPageState> {
  state: IssueForUserPageState = {
    events: [],
    initialValues: {
      eventIds: [],
      address: '',
      signer: '',
    },
    signers: [],
  };

  async componentDidMount() {
    const events = await getEvents();
    const signers = await getSigners();

    const signer = signers.length > 0 ? signers[0].signer : '';

    this.setState({ events, signers, initialValues: { ...this.state.initialValues, signer } });
  }

  onSubmit = async (
    values: IssueForUserFormValues,
    actions: FormikActions<IssueForUserFormValues>
  ) => {
    try {
      actions.setStatus(null);
      await mintUserToManyEvents(values.eventIds, values.address, values.signer);
      actions.setStatus({
        ok: true,
        msg: `All Done`,
      });
    } catch (err) {
      actions.setStatus({
        ok: false,
        msg: `Mint Failed: ${err.message}`,
      });
    } finally {
      actions.setSubmitting(false);
    }
  };

  render() {
    if (this.state.events.length === 0) {
      return <div className="bk-msg-error">No Events</div>;
    }

    return (
      <div className={'bk-container'}>
        <Formik
          enableReinitialize
          initialValues={this.state.initialValues}
          onSubmit={this.onSubmit}
          validationSchema={IssueForUserFormValueSchema}
          render={({ dirty, isValid, isSubmitting, status }) => {
            return (
              <Form>
                <div className="bk-form-row">
                  <label>Choose Events:</label>
                  <div>
                    {this.state.events.map(event => {
                      const label = `${event.name} (${event.fancy_id}) - ${event.year}`;
                      return (
                        <Checkbox key={event.id} name="eventIds" value={event.id} label={label} />
                      );
                    })}
                  </div>
                  <ErrorMessage name="eventIds" component="p" className="bk-error" />
                </div>
                <div className="bk-form-row">
                  <label htmlFor="address">Beneficiary Address</label>
                  <Field
                    name="address"
                    render={({ field, form }: FieldProps) => (
                      <input
                        type="text"
                        placeholder="0x811a16ebf03c20d9333ff5321372d86da9ad1f2e"
                        className={classNames(!!form.errors[field.name] && 'error')}
                        {...field}
                      />
                    )}
                  />
                  <ErrorMessage name="address" component="p" className="bk-error" />
                </div>
                <div className="bk-form-row">
                  <label htmlFor="signer">Choose Address:</label>
                  <Field name="signer" component="select">
                    {this.state.signers.map(signer => {
                      const label = `${signer.id} - ${signer.signer} (${signer.role}) - Pend: ${
                        signer.pending_tx
                      } - Gas: ${convertToGWEI(signer.gas_price)}`;
                      return (
                        <option key={signer.id} value={signer.signer}>
                          {label}
                        </option>
                      );
                    })}
                  </Field>
                  <ErrorMessage name="signer" component="p" className="bk-error" />
                </div>
                {status && (
                  <div className={status.ok ? 'bk-msg-ok' : 'bk-msg-error'}>{status.msg}</div>
                )}
                <SubmitButton
                  text="Mint"
                  isSubmitting={isSubmitting}
                  canSubmit={isValid && dirty}
                />
              </Form>
            );
          }}
        />
      </div>
    );
  }
}

type CheckboxProps = {
  name: string;
  value: any;
  label: string;
};

const Checkbox: React.FC<CheckboxProps> = props => {
  return (
    <Field name={props.name}>
      {({ field, form }: FieldProps) => (
        <label>
          <input
            type="checkbox"
            checked={field.value.includes(props.value)}
            onChange={() => {
              if (field.value.includes(props.value)) {
                const nextValue = field.value.filter((value: any) => value !== props.value);
                form.setFieldValue(props.name, nextValue);
              } else {
                const nextValue = field.value.concat([props.value]);
                form.setFieldValue(props.name, nextValue);
              }
            }}
          />
          {props.label}
        </label>
      )}
    </Field>
  );
};
