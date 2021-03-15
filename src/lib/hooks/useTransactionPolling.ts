import { useState, useEffect } from 'react';
import Web3 from 'web3';
import { TransactionReceipt } from 'web3-core';
import { LAYERS } from '../constants';

const useTransactionPolling = (hash: string, layer: string) => {
  const [isTransactionPolling, togglePolling] = useState<boolean>(false);
  const [receipt, setReceipt] = useState<null | TransactionReceipt>(null);
  const [web3, setWeb3] = useState<null | Web3>(null);

  useEffect(() => {
    if (hash && web3) {
      togglePolling(true);
      runPolling();
    }
  }, [web3, hash]); /* eslint-disable-line react-hooks/exhaustive-deps */

  useEffect(() => {
    if (layer) {
      const provider =
        layer === LAYERS.layer1 ? process.env.REACT_APP_INFURA_PROVIDER || '' : process.env.REACT_APP_L2_RPC_URL || '';
      const _web3 = new Web3(provider);
      setWeb3(_web3);
    }
  }, [layer]);

  const runPolling = () => {
    setTimeout(async () => {
      try {
        if (hash && web3) {
          let _receipt = await web3.eth.getTransactionReceipt(hash);
          if (_receipt) {
            setTimeout(() => setReceipt(_receipt), 1000);
          } else {
            runPolling();
          }
        } else {
          runPolling();
        }
      } catch (e) {
        console.log('Error while polling Transaction');
        console.log(e);
        runPolling();
      }
    }, 2000);
  };

  return [receipt, isTransactionPolling];
};

export default useTransactionPolling;
