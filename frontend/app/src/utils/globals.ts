import { NetworkType } from '../interfaces';

export const APP_NAME = process.env.REACT_APP_APP_NAME || 'CTez';
export const NETWORK = (process.env.REACT_APP_NETWORK_TYPE || 'florencenet') as NetworkType;
export const CFMM_ADDRESS = process.env.REACT_APP_CFMM_CONTRACT;
export const CTEZ_ADDRESS = process.env.REACT_APP_CTEZ_CONTRACT;
export const CTEZ_FA12_ADDRESS = process.env.REACT_APP_CTEZ_FA12_CONTRACT;
export const LQT_FA12_ADDRESS = process.env.REACT_APP_LQT_FA12_CONTRACT;
export const RPC_URL = process.env.REACT_APP_RPC_URL ?? 'http://localhost';
export const RPC_PORT = process.env.REACT_APP_RPC_PORT ?? '443';
export const TZKT_API = process.env.REACT_APP_TZKT ?? 'http://localhost';
export const TZKT_PORT = process.env.REACT_APP_TZKT_PORT ?? '443';
export const CONTRACT_DEPLOYMENT_DATE = process.env.REACT_APP_CONTRACT_DEPLOYMENT_DATE || '';
export const CTEZ_CONTRACT_BIGMAP = process.env.REACT_APP_CTEZ_CONTRACT_BIGMAP ?? 30161;
export const TOTAL_OVEN_IMAGES = 11;
export const DEFAULT_SLIPPAGE = 0.2;
export const DEFAULT_DEALINE = 20;
