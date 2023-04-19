import { createSlice, PayloadAction, Reducer } from '@reduxjs/toolkit';

// Enums
import { StoreNameEnum } from '@extension/enums';

// Thunks
import {
  clearSessionsThunk,
  fetchSessionsThunk,
  removeAuthorizedAddressThunk,
  removeSessionThunk,
  setSessionThunk,
} from './thunks';

// Types
import { ISession } from '@extension/types';
import { IRemoveAuthorizedAddressResult, ISessionsState } from './types';

// Utils
import { getInitialState, upsertSessions } from './utils';

const slice = createSlice({
  extraReducers: (builder) => {
    /** Clear sessions **/
    builder.addCase(clearSessionsThunk.fulfilled, (state: ISessionsState) => {
      state.items = [];
      state.saving = false;
    });
    builder.addCase(clearSessionsThunk.pending, (state: ISessionsState) => {
      state.saving = true;
    });
    builder.addCase(clearSessionsThunk.rejected, (state: ISessionsState) => {
      state.saving = false;
    });
    /** Fetch sessions **/
    builder.addCase(
      fetchSessionsThunk.fulfilled,
      (state: ISessionsState, action: PayloadAction<ISession[]>) => {
        state.items = action.payload;
        state.fetching = false;
      }
    );
    builder.addCase(fetchSessionsThunk.pending, (state: ISessionsState) => {
      state.fetching = true;
    });
    builder.addCase(fetchSessionsThunk.rejected, (state: ISessionsState) => {
      state.fetching = false;
    });
    /** Remove authorized address **/
    builder.addCase(
      removeAuthorizedAddressThunk.fulfilled,
      (
        state: ISessionsState,
        action: PayloadAction<IRemoveAuthorizedAddressResult>
      ) => {
        state.items = upsertSessions(state.items, action.payload.update) // update the sessions
          .filter(
            (session) =>
              !action.payload.remove.some((value) => value === session.id)
          ); // filter out the removed sessions
        state.saving = false;
      }
    );
    builder.addCase(
      removeAuthorizedAddressThunk.pending,
      (state: ISessionsState) => {
        state.saving = true;
      }
    );
    builder.addCase(
      removeAuthorizedAddressThunk.rejected,
      (state: ISessionsState) => {
        state.saving = false;
      }
    );
    /** Remove session **/
    builder.addCase(
      removeSessionThunk.fulfilled,
      (state: ISessionsState, action: PayloadAction<string>) => {
        state.items = state.items.filter(
          (value) => value.id !== action.payload
        );
        state.saving = false;
      }
    );
    builder.addCase(removeSessionThunk.pending, (state: ISessionsState) => {
      state.saving = true;
    });
    builder.addCase(removeSessionThunk.rejected, (state: ISessionsState) => {
      state.saving = false;
    });
    /** Set session **/
    builder.addCase(
      setSessionThunk.fulfilled,
      (state: ISessionsState, action: PayloadAction<ISession>) => {
        state.items = upsertSessions(state.items, [action.payload]);
        state.saving = false;
      }
    );
    builder.addCase(setSessionThunk.pending, (state: ISessionsState) => {
      state.saving = true;
    });
    builder.addCase(setSessionThunk.rejected, (state: ISessionsState) => {
      state.saving = false;
    });
  },
  initialState: getInitialState(),
  name: StoreNameEnum.Sessions,
  reducers: {
    noop: () => {
      return;
    },
  },
});

export const reducer: Reducer = slice.reducer;