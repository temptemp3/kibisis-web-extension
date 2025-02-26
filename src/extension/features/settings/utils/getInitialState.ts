// types
import { ISettingsState } from '../types';

export default function getInitialState(): ISettingsState {
  return {
    advanced: {
      allowBetaNet: false,
      allowDidTokenFormat: false,
      allowTestNet: false,
    },
    appearance: {
      theme: 'light',
    },
    fetching: false,
    general: {
      preferredBlockExplorerId: null,
      selectedNetworkGenesisHash: null,
    },
    saving: false,
  };
}
