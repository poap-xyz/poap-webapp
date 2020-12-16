import React, { useEffect } from 'react';

// auth
import { authClient } from '../auth';

export const AdminLoginPage = () => {
  useEffect(() => {
    authClient.login();
  }, []);

  return <></>;
};
