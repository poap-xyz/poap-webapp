import React, { FC, useEffect, useState } from 'react';

/* Assets */
import checked from '../../images/checked.svg';
import error from '../../images/error.svg';

/* Types */
import { deleteClaimUrl, getWebsiteClaimUrls, WebsiteClaimUrl } from '../../api';
import { ErrorMessage, Field, FieldProps, Form, Formik, FormikActions } from 'formik';
import classNames from 'classnames';
import { SubmitButton } from '../../components/SubmitButton';
import ReactModal from 'react-modal';
import edit from '../../images/edit.svg';
import { useToasts } from 'react-toast-notifications';
import { Loading } from '../../components/Loading';

type WebsiteClaimListProps = {
  claimName: string;
};

type DeleteClaimUrlFormValues = {
  claimUrl: string;
};

const WebsitesClaimUrlList: FC<WebsiteClaimListProps> = (props) => {
  const claimNameParam = props.claimName;
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [selectedClaimUrl, setSelectedClaimUrl] = useState<null | WebsiteClaimUrl>(null);
  const [websiteClaims, setWebsiteClaims] = useState<WebsiteClaimUrl[] | null>(null);

  /* Effects */
  useEffect(() => {
    fetchWebsiteClaimUrls();
  }, []); /* eslint-disable-line react-hooks/exhaustive-deps */

  /* Libraries */
  const { addToast } = useToasts();

  const fetchWebsiteClaimUrls = async () => {
    try {
      setWebsiteClaims(null);
      const _claimUrls = await getWebsiteClaimUrls(claimNameParam);
      setWebsiteClaims(_claimUrls);
    } catch (e) {
      addToast('Error while fetching Claim Urls', {
        appearance: 'error',
        autoDismiss: false,
      });
    }
  };

  const openEditModal = (claimUrl: WebsiteClaimUrl) => {
    setModalOpen(true);
    setSelectedClaimUrl(claimUrl);
  };

  const closeEditModal = () => {
    setModalOpen(false);
    setSelectedClaimUrl(null);
  };

  const handleSubmitDelete = async (values: DeleteClaimUrlFormValues, actions: FormikActions<DeleteClaimUrlFormValues>) => {
    if (!selectedClaimUrl) return;

    try {
      actions.setStatus(null);
      actions.setSubmitting(true);
      await deleteClaimUrl(values.claimUrl);
      closeEditModal();
      await fetchWebsiteClaimUrls();
    } catch (error) {
      actions.setStatus({ ok: false, msg: `Claim url could not be deleted.` });
    } finally {
      actions.setSubmitting(false);
    }
  };

  if (!websiteClaims) {
    return (
      <div className={'website-claimurl-list'}>
        <div className={'row website-claimurl-list-title'}>
          <Loading />
        </div>
      </div>
    );
  }

  return (
    <div className={'website-claimurl-list'}>
    <div className={'row website-claimurl-list-title'}>
      <div className={'col-xs-4'}>Claim URL</div>
      <div className={'col-xs-2'}>Created</div>
      <div className={'col-xs-2'}>IP</div>
      <div className={'col-xs-2'}>Claimed Time</div>
      <div className={'col-xs-1 center'}>Claimed</div>
      <div className={'col-xs-1 center'}>Remove</div>
    </div>
  {websiteClaims.map((websiteClaim, i) => {
    return (
      <div key={websiteClaim.claimUrl} className={`row website-claimurl-list-row  ${i % 2 === 0 ? 'even' : 'odd'}`}>
        <div className={'col-xs-4'}>
      <a href={`${websiteClaim.claimUrl}`} rel="noopener noreferrer" target="_blank">
        {websiteClaim.claimUrl}
      </a>
      </div>
      <div className={'col-xs-2'}>
        {websiteClaim.time}
      </div>
      <div className={'col-xs-2'}>
        {websiteClaim.ip}
      </div>
      <div className={'col-xs-2'}>
        {websiteClaim.claimedTime || "Not claimed"}
      </div>
      <div className={'col-xs-1 center'}>
        <img
          src={websiteClaim.claimed ? checked : error}
          alt={websiteClaim.claimed ? 'Claimed' : 'Pending'}
          className={'status-icon'}
        />
      </div>
      {!websiteClaim.claimed  &&
      <div className={'col-md-1 center status'}>
        <img src={edit} alt={'Edit'} className={'edit-icon'} onClick={() => openEditModal(websiteClaim)} />
      </div>
      }
        <ReactModal isOpen={modalOpen} shouldFocusAfterRender={true}>
          <div>
            <h3>Delete Claim Url</h3>
            {selectedClaimUrl && (
              <Formik
                enableReinitialize
                onSubmit={handleSubmitDelete}
                initialValues={{claimUrl: selectedClaimUrl.claimUrl}}>
                {({ dirty, isValid, isSubmitting, status, touched }) => {
                  return (
                    <Form className="claimurl-delete-modal-form">
                      <Field
                        name="claimUrl"
                        render={({ field, form }: FieldProps) => {
                          return (
                            <input
                              type="text"
                              autoComplete="off"
                              className={classNames(!!form.errors[field.name] && 'error')}
                              placeholder={'Claim Url'}
                              readOnly={true}
                              {...field}
                            />
                          );
                        }}
                      />
                      <ErrorMessage name="claimUrl" component="p" className="bk-error" />
                      {status && <p className={status.ok ? 'bk-msg-ok' : 'bk-msg-error'}>{status.msg}</p>}
                      <SubmitButton text="Delete" isSubmitting={isSubmitting} canSubmit={true} />
                      <div onClick={closeEditModal} className={'close-modal'}>
                        Cancel
                      </div>
                    </Form>
                  );
                }}
              </Formik>
            )}
          </div>
        </ReactModal>
    </div>
  );
  })}
  </div>
);
};

export default WebsitesClaimUrlList;
