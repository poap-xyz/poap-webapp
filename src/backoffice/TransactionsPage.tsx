import React, { FC, useState, useEffect } from 'react';
import classNames from 'classnames';

/* Libraries */
import ReactModal from 'react-modal';
import ReactPaginate from 'react-paginate';
import { ErrorMessage, Field, FieldProps, Form, Formik, FormikActions } from 'formik';

/* Helpers */
import { GasPriceSchema } from '../lib/schemas';
import { TX_STATUS, LAYERS, etherscanLinks, blockscoutLinks } from '../lib/constants';
import { Transaction, getTransactions, bumpTransaction, AdminAddress, getSigners } from '../api';
import { convertFromGWEI, convertToGWEI, reduceAddress } from '../lib/helpers';
/* Components */
import { Loading } from '../components/Loading';
import { SubmitButton } from '../components/SubmitButton';
import { TxStatus } from '../components/TxStatus';
/* Assets */
import gas from '../images/gas-station.svg';
import FilterChip from '../components/FilterChip';
import FilterSelect from '../components/FilterSelect';

type PaginateAction = {
  selected: number;
};

type GasPriceFormValues = {
  gasPrice: string;
};

const TransactionsPage: FC = () => {
  const [page, setPage] = useState<number>(0);
  const [limit, setLimit] = useState<number>(10);
  const [total, setTotal] = useState<number>(0);
  const [signerFilter, setSignerFilter] = useState<string>('');
  const [signers, setSigners] = useState<AdminAddress[]>([]);
  const [statusList, setStatusList] = useState<string[]>([]);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [selectedTx, setSelectedTx] = useState<null | Transaction>(null);
  const [isFetchingTx, setIsFetchingTx] = useState<null | boolean>(null);
  const [transactions, setTransactions] = useState<null | Transaction[]>(null);
  const [isFailedSelected, setIsFailedSelected] = useState<boolean>(false);
  const [isPassedSelected, setIsPassedSelected] = useState<boolean>(false);
  const [isPendingSelected, setIsPendingSelected] = useState<boolean>(false);

  useEffect(() => {
    if (signers.length === 0) {
      getSigners().then((data) => {
        setSigners(data);
      });
    }
  }, []); /* eslint-disable-line react-hooks/exhaustive-deps */

  useEffect(() => {
    fetchTransactions();
  }, [page]); /* eslint-disable-line react-hooks/exhaustive-deps */

  useEffect(() => {
    setPage(0);
    fetchTransactions();
  }, [statusList, signerFilter, limit]); /* eslint-disable-line react-hooks/exhaustive-deps */

  const fetchTransactions = () => {
    setIsFetchingTx(true);
    setTransactions(null);

    getTransactions(limit, page * limit, statusList.join(','), signerFilter)
      .then((response) => {
        if (!response) return;
        setTransactions(response.transactions);
        setTotal(response.total);
      })
      .catch((error) => console.error(error))
      .finally(() => setIsFetchingTx(false));
  };

  const handlePageChange = (obj: PaginateAction) => {
    setPage(obj.selected);
  };

  const handleFormSubmit = async (values: GasPriceFormValues, actions: FormikActions<GasPriceFormValues>) => {
    if (!selectedTx) return;
    try {
      actions.setStatus(null);
      actions.setSubmitting(true);

      const gasPriceInWEI = convertFromGWEI(values.gasPrice);
      await bumpTransaction(selectedTx.tx_hash, gasPriceInWEI);
      fetchTransactions();
      closeEditModal();
    } catch (error) {
      let message: any = `Gas price couldn't be changed`;
      if (error.message) {
        message = (
          <span>
            {message}
            <br />
            {error.message}
          </span>
        );
      }
      actions.setStatus({ ok: false, msg: message });
    } finally {
      actions.setSubmitting(false);
    }
  };

  const handleFilterToggle = (status: string) => {
    const _statusList = [...statusList];
    const isStatusInStatusList = _statusList.indexOf(status) > -1;
    const indexOfStatus = _statusList.indexOf(status);

    if (isStatusInStatusList) {
      _statusList.splice(indexOfStatus, 1);
    } else {
      _statusList.push(status);
    }
    setStatusList(_statusList);
  };

  const openEditModal = (transaction: Transaction) => {
    setModalOpen(true);
    setSelectedTx(transaction);
  };

  const closeEditModal = () => {
    setModalOpen(false);
    setSelectedTx(null);
  };

  const handleFailedClick = () => {
    handleFilterToggle('failed');
    setIsFailedSelected(!isFailedSelected);
  };
  const handlePassedClick = () => {
    handleFilterToggle('passed');
    setIsPassedSelected(!isPassedSelected);
  };
  const handlePendingClick = () => {
    handleFilterToggle('pending');
    setIsPendingSelected(!isPendingSelected);
  };
  const handleCreatedByChange = (e: React.ChangeEvent<HTMLSelectElement>): void => {
    const { value } = e.target;
    setSignerFilter(value);
  };
  const handleLimitChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>): void => {
    const { value } = e.target;
    setLimit(parseInt(value, 10));
  };

  return (
    <div className={'admin-table transactions'}>
      <h2>Transactions</h2>
      <div>
        <div className={'filters-container transactions'}>
          <div className={'left-content'}>
            <FilterChip text="Failed" isActive={isFailedSelected} handleOnClick={handleFailedClick} />
            <FilterChip text="Passed" isActive={isPassedSelected} handleOnClick={handlePassedClick} />
            <FilterChip text="Pending" isActive={isPendingSelected} handleOnClick={handlePendingClick} />
          </div>
          <div className={'right-content'}>
            <FilterSelect handleChange={handleCreatedByChange}>
              <option value="">All signers</option>
              {signers.map((signer) => {
                return (
                  <option key={signer.id} value={signer.signer}>
                    {signer.id} - {signer.signer} ({signer.role})
                  </option>
                );
              })}
            </FilterSelect>
          </div>
        </div>
        <div className={'secondary-filters'}>
          Results per page:
          <select onChange={handleLimitChange}>
            <option value={10}>10</option>
            <option value={100}>100</option>
            <option value={1000}>1000</option>
          </select>
        </div>
      </div>
      <div className={'row table-header visible-md'}>
        <div className={'col-md-1 center'}>#</div>
        <div className={'col-md-3'}>Tx Hash</div>
        <div className={'col-md-3'}>Signer</div>
        <div className={'col-md-2'}>Operation</div>
        <div className={'col-md-1 center'}>Status</div>
        <div className={'col-md-2 center'}>Gas Price (GWei)</div>
      </div>
      <div className={'admin-table-row'}>
        {isFetchingTx && <Loading />}

        {transactions &&
          transactions.map((tx, i) => {
            const blockExplorer = tx.layer === LAYERS.layer1 ? etherscanLinks : blockscoutLinks;
            return (
              <div className={`row ${i % 2 === 0 ? 'even' : 'odd'}`} key={tx.id}>
                <div className={'col-md-1 center'}>
                  <span className={'visible-sm'}>#</span>
                  {tx.id}
                </div>
                <div className={'col-md-3'}>
                  <span className={'visible-sm'}>Tx: </span>
                  <a href={blockExplorer.tx(tx.tx_hash)} target={'_blank'}>
                    {tx.tx_hash && reduceAddress(tx.tx_hash)}
                  </a>
                </div>
                <div className={'col-md-3'}>
                  <span className={'visible-sm'}>Signer: </span>
                  <a href={blockExplorer.address(tx.signer)} target={'_blank'}>
                    {tx.signer && reduceAddress(tx.signer)}
                  </a>
                  <span className={'nonce'} title={'Nonce'}>
                    {tx.nonce}
                  </span>
                </div>
                <div className={'col-md-2 capitalize'}>
                  <span className={'visible-sm'}>Operation: </span>
                  {tx.operation}
                </div>
                <div className={'col-md-1 center'}>
                  <TxStatus status={tx.status} />
                </div>
                <div className={'col-md-2 center'}>
                  <span className={'visible-sm'}>Gas Price (GWei): </span>
                  {tx.gas_price && convertToGWEI(tx.gas_price)}
                  {tx.status === TX_STATUS.pending && (
                    <img src={gas} alt={'Edit'} className={'edit-icon'} onClick={() => openEditModal(tx)} />
                  )}
                </div>
              </div>
            );
          })}

        {transactions && transactions.length === 0 && !isFetchingTx && (
          <div className={'no-results'}>No transactions found</div>
        )}
      </div>
      {total > 10 && (
        <div className={'pagination'}>
          <ReactPaginate
            pageCount={Math.ceil(total / limit)}
            marginPagesDisplayed={2}
            pageRangeDisplayed={5}
            forcePage={page}
            activeClassName={'active'}
            onPageChange={handlePageChange}
          />
        </div>
      )}
      <ReactModal isOpen={modalOpen} shouldFocusAfterRender={true}>
        <div>
          <h3>Edit Gas Price</h3>
          {selectedTx && (
            <>
              <div className={'description'}>
                Modify gas price for tx{' '}
                <a href={etherscanLinks.tx(selectedTx.tx_hash)} target={'_blank'}>
                  {selectedTx.tx_hash}
                </a>
                . Operation: {selectedTx.operation}
              </div>
              <Formik
                enableReinitialize
                onSubmit={handleFormSubmit}
                initialValues={{ gasPrice: convertToGWEI(selectedTx.gas_price) }}
                validationSchema={GasPriceSchema}
              >
                {({ dirty, isValid, isSubmitting, status, touched }) => {
                  return (
                    <Form className="price-gas-modal-form">
                      <Field
                        name="gasPrice"
                        render={({ field, form }: FieldProps) => {
                          return (
                            <input
                              type="text"
                              autoComplete="off"
                              className={classNames(!!form.errors[field.name] && 'error')}
                              placeholder={'Gas price in GWEI'}
                              {...field}
                            />
                          );
                        }}
                      />
                      <ErrorMessage name="gasPrice" component="p" className="bk-error" />
                      {status && <p className={status.ok ? 'bk-msg-ok' : 'bk-msg-error'}>{status.msg}</p>}
                      <SubmitButton text="Modify gas price" isSubmitting={isSubmitting} canSubmit={isValid && dirty} />
                      <div onClick={closeEditModal} className={'close-modal'}>
                        Cancel
                      </div>
                    </Form>
                  );
                }}
              </Formik>
            </>
          )}
        </div>
      </ReactModal>
    </div>
  );
};

export { TransactionsPage };
