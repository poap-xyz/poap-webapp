import React from 'react';
import { Route, RouteProps } from 'react-router-dom';
import { withAuth } from '.';

export interface PrivateRouteProps extends RouteProps {
  component: React.ComponentType<any>;
}

export const PrivateRoute: React.FC<PrivateRouteProps> = withAuth(
  ({ auth, component: Component, ...rest }) => {
    return (
      <Route
        {...rest}
        render={props => {
          if (auth.isAuthenticated()) {
            return <Component {...props} />;
          } else {
            console.log('calling login with ', props.location.pathname);
            auth.login(props.location.pathname);
            return null;
          }
        }}
      />
    );
  }
);
