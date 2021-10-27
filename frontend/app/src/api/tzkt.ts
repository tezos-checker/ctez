import axios from 'axios';
import { AllOvenDatum, Baker, Block, CTezTzktStorage } from '../interfaces';
import { CTEZ_ADDRESS, CTEZ_CONTRACT_BIGMAP, TZKT_API, TZKT_PORT } from '../utils/globals';

const get = async <T, P>(endpoint: string, queryParams?: P, userAddress?: string): Promise<T> => {
  // let tzktUrl = TZKT_API;
  // let tzktPort = TZKT_PORT;
  // if (userAddress) {
  //   tzktUrl = getTzKtURL(userAddress) ?? TZKT_API;
  //   tzktPort = getTzKtPort(userAddress) ?? TZKT_PORT;
  // }
  return (await axios.get(`${TZKT_API}:${TZKT_PORT}/v1/${endpoint}`, { params: queryParams })).data;
};

export const getDelegates = async (userAddress?: string): Promise<Baker[]> => {
  const data: string[][] = await get(
    'delegates?active=true&offset=0&limit=100&select.values=alias,address&sort.desc=stakingBalance',
    undefined,
    userAddress,
  );
  return data.map(([name, address]) => ({ name, address }));
};

export const getLastBlockOfTheDay = async (date: string, userAddress?: string): Promise<Block> => {
  const data: Block[] = await get(
    `blocks?timestamp.gt=${date}T00:00:00Z&timestamp.lt=${date}T23:59:59Z&sort.desc=level&limit=1`,
    undefined,
    userAddress,
  );
  return data[0];
};

export const getCTezTzktStorage = async (
  level?: number,
  userAddress?: string,
): Promise<CTezTzktStorage> => {
  const storage: CTezTzktStorage = await get(
    `contracts/${CTEZ_ADDRESS}/storage`,
    { level },
    userAddress,
  );
  return storage;
};

export const getAllOvensAPI = async (): Promise<AllOvenDatum[]> => {
  const data = await get<AllOvenDatum[], unknown>(
    `bigmaps/${CTEZ_CONTRACT_BIGMAP}/keys?limit=10000`,
  );
  return data;
};

export const getUserOvensAPI = async (userAddress: string): Promise<AllOvenDatum[]> => {
  const data = await get<AllOvenDatum[], { 'key.owner': string }>(
    `bigmaps/${CTEZ_CONTRACT_BIGMAP}/keys`,
    { 'key.owner': userAddress },
  );
  return data;
};

export const getOvenByAddressAPI = async (ovenAddress: string): Promise<AllOvenDatum> => {
  const data = await get<AllOvenDatum[], { 'value.address': string }>(
    `bigmaps/${CTEZ_CONTRACT_BIGMAP}/keys`,
    {
      'value.address': ovenAddress,
    },
  );
  return data?.[0];
};
