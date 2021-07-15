import * as yup from 'yup';
import emailRegex from 'email-regex';

import { isValidAddressOrENS } from '../lib/helpers';
import { IMAGE_SUPPORTED_FORMATS } from './constants';

const AddressSchema = yup.object().shape({
  address: yup.string().required(),
});

const RedeemSchema = yup.object().shape({
  address: yup
    .mixed()
    .test({
      test: async (value) => {
        let validAddressOrENS = await isValidAddressOrENS(value);
        return validAddressOrENS;
      },
    })
    .required(),
});

const AddressOrEmailSchema = yup.object().shape({
  address: yup.mixed().test({
    test: async (value) => {
      if (!value) {
        return true;
      }
      let validAddressOrENS = await isValidAddressOrENS(value);
      return validAddressOrENS || emailRegex({ exact: true }).test(value);
    },
  }),
});

const GasPriceSchema = yup.object().shape({
  gasPrice: yup.number().required().positive(),
});

const BurnFormSchema = yup.object().shape({
  tokenId: yup.number().required().positive().integer(),
});

const fileSchema = yup
  .mixed()
  .test('fileFormat', 'Unsupported format, please upload a png file', (value) =>
    IMAGE_SUPPORTED_FORMATS.includes(value.type),
  );

export const templateFormSchema = yup.object().shape({
  name: yup.string().required('This field is required'),
  title_image: yup.mixed().test({
    test: (value) => {
      if (typeof value === 'object') return IMAGE_SUPPORTED_FORMATS.includes(value.type);
      if (typeof value === 'string') return yup.string().isValidSync(value);

      return false;
    },
    message: 'Must be a PNG image',
  }),
  title_link: yup.string().required('This field is required').url('Must be valid URL'),
  header_link_text: yup.string(),
  header_link_url: yup.string().url('Must be valid URL'),
  header_color: yup
    .string()
    .required('This field is required')
    .matches(/^#[0-9A-Fa-f]{6}$/, 'Not a valid Hex color'),
  header_link_color: yup.string().matches(/^#[0-9A-Fa-f]{6}$/, 'Not a valid Hex color'),
  main_color: yup
    .string()
    .required('This field is required')
    .matches(/^#[0-9A-Fa-f]{6}$/, 'Not a valid Hex color'),
  footer_color: yup
    .string()
    .required('This field is required')
    .matches(/^#[0-9A-Fa-f]{6}$/, 'Not a valid Hex color'),
  left_image_url: yup.mixed().test({
    test: (value) => {
      if (typeof value === 'object') return IMAGE_SUPPORTED_FORMATS.includes(value.type);
      if (typeof value === 'string') return yup.string().isValidSync(value);

      return true;
    },
    message: 'Must be a PNG image',
  }),
  left_image_link: yup.string().url('Must be valid URL'),
  right_image_url: yup.mixed().test({
    test: (value) => {
      if (typeof value === 'object') return IMAGE_SUPPORTED_FORMATS.includes(value.type);
      if (typeof value === 'string') return yup.string().isValidSync(value);

      return true;
    },
    message: 'Must be a PNG image',
  }),
  right_image_link: yup.string().url('Must be valid URL'),
  mobile_image_url: yup.mixed().test({
    test: (value) => {
      if (typeof value === 'object') return IMAGE_SUPPORTED_FORMATS.includes(value.type);
      if (typeof value === 'string') return yup.string().isValidSync(value);

      return true;
    },
    message: 'Must be a PNG image',
  }),
  mobile_image_link: yup.string().url('Must be valid URL'),
  footer_icon: yup.mixed().test({
    test: (value) => {
      if (typeof value === 'object') return IMAGE_SUPPORTED_FORMATS.includes(value.type);
      if (typeof value === 'string') return yup.string().isValidSync(value);

      return false;
    },
    message: 'Must be a PNG image',
  }),
  secret_code: yup
    .string()
    .required('The secret code is required')
    .matches(/^[0-9]{6}$/, 'Must be exactly 6 digits'),
  email: yup.string().email('An email is required'),
});

const PoapEventSchema = yup.object().shape({
  name: yup
    .string()
    .required('A unique name is required')
    .max(150, 'The event name should be less than 150 characters'),
  year: yup
    .number()
    .required()
    .min(1990)
    .max(new Date().getFullYear() + 1),
  id: yup.number(),
  description: yup.string().required('The description is required'),
  start_date: yup.string().required('The start date is required'),
  end_date: yup.string().required('The end date is required'),
  expiry_date: yup.string().required('The expiry date is required'),
  city: yup.string(),
  country: yup.string(),
  event_url: yup.string().url(),
  image: yup.mixed().when('isFile', {
    is: (value) => value,
    then: fileSchema,
    otherwise: yup.string(),
  }),
  secret_code: yup
    .string()
    .required('The secret code is required')
    .matches(/^[0-9]{6}$/, 'Must be exactly 6 digits'),
  email: yup.string().email('An email is required'),
  requested_codes: yup
  .number()
  .required('Amount of codes is required')
  .min(1, 'The minimum amount of codes is 1'),
});

const PoapEventSchemaEdit = yup.object().shape({
  name: yup
    .string()
    .required('A unique name is required')
    .max(150, 'The event name should be less than 150 characters'),
  year: yup
    .number()
    .required()
    .min(1990)
    .max(new Date().getFullYear() + 1),
  id: yup.number(),
  description: yup.string(),
  start_date: yup.string().required('The start date is required'),
  end_date: yup.string().required('The end date is required'),
  city: yup.string(),
  country: yup.string(),
  event_url: yup.string().url(),
  image: yup.mixed().when('isFile', {
    is: (value) => value,
    then: fileSchema,
    otherwise: yup.string(),
  }),
  secret_code: yup
    .string()
    .required('The secret code is required')
    .matches(/^[0-9]{6}$/, 'Must be exactly 6 digits'),
  email: yup.string().email('An email is required'),
});

const PoapQrRequestSchema = yup.object().shape({
  secret_code: yup
    .string()
    .required('The secret code is required')
    .matches(/^[0-9]{6}$/, 'Must be exactly 6 digits'),
  requested_codes: yup
  .number()
  .required('Amount of codes is required')
  .min(1, 'The minimum amount of codes is 1'),
});

const IssueForEventFormValueSchema = yup.object().shape({
  eventId: yup.number().required().min(1),
  addressList: yup.string().required(),
  signer: yup
    .string()
    .required()
    .matches(/^0x[0-9a-fA-F]{40}$/, 'Not a valid address'),
});

const IssueForUserFormValueSchema = yup.object().shape({
  address: yup.string().required(),
  signer: yup
    .string()
    .required()
    .matches(/^0x[0-9a-fA-F]{40}$/, 'Not a valid address'),
});

const ClaimHashSchema = yup.object().shape({
  hash: yup.string().required().length(6),
});

const InboxFormSchema = yup.object().shape({
  title: yup.string().required(),
  description: yup.string().required(),
  recipientFilter: yup.string().required(),
  notificationType: yup.string().required(),
  selectedEvent: yup.number().nullable(),
});

const UpdateModalWithFormikRangeSchema = yup.object().shape({
  from: yup.number().positive().required(),
  to: yup.number().positive().required(),
});

const UpdateModalWithFormikListSchema = yup.object().shape({
  hashesList: yup.string().required(),
  event: yup
    .string()
    .matches(/^[0-9]{1,}$/)
    .required(),
});

const UpdateModalWithFormikSelectedQrsSchema = yup.object().shape({});

const CheckoutSchema = yup.object().shape({
  event_id: yup.number().required(),
  fancy_id: yup
    .string()
    .required('A unique name is required')
    .matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Must be URL friendly. No spaces, only ASCII')
    .max(150, 'The event name should be less than 150 characters'),
  max_limit: yup.number().required().min(0),
  timezone: yup.number().required(),
  start_date: yup.string().required('The start date is required'),
  start_time: yup.string().required('The start date is required'),
  end_date: yup.string().required('The end date is required'),
  end_time: yup.string().required('The end date is required'),
});

const DeliverySchema = yup.object().shape({
  slug: yup
    .string()
    .required('A unique name is required')
    .matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Must be URL friendly. No spaces, only ASCII')
    .max(100, 'The event name should be less than 100 characters'),
  card_title: yup.string().required('Card title is required'),
  card_text: yup.string().required('Card text is required'),
  page_title: yup.string().required('Page title is required'),
  page_text: yup.string().required('Page text is required'),
  metadata_title: yup.string().required('Metadata title text is required'),
  metadata_description: yup.string().required('Metadata description is required'),
  image: yup.string().required('An image URL is required'),
  page_title_image: yup.string(),
  event_ids: yup.string().required('Event IDs comma separated'),
});

const WebsiteSchema = yup.object().shape({
  claimName: yup
    .string()
    .required('A unique name is required')
    .matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Must be URL friendly. No spaces, only ASCII')
    .max(100, 'The event name should be less than 100 characters'),
  from: yup.string(),
  to: yup.string(),
  captcha: yup.boolean(),
  active: yup.boolean(),
});

export {
  AddressSchema,
  GasPriceSchema,
  BurnFormSchema,
  PoapEventSchema,
  PoapEventSchemaEdit,
  ClaimHashSchema,
  RedeemSchema,
  AddressOrEmailSchema,
  IssueForEventFormValueSchema,
  IssueForUserFormValueSchema,
  InboxFormSchema,
  UpdateModalWithFormikRangeSchema,
  UpdateModalWithFormikSelectedQrsSchema,
  UpdateModalWithFormikListSchema,
  CheckoutSchema,
  DeliverySchema,
  WebsiteSchema,
  PoapQrRequestSchema
};
