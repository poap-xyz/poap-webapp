import React, { FC, Fragment, useEffect, useState } from 'react';
import { Switch, Route, RouteComponentProps, Link } from 'react-router-dom';
import { Formik, Form, Field, FieldProps, ErrorMessage } from 'formik';
import classNames from 'classnames';
import delve from 'dlv';

/* Helpers */
import { getTokenInfoWithENS, TokenInfo, burnToken } from '../api';
import { BurnFormSchema } from '../lib/schemas';
/* Components */
import { SubmitButton } from '../components/SubmitButton';
import { Loading } from '../components/Loading';

const BurnPage: FC = () => {
  return (
    <Switch>
      <Route exact path="/admin/burn" component={BurnForm} />
      <Route exact path="/admin/burn/:tokenId" component={BurnToken} />
    </Switch>
  );
};

const BurnForm: FC<RouteComponentProps> = ({ history }) => {
  return (
    <div className="content-event aos-init aos-animate" data-aos="fade-up" data-aos-delay="300">
      <p>From here you will be able to search and burn any token you desire</p>
      <Formik
        initialValues={{ tokenId: '' }}
        validationSchema={BurnFormSchema}
        onSubmit={values => history.push(`/admin/burn/${values.tokenId}`)}
      >
        {({ dirty, isValid, isSubmitting }) => (
          <Form className="login-form">
            <Field
              name="tokenId"
              render={({ field, form }: FieldProps) => (
                <input
                  type="text"
                  autoComplete="off"
                  placeholder="178223"
                  className={classNames(!!form.errors[field.name] && 'error')}
                  {...field}
                />
              )}
            />
            <ErrorMessage name="token" component="p" className="bk-error" />
            <SubmitButton
              text="Find token"
              isSubmitting={isSubmitting}
              canSubmit={isValid && dirty}
            />
          </Form>
        )}
      </Formik>
    </div>
  );
};

const BurnToken: FC<RouteComponentProps> = props => {
  const tokenId = delve(props, 'match.params.tokenId');

  const [token, setToken] = useState<null | TokenInfo>(null);
  const [loadingTokenInfo, setLoadingTokenInfo] = useState<null | boolean>(null);
  const [errorTokenInfo, setErrorTokenInfo] = useState<null | Error>(null);

  const [successBurn, setSuccessBurn] = useState<null | boolean>(null);
  const [loadingBurn, setLoadingBurn] = useState<null | boolean>(null);
  const [errorBurn, setErrorBurn] = useState<null | Error>(null);

  useEffect(() => {
    setLoadingTokenInfo(true);
    getTokenInfoWithENS(tokenId)
      .then(token => setToken(token))
      .catch(error => setErrorTokenInfo(error))
      .finally(() => setLoadingTokenInfo(false));
  }, [tokenId]);

  const handleBurn = async (tokenId: string) => {
    if (loadingBurn) return;

    try {
      setLoadingBurn(true);
      await burnToken(tokenId);
      setSuccessBurn(true);
    } catch (error) {
      setErrorBurn(error.message);
    } finally {
      setLoadingBurn(false);
    }
  };

  return (
    <div className="content-event aos-init aos-animate" data-aos="fade-up" data-aos-delay="300">
      <h2>Token Info</h2>

      {loadingTokenInfo && <Loading />}

      {token && typeof token.event.image_url === 'string' && (
        <div className="card">
          <div className="content">
            <div>
              <img src={token.event.image_url} alt={token.event.description} className="avatar" />
            </div>
            <div>
              <h3 className="title">{token.event.name}</h3>
              <p className="subtitle">{token.event.description}</p>
              <p className="info">{token.ownerText}</p>
            </div>
          </div>

          <div className="actions">
            {loadingBurn && <Loading />}
            {!loadingBurn && !successBurn && (
              <button
                className="action-btn"
                disabled={successBurn || Boolean(errorBurn)}
                onClick={() => handleBurn(token.tokenId)}
              >
                Burn Token
              </button>
            )}
          </div>
        </div>
      )}

      <Fragment>
        {errorTokenInfo && <p className="bk-msg-error">Couldn't find token {tokenId}</p>}
        {errorBurn && <p className="bk-msg-error">Couldn't burn token {tokenId}</p>}
        {successBurn && <p className="bk-msg-ok">Token {tokenId} was successfully burned!</p>}

        {(errorTokenInfo || errorBurn || successBurn) && (
          <Link to={`/admin/burn`}>
            <button className="btn">Find another token</button>
          </Link>
        )}
      </Fragment>
    </div>
  );
};

export { BurnPage };
