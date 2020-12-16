import React, { FC } from 'react';
import { TransactionReceipt } from 'web3-core'

/* Helpers */
import { reduceAddress } from '../lib/helpers'
import { blockscoutLinks, etherscanLinks } from '../lib/constants';

/* Assets */
import arrow from '../images/arrow-link.svg'
import close from '../images/close.svg'
import tick from '../images/tick.svg'
import spinner from '../images/etherscan-spinner.svg';

type TxDetailProps = {
  hash: string;
  receipt: null | TransactionReceipt;
  layer1?: boolean;
};

const TxDetail: FC<TxDetailProps> = ({ hash, receipt, layer1 = true }) => {
  let status = (
    <div className={'info-tx info-pending'}>
      <img src={spinner} alt={'Mining'} />
      Pending
    </div>
  );

  if (receipt) {
    if (receipt.status) {
      status = (
        <div className={'info-tx info-success'}>
          <img src={tick} alt={'Success'} />
          Success
        </div>
      )
    } else {
      status = (
        <div className={'info-tx info-error'}>
          <img src={close} alt={'Failed'} />
          Failed
        </div>
      )
    }
  }

  return (
    <div className={'tx-detail'} data-aos="fade-up" data-aos-delay="300">
      <div className={'tx-detail-title'}>Your transaction</div>
      <div className={'tx-detail-box'}>
        <div className={'tx-detail-cell'}>
          <div className={'tx-detail-cell-title'}>Hash</div>
          <a
            href={layer1 ? etherscanLinks.tx(hash) : blockscoutLinks.tx(hash)}
            target={'_blank'}
            rel="noopener noreferrer"
          >
            {reduceAddress(hash)}
            <img src={arrow} alt={'Link'} />
          </a>
        </div>
        <div className={'tx-detail-cell'}>
          <div className={'tx-detail-cell-title'}>Status</div>
          <div>{status}</div>
        </div>
      </div>
    </div>
  );
};

export { TxDetail };
