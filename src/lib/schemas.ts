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
  address: yup
    .mixed()
    .test({
      test: async (value) => {
        let validAddressOrENS = await isValidAddressOrENS(value);
        if (emailRegex({ exact: true }).test(value) || validAddressOrENS) {
          return true;
        }
        return false;
      },
    })
    .required(),
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
  name: yup.string().required('A unique name is required'),
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

const IssueForEventFormValueSchema = yup.object().shape({
  eventId: yup.number().required().min(1),
  addressList: yup.string().required(),
  signer: yup
    .string()
    .required()
    .matches(/^0x[0-9a-fA-F]{40}$/, 'Not a valid address'),
});

const IssueForUserFormValueSchema = yup.object().shape({
  eventIds: yup.array().of(yup.number().min(1)).required().min(1),
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

export {
  AddressSchema,
  GasPriceSchema,
  BurnFormSchema,
  PoapEventSchema,
  ClaimHashSchema,
  RedeemSchema,
  AddressOrEmailSchema,
  IssueForEventFormValueSchema,
  IssueForUserFormValueSchema,
  InboxFormSchema,
  UpdateModalWithFormikRangeSchema,
  UpdateModalWithFormikSelectedQrsSchema,
  UpdateModalWithFormikListSchema,
};
