import * as yup from 'yup';
import { getDefaultProvider } from 'ethers';
import { getAddress, formatUnits } from 'ethers/utils';

function isValidAddress(str: string): boolean {
  try {
    getAddress(str);
    return true;
  } catch (error) {
    return false;
  }
}

async function isValidAddressOrENS(str: string): Promise<boolean> {
  if (isValidAddress(str)) {
    return true;
  } else {
    try {
      let response = await resolveName(str);
      if (response) return true;
    } catch (error) {
      return false;
    }
  }
  return false;
}

async function resolveName(name: string): Promise<string> {
  const mainnetProvider = getDefaultProvider('homestead');
  const resolvedAddress = await mainnetProvider.resolveName(name);
  return resolvedAddress;
}

const isValidEmail = (email: string) => {
  return yup.string().email().isValidSync(email);
};

const convertToGWEI = (numberInWEI: string) => {
  return Number(formatUnits(numberInWEI, 'gwei')).toString();
};

const convertToETH = (numberInWEI: string) => {
  return Number(formatUnits(numberInWEI, 'ether'));
};

const convertFromGWEI = (numberInGWEI: string) => {
  let numberGWEI: number = Number(numberInGWEI);
  for (let i = 1; i < 10; i++) {
    numberGWEI = Number(numberGWEI) * 10;
  }
  return String(numberGWEI);
};

const reduceAddress = (address: string) => {
  if (address.length < 10) return address;
  return address.slice(0, 6) + '\u2026' + address.slice(-4);
};

const generateSecretCode = () =>
  Math.floor(Math.random() * 999999)
    .toString()
    .padStart(6, '0');

const getBase64 = (img: File | Blob, callback: (outputFile: string | undefined) => void) => {
  const reader = new FileReader();

  reader.addEventListener('load', () => {
    if (typeof reader.result === 'string') return reader.result;
  });
  reader.readAsDataURL(img);
};

function getNumberWithOrdinal(n: number): string {
  const s = ['th', 'st', 'nd', 'rd'],
    v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

function timeSince(date: Date): string {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);

  let interval = seconds / 31536000;

  if (interval > 1) {
    return Math.floor(interval) + ' years';
  }
  interval = seconds / 2592000;
  if (interval > 1) {
    return Math.floor(interval) + ' months';
  }
  interval = seconds / 86400;
  if (interval > 1) {
    return Math.floor(interval) + ' days';
  }
  interval = seconds / 3600;
  if (interval > 1) {
    return Math.floor(interval) + ' hours';
  }
  interval = seconds / 60;
  if (interval > 1) {
    return Math.floor(interval) + ' minutes';
  }

  return Math.floor(seconds) + ' seconds';
}

export {
  getBase64,
  isValidAddress,
  isValidAddressOrENS,
  convertToGWEI,
  convertFromGWEI,
  convertToETH,
  reduceAddress,
  generateSecretCode,
  isValidEmail,
  getNumberWithOrdinal,
  timeSince,
};
