import React from 'react';
import { RouteComponentProps } from 'react-router';
import { Link } from 'react-router-dom';
import { AuthService, withAuth } from '.';
import { Loading } from '../components/Loading';
import PoapLogo from '../images/POAP.svg';

type CallbackState = {
  loginFailed: boolean;
};
class Callback_ extends React.Component<
  RouteComponentProps & { auth: AuthService },
  CallbackState
  > {
  state: CallbackState = {
    loginFailed: false,
  };
  async componentDidMount() {
    try {
      const path = await this.props.auth.handleCallback();
      this.props.history.push(path);
    } catch (err) {
      console.log(`login error: err`);
      this.setState({ loginFailed: true });
    }
  }

  render() {
    return (
      <>
        <header id="site-header" role="banner">
          <div className="container">
            <div className="col-xs-6 col-sm-6 col-md-6">
              <Link to="/" className="logo">
                <img src={PoapLogo} alt="POAP" />
              </Link>
            </div>
            <div className="col-xs-6 col-sm-6 col-md-6">
              <p className="page-title">BackOffice</p>
            </div>
          </div>
        </header>
        <main className="app-content">
          <div className="container">
            {this.state.loginFailed ? (
              <div className="bk-msg-error">Login Failed</div>
            ) : (
                <Loading />
              )}
          </div>
        </main>
      </>
    );
  }
}

export const Callback = withAuth(Callback_);
