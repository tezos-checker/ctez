import { ValueOf } from './helper';

export const MODAL_NAMES = {
  CREATE_OVEN: 'create-oven',
  TRACK_OVEN: 'track-oven',
} as const;

export type TModalNames = ValueOf<typeof MODAL_NAMES>;
