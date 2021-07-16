import queryString from 'query-string';

import { authClient } from './auth';

export type Address = string;
export type Params = {
  [key: string]: string | number | boolean | undefined;
};
export interface TemplatesResponse<Result> {
  total: number;
  next?: string;
  previous?: string;
  event_templates: Result[];
}
export interface TokenInfo {
  tokenId: string;
  owner: string;
  event: PoapEvent;
  ownerText?: string;
  layer: string;
  ens?: any;
}

export type QrCodesListAssignResponse = {
  success: boolean;
  alreadyclaimedQrs: string[];
};
export interface PoapEvent {
  id: number;
  fancy_id: string;
  signer: Address;
  signer_ip: string;
  name: string;
  description: string;
  city: string;
  country: string;
  event_url: string;
  event_template_id: number;
  from_admin: boolean;
  image_url: string;
  year: number;
  start_date: string;
  end_date: string;
  expiry_date: string;
  virtual_event: boolean;
  email?: string;
}
export interface QrRequest {
  event: PoapEvent;
  accepted_codes: number;
  created_date: string;
  event_id: number;
  id: number;
  requested_codes: number;
  reviewed: boolean;
  reviewed_by: string;
  reviewed_date: string;
}

export interface SortCondition {
  sort_by: string;
  sort_direction: SortDirection;
}

export enum SortDirection {
  ascending = 'asc',
  descending = 'desc',
}

export interface PoapFullEvent extends PoapEvent {
  secret_code?: number;
  email?: string;
}
export interface Claim extends ClaimProof {
  claimerSignature: string;
}
export interface ClaimProof {
  claimId: string;
  eventId: number;
  claimer: Address;
  proof: string;
}

export type Template = {
  id: number;
  name: string;
  title_image: string;
  title_link: string;
  header_link_text: string;
  header_link_url: string;
  header_color: string;
  header_link_color: string;
  main_color: string;
  footer_color: string;
  left_image_url: string;
  left_image_link: string;
  right_image_url: string;
  right_image_link: string;
  mobile_image_url: string;
  mobile_image_link: string;
  footer_icon: string;
  secret_code: string;
};
export type TemplatePageFormValues = {
  name: string;
  title_image: Blob | string;
  title_link: string;
  header_link_text: string;
  header_link_url: string;
  header_color: string;
  header_link_color: string;
  main_color: string;
  footer_color: string;
  left_image_url: Blob | string;
  left_image_link: string;
  right_image_url: Blob | string;
  right_image_link: string;
  mobile_image_url: Blob | string;
  mobile_image_link: string;
  footer_icon: Blob | string;
  secret_code: string;
  email: string;
};
export type EventTemplate = {
  created_date: string;
  footer_color: string;
  footer_icon: string;
  header_color: string;
  header_link_color: string;
  header_link_text: string;
  header_link_url: string;
  id: number;
  is_active: boolean;
  left_image_link: string;
  left_image_url: string;
  main_color: string;
  mobile_image_link: string;
  mobile_image_url: string;
  name: string;
  right_image_link: string;
  right_image_url: string;
  title_image: string;
  title_link: string;
};

export interface QrResult {
  token: number;
}
export interface HashClaim {
  id: number;
  qr_hash: string;
  tx_hash: string;
  tx: Transaction;
  event_id: number;
  event: PoapEvent;
  event_template: EventTemplate | null;
  beneficiary: Address;
  user_input: string | null;
  signer: Address;
  claimed: boolean;
  claimed_date: string;
  created_date: string;
  tx_status?: string;
  secret: string;
  delegated_mint: boolean;
  delegated_signed_message: string;
  result: QrResult | null;
  queue_uid?: string;
}
export interface PoapSetting {
  id: number;
  name: string;
  type: string;
  value: string;
}
export interface AdminAddress {
  id: number;
  signer: Address;
  role: string;
  gas_price: string;
  balance: string;
  created_date: string;
  pending_tx: number;
}
export interface Transaction {
  id: number;
  tx_hash: string;
  nonce: number;
  operation: string;
  arguments: string;
  created_date: string;
  gas_price: string;
  signer: string;
  status: string;
  layer: string;
}
export interface PaginatedTransactions {
  limit: number;
  offset: number;
  total: number;
  transactions: Transaction[];
}
export interface EmailClaim {
  id: number;
  email: string;
  token: object;
  end_date: Date;
  processed: boolean;
}

export interface Notification {
  id: number;
  title: string;
  description: string;
  type: string;
  event_id: number;
  event: PoapEvent;
}

export interface PaginatedNotifications {
  limit: number;
  offset: number;
  total: number;
  notifications: Notification[];
}

export interface AdminLog {
  id: number;
  event_id: number;
  action: string;
  created_date: string;
  request_params: string;
  response_code: number;
  response: string;
  auth0_email: string;
  agent_vars: string;
  ip: string;
}

export interface PaginatedAdminLogs {
  limit: number;
  offset: number;
  total: number;
  admin_logs: AdminLog[];
}

export interface AdminLogAction {
  action: string;
  description: string;
}

export type QrCode = {
  beneficiary: string;
  user_input: string | null;
  claimed: boolean;
  claimed_date: string;
  created_date: string;
  event_id: number;
  id: number;
  is_active: boolean;
  scanned: boolean;
  numeric_id: number;
  qr_hash: string;
  qr_roll_id: number;
  tx_hash: string;
  tx_status: string | null;
  event: PoapEvent;
  delegated_mint: boolean;
  delegated_signed_message: string | null;
};

export type PaginatedQrCodes = {
  limit: number;
  offset: number;
  total: number;
  qr_claims: QrCode[];
};

export type PaginatedQrRequest = {
  limit: number;
  offset: number;
  total: number;
  qr_requests: QrRequest[];
};

export type ActiveQrRequest = {
  active: number;
};

export type ENSQueryResult = { valid: false } | { valid: true; ens: string };

export type AddressQueryResult = { valid: false } | { valid: true; ens: string };

export interface MigrateResponse {
  signature: string;
}

export type eventOptionType = {
  value: number;
  label: string;
  start_date: string;
};

export type QueueResponse = {
  queue_uid: string;
};

type QueueResult = {
  tx_hash: string;
};

export type Queue = {
  uid: string;
  operation: string;
  status: string;
  result: QueueResult | null;
};

export enum QueueStatus {
  finish = 'FINISH',
  finish_with_error = 'FINISH_WITH_ERROR',
  in_process = 'IN_PROCESS',
  pending = 'PENDING',
}

const API_BASE =
  process.env.NODE_ENV === 'development'
    ? `${process.env.REACT_APP_TEST_API_ROOT}`
    : `${process.env.REACT_APP_API_ROOT}`;

const API_WEBSITES =
  process.env.NODE_ENV === 'development'
  ? `${process.env.REACT_APP_TEST_API_WEBSITES}`
  : `${process.env.REACT_APP_API_WEBSITES}`;


const ETH_THE_GRAPH_URL = process.env.REACT_APP_ETH_THE_GRAPH_URL;
const L2_THE_GRAPH_URL = process.env.REACT_APP_L2_THE_GRAPH_URL;

async function fetchJson<A>(input: RequestInfo, init?: RequestInit): Promise<A> {
  const res = await fetch(input, init);

  if (!res.ok) {
    const data = await res.json();
    if (data && data.message) throw new Error(data.message);
  }

  return await res.json();
}

async function fetchJsonNoResponse<A>(input: RequestInfo, init?: RequestInit): Promise<void> {
  const res = await fetch(input, init);
  if (!res.ok) {
    const data = await res.json();
    if (data && data.message) throw new Error(data.message);
  }
}

async function secureFetchNoResponse(input: RequestInfo, init?: RequestInit): Promise<void> {
  const bearer = 'Bearer ' + (await authClient.getAPIToken());
  const res = await fetch(input, {
    ...init,
    headers: {
      Authorization: bearer,
      ...(init ? init.headers : {}),
    },
  });
  if (!res.ok) {
    const data = await res.json();
    if (data && data.message) throw new Error(data.message);
    throw new Error(`Request failed => statusCode: ${res.status} msg: ${res.statusText}`);
  }
}

async function secureFetch<A>(input: RequestInfo, init?: RequestInit): Promise<A> {
  const bearer = 'Bearer ' + (await authClient.getAPIToken());
  const res = await fetch(input, {
    ...init,
    headers: {
      Authorization: bearer,
      ...(init ? init.headers : {}),
    },
  });
  if (!res.ok) {
    const data = await res.json();
    if (data && data.message) throw new Error(data.message);
    throw new Error(`Request Failed => statusCode: ${res.status} msg: ${res.statusText}`);
  }
  return await res.json();
}

export function resolveENS(name: string): Promise<ENSQueryResult> {
  return fetchJson(`${API_BASE}/actions/ens_resolve?name=${encodeURIComponent(name)}`);
}

export function getENSFromAddress(address: Address): Promise<AddressQueryResult> {
  return fetchJson(`${API_BASE}/actions/ens_lookup/${address}`);
}

export function getTokensFor(address: string): Promise<TokenInfo[]> {
  return fetchJson(`${API_BASE}/actions/scan/${address}`);
}

export function getTokenInfo(tokenId: string): Promise<TokenInfo> {
  return fetchJson(`${API_BASE}/token/${tokenId}`);
}

export async function getEvents(): Promise<PoapEvent[]> {
  return authClient.isAuthenticated() ? secureFetch(`${API_BASE}/events`) : fetchJson(`${API_BASE}/events`);
}

export async function getQrRequests(
  limit: number,
  offset: number,
  reviewed?: boolean,
  event_id?: number,
  sort_condition?: SortCondition,
): Promise<PaginatedQrRequest> {
  const sort_by = sort_condition?.sort_by;
  const sort_direction = sort_condition?.sort_direction;

  const params = queryString.stringify({ limit, offset, event_id, reviewed, sort_by, sort_direction }, { sort: false });
  try {
    return authClient.isAuthenticated()
      ? secureFetch(`${API_BASE}/qr-requests?${params}`)
      : fetchJson(`${API_BASE}/qr-requests?${params}`);
  } catch (e) {
    return e;
  }
}

export async function postQrRequests(
  event_id: number,
  requested_codes: number,
  secret_code: number
): Promise<void> {
  return authClient.isAuthenticated() ? 
    secureFetch(`${API_BASE}/qr-requests`, {
      method: 'POST',
      body: JSON.stringify({
        event_id,
        requested_codes,
        secret_code,
      }),
      headers: { 'Content-Type': 'application/json' },
    })
    :
    fetchJson(`${API_BASE}/qr-requests`, {
      method: 'POST',
      body: JSON.stringify({
        event_id,
        requested_codes,
        secret_code,
      }),
      headers: { 'Content-Type': 'application/json' },
    })
}

export async function getActiveQrRequests(
  event_id?: number,
): Promise<ActiveQrRequest> {
  const params = queryString.stringify({ event_id }, { sort: false });
  try {
    return authClient.isAuthenticated() ? secureFetch(`${API_BASE}/qr-requests/active/count?${params}`) : fetchJson(`${API_BASE}/qr-requests/active/count?${params}`);
  } catch(e) {
    return e;
  }
}

export async function setQrRequests(
  id: number,
  accepted_codes: number
): Promise<void> {
  try {
    return secureFetch(`${API_BASE}/qr-requests/${id}`, {
      method: 'PUT',
      body: JSON.stringify({
        id,
        accepted_codes
      }),
      headers: { 'Content-Type': 'application/json' },
    });
  } catch(e) {
    return e;
  }
}

export type TemplateResponse = TemplatesResponse<Template>;

export async function getTemplates({ limit = 10, offset = 0, name = '' }: Params = {}): Promise<TemplateResponse> {
  return fetchJson(`${API_BASE}/event-templates?limit=${limit}&offset=${offset}&name=${name}`);
}

export async function getTemplateById(id?: number): Promise<Template> {
  const isAdmin = authClient.isAuthenticated();
  return isAdmin
    ? secureFetch(`${API_BASE}/event-templates-admin/${id}`)
    : fetchJson(`${API_BASE}/event-templates/${id}`);
}

export async function getEvent(fancyId: string): Promise<null | PoapFullEvent> {
  const isAdmin = authClient.isAuthenticated();
  return isAdmin ? secureFetch(`${API_BASE}/events-admin/${fancyId}`) : fetchJson(`${API_BASE}/events/${fancyId}`);
}

export async function getSetting(settingName: string): Promise<null | PoapSetting> {
  return fetchJson(`${API_BASE}/settings/${settingName}`);
}

export async function getTokenInfoWithENS(tokenId: string): Promise<TokenInfo> {
  const token = await getTokenInfo(tokenId);

  try {
    const ens = await getENSFromAddress(token.owner);
    const ownerText = ens.valid ? `${ens.ens} (${token.owner})` : `${token.owner}`;
    const tokenParsed = { ...token, ens, ownerText };
    return tokenParsed;
  } catch (error) {
    return token;
  }
}

export function setSetting(settingName: string, settingValue: string): Promise<any> {
  return secureFetchNoResponse(`${API_BASE}/settings/${settingName}/${settingValue}`, {
    method: 'PUT',
  });
}

export function burnToken(tokenId: string): Promise<QueueResponse> {
  return secureFetch(`${API_BASE}/burn/${tokenId}`, {
    method: 'POST',
  });
}

export async function sendNotification(
  title: string,
  description: string,
  notificationType: string,
  selectedEventId: number | null,
): Promise<any> {
  return secureFetchNoResponse(`${API_BASE}/notifications`, {
    method: 'POST',
    body: JSON.stringify({
      title,
      description,
      event_id: selectedEventId ? selectedEventId : null,
      type: notificationType,
    }),
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function mintEventToManyUsers(
  eventId: number,
  addresses: string[],
  signer_address: string,
): Promise<QueueResponse> {
  return secureFetch(`${API_BASE}/actions/mintEventToManyUsers`, {
    method: 'POST',
    body: JSON.stringify({
      eventId,
      addresses,
      signer_address,
    }),
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function mintUserToManyEvents(
  eventIds: number[],
  address: string,
  signer_address: string,
): Promise<QueueResponse> {
  return secureFetch(`${API_BASE}/actions/mintUserToManyEvents`, {
    method: 'POST',
    body: JSON.stringify({
      eventIds,
      address,
      signer_address,
    }),
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function updateEvent(event: FormData, fancyId: string): Promise<void> {
  const isAdmin = authClient.isAuthenticated();

  return isAdmin
    ? secureFetchNoResponse(`${API_BASE}/events/${fancyId}`, { method: 'PUT', body: event })
    : fetchJsonNoResponse(`${API_BASE}/events/${fancyId}`, { method: 'PUT', body: event });
}

export async function createEvent(event: FormData) {
  const isAdmin = authClient.isAuthenticated();
  if (isAdmin) {
    return secureFetch(`${API_BASE}/events`, {
      method: 'POST',
      body: event,
    });
  }
  return fetchJson(`${API_BASE}/events`, {
    method: 'POST',
    body: event,
  });
}

export async function createTemplate(event: FormData): Promise<Template> {
  const isAdmin = authClient.isAuthenticated();
  if (isAdmin) {
    return secureFetch(`${API_BASE}/event-templates`, {
      method: 'POST',
      body: event,
    });
  }
  return fetchJson(`${API_BASE}/event-templates`, {
    method: 'POST',
    body: event,
  });
}

export async function updateTemplate(event: FormData, id: number): Promise<void> {
  return fetchJsonNoResponse(`${API_BASE}/event-templates/${id}`, {
    method: 'PUT',
    body: event,
  });
}

export async function getSigners(): Promise<AdminAddress[]> {
  return secureFetch(`${API_BASE}/signers`);
}

export function setSigner(id: number, gasPrice: string): Promise<any> {
  return secureFetchNoResponse(`${API_BASE}/signers/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ gas_price: gasPrice }),
  });
}

export function getNotifications(
  limit: number,
  offset: number,
  type?: string,
  recipientFilter?: string,
  eventId?: number,
): Promise<PaginatedNotifications> {
  let paramsObject = { limit, offset };

  if (type) Object.assign(paramsObject, { type });

  if (recipientFilter === 'everyone') {
    Object.assign(paramsObject, { event_id: '' });
  }

  if (recipientFilter === 'event') {
    Object.assign(paramsObject, { event_id: eventId });
  }

  const params = queryString.stringify(paramsObject);

  return secureFetch(`${API_BASE}/notifications?${params}`);
}

export async function getQrCodes(
  limit: number,
  offset: number,
  passphrase: string,
  claimed?: boolean,
  scanned?: boolean,
  event_id?: number,
): Promise<PaginatedQrCodes> {
  const isAdmin = authClient.isAuthenticated();
  const params = queryString.stringify({ limit, offset, claimed, event_id, scanned, passphrase }, { sort: false });
  return isAdmin ? secureFetch(`${API_BASE}/qr-code?${params}`) : fetchJson(`${API_BASE}/qr-code?${params}`);
}

export async function qrCodesRangeAssign(
  from: number,
  to: number,
  eventId: number | null,
  passphrase?: string,
): Promise<void> {
  const isAdmin = authClient.isAuthenticated();

  return isAdmin
    ? secureFetchNoResponse(`${API_BASE}/qr-code/range-assign`, {
        method: 'PUT',
        body: JSON.stringify({
          numeric_id_min: from,
          numeric_id_max: to,
          event_id: eventId,
        }),
        headers: { 'Content-Type': 'application/json' },
      })
    : fetchJsonNoResponse(`${API_BASE}/qr-code/range-assign`, {
        method: 'PUT',
        body: JSON.stringify({
          numeric_id_min: from,
          numeric_id_max: to,
          event_id: eventId,
          passphrase,
        }),
        headers: { 'Content-Type': 'application/json' },
      });
}

export async function qrCodesListAssign(
  qrHashes: string[],
  eventId: number | null,
): Promise<QrCodesListAssignResponse> {
  console.log(eventId);
  return secureFetch(`${API_BASE}/qr-code/list-assign`, {
    method: 'PUT',
    body: JSON.stringify({
      qr_code_hashes: qrHashes,
      event_id: eventId,
    }),
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function qrCreateMassive(
  qrHashes: string[],
  qrIds: string[],
  delegated_mint: boolean,
  event?: string,
): Promise<void> {
  let unstringifiedBody = {
    qr_list: qrHashes,
    numeric_list: qrIds,
    delegated_mint,
  };

  if (Number(event) !== 0) Object.assign(unstringifiedBody, { event_id: Number(event) });

  const body = JSON.stringify(unstringifiedBody);

  return secureFetchNoResponse(`${API_BASE}/qr-code/list-create`, {
    method: 'POST',
    body,
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function qrCodesSelectionUpdate(
  qrCodesIds: string[],
  eventId: number | null,
  passphrase?: string,
): Promise<void> {
  const isAdmin = authClient.isAuthenticated();

  return isAdmin
    ? secureFetchNoResponse(`${API_BASE}/qr-code/update`, {
        method: 'PUT',
        body: JSON.stringify({
          qr_code_ids: qrCodesIds,
          event_id: eventId,
        }),
        headers: { 'Content-Type': 'application/json' },
      })
    : fetchJsonNoResponse(`${API_BASE}/qr-code/update`, {
        method: 'PUT',
        body: JSON.stringify({
          qr_code_ids: qrCodesIds,
          event_id: eventId,
          passphrase,
        }),
        headers: { 'Content-Type': 'application/json' },
      });
}

export async function generateRandomCodes(event_id: number, amount: number, delegated_mint: boolean): Promise<void> {
  return secureFetchNoResponse(`${API_BASE}/qr-code/generate`, {
    method: 'POST',
    body: JSON.stringify({
      event_id,
      amount,
      delegated_mint,
    }),
    headers: { 'Content-Type': 'application/json' },
  });
}

export function getTransactions(
  limit: number,
  offset: number,
  status: string,
  signer: string,
): Promise<PaginatedTransactions> {
  const params = queryString.stringify({ limit, offset, status, signer }, { sort: false });
  return secureFetch(`${API_BASE}/transactions?${params}`);
}

export function bumpTransaction(tx_hash: string, gasPrice: string): Promise<any> {
  return secureFetchNoResponse(`${API_BASE}/actions/bump`, {
    method: 'POST',
    body: JSON.stringify({ txHash: tx_hash, gasPrice: gasPrice }),
    headers: { 'Content-Type': 'application/json' },
  });
}

export function getAdminLogs(
  limit: number,
  offset: number,
  email: string,
  action: string,
  created_from: string,
  created_to: string,
  response_status?: number,
  event_id?: number,
): Promise<PaginatedAdminLogs> {
  const params = queryString.stringify(
    { limit, offset, email, action, response_status, created_from, created_to, event_id },
    { sort: false },
  );
  return secureFetch(`${API_BASE}/admin-logs?${params}`);
}

export function getAdminActions(): Promise<AdminLogAction[]> {
  return secureFetch(`${API_BASE}/admin-logs/actions`);
}

export async function getClaimHash(hash: string): Promise<HashClaim> {
  return fetchJson(`${API_BASE}/actions/claim-qr?qr_hash=${hash}`);
}

export async function postClaimHash(qr_hash: string, address: string, secret: string): Promise<HashClaim> {
  return fetchJson(`${API_BASE}/actions/claim-qr`, {
    method: 'POST',
    body: JSON.stringify({ qr_hash, address, secret }),
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function postTokenMigration(tokenId: number): Promise<MigrateResponse> {
  return fetchJson(`${API_BASE}/actions/migrate`, {
    method: 'POST',
    body: JSON.stringify({ tokenId }),
    headers: { 'Content-Type': 'application/json' },
  });
}

export function getEmailClaim(token: string): Promise<EmailClaim> {
  return fetchJson(`${API_BASE}/actions/claim-email?token=${token}`);
}

export function requestEmailRedeem(email: string): Promise<void> {
  return fetchJson(`${API_BASE}/actions/claim-email`, {
    method: 'POST',
    body: JSON.stringify({ email }),
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function redeemWithEmail(address: string, token: string, email: string): Promise<QueueResponse> {
  return fetchJson(`${API_BASE}/actions/redeem-email-tokens`, {
    method: 'POST',
    body: JSON.stringify({ email, address, token }),
    headers: { 'Content-Type': 'application/json' },
  });
}

/* Checkout */
export type Checkout = {
  id: number;
  fancy_id: string;
  start_time: string;
  end_time: string;
  max_limit: number;
  timezone: string;
  is_active: string;
  event: PoapEvent;
};

export interface PaginatedCheckouts {
  limit: number;
  offset: number;
  total: number;
  checkouts: Checkout[];
}

type CheckoutRedeemResponse = {
  qr_hash: string;
};

export function getCheckout(fancyId: string): Promise<Checkout> {
  const isAdmin = authClient.isAuthenticated();
  return isAdmin ? secureFetch(`${API_BASE}/checkouts/${fancyId}`) : fetchJson(`${API_BASE}/checkouts/${fancyId}`);
}

export function redeemCheckout(fancyId: string, gRecaptchaResponse: string): Promise<CheckoutRedeemResponse> {
  return fetchJson(`${API_BASE}/checkouts/${fancyId}/redeem`, {
    method: 'POST',
    body: JSON.stringify({ gRecaptchaResponse }),
    headers: { 'Content-Type': 'application/json' },
  });
}

export function getCheckouts(
  limit: number,
  offset: number,
  eventId: number | undefined,
  activeStatus: boolean | null,
): Promise<PaginatedCheckouts> {
  let paramsObject: any = { limit, offset };

  if (eventId) paramsObject['event_id'] = eventId;

  if (activeStatus !== null) {
    paramsObject['is_active'] = activeStatus;
  }

  const params = queryString.stringify(paramsObject);
  return secureFetch(`${API_BASE}/admin/checkouts/?${params}`);
}

export function createCheckout(
  event_id: number,
  fancy_id: string,
  start_time: string,
  end_time: string,
  max_limit: number,
  timezone: number,
): Promise<Checkout> {
  return secureFetch(`${API_BASE}/checkouts`, {
    method: 'POST',
    body: JSON.stringify({
      event_id,
      fancy_id,
      start_time,
      end_time,
      max_limit,
      timezone,
    }),
    headers: { 'Content-Type': 'application/json' },
  });
}

export function editCheckout(
  event_id: number,
  fancy_id: string,
  start_time: string,
  end_time: string,
  max_limit: number,
  timezone: number,
  is_active: string,
): Promise<Checkout> {
  return secureFetch(`${API_BASE}/checkouts/${fancy_id}`, {
    method: 'PUT',
    body: JSON.stringify({
      event_id,
      fancy_id,
      start_time,
      end_time,
      max_limit,
      timezone,
      is_active,
    }),
    headers: { 'Content-Type': 'application/json' },
  });
}

export function getQueueMessage(messageId: string): Promise<Queue> {
  return fetchJson(`${API_BASE}/queue-message/${messageId}`);
}

/* Deliveries */
export type Delivery = {
  id: number;
  slug: string;
  card_title: string;
  card_text: string;
  page_title: string;
  page_title_image: string;
  page_text: string;
  image: string;
  active: boolean;
  metadata_title: string;
  metadata_description: string;
  event_ids: string;
};

export type DeliveryAddress = {
  address: string;
  claimed: boolean;
  event_ids: string;
};

export interface PaginatedDeliveries {
  limit: number;
  offset: number;
  total: number;
  deliveries: Delivery[];
}

export function getDeliveries(
  limit: number,
  offset: number,
  eventId: number | undefined,
  active: boolean | null,
): Promise<PaginatedDeliveries> {
  let paramsObject: any = { limit, offset };

  if (eventId) paramsObject['event_id'] = eventId;

  if (active !== null) {
    paramsObject['active'] = active;
  }

  const params = queryString.stringify(paramsObject);
  return secureFetch(`${API_BASE}/deliveries?${params}`);
}

export function getDelivery(id: string | number): Promise<Delivery> {
  return fetchJson(`${API_BASE}/delivery/${id}`);
}

export function getDeliveryAddresses(id: string | number): Promise<DeliveryAddress[]> {
  return fetchJson(`${API_BASE}/delivery-addresses/${id}`);
}

export function createDelivery(
  slug: string,
  event_ids: string,
  card_title: string,
  card_text: string,
  page_title: string,
  page_text: string,
  metadata_title: string,
  metadata_description: string,
  image: string,
  page_title_image: string,
  addresses: any[],
): Promise<Delivery> {
  return secureFetch(`${API_BASE}/deliveries`, {
    method: 'POST',
    body: JSON.stringify({
      slug,
      event_ids,
      card_title,
      card_text,
      page_title,
      page_text,
      metadata_title,
      metadata_description,
      image,
      page_title_image,
      addresses,
    }),
    headers: { 'Content-Type': 'application/json' },
  });
}

export function updateDelivery(
  id: number,
  slug: string,
  card_title: string,
  card_text: string,
  page_title: string,
  page_text: string,
  metadata_title: string,
  metadata_description: string,
  image: string,
  page_title_image: string,
  active: boolean,
): Promise<Delivery> {
  return secureFetch(`${API_BASE}/deliveries/${id}`, {
    method: 'PUT',
    body: JSON.stringify({
      slug,
      card_title,
      card_text,
      page_title,
      page_text,
      metadata_title,
      metadata_description,
      image,
      page_title_image,
      active,
    }),
    headers: { 'Content-Type': 'application/json' },
  });
}
/* Websites */
export type Website = {
  claimName: string;
  active: boolean;
  captcha: boolean;
  created: string;
  from?: string;
  to?: string;
  deliveriesCount?: {total: number, claimed: number};
};

export interface PaginatedWebsites {
  limit: number;
  offset: number;
  total: number;
  websites: Website[];
}

export type WebsiteClaimUrl = {
  claimName: string;
  claimUrl: string;
  ip: string;
  claimed: boolean;
  claimedTime: Date;
  time: Date;
};

export function getWebsites(
  limit: number,
  offset: number,
  active: boolean | null,
  timeframe: string | null,
): Promise<PaginatedWebsites> {
  let paramsObject: any = { limit, offset };

  if (active !== null) {
    paramsObject['active'] = active;
  }

  if(timeframe !== null){
    paramsObject['timeframe'] = timeframe;
  }

  const params = queryString.stringify(paramsObject);
  return secureFetch(`${API_WEBSITES}/admin/claimName/all?${params}`);
}

export function getWebsite(claimName: string ): Promise<Website> {
  return secureFetch(`${API_WEBSITES}/admin/claimName/${claimName}`);
}

export function getWebsiteClaimUrls(claimName: string, claimed?: boolean): Promise<WebsiteClaimUrl[]> {
  if(claimed === true){
    return secureFetch(`${API_WEBSITES}/admin/delivery/claimed/${claimName}`);
  }

  return secureFetch(`${API_WEBSITES}/admin/delivery/${claimName}`);
}

export async function createWebsite(
  claimName: string,
  claimUrls: string[],
  from?: string,
  to?: string,
  captcha?: boolean,
  active?: boolean,
): Promise<Website> {

  const createClaimName: Website = await secureFetch(`${API_WEBSITES}/admin/claimName`, {
    method: 'POST',
    body: JSON.stringify({
      claimName,
      from,
      to,
      captcha,
      active,
    }),
    headers: { 'Content-Type': 'application/json' },
  });

  if(claimUrls && claimUrls.length > 0)
    await addURLsToWebsite(claimName, claimUrls);

  return createClaimName;
}

function addURLsToWebsite(
  claimName: string,
  claimUrls?: string[],
): Promise<WebsiteClaimUrl[]> {
  return secureFetch(`${API_WEBSITES}/admin/delivery/add/${claimName}`, {
    method: 'POST',
    body: JSON.stringify({
      claimUrl: claimUrls,
    }),
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function updateWebsite(
  prevClaimName: string,
  claimName: string,
  claimUrls: string[],
  from?: string,
  to?: string,
  captcha?: boolean,
  active?: boolean,
): Promise<Website> {
  const updatedWebsite: Website = await secureFetch(`${API_WEBSITES}/admin/claimName/${prevClaimName}`, {
    method: 'PUT',
    body: JSON.stringify({
      claimName,
      from,
      to,
      captcha,
      active,
    }),
    headers: { 'Content-Type': 'application/json' },
  });

  if(claimUrls && claimUrls.length > 0)
    await addURLsToWebsite(claimName, claimUrls);

  return updatedWebsite;
}

export async function deleteClaimUrl(
  claimUrl: string,
): Promise<Website> {
  return secureFetch(`${API_WEBSITES}/admin/delivery/`, {
    method: 'DELETE',
    body: JSON.stringify({
      claimUrl: claimUrl,
    }),
    headers: { 'Content-Type': 'application/json' },
  });
}

interface TheGraphResponse<T> {
  data: T;
}

interface TheGraphDataTokensQuantity {
  event?: TheGraphEventTokensQuantity;
}

interface TheGraphEventTokensQuantity {
  id: string;
  tokenCount: string;
}

export async function tokensQuantityByEventId(eventId: number): Promise<number> {
  let promises: Array<Promise<number>> = [];

  if (L2_THE_GRAPH_URL) {
    promises = promises.concat(tokensQuantityByEventIdAndSubgraphUrl(eventId, L2_THE_GRAPH_URL));
  }

  if (ETH_THE_GRAPH_URL) {
    promises = promises.concat(tokensQuantityByEventIdAndSubgraphUrl(eventId, ETH_THE_GRAPH_URL));
  }

  const results = await Promise.all(promises);

  return results.reduce((acc, value) => acc + value, 0);
}

async function tokensQuantityByEventIdAndSubgraphUrl(eventId: number, subgraphUrl: string): Promise<number> {
  const query = `{"query":"{event(id: ${eventId}){id tokenCount}}"}`;
  const request = { body: query, method: 'POST' };
  const count = (await fetchJson<TheGraphResponse<TheGraphDataTokensQuantity>>(subgraphUrl, request)).data.event
    ?.tokenCount;
  return count ? parseInt(count) : 0;
}
