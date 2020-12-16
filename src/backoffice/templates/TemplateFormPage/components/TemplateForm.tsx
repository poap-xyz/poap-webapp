import React, { FC, useEffect, useMemo, useState } from 'react';
import { Tooltip } from 'react-lightweight-tooltip';
import { Formik, Form, FormikActions } from 'formik';
import ReactModal from 'react-modal';
import { useHistory } from 'react-router-dom';
import { useToasts } from 'react-toast-notifications';
import { FiCheckSquare, FiSquare } from 'react-icons/fi';

// lib
import { generateSecretCode } from 'lib/helpers';

// components
import { ImageContainer } from 'backoffice/EventsPage';
import { ColorPicker } from './ColorPicker';
import { SubmitButton } from 'components/SubmitButton';
import { EventField } from 'backoffice/EventsPage';

// assets
import infoButton from 'images/info-button.svg';
import { ReactComponent as CloseIcon } from 'images/x.svg';

// api
import { Template, TemplatePageFormValues, createTemplate, updateTemplate, getTemplateById } from 'api';

// helpers
import { COLORS, ROUTES } from 'lib/constants';
import { templateFormSchema } from 'lib/schemas';
import { TemplatePreview } from 'CodeClaimPage/templateClaim/TemplatePreview';

type SetFieldValue = FormikActions<TemplatePageFormValues>['setFieldValue'];

type Props = {
  id?: number;
};

export const TemplateForm: FC<Props> = ({ id }) => {
  const [templateId, setTemplateId] = useState<number | undefined>(id);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState<boolean>(false);
  const [template, setTemplate] = useState<Template | null>(null);
  const [includeEmail, setIncludeEmail] = useState<boolean>(true);

  // libs
  const history = useHistory();
  const { addToast } = useToasts();

  // hooks
  useEffect(() => {
    if (!template && templateId) {
      getTemplateById(templateId).then(setTemplate);
    }
  }, [templateId, template]);

  // handlers
  const onSubmit = (values: TemplatePageFormValues, formikActions: FormikActions<TemplatePageFormValues>) => {
    const formData = new FormData();

    Object.entries(values).forEach(([key, value]: [string, string | Blob]) => {
      if (templateId) {
        if (
          (key.includes('image_url') || key.includes('footer_icon') || key.includes('title_image')) &&
          typeof value === 'string'
        ) {
          return;
        }
        formData.append(key, typeof value === 'number' ? String(value) : value);
      } else {
        formData.append(key, typeof value === 'number' ? String(value) : value);
      }
    });

    if (!templateId) {
      if (includeEmail && !values['email']) {
        formikActions.setErrors({ email: 'An email is required' });
        formikActions.setSubmitting(false);
        return;
      }
    }

    templateId
      ? updateTemplate(formData, templateId)
          .then(() => {
            getTemplateById(templateId).then((template) => {
              setTemplate(template);
              openPreviewModal();
            });
          })
          .catch((error: Error) => {
            addToast(error.message, {
              appearance: 'error',
              autoDismiss: true,
            });
          })
          .finally(() => {
            formikActions.setSubmitting(false);
          })
      : createTemplate(formData)
          .then((template) => {
            if (template) {
              setTemplateId(template.id);
              setTemplate(template);
              openPreviewModal();
            }
          })
          .catch((error: Error) => {
            addToast(error.message, {
              appearance: 'error',
              autoDismiss: true,
            });
          })
          .finally(() => {
            formikActions.setSubmitting(false);
          });
  };

  // handlers
  const openPreviewModal = () => setIsPreviewModalOpen(true);
  const handleClosePreviewClick = () => setIsPreviewModalOpen(false);
  const handleGoBack = () => history.push(ROUTES.template.path);

  const toggleCheckbox = () => setIncludeEmail(!includeEmail);

  // constants
  const initialValues = useMemo(() => {
    if (template) {
      const values = {
        ...template,
        secret_code: template.secret_code ? template.secret_code.toString().padStart(6, '0') : '',
        email: '',
      };

      return values;
    } else {
      const values: TemplatePageFormValues = {
        name: '',
        title_image: '',
        title_link: '',
        header_link_text: '',
        header_link_url: '',
        header_color: '',
        header_link_color: '',
        main_color: '',
        footer_color: '',
        left_image_url: '',
        left_image_link: '',
        right_image_url: '',
        right_image_link: '',
        mobile_image_url: '',
        mobile_image_link: '',
        footer_icon: '',
        secret_code: generateSecretCode(),
        email: '',
      };

      return values;
    }
  }, [template]); /* eslint-disable-line react-hooks/exhaustive-deps */
  const CheckboxIcon = includeEmail ? FiCheckSquare : FiSquare;

  const warning = (
    <div className={'backoffice-tooltip'}>
      {templateId ? (
        <span>
          Be sure to save the 6 digit <b>Edit Code</b> to make any further updateTemplates
        </span>
      ) : (
        <span>
          Be sure to complete the 6 digit <b>Edit Code</b> that was originally used
        </span>
      )}
    </div>
  );

  const editLabel = ({
    label,
    tooltipText,
    bold = false,
    optional = false,
  }: {
    label: string;
    tooltipText: string | React.ReactNode;
    bold?: boolean;
    optional?: boolean;
  }) => {
    const _optional = optional ? <i>Optional</i> : '';
    let _label = (
      <div className="info-label">
        {label} {_optional}
      </div>
    );
    if (bold)
      _label = (
        <b className="info-label">
          {label} {_optional}
        </b>
      );
    return (
      <div className="info-label-container">
        {_label}
        <Tooltip
          content={tooltipText}
          styles={{ content: {}, tooltip: { zIndex: 100 }, arrow: {}, wrapper: {}, gap: {} }}
        >
          <img alt="Informative icon" src={infoButton} className={'info-button'} />
        </Tooltip>
      </div>
    );
  };

  const titleSpecs = (
    <div>
      <div>Header image, top left position</div>
      <div>&bull; Mandatory: PNG format</div>
      <div>&bull; Recommended: up to 300px width, 60px height</div>
    </div>
  );

  const sideSpecs = (
    <div>
      <div>Side image</div>
      <div>&bull; Mandatory: PNG format</div>
      <div>&bull; Recommended: 240x400px</div>
    </div>
  );

  const mobileSpecs = (
    <div>
      <div>Side image</div>
      <div>&bull; Mandatory: PNG format</div>
      <div>&bull; Recommended: 320x100px</div>
    </div>
  );

  const footerSpecs = (
    <div>
      <div>Footer image, bottom left position</div>
      <div>&bull; Mandatory: PNG format</div>
      <div>&bull; Recommended: 75x75px</div>
    </div>
  );

  if (id && !template) return <div />;

  return (
    <div className={'bk-container'}>
      <Formik
        enableReinitialize
        initialValues={initialValues}
        validateOnBlur={false}
        validateOnChange={false}
        validationSchema={templateFormSchema}
        onSubmit={onSubmit}
      >
        {({ values, errors, isSubmitting, setFieldValue }) => {
          const handleFileChange = (
            event: React.ChangeEvent<HTMLInputElement>,
            setFieldValue: SetFieldValue,
            name: string,
          ) => {
            event.preventDefault();
            const { files } = event.target;

            if (!files || !files.length) return;

            const firstFile = files[0];
            setFieldValue(name, firstFile);
          };

          return (
            <Form className="template-form">
              <h2>{`${templateId ? 'Update' : 'Create'}`} Template</h2>
              <EventField title="Name of the template" name="name" />
              <div className="bk-group">
                <ColorPicker title="Header's color" name="header_color" setFieldValue={setFieldValue} values={values} />
                <ColorPicker
                  title={
                    <>
                      Header's link color <i>Optional</i>
                    </>
                  }
                  name="header_link_color"
                  setFieldValue={setFieldValue}
                  values={values}
                />
              </div>
              <div className="bk-group">
                <ColorPicker title="Main color" name="main_color" setFieldValue={setFieldValue} values={values} />
                <ColorPicker title="Footer's color" name="footer_color" setFieldValue={setFieldValue} values={values} />
              </div>
              <div className="bk-group">
                <div
                  className={values?.title_image && typeof values?.title_image === 'string' ? 'input-with-image' : ''}
                >
                  <ImageContainer
                    name="title_image"
                    text="Title's image"
                    customLabel={editLabel({ label: "Title's image", tooltipText: titleSpecs })}
                    handleFileChange={handleFileChange}
                    setFieldValue={setFieldValue}
                    errors={errors}
                    shouldShowInfo={false}
                  />
                  {values?.title_image && typeof values?.title_image === 'string' && (
                    <div className={'template-image-preview'}>
                      <div>
                        <img alt={values.title_image} src={values.title_image} />
                      </div>
                    </div>
                  )}
                </div>
                <EventField title="Title's image redirect link" name="title_link" />
              </div>
              <div className="bk-group">
                <EventField
                  title={
                    <>
                      Header's text <i>Optional</i>
                    </>
                  }
                  name="header_link_text"
                />
                <EventField
                  title={
                    <>
                      Header's text redirect link <i>Optional</i>
                    </>
                  }
                  name="header_link_url"
                />
              </div>
              <div className="bk-group">
                <div
                  className={
                    values?.left_image_url && typeof values?.left_image_url === 'string' ? 'input-with-image' : ''
                  }
                >
                  <ImageContainer
                    name="left_image_url"
                    text="Left image"
                    customLabel={editLabel({
                      label: 'Left image',
                      tooltipText: sideSpecs,
                      optional: true,
                    })}
                    handleFileChange={handleFileChange}
                    setFieldValue={setFieldValue}
                    errors={errors}
                    shouldShowInfo={false}
                  />
                  {values?.left_image_url && typeof values?.left_image_url === 'string' && (
                    <div className={'template-image-preview'}>
                      <div>
                        <img
                          alt={values.left_image_url}
                          src={values.left_image_url}
                          className={'template-image-preview'}
                        />
                      </div>
                    </div>
                  )}
                </div>
                <EventField
                  title={
                    <>
                      Left image's redirect link <i>Optional</i>
                    </>
                  }
                  name="left_image_link"
                />
              </div>
              <div className="bk-group">
                <div
                  className={
                    values?.right_image_url && typeof values?.right_image_url === 'string' ? 'input-with-image' : ''
                  }
                >
                  <ImageContainer
                    name="right_image_url"
                    customLabel={editLabel({
                      label: 'Right image',
                      tooltipText: sideSpecs,
                      optional: true,
                    })}
                    text="Right image"
                    handleFileChange={handleFileChange}
                    setFieldValue={setFieldValue}
                    errors={errors}
                    shouldShowInfo={false}
                  />
                  {values?.right_image_url && typeof values?.right_image_url === 'string' && (
                    <div className={'template-image-preview'}>
                      <div>
                        <img
                          alt={values.right_image_url}
                          src={values.right_image_url}
                          className={'template-image-preview'}
                        />
                      </div>
                    </div>
                  )}
                </div>
                <EventField
                  title={
                    <>
                      Right image's redirect link <i>Optional</i>
                    </>
                  }
                  name="right_image_link"
                />
              </div>
              <div className="bk-group">
                <div
                  className={
                    values?.mobile_image_url && typeof values?.mobile_image_url === 'string' ? 'input-with-image' : ''
                  }
                >
                  <ImageContainer
                    name="mobile_image_url"
                    customLabel={editLabel({
                      label: 'Mobile image',
                      tooltipText: mobileSpecs,
                      optional: true,
                    })}
                    text="Mobile image"
                    handleFileChange={handleFileChange}
                    setFieldValue={setFieldValue}
                    errors={errors}
                    shouldShowInfo={false}
                  />
                  {values?.mobile_image_url && typeof values?.mobile_image_url === 'string' && (
                    <div className={'template-image-preview'}>
                      <div>
                        <img
                          alt={values.mobile_image_url}
                          src={values.mobile_image_url}
                          className={'template-image-preview'}
                        />
                      </div>
                    </div>
                  )}
                </div>
                <EventField
                  title={
                    <>
                      Mobile image's redirect link <i>Optional</i>
                    </>
                  }
                  name="mobile_image_link"
                />
              </div>
              <div className="bk-group">
                <div
                  className={values?.footer_icon && typeof values?.footer_icon === 'string' ? 'input-with-image' : ''}
                >
                  <ImageContainer
                    text="Footer's logo"
                    customLabel={editLabel({ label: "Footer's logo", tooltipText: footerSpecs })}
                    name="footer_icon"
                    handleFileChange={handleFileChange}
                    setFieldValue={setFieldValue}
                    errors={errors}
                    shouldShowInfo={false}
                  />
                  {values?.footer_icon && typeof values?.footer_icon === 'string' && (
                    <div className={'template-image-preview'}>
                      <div>
                        <img alt={values.footer_icon} src={values.footer_icon} className={'template-image-preview'} />
                      </div>
                    </div>
                  )}
                </div>
                <div>
                  <EventField
                    title={editLabel({ label: 'Edit Code', tooltipText: warning, bold: true })}
                    name="secret_code"
                  />

                  {!templateId && (
                    <div className={'email-checkbox'}>
                      <div onClick={toggleCheckbox} className={'box-label'}>
                        <CheckboxIcon color={COLORS.primaryColor} /> Receive a backup of the template Edit Code
                      </div>
                      {includeEmail && <EventField disabled={false} title={'Email'} name="email" />}
                    </div>
                  )}
                </div>
              </div>
              <div className="template-buttons-container">
                <div>
                  <SubmitButton canSubmit text="Save & preview" isSubmitting={isSubmitting} />
                </div>
                <div onClick={handleGoBack} className={'close-action'}>
                  Return to templates
                </div>
              </div>
            </Form>
          );
        }}
      </Formik>
      <ReactModal
        className="template"
        isOpen={isPreviewModalOpen}
        onRequestClose={handleClosePreviewClick}
        shouldFocusAfterRender={true}
      >
        <CloseIcon onClick={handleClosePreviewClick} />
        <TemplatePreview template={template} />
      </ReactModal>
    </div>
  );
};
