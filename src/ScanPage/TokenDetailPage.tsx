import React, { useEffect, useState } from 'react';
import { useToasts } from 'react-toast-notifications';

// routing
import { RouteComponentProps } from 'react-router';
import { Link } from 'react-router-dom';

// libraries
import {
  RedditIcon,
  RedditShareButton,
  TelegramIcon,
  TelegramShareButton,
  TwitterIcon,
  TwitterShareButton,
} from 'react-share';

// Helpers
import { connectWallet, NETWORK } from '../poap-eth';
import { getTokenInfoWithENS, postTokenMigration, TokenInfo } from '../api';

// constants
import { LAYERS } from '../lib/constants';

// assets
import EmptyBadge from '../images/empty-badge.svg';
import HeaderShadowImg from '../images/header-shadow.svg';
import HeaderShadowDesktopImg from '../images/header-shadow-desktop.svg';

// utils
import { useBodyClassName } from '../react-helpers';
import { SubmitButton } from '../components/SubmitButton';
import abi from '../abis/PoapDelegatedMint.json';
import { TransactionReceipt } from 'web3-core';
import { TxDetail } from '../components/TxDetail';

const CONTRACT_ADDRESS = process.env.REACT_APP_MINT_DELEGATE_CONTRACT;

export const TokenDetailPage: React.FC<RouteComponentProps<{
  tokenId: string;
}>> = ({ match }) => {
  const [token, setToken] = useState<null | TokenInfo>(null);
  const [web3, setWeb3] = useState<any>(null);
  const [migrateInProcess, setMigrateInProcess] = useState<boolean>(false);
  const [migrationFinished, setMigrationFinished] = useState<boolean>(false);
  const [txHash, setTxHash] = useState<string>('');
  const [txReceipt, setTxReceipt] = useState<null | TransactionReceipt>(null);

  const { addToast } = useToasts();

  const submitMigration = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!token) return;
    setMigrateInProcess(true);
    postTokenMigration(parseInt(token.tokenId))
      .then((result) => {
        if (result) {
          migrateToken(result.signature);
        }
      })
      .catch(showErrorMessage);
  };

  const migrateToken = async (signature: string) => {
    let _web3 = web3;
    if (!_web3) {
      let response = await connectWallet();
      if (!response.web3) return null;
      _web3 = response.web3;
      if (response.networkError) {
        let message = `Wrong network, please connect to ${NETWORK}.`;
        addToast(message, {
          appearance: 'error',
          autoDismiss: false,
        });
        return null;
      }

      setWeb3(_web3);
    }

    const accounts = await _web3.eth.getAccounts();
    if (accounts.length === 0) return null;

    const account = accounts[0];
    if (!token) return;

    try {
      const contract = new _web3.eth.Contract(abi, CONTRACT_ADDRESS);
      let gas = 1000000;
      try {
        gas = await contract.methods
          .mintToken(token.event.id, token.tokenId, token.owner, signature)
          .estimateGas({ from: account });
        gas = Math.floor(gas * 1.3);
      } catch (e) {
        console.log('Error calculating gas');
      }

      contract.methods
        .mintToken(token.event.id, token.tokenId, token.owner, signature)
        .send({ from: account, gas: gas }, (err: any, hash: string | null) => {
          if (err) {
            console.log('Error on Mint Token: ', err);
            showErrorMessage();
          }
          if (hash) {
            setTxHash(hash);
          }
        });
    } catch (e) {
      console.log('Error submitting transaction');
      console.log(e);
      showErrorMessage();
    }
  };

  const showErrorMessage = () => {
    setMigrateInProcess(false);
    let message = `Error while trying to submit transaction.\nPlease try again.`;
    addToast(message, {
      appearance: 'error',
      autoDismiss: false,
    });
  };

  const getReceipt = async () => {
    let receipt: null | TransactionReceipt = null;
    if (web3 && txHash !== '' && !txReceipt) {
      receipt = await web3.eth.getTransactionReceipt(txHash);
      if (receipt) {
        setTxReceipt(receipt);
      }
    }

    if (!receipt || !receipt.status || (txReceipt && !txReceipt.status)) {
      setMigrateInProcess(false);
    }

    if (receipt && receipt.status) setMigrationFinished(true);
  };

  useBodyClassName('poap-app event-page');

  useEffect(() => {
    const fn = async () => {
      const token = await getTokenInfoWithENS(match.params.tokenId);
      setToken(token);
    };
    fn();
  }, [match]);

  useEffect(() => {
    if (txHash && web3) {
      const interval = setInterval(() => {
        getReceipt();
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [txHash, txReceipt]); /* eslint-disable-line react-hooks/exhaustive-deps */

  if (token == null) {
    return (
      <>
        <div className="header-events token-page">
          <div className="container">
            <h1>Loading</h1>
            <div className="logo-event token-page">
              <img src={EmptyBadge} alt="Event" />
            </div>
          </div>
        </div>
        <main id="site-main" role="main" className="main-events">
          <div className="image-main">
            <img src={HeaderShadowImg} alt="" className="mobile" />
            <img src={HeaderShadowDesktopImg} alt="" className="desktop" />
          </div>
          <div className="main-content">
            <div className="container">
              <div className="content-event">
                <h2>Collection</h2>
              </div>
            </div>
          </div>
        </main>
      </>
    );
  }

  const { event, owner, layer, ens } = token;
  let address = owner;

  if (ens && ens.valid) {
    address = ens.ens;
  }

  return (
    <>
      <div className="header-events token-page">
        <div className="container">
          <h1>{event.name}</h1>
          <p>
            {(event.city || event.country) && (
              <>
                {event.city ? `${event.city}, ` : ''}
                {event.country}
                <br />
              </>
            )}
            <b>{event.start_date}</b>
          </p>
          <div className="logo-event token-page">
            {typeof event.image_url === 'string' && <img src={event.image_url} alt="Event" />}
          </div>
        </div>
      </div>
      <main id="site-main" role="main" className="main-events">
        <div className="image-main">
          <img src={HeaderShadowImg} alt="" className="mobile" />
          <img src={HeaderShadowDesktopImg} alt="" className="desktop" />
        </div>
        <div className="main-content">
          <div className="container claim-info">
            <div className="content-event">
              <h2>Collection</h2>
              <p className={`wallet-number ${(ens && ens.valid) ? "ens":""}`}>
                <Link to={`/scan/${address}`}>{address}</Link>
              </p>
              <h2>Brog on the interwebz</h2>
              <ul className="social-icons">
                <li>
                  <TwitterShareButton
                    url={window.location.toString()}
                    title={`Look at my ${event.name} badge!`}
                    via="poapxyz"
                  >
                    <TwitterIcon size={40} round iconBgStyle={{ fill: '#6534FF' }} />
                  </TwitterShareButton>
                </li>
                <li>
                  <TelegramShareButton url={window.location.toString()} title={`Look at my ${event.name} badge!`}>
                    <TelegramIcon size={40} round iconBgStyle={{ fill: '#6534FF' }} />
                  </TelegramShareButton>
                </li>
                <li>
                  <RedditShareButton url={window.location.toString()} title={`Look at my ${event.name} badge!`}>
                    <RedditIcon size={40} round iconBgStyle={{ fill: '#6534FF' }} />
                  </RedditShareButton>
                </li>
              </ul>
            </div>
            <div className={'migration-section'}>
              {layer === LAYERS.layer2 && !migrationFinished && !txHash && (
                <>
                  <div className={'divider'} />
                  <p>This POAP is currently on xDAI and it can be migrated to mainnet</p>
                  <div>
                    <form onSubmit={submitMigration}>
                      <SubmitButton text={'Migrate POAP'} isSubmitting={migrateInProcess} canSubmit={true} />
                    </form>
                  </div>
                </>
              )}
              {layer === LAYERS.layer2 && migrationFinished && <p className={'success'}>POAP migrated successfully!</p>}
              {txHash && <TxDetail hash={txHash} receipt={txReceipt} />}
              {txReceipt && !txReceipt.status && (
                <>
                  <div className={'divider'} />
                  <div className={'text-info'} data-aos="fade-up">
                    <p>It seems that your transaction failed. Please refresh the page</p>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </main>
    </>
  );
};
