import React, { FC } from 'react';

// types
import { Template, TemplatePageFormValues } from 'api';

// assets
import EmptyBadge from 'images/empty-badge.svg';

// components
import { TemplateClaimHeader } from './TemplateClaimHeader';
import { TemplateClaimFooter } from './TemplateClaimFooter';
import ClaimForm from '../ClaimForm';

type Props = {
  template: Template | TemplatePageFormValues | null;
};

export const TemplatePreview: FC<Props> = ({ template }) => {
  const image = EmptyBadge;
  const title = 'POAP Claim';

  if (!template) return <div />

  return (
    <div className={'code-claim-page'}>
      <TemplateClaimHeader title={title} image={image} claimed={false} template={template} />
      <div className="claim-body template">
        <ClaimForm template={template} onSubmit={() => false} />
      </div>
      <TemplateClaimFooter template={template} />
    </div>
  );
};
