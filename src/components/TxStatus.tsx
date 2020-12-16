import React, { FC } from 'react';

/* Helpers */
import { TX_STATUS } from '../lib/constants';

/* Assets */
import bump from '../images/increase.svg';
import checked from '../images/checked.svg';
import error from '../images/error.svg';
import clock from '../images/clock.svg';


const TxStatus: FC<{status: string}> = ({status}) => {

  const txStatus = {
    [TX_STATUS.pending]: clock,
    [TX_STATUS.failed]: error,
    [TX_STATUS.passed]: checked,
    [TX_STATUS.bumped]: bump,
  };

  return (
    <img src={txStatus[status]} className={'status-icon'} alt={status} title={status} />
  );
};

export { TxStatus };
