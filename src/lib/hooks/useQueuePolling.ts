import { useState, useEffect } from 'react';
import { getQueueMessage, QueueStatus } from '../../api';

const useQueuePolling = (messageId: string) => {
  const [isQueuePolling, togglePolling] = useState<boolean>(false);
  const [transactionHash, setTransactionHash] = useState<string>('');
  const [failedRequest, setFailedRequest] = useState<boolean>(false);

  useEffect(() => {
    if (messageId) {
      togglePolling(true);
      runPolling();
    }
  }, [messageId]); /* eslint-disable-line react-hooks/exhaustive-deps */

  const runPolling = () => {
    setTimeout(async () => {
      console.log('Running Queue Polling');
      try {
        let response = await getQueueMessage(messageId);
        if (response.status === QueueStatus.finish && response.result) {
          setTransactionHash(response.result.tx_hash);
          togglePolling(false);
        } else if (response.status === QueueStatus.finish_with_error) {
          setFailedRequest(true);
        } else {
          runPolling();
        }
      } catch (e) {
        console.log('Error while polling Queue message');
        console.log(e);
        runPolling();
      }
    }, 2000);
  };

  return [transactionHash, failedRequest, isQueuePolling];
};

export default useQueuePolling;
