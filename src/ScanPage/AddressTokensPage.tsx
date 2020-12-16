import React, { FC, useState, useEffect } from 'react';
import { useToasts } from 'react-toast-notifications';
import ReactModal from 'react-modal';

// routing
import { RouteComponentProps } from 'react-router';
import { Link } from 'react-router-dom';

// libraries
import classNames from 'classnames';
import delve from 'dlv';

/* Helpers */
import { shortAddress } from '../poap-eth';
import { TokenInfo, getTokensFor, resolveENS, getENSFromAddress, requestEmailRedeem } from '../api';
import { isValidAddress, isValidEmail } from '../lib/helpers';

/* Assets */
import NoEventsImg from '../images/event-2019.svg';

/* Components */
import { Loading } from '../components/Loading';
import { SubmitButton } from '../components/SubmitButton';

type AddressTokensPageState = {
  tokens: null | TokenInfo[];
  address: null | string;
  ens: null | string;
  error: boolean;
  loading: boolean;
  isRedeemModalOpen: boolean;
  isRedeemLoading: boolean;
};

type TokenByYear = {
  year: number;
  tokens: TokenInfo[];
};

export const AddressTokensPage: FC<RouteComponentProps> = ({ location, match }) => {
  const [state, setState] = useState<AddressTokensPageState>({
    tokens: null,
    error: false,
    address: null,
    ens: null,
    loading: false,
    isRedeemModalOpen: false,
    isRedeemLoading: false,
  });

  const { addToast } = useToasts();
  const { tokens, error, address, ens, loading, isRedeemLoading, isRedeemModalOpen } = state;

  useEffect(() => {
    getTokens();
  }, []); // eslint-disable-line

  const handleOpenRedeemModalClick = () => {
    setState((oldState) => ({ ...oldState, isRedeemModalOpen: true }));
  };

  const handleCloseRedeemModalClick = () => {
    setState((oldState) => ({ ...oldState, isRedeemModalOpen: false }));
  };

  const handleRedeemConfirm = () => {
    if (!address) return;
    setState((oldState) => ({ ...oldState, isRedeemLoading: true }));

    requestEmailRedeem(address)
      .then(() => {
        setState((oldState) => ({ ...oldState, isRedeemModalOpen: false }));

        const successMessage = 'Your request was processed correcty! Please, check your email';

        addToast(successMessage, {
          appearance: 'success',
          autoDismiss: true,
        });
      })
      .catch((e: Error) => {
        const errorMessage = `An error occurred claiming your POAPs:\n${e.message}`;

        addToast(errorMessage, {
          appearance: 'error',
          autoDismiss: false,
        });
      })
      .finally(() => setState((oldState) => ({ ...oldState, isRedeemLoading: false })));
  };

  const getTokens = async () => {
    try {
      setState((oldState) => ({ ...oldState, loading: true }));

      const account = delve(match, 'params.account');
      const addressFromHistory = delve(location, 'state.address');
      const address = account || addressFromHistory;

      if (isValidAddress(address)) {
        const tokens = await getTokensFor(address);
        try {
          const ens = await getENSFromAddress(address);
          setState((oldState) => ({ ...oldState, tokens, address, ens: ens.valid ? ens.ens : null }));
        } catch (e) {
          setState((oldState) => ({ ...oldState, tokens, address, ens: null }));
        }
      } else if (isValidEmail(address)) {
        const tokens = await getTokensFor(address);
        setState((oldState) => ({ ...oldState, tokens, address, ens: null }));
      } else {
        const ensResponse = await resolveENS(address);

        if (ensResponse.valid) {
          const tokens = await getTokensFor(ensResponse.ens);
          setState((oldState) => ({ ...oldState, tokens, address: ensResponse.ens, ens: address }));
        }
      }
    } catch (err) {
      setState((oldState) => ({ ...oldState, error: true }));
    } finally {
      setState((oldState) => ({ ...oldState, loading: false }));
    }
  };

  const getTokensByYear = (): TokenByYear[] => {
    if (state.tokens == null) {
      throw new Error('There are no tokens');
    }

    const tokensByYear: Map<number, TokenInfo[]> = new Map();

    for (const token of state.tokens) {
      const { year } = token.event;

      if (tokensByYear.has(year)) {
        tokensByYear.get(year)!.push(token);
      } else {
        tokensByYear.set(year, [token]);
      }
    }

    const lastYear = Math.min(...state.tokens.map((t) => t.event.year));

    const res: TokenByYear[] = [];

    for (let year = new Date().getFullYear(); year >= lastYear; year--) {
      res.push({
        year,
        tokens: tokensByYear.get(year) || [],
      });
    }

    return res;
  };

  const renderTokens = () => {
    return (
      <>
        <p>These are the events you have attended in the past</p>
        {getTokensByYear().map(({ year, tokens }, i) => (
          <div key={year} className={classNames('event-year', tokens.length === 0 && 'empty-year')}>
            <h2>{year}</h2>
            {tokens.length > 0 ? (
              <div className="events-logos">
                {tokens.map((t, index) => {
                  if (t.tokenId) {
                    return (
                      <Link
                        key={index}
                        to={{
                          pathname: `/token/${t.tokenId}`,
                          state: t,
                        }}
                        className="event-circle"
                        data-aos="fade-up"
                      >
                        <img src={t.event.image_url} alt={t.event.name} />
                      </Link>
                    );
                  } else {
                    return (
                      <div className="event-circle" data-aos="fade-up" key={index}>
                        <img src={t.event.image_url} alt={t.event.name} />
                      </div>
                    );
                  }
                })}
              </div>
            ) : (
              <>
                <img src={NoEventsImg} alt="" />
                <p className="image-description">You’ve been a couch potato all of {year}</p>
              </>
            )}
          </div>
        ))}
      </>
    );
  };

  return (
    <main id="site-main" role="main" className="app-content">
      <div className="container">
        <div className="content-event years" data-aos="fade-up" data-aos-delay="300">
          {!error && !loading && (
            <h1>
              {ens ? (
                <>
                  Hey <span>{ens}!</span> ({address && shortAddress(address)})
                </>
              ) : (
                <>
                  <div className={'greetings-desktop'}>Hey {address}!</div>
                  <div className={'greetings-mobile'}>
                    Hey {address && !isValidEmail(address) ? shortAddress(address) : address}!
                  </div>
                </>
              )}
            </h1>
          )}

          {error && !loading && (
            <div className="bk-msg-error">
              There was an error.
              <br />
              Check the address and try again
            </div>
          )}

          {loading === true && (
            <>
              <Loading />
              <div style={{ textAlign: 'center' }}>Waiting for your tokens...</div>
            </>
          )}

          {tokens && tokens.length === 0 && (
            <div className={classNames('event-year', 'empty-year')} style={{ marginTop: '30px' }}>
              <img src={NoEventsImg} alt="" />
              <p className="image-description">You don't seem to have any tokens. You're quite a couch potato!</p>
            </div>
          )}

          {tokens && tokens.length > 0 && renderTokens()}

          {!error && !loading && address && isValidEmail(address) && tokens && tokens.length > 0 && (
            <div className="scan-email-badge-container">
              <span className="scan-email-badge">
                <b>Note:</b> These badges are not in an Ethereum wallet yet. When you're ready to claim your POAPS, please click on
                the button below
              </span>
              <div className="scan-email-badge-button-container">
                <button onClick={handleOpenRedeemModalClick} className="btn btn-primary">
                  Claim my POAPs
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <ReactModal isOpen={isRedeemModalOpen} shouldFocusAfterRender={true}>
        <div className={classNames('redeem-modal', isRedeemLoading && 'submitting')}>
          <h2>Claim POAPs</h2>
          <span className="redeem-modal-paragraph">
            To claim your POAPs to your Ethereum wallet you will need access to the email{' '}
            <span className="redeem-modal-email">{address}</span> and the address of your wallet. You will receive an
            email to verify that you own that email and instructions to redeem your POAPs.
          </span>
          <div className="redeem-modal-buttons-container">
            <SubmitButton
              canSubmit={true}
              text="Confirm"
              isSubmitting={isRedeemLoading}
              onClick={handleRedeemConfirm}
            />

            <div onClick={handleCloseRedeemModalClick} className={'close-modal'}>
              Cancel
            </div>
          </div>
        </div>
      </ReactModal>
    </main>
  );
};
