import { useEffect, useState } from 'react';

// features
import { IAccountTransaction } from '@extension/features/transactions';

// selectors
import {
  useSelectAccounts,
  useSelectAccountTransactions,
  useSelectSelectedNetwork,
} from '@extension/selectors';

// servcies
import { AccountService } from '@extension/services';

// types
import {
  IAccount,
  IAccountInformation,
  INetwork,
  ITransactions,
} from '@extension/types';
import { IUseTransactionPageOptions, IUseTransactionPageState } from './types';

export default function useTransactionPage({
  address,
  onError,
  transactionId,
}: IUseTransactionPageOptions): IUseTransactionPageState {
  // selectors
  const accounts: IAccount[] = useSelectAccounts();
  const network: INetwork | null = useSelectSelectedNetwork();
  const accountTransactions: IAccountTransaction[] =
    useSelectAccountTransactions();
  // state
  const [account, setAccount] = useState<IAccount | null>(null);
  const [accountInformation, setAccountInformation] =
    useState<IAccountInformation | null>(null);
  const [transaction, setTransaction] = useState<ITransactions | null>(null);

  // 1. when we have the address and accounts, get the account
  useEffect(() => {
    let selectedAccount: IAccount | null;

    if (address && accounts.length > 0) {
      selectedAccount =
        accounts.find(
          (value) =>
            AccountService.convertPublicKeyToAlgorandAddress(
              value.publicKey
            ) === address
        ) || null;

      // if there is no account, we have an error
      if (!selectedAccount) {
        return onError();
      }

      setAccount(selectedAccount);
    }
  }, [address, accounts]);
  // 2a. when the account has been found, and we have the selected network, get the account information
  useEffect(() => {
    if (account && network) {
      setAccountInformation(
        AccountService.extractAccountInformationForNetwork(account, network) ||
          null
      );
    }
  }, [account, network]);
  // 2b. when the account has been found, get the transaction information
  useEffect(() => {
    let accountTransaction: IAccountTransaction | null;
    let selectedTransaction: ITransactions | null;

    if (account) {
      accountTransaction =
        accountTransactions.find((value) => value.accountId === account.id) ||
        null;

      if (accountTransaction) {
        selectedTransaction =
          accountTransaction.transactions.find(
            (value) => value.id === transactionId
          ) || null;

        setTransaction(selectedTransaction);
      }
    }
  }, [account]);

  return {
    account,
    accountInformation,
    network,
    transaction,
  };
}
