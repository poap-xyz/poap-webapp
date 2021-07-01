const ROLES = {
  administrator: 'administrator',
  eventHost: 'event_host',
};

const COLORS = {
  primaryColor: '#6534ff',
};

const STYLES = {
  // Adding #80 to RGB color for 50% opacity
  boxShadow: (color: string) => `0px 10px 30px -5px ${color}80`,
};

const LABELS = {
  issueBadges: {
    roles: [ROLES.administrator],
    title: 'Issue Badges',
  },
  inbox: {
    roles: [ROLES.administrator],
    title: 'Inbox',
  },
  otherTasks: {
    roles: [ROLES.administrator],
    title: 'Other Tasks',
  },
  quickLinks: {
    roles: [ROLES.eventHost],
    title: 'Quick Links',
  },
  menu: {
    roles: [ROLES.eventHost],
    title: 'Menu',
  },
};

const ROUTES = {
  home: '/',
  scan: '/scan/:account',
  scanHome: '/scan',
  redeem: '/redeem/:uid',
  renderToken: '/r/token/:tokenId',
  token: '/token/:tokenId',
  callback: '/callback',
  codeClaimWeb3PageHash: '/claim/:hash/:method',
  codeClaimPageHash: '/claim/:hash',
  codeClaimPage: '/claim',

  checkouts: {
    main: '/e/:fancyId',
    admin: {
      path: '/admin/checkouts',
      roles: [ROLES.administrator],
      title: 'Checkouts',
    },
    newForm: {
      path: '/admin/checkouts/new',
      roles: [ROLES.administrator],
      title: 'New Checkout',
    },
    editForm: {
      path: '/admin/checkouts/:fancyId',
      roles: [ROLES.administrator],
      title: 'Edit Checkout',
    },
  },

  admin: '/admin',
  adminLogin: {
    path: '/admin/login',
    title: 'Login',
  },
  issueForEvent: {
    path: '/admin/issue-for-event',
    roles: [ROLES.administrator],
    title: 'Many Users',
  },
  template: {
    path: '/admin/template',
    roles: [ROLES.eventHost],
    title: 'Manage Templates',
  },
  templateForm: {
    path: '/admin/template/form/:id?',
    roles: [ROLES.eventHost],
  },
  issueForUser: {
    path: '/admin/issue-for-user',
    roles: [ROLES.administrator],
    title: 'Many Events',
  },
  events: {
    path: '/admin/events',
    roles: [ROLES.administrator, ROLES.eventHost],
    title: 'Manage Events',
  },
  eventsList: {
    path: '/admin/events/list',
    roles: [ROLES.administrator, ROLES.eventHost],
  },
  eventsNew: {
    path: '/admin/events/new',
    roles: [ROLES.administrator, ROLES.eventHost],
  },
  event: {
    path: '/admin/events/:eventId',
    roles: [ROLES.administrator, ROLES.eventHost],
  },
  minters: {
    path: '/admin/minters',
    roles: [ROLES.administrator],
  },
  burn: {
    path: '/admin/burn',
    roles: [ROLES.administrator],
    title: 'Burn Tokens',
  },
  burnToken: {
    path: '/admin/burn/:tokenId',
    roles: [ROLES.administrator],
    title: 'Burn Token',
  },
  addressManagement: {
    path: '/admin/address-management',
    roles: [ROLES.administrator],
    title: 'Manage Addresses',
  },
  transactions: {
    path: '/admin/transactions',
    roles: [ROLES.administrator],
    title: 'Transactions',
  },
  inbox: {
    path: '/admin/inbox',
    roles: [ROLES.administrator],
    title: 'Send Notification',
  },
  inboxList: {
    path: '/admin/inbox-list',
    roles: [ROLES.administrator],
    title: 'Notifications List',
  },
  qr: {
    path: '/admin/qr',
    roles: [ROLES.administrator, ROLES.eventHost],
    title: 'Manage QR Codes',
  },

  deliveries: {
    admin: {
      path: '/admin/deliveries',
      roles: [ROLES.administrator],
      title: 'Deliveries',
    },
    newForm: {
      path: '/admin/deliveries/new',
      roles: [ROLES.administrator],
      title: 'New Delivery',
    },
    editForm: {
      path: '/admin/deliveries/:id',
      roles: [ROLES.administrator],
      title: 'Edit Delivery',
    },
  },

  websites: {
    admin: {
      path: '/admin/websites',
      roles: [ROLES.administrator],
      title: 'Websites',
    },
    newForm: {
      path: '/admin/websites/new',
      roles: [ROLES.administrator],
      title: 'New Website',
    },
    editForm: {
      path: '/admin/websites/edit/:claimName',
      roles: [ROLES.administrator],
      title: 'Edit Website',
    }
  },

};

const IMAGE_SUPPORTED_FORMATS = ['image/png'];

const TX_STATUS = {
  failed: 'failed',
  passed: 'passed',
  pending: 'pending',
  bumped: 'bumped',
};

const LAYERS = {
  layer1: 'Layer1',
  layer2: 'Layer2',
};

const layerOneNetwork = process.env.REACT_APP_ETH_NETWORK === 'mainnet' ? '' : `${process.env.REACT_APP_ETH_NETWORK}.`;
const layerTwoNetwork = process.env.REACT_APP_L2_ETH_NETWORK;

const etherscanLinks = {
  tx: (hash: string): string => `https://${layerOneNetwork}etherscan.io/tx/${hash}`,
  address: (address: string): string => `https://${layerOneNetwork}etherscan.io/address/${address}`,
};

const blockscoutLinks = {
  tx: (hash: string): string => `https://blockscout.com/poa/${layerTwoNetwork}/tx/${hash}`,
  address: (address: string): string => `https://blockscout.com/poa/${layerTwoNetwork}/address/${address}`,
};

export {
  ROLES,
  ROUTES,
  TX_STATUS,
  LAYERS,
  etherscanLinks,
  blockscoutLinks,
  LABELS,
  IMAGE_SUPPORTED_FORMATS,
  COLORS,
  STYLES,
};
