import React, { FC, useState, useEffect } from 'react';
import { Formik, FormikActions, Form, Field, FieldProps, ErrorMessage } from 'formik';
import classNames from 'classnames';

/* Helpers */
import { GasPriceSchema } from '../lib/schemas';
import { getSetting, setSetting } from '../api';
import { convertToGWEI, convertFromGWEI } from '../lib/helpers';
/* Components */
import { SubmitButton } from '../components/SubmitButton';

type GasPriceFormValues = {
  gasPrice: string;
};

const GasPricePage: FC = () => {
  const [isFetchingCurrentGasPrice, setIsFetchingCurrentGasPrice] = useState<null | boolean>(null);
  const [gasPrice, setGasPrice] = useState<string>('');

  useEffect(() => {
    setIsFetchingCurrentGasPrice(true);

    getSetting('gas-price')
      .then(setting => {
        if (!setting) return;
        const gasPriceInGwei = convertToGWEI(setting.value);
        setGasPrice(gasPriceInGwei);
      })
      .catch(error => console.error(error))
      .finally(() => setIsFetchingCurrentGasPrice(false));
  }, []);

  const handleFormSubmit = async (
    values: GasPriceFormValues,
    actions: FormikActions<GasPriceFormValues>
  ) => {
    try {
      actions.setStatus(null);
      actions.setSubmitting(true);

      const gasPriceInWEI = convertFromGWEI(values.gasPrice);
      await setSetting('gas-price', gasPriceInWEI);
      setGasPrice(values.gasPrice);

      actions.setStatus({ ok: true, msg: 'Gas price changed succesfully' });
    } catch (error) {
      actions.setStatus({ ok: false, msg: `Gas price couldn't be changed` });
    } finally {
      actions.setSubmitting(false);
    }
  };

  return (
    <div className="content-event aos-init aos-animate" data-aos="fade-up" data-aos-delay="300">
      <p>From here you will be able to modify the gas price in GWEI units</p>
      <Formik
        enableReinitialize
        onSubmit={handleFormSubmit}
        initialValues={{ gasPrice }}
        validationSchema={GasPriceSchema}
      >
        {({ dirty, isValid, isSubmitting, status, touched }) => {
          return (
            <Form className="login-form">
              <Field
                name="gasPrice"
                render={({ field, form }: FieldProps) => {
                  return (
                    <input
                      type="text"
                      autoComplete="off"
                      className={classNames(!!form.errors[field.name] && 'error')}
                      placeholder={isFetchingCurrentGasPrice ? 'Loading current gas price' : ''}
                      {...field}
                    />
                  );
                }}
              />
              <ErrorMessage name="gasPrice" component="p" className="bk-error" />
              {status && !touched.gasPrice && (
                <p className={status.ok ? 'bk-msg-ok' : 'bk-msg-error'}>{status.msg}</p>
              )}
              <SubmitButton
                text="Modify gas price"
                isSubmitting={isSubmitting}
                canSubmit={isValid && dirty}
              />
            </Form>
          );
        }}
      </Formik>
    </div>
  );
};

export { GasPricePage };
