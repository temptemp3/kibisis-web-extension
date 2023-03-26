import { IWalletAccount } from '@agoralabs-sh/algorand-provider';
import { AsyncThunk, createAsyncThunk } from '@reduxjs/toolkit';
import browser from 'webextension-polyfill';

// Enums
import { EventNameEnum, MessagesThunkEnum } from '../../../enums';

// Errors
import { BaseSerializableError } from '../../../errors';

// Events
import { ExtensionEnableResponseEvent } from '../../../events';

// Types
import { IAccount, ILogger, IMainRootState, ISession } from '../../../types';

interface IPayload {
  error: BaseSerializableError | null;
  session: ISession | null;
  tabId: number;
}

const sendEnableResponse: AsyncThunk<
  void, // return
  IPayload, // args
  Record<string, never>
> = createAsyncThunk<void, IPayload, { state: IMainRootState }>(
  MessagesThunkEnum.SendEnableResponse,
  async ({ error, session, tabId }, { getState }) => {
    const accounts: IAccount[] = getState().accounts.items;
    const functionName: string = 'sendEnableResponse';
    const logger: ILogger = getState().application.logger;
    let message: ExtensionEnableResponseEvent;

    logger.debug(
      `${functionName}(): sending "${EventNameEnum.ExtensionEnableResponse}" message to content script`
    );

    // send the error response to the background script & the content script
    if (error) {
      message = new ExtensionEnableResponseEvent(null, error);

      await Promise.all([
        browser.runtime.sendMessage(message),
        browser.tabs.sendMessage(tabId, message),
      ]);

      return;
    }

    if (session) {
      message = new ExtensionEnableResponseEvent(
        {
          accounts: session.authorizedAddresses.map<IWalletAccount>(
            (address) => {
              const account: IAccount | null =
                accounts.find((value) => value.address === address) || null;

              return {
                address,
                ...(account?.name && {
                  name: account.name,
                }),
              };
            }
          ),
          genesisHash: session.genesisHash,
          genesisId: session.genesisId,
          sessionId: session.id,
        },
        null
      );

      await Promise.all([
        // send the response to the background
        browser.runtime.sendMessage(message),
        // send the response to the content script
        browser.tabs.sendMessage(tabId, message),
      ]);

      return;
    }
  }
);

export default sendEnableResponse;