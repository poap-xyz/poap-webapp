import React, { FC } from 'react';

/* Hooks */
import useQueuePolling from '../lib/hooks/useQueuePolling';
import useTransactionPolling from '../lib/hooks/useTransactionPolling';

/* Components */
import { TxDetail } from './TxDetail';
import { Loading } from './Loading';

/* Constants */
import { LAYERS } from '../lib/constants';
import { Link } from 'react-router-dom';

/* Types */
type TransactionProps = {
  queueId: string;
  layer: string;
  address?: string;
};

const Transaction: FC<TransactionProps> = ({ queueId, layer, address }) => {
  const [transactionHash, failedRequest] = useQueuePolling(queueId);
  const [receipt] = useTransactionPolling(typeof transactionHash === 'boolean' ? '' : transactionHash, layer);

  if (failedRequest) {
    return (
      <div className={'tx-message'}>
        <p className="bk-msg-error">An error occurred!</p>
        <p className="bk-msg-error">We couldn't process your request, please try again</p>
      </div>
    );
  }

  if (!transactionHash) {
    return (
      <div className={'tx-message'}>
        <Loading />
        Processing your request
      </div>
    );
  }

  return (
    <>
      {typeof transactionHash === 'string' && typeof receipt !== 'boolean' && (
        <TxDetail hash={transactionHash} receipt={receipt} layer1={layer === LAYERS.layer1} />
      )}
      {receipt && typeof receipt !== 'boolean' && receipt.status && address && (
        <div className="redeem-success">
          <h6>Success!</h6>
          <div>
            Check your POAPs <Link to={`/scan/${address}`}>here</Link>
          </div>
        </div>
      )}
    </>
  );
};

export default Transaction;
