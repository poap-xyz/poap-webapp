import React, { FC, useState, useEffect } from 'react';
import classNames from 'classnames';

/* Libraries */
import ReactModal from 'react-modal';
import { Formik, FormikActions, Form, Field, FieldProps, ErrorMessage } from 'formik';

/* Helpers */
import { GasPriceSchema } from '../lib/schemas';
import { etherscanLinks } from '../lib/constants';
import { getSigners, setSigner, AdminAddress } from '../api';
import { convertToGWEI, convertFromGWEI, convertToETH, reduceAddress } from '../lib/helpers';

/* Components */
import { SubmitButton } from '../components/SubmitButton';
import { Loading } from '../components/Loading';

/* Assets */
import edit from '../images/edit.svg';

type GasPriceFormValues = {
  gasPrice: string;
};

ReactModal.setAppElement('#root');

const AddressManagementPage: FC = () => {
  const [isFetchingAddresses, setIsFetchingAddresses] = useState<null | boolean>(null);
  const [addresses, setAddresses] = useState<null | AdminAddress[]>(null);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [selectedAddress, setSelectedAddress] = useState<null | AdminAddress>(null);

  useEffect(() => {
    fetchSigners();
  }, []);

  const fetchSigners = () => {
    setIsFetchingAddresses(true);
    setAddresses(null);

    getSigners()
      .then((addresses) => {
        if (!addresses) return;
        setAddresses(addresses);
      })
      .catch((error) => console.error(error))
      .finally(() => setIsFetchingAddresses(false));
  };

  const handleFormSubmit = async (values: GasPriceFormValues, actions: FormikActions<GasPriceFormValues>) => {
    if (!selectedAddress) return;
    try {
      actions.setStatus(null);
      actions.setSubmitting(true);

      const gasPriceInWEI = convertFromGWEI(values.gasPrice);
      await setSigner(selectedAddress.id, gasPriceInWEI);
      fetchSigners();
      closeEditModal();
    } catch (error) {
      actions.setStatus({ ok: false, msg: `Gas price couldn't be changed` });
    } finally {
      actions.setSubmitting(false);
    }
  };

  const openEditModal = (address: AdminAddress) => {
    setModalOpen(true);
    setSelectedAddress(address);
  };

  const closeEditModal = () => {
    setModalOpen(false);
    setSelectedAddress(null);
  };

  return (
    <div className={'admin-table addresses'}>
      <h2>Admin addresses management</h2>
      <div className={'row table-header visible-md'}>
        <div className={'col-md-1 center'}>#</div>
        <div className={'col-md-3'}>Address</div>
        <div className={'col-md-2'}>Role</div>
        <div className={'col-md-2'}>Pending Txs</div>
        <div className={'col-md-2 center'}>Balance (ETH)</div>
        <div className={'col-md-2 center'}>Gas Price (GWei)</div>
      </div>
      <div className={'admin-table-row'}>
        {isFetchingAddresses && <Loading />}
        {addresses &&
          addresses.map((address, i) => {
            return (
              <div className={`row`} key={address.id}>
                <div className={'col-md-1 center'}>
                  <span className={'visible-sm'}>#</span>
                  {address.id}
                </div>
                <div className={'col-md-3'}>
                  <span className={'visible-sm'}>Address: </span>
                  <a href={etherscanLinks.address(address.signer)} target={'_blank'}>
                    {reduceAddress(address.signer)}
                  </a>
                </div>
                <div className={'col-md-2 capitalize'}>
                  <span className={'visible-sm'}>Role: </span>
                  {address.role}
                </div>
                <div className={'col-md-2 center'}>
                  <span className={'visible-sm'}>Pending Txs: </span>
                  {address.pending_tx}
                </div>
                <div className={'col-md-2 center'}>
                  <span className={'visible-sm'}>Balance (ETH): </span>
                  {Math.round(convertToETH(address.balance) * 1000) / 1000}
                </div>
                <div className={'col-md-2 center'}>
                  <span className={'visible-sm'}>Gas Price (GWei): </span>
                  {convertToGWEI(address.gas_price)}
                  <img src={edit} alt={'Edit'} className={'edit-icon'} onClick={() => openEditModal(address)} />
                </div>
              </div>
            );
          })}
      </div>
      <ReactModal isOpen={modalOpen} shouldFocusAfterRender={true}>
        <div>
          <h3>Edit Gas Price</h3>
          {selectedAddress && (
            <Formik
              enableReinitialize
              onSubmit={handleFormSubmit}
              initialValues={{ gasPrice: convertToGWEI(selectedAddress.gas_price) }}
              validationSchema={GasPriceSchema}
            >
              {({ dirty, isValid, isSubmitting, status, touched }) => {
                return (
                  <Form className="price-gas-modal-form">
                    <Field
                      name="gasPrice"
                      render={({ field, form }: FieldProps) => {
                        return (
                          <input
                            type="text"
                            autoComplete="off"
                            className={classNames(!!form.errors[field.name] && 'error')}
                            placeholder={'Gas price in GWEI'}
                            {...field}
                          />
                        );
                      }}
                    />
                    <ErrorMessage name="gasPrice" component="p" className="bk-error" />
                    {status && <p className={status.ok ? 'bk-msg-ok' : 'bk-msg-error'}>{status.msg}</p>}
                    <SubmitButton text="Modify gas price" isSubmitting={isSubmitting} canSubmit={isValid && dirty} />
                    <div onClick={closeEditModal} className={'close-modal'}>
                      Cancel
                    </div>
                  </Form>
                );
              }}
            </Formik>
          )}
        </div>
      </ReactModal>
    </div>
  );
};

export { AddressManagementPage };
