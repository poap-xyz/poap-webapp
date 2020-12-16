import React, { useEffect, useState } from 'react';
import Web3 from 'web3';
// @ts-ignore
import { TransactionReceipt } from 'web3-core';
import ReactModal from 'react-modal';
import { useToasts } from 'react-toast-notifications';

/* Helpers */
import { connectWallet, NETWORK } from '../poap-eth';
import { HashClaim } from '../api';
import { reduceAddress } from '../lib/helpers';

/* Components */
import { Button } from '../components/Button';
import { TxDetail } from '../components/TxDetail';

/* Assets */
import abi from '../abis/PoapDelegatedMint.json';
import ClaimFooterMessage from './ClaimFooterMessage';

const PAGE_STATUS = {
  CONNECTED: 'connected',
  LOADING: 'loading',
  DISCONNECTED: 'disconected',
};

const CONTRACT_ADDRESS = process.env.REACT_APP_MINT_DELEGATE_CONTRACT;
const TX_RETRY_LIMIT = 100; // ~5m

/*
 * @dev: Component to show user that transactions is being mined
 * */
const ClaimDelegated: React.FC<{
  claim: HashClaim;
  verifyClaim: () => void;
  initialStep: boolean;
}> = ({ claim, verifyClaim, initialStep }) => {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [disclaimerShowed, setDisclaimerShowed] = useState<boolean>(false);
  const [web3, setWeb3] = useState<any>(null);
  const [connectStatus, setConnectStatus] = useState<string>(
    !initialStep ? PAGE_STATUS.LOADING : PAGE_STATUS.DISCONNECTED,
  );
  const [txHash, setTxHash] = useState<string>('');
  const [txRetry, setTxRetry] = useState<number>(0);
  const [txReceipt, setTxReceipt] = useState<null | TransactionReceipt>(null);

  const { addToast } = useToasts();

  useEffect(() => {
    if (initialStep) {
      let localTxs = localStorage.getItem('claims');
      if (localTxs) {
        let claims = JSON.parse(localTxs);
        if (claim.qr_hash in claims) {
          setTxHash(claims[claim.qr_hash]);
        }
        const _web3 = new Web3(process.env.REACT_APP_INFURA_PROVIDER || '');
        setWeb3(_web3);
      }
    } else {
      claimPoap();
    }
  }, []); /* eslint-disable-line react-hooks/exhaustive-deps */

  useEffect(() => {
    if (txHash && web3) {
      const interval = setInterval(() => {
        verifyClaim();
        getReceipt();
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [txHash, web3, txReceipt, txRetry]); /* eslint-disable-line react-hooks/exhaustive-deps */

  const claimPoap = async () => {
    if (!disclaimerShowed) {
      setIsModalOpen(true);
      setDisclaimerShowed(true);
      return;
    }

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
      setWeb3(response.web3);
    }

    const accounts = await _web3.eth.getAccounts();
    if (accounts.length === 0) return null;
    const account = accounts[0];

    setConnectStatus(PAGE_STATUS.LOADING);

    try {
      const contract = new _web3.eth.Contract(abi, CONTRACT_ADDRESS);
      let gas = 1000000;
      try {
        gas = await contract.methods
          .mintToken(claim.event_id, claim.beneficiary, claim.delegated_signed_message)
          .estimateGas({ from: account });
        gas = Math.floor(gas * 1.3);
      } catch (e) {
        console.log('Error calculating gas');
      }

      contract.methods
        .mintToken(claim.event_id, claim.beneficiary, claim.delegated_signed_message)
        .send({ from: account, gas: gas }, (err: any, hash: string | null) => {
          if (err) {
            console.log('Error on Mint Token: ', err);
            setConnectStatus(PAGE_STATUS.CONNECTED);
          }
          if (hash) {
            setTxHash(hash);

            // Save to local storage
            let localTxs = localStorage.getItem('claims');
            let claims = localTxs ? JSON.parse(localTxs) : {};
            claims = { ...claims, [claim.qr_hash]: hash };
            localStorage.setItem('claims', JSON.stringify(claims));
          }
        });
    } catch (e) {
      setConnectStatus(PAGE_STATUS.CONNECTED);
    }
  };

  const getReceipt = async () => {
    let receipt: null | TransactionReceipt = null;
    if (web3 && txHash !== '' && !txReceipt) {
      receipt = await web3.eth.getTransactionReceipt(txHash);
      if (receipt) {
        setTimeout(() => setTxReceipt(receipt), 3000);
      }
    }

    if (!receipt || !receipt.status || (txReceipt && !txReceipt.status)) {
      setTxRetry(txRetry + 1);
    }
  };

  const cleanState = () => {
    localStorage.clear();
    setTxHash('');
    setTxReceipt(null);
  };

  const continueClaim = () => {
    setIsModalOpen(false);
    claimPoap();
  };

  const fadeEffect = initialStep ? 'fade-up' : '';

  let beneficiary = claim.beneficiary;
  if (claim.user_input && claim.user_input.toLowerCase() !== claim.beneficiary.toLowerCase()) {
    beneficiary = `${claim.user_input} (${reduceAddress(claim.beneficiary)})`;
  }

  return (
    <div className={'container claim-info claim-delegated'} data-aos={fadeEffect} data-aos-delay="300">
      <form className={'claim-form'}>
        <input type={'text'} disabled={true} value={beneficiary} />

        <div className={'web3-browser'}>
          This POAP hasn’t been claimed. <a href={'mailto:hello@poap.xyz'}>Need help?</a>
        </div>
      </form>

      {connectStatus !== PAGE_STATUS.LOADING && !txHash && (
        <Button text={'Claim POAP token'} action={claimPoap} extraClass={'link-btn'} />
      )}

      {connectStatus === PAGE_STATUS.LOADING && !txHash && (
        <Button text={''} action={() => {}} extraClass={'loading'} />
      )}

      {txHash && <TxDetail hash={txHash} receipt={txReceipt} />}

      {txHash && txRetry > TX_RETRY_LIMIT && (!txReceipt || (txReceipt && txReceipt.status)) && (
        <>
          <div className={'text-info'}>
            <p>We can't verify your transaction. If you cancel it, please try again</p>
          </div>
          <Button text={'Try again'} action={cleanState} extraClass={'link-btn'} />
        </>
      )}

      {txReceipt && txReceipt.status && (
        <>
          <div className={'text-info'}>
            <p>Your transaction was mined but we can't verify that the POAP is in your wallet</p>
            <p>Please, click below to refresh and try again</p>
          </div>
          <Button text={'Try again'} action={cleanState} extraClass={'link-btn'} />
        </>
      )}

      {txReceipt && !txReceipt.status && (
        <>
          <div className={'text-info'}>
            <p>It seems that your transaction failed. Want to try again?</p>
          </div>
          <Button text={'Retry'} action={cleanState} extraClass={'link-btn'} />
        </>
      )}

      <ClaimFooterMessage />
      <ReactModal isOpen={isModalOpen} shouldFocusAfterRender={true}>
        <div className="admin-list-modal">
          <div className="claim-modal-text-container">
            <p>The current surge in gas prices makes a POAP minting have a cost of between $2 and $6 in mining fees.</p>
            <p>We are working hard on a scaling solution that should be ready in 6-8 weeks. </p>
            <p>
              The POAP is already reserved for the address submitted to be minted for free once our new deployment is
              ready. You can continue the process at your expense or just close this page.
            </p>
            <p>
              For learning more about what our plans are visit our{' '}
              <a href="http://poap.xyz/discord" target="_blank" rel="noopener noreferrer">
                discord
              </a>
              .
            </p>
          </div>
          <div className="claim-modal-cancel-container">
            <div onClick={continueClaim} className={'close-modal'}>
              Continue
            </div>
          </div>
        </div>
      </ReactModal>
    </div>
  );
};

export default ClaimDelegated;
