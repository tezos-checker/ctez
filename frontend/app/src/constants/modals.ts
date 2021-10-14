import { ValueOf } from './helper';

export const MODAL_NAMES = {
  CREATE_OVEN: 'create-oven',
  TRACK_OVEN: 'track-oven',
  TX_SUBMITTED: 'tx-submitted',
} as const;

export type TModalNames = ValueOf<typeof MODAL_NAMES>;
