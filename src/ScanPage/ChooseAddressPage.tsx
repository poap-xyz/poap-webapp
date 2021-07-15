import React, { useState, useCallback } from 'react';
import { Formik, Form } from 'formik';
import classNames from 'classnames';

/* Helpers */
import { connectWallet } from '../poap-eth';
import { resolveENS, getENSFromAddress } from '../api';
import { isValidAddress, isValidEmail } from '../lib/helpers';
import { AddressOrEmailSchema } from '../lib/schemas';

type ChooseAddressPageProps = {
  onAccountDetails: (addressOrENS: string, address: string) => void;
};

type LoginButtonProps = {
  onAddress: (addressOrENS: string, address: string) => void;
};

type AddressInputProps = {
  onAddress: (addressOrENS: string, address: string) => void;
};

type AddressFormValues = {
  address: string;
};

const initialValues: AddressFormValues = {
  address: '',
};

const LoginButton: React.FC<LoginButtonProps> = ({ onAddress }) => {
  const doLogin = useCallback(async () => {
    let { web3 } = await connectWallet();

    if (!web3) {
      return;
    }
    const accounts = await web3.eth.getAccounts();
    if (accounts.length === 0) return null;
    const account = accounts[0];

    if (account) {
      try {
        const ensResponse = await getENSFromAddress(account);
        onAddress(ensResponse.valid ? ensResponse.ens : account, account);
      } catch (e) {
        onAddress(account, account);
      }
    }
  }, [onAddress]);

  return (
    <button className="btn" onClick={doLogin}>
      <span>Browse Collection</span>
    </button>
  );
};

const AddressInput: React.FC<AddressInputProps> = ({ onAddress }) => {
  const [ensError, setEnsError] = useState(false);
  const [working, setWorking] = useState(false);

  const onSubmit = async ({ address }: AddressFormValues) => {
    setWorking(true);

    if (isValidAddress(address)) {
      try {
        const addressResponse = await getENSFromAddress(address);
        onAddress(addressResponse.valid ? addressResponse.ens : address, address);
      } catch (e) {
        onAddress(address, address);
      }
    } else if (isValidEmail(address)) {
      onAddress(address, address);
    } else {
      setEnsError(false);
      const ensResponse = await resolveENS(address);

      if (ensResponse.valid) {
        onAddress(address, ensResponse.ens);
      } else {
        setEnsError(true);
      }
    }

    setWorking(false);
  };

  return (
    <Formik onSubmit={onSubmit} initialValues={initialValues} validationSchema={AddressOrEmailSchema}>
      {({ values, errors, setFieldValue }) => (
        <Form className="login-form">
          <input
            type="text"
            id="address"
            name="address"
            placeholder="matoken.eth or alison@google.com"
            onChange={(e) => setFieldValue('address', e.target.value, true)}
            autoComplete="off"
            value={values.address}
            className={classNames(ensError && 'error')}
          />
          {ensError && <p className="text-error">Invalid ENS name</p>}
          <input
            type="submit"
            id="submit"
            value={working ? '' : 'Display Badges'}
            disabled={Boolean(errors.address) || !values.address}
            className={classNames(working && 'loading')}
            name="submit"
          />
        </Form>
      )}
    </Formik>
  );
};

export const ChooseAddressPage: React.FC<ChooseAddressPageProps> = ({ onAccountDetails }) => {
  return (
    <main id="site-main" role="main" className="app-content">
      <div className="container">
        <div className="content-event" data-aos="fade-up" data-aos-delay="300">
          <p>
            Welcome to <span> POAP scan</span>, your gateway to the <span>POAP ecosystem</span>.
            <br />
            Enter an address below to explore a collection.
          </p>
          <br />
          <AddressInput onAddress={onAccountDetails} />
          <LoginButton onAddress={onAccountDetails} />
        </div>
      </div>
    </main>
  );
};
