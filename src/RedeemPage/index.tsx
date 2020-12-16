import React, { FC, useState, useEffect } from 'react';
import { Formik, Form, Field, FieldProps } from 'formik';
import { RouteComponentProps } from 'react-router-dom';
import { useToasts } from 'react-toast-notifications';
import { TransactionReceipt } from 'web3-core';
import { Link } from 'react-router-dom';
import classNames from 'classnames';
import Web3 from 'web3';
import delve from 'dlv';

// components
import { TxDetail } from '../components/TxDetail';
import { ScanHeader, ScanFooter } from '../ScanPage';
import { SubmitButton } from '../components/SubmitButton';

// lib
import { RedeemSchema } from '../lib/schemas';

// api
import { EmailClaim, redeemWithEmail, TokenInfo, getTokensFor, getEmailClaim } from '../api';

/* Assets */
import LoadingSpinner from '../images/loading.svg';

type RedeemFormValues = {
  address: string;
};

const initialValues = { address: '' };

export const RedeemPage: FC<RouteComponentProps> = ({ match }) => {
  // react hooks
  const [isRedeemLoading, setIsRedeemLoading] = useState<boolean>(false);
  const [claim, setClaim] = useState<EmailClaim | null>(null);
  const [tokens, setTokens] = useState<TokenInfo[]>([]);
  const [tokenError, setTokenError] = useState<boolean>(false);
  const [txHash, setTxHash] = useState<string>('');
  const [web3, setWeb3] = useState<any>(null);
  const [txReceipt, setTxReceipt] = useState<null | TransactionReceipt>(null);
  const [ethereumAddress, setEthereumAddress] = useState<string>('');

  // lib hooks
  const { addToast } = useToasts();

  // constants
  const uid = delve(match, 'params.uid');

  // effects
  useEffect(() => {
    getClaim();
  }, []) // eslint-disable-line
  useEffect(() => {
    if (claim) getTokens();
  }, [claim]) // eslint-disable-line
  useEffect(() => {
    if (txHash && web3) {
      const interval = setInterval(() => {
        getReceipt();
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [txHash, web3]); /* eslint-disable-line react-hooks/exhaustive-deps */

  // methods
  const getClaim = async () => {
    try {
      let _claim = await getEmailClaim(uid);
      setClaim(_claim);
    } catch (e) {
      setTokenError(true);
      console.log('Error getting claim');
      console.log(e);
    }
  };
  const getTokens = async () => {
    if (!claim) return;
    try {
      const tokens = await getTokensFor(claim.email);
      setTokens(tokens);
    } catch (error) {
      addToast(error.message, {
        appearance: 'error',
        autoDismiss: false,
      });
    }
  };
  const getReceipt = async () => {
    let receipt: null | TransactionReceipt = null;
    if (web3 && txHash && !txReceipt) {
      receipt = await web3.eth.getTransactionReceipt(txHash);
      if (receipt) {
        setTimeout(() => setTxReceipt(receipt), 1000);
      }
    }
  };

  // handlers
  const handleForm = async (values: RedeemFormValues) => {
    if (!claim) return;

    const { address } = values;
    setIsRedeemLoading(true);
    setEthereumAddress(address);
    redeemWithEmail(address, uid, claim.email)
      .then((response) => {
        const _web3 = new Web3(process.env.REACT_APP_L2_RPC_URL || '');
        setWeb3(_web3);
        setTxHash(response.tx_hash);
      })
      .catch((error) => {
        addToast(error.message, {
          appearance: 'error',
          autoDismiss: false,
        });
      })
      .finally(() => setIsRedeemLoading(false));
  };

  let body = (
    <div className={'preloader'}>
      <img src={LoadingSpinner} alt={'Loading'} />
    </div>
  );

  if (tokenError) {
    body = (
      <div className={'token-error'}>
        <div>We couldn't validate the information received.</div>
        <div>The link could have expired or been already claimed.</div>
        <div>
          Check your POAPs <Link to={'/scan'}>here</Link> and request another email if needed.
        </div>
      </div>
    );
  }

  if (claim && !tokenError) {
    body = (
      <>
        <Formik enableReinitialize onSubmit={handleForm} initialValues={initialValues} validationSchema={RedeemSchema}>
          {({ dirty, isValid, handleChange, values }) => {
            return (
              <Form className="claim-form">
                <div className="redeem-text">
                  This POAPs were claimed with email <span>{claim.email}</span>, please enter your Ethereum address or ENS to claim them
                </div>
                <Field
                  name="hash"
                  render={({ field, form }: FieldProps) => {
                    return (
                      <input
                        type="text"
                        autoComplete="off"
                        className={classNames('width500', !!form.errors[field.name] && 'error')}
                        placeholder="Input your Ethereum address or ENS"
                        name="address"
                        onChange={handleChange}
                        value={values.address}
                        disabled={isRedeemLoading || !!txHash}
                      />
                    );
                  }}
                />
                {!txHash && (
                  <SubmitButton
                    className="mb-24"
                    text="Continue"
                    isSubmitting={isRedeemLoading}
                    canSubmit={isValid && dirty}
                  />
                )}
              </Form>
            );
          }}
        </Formik>

        {txHash && <TxDetail hash={txHash} receipt={txReceipt} layer1={false} />}

        {txReceipt && txReceipt.status && (
          <div className="redeem-success">
            <h6>Success!</h6>
            <div>
              Check your POAPs <Link to={`/scan/${ethereumAddress}`}>here</Link>
            </div>
          </div>
        )}

        <div className="redeem-text-container">
          <div className="redeem-subtitle">POAPs to be claimed</div>
        </div>

        <div className="redeem-poaps-container events-logos">
          {tokens.length > 0 ? (
            tokens.map((token: TokenInfo, index) => (
              <div key={index} className="event-circle" data-aos="fade-up">
                {typeof token.event.image_url === 'string' && (
                  <img src={token.event.image_url} alt={token.event.name} />
                )}
              </div>
            ))
          ) : (
            <span>Loading Tokens</span>
          )}
        </div>
      </>
    );
  }

  return (
    <div className="landing">
      <ScanHeader sectionName="Claim" />
      <div className="redeem-content-container">
        {body}
      </div>
      <ScanFooter path="home" />
    </div>
  );
};
