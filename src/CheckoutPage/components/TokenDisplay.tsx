import React from 'react';

/* Assets */
import EmptyBadge from '../../images/empty-badge.svg';

/* Types */
type TokenDisplayProps = {
  image: string | null;
  title: string;
};

const TokenDisplay: React.FC<TokenDisplayProps> = ({ title, image }) => {
  return (
    <div className={'checkout-header'}>
      <div className={'image-wrapper'}>
        {image ? (
          <img src={image} alt={title} className={'logo'} />
        ) : (
          <img src={EmptyBadge} alt="POAP" className={'empty'} />
        )}
      </div>
      {title && (
        <div className={'title'}>{title}</div>
      )}
    </div>
  );
};

export default TokenDisplay;
