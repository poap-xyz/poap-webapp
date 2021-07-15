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

type LoginFormProps = {
  onAddress: (addressOrENS: string, address: string) => void;
};

type AddressFormValues = {
  address: string;
};

const initialValues: AddressFormValues = {
  address: '',
};

const LoginForm: React.FC<LoginFormProps> = ({ onAddress }) => {
  const [ensError, setEnsError] = useState(false);
  const [working, setWorking] = useState(false);

  const onSubmit = async ({ address }: AddressFormValues) => {
    setWorking(true);

    if (address) {
      if (isValidAddress(address)) {
        try {
          const addressResponse = await getENSFromAddress(address);
          onAddress(addressResponse.valid ? addressResponse.ens : address, address);
          return;
        } catch (e) {
          onAddress(address, address);
          return;
        }
      } else if (isValidEmail(address)) {
        onAddress(address, address);
        return;
      } else {
        setEnsError(false);
        const ensResponse = await resolveENS(address);

        if (ensResponse.valid) {
          onAddress(address, ensResponse.ens);
          return;
        } else {
          setEnsError(true);
        }
      }
    } else {
      await doLogin();
    }

    setWorking(false);
  };

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
            value={working ? '' : 'Show my Collection'}
            disabled={Boolean(errors.address)}
            className={classNames((working && 'loading') || (!working && 'btn'))}
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
          <LoginForm onAddress={onAccountDetails} />
        </div>
      </div>
    </main>
  );
};
