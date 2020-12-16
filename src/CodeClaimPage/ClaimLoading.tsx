import React from 'react';

/* Assets */
import LoadingSpinner from '../images/loading.svg';

const ClaimLoading: React.FC = () => {
  return (
    <div className={'claim-info'}>
      <div className={'claim-preloader'}>
        <img src={LoadingSpinner} alt={'Loading'} />
      </div>
      <div className={'text-info'}>Please wait a moment</div>
    </div>
  );
};

export default ClaimLoading;
