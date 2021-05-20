import React, { FC } from 'react';

/* Assets */
import checked from '../../images/checked.svg';
import error from '../../images/error.svg';

/* Types */
import { PoapEvent, DeliveryAddress } from '../../api';

type AddressesListProps = {
  events: PoapEvent[];
  addresses: DeliveryAddress[];
};

const AddressesList: FC<AddressesListProps> = (props) => {
  const { events, addresses } = props;

  return (
    <div className={'delivery-address-list'}>
      <div className={'row delivery-address-list-title'}>
        <div className={'col-xs-8'}>Address</div>
        <div className={'col-xs-2'}>POAPs</div>
        <div className={'col-xs-2 center'}>Claimed</div>
      </div>
      {addresses.map((each, i) => {
        let _events: (PoapEvent | undefined)[] = each.event_ids.split(',').map((e) => {
          const id = parseInt(e, 10);
          return events.find((ev) => ev.id === id);
        });
        return (
          <div key={each.address} className={`row delivery-address-list-row ${i % 2 === 0 ? 'even' : 'odd'}`}>
            <div className={'col-xs-8'}>
              <a href={`/scan/${each.address}`} rel="noopener noreferrer" target="_blank">
                {each.address}
              </a>
            </div>
            <div className={'col-xs-2'}>
              {_events.map((ev, i) => (
                <img key={i} src={ev?.image_url} alt={ev?.name} className={'poap-badge'} />
              ))}
            </div>
            <div className={'col-xs-2 center'}>
              <img
                src={each.claimed ? checked : error}
                alt={each.claimed ? 'Claimed' : 'Pending'}
                className={'status-icon'}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default AddressesList;
