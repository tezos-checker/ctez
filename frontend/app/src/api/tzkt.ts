import axios from 'axios';
import { AllOvenDatum, Baker, Block, CTezTzktStorage } from '../interfaces';
import { CTEZ_ADDRESS, CTEZ_CONTRACT_BIGMAP, TZKT_API, TZKT_PORT } from '../utils/globals';

const get = async <T>(
  endpoint: string,
  queryParams?: Record<string, any>,
  userAddress?: string
): Promise<T> => {
  // let tzktUrl = TZKT_API;
  // let tzktPort = TZKT_PORT;
  // if (userAddress) {
  //   tzktUrl = getTzKtURL(userAddress) ?? TZKT_API;
  //   tzktPort = getTzKtPort(userAddress) ?? TZKT_PORT;
  // }
  return (await axios.get(`${TZKT_API}:${TZKT_PORT}/v1/${endpoint}`, { params: queryParams })).data;
};

const getAllChunks = async <T>(
  endpoint: string,
  limit: number,
  queryParams?: Record<string, any>,
  userAddress?: string
): Promise<T[]> => {
  let offset = 0;
  let chunk: T[] = [];
  const result: T[] = [];
  do {
    // eslint-disable-next-line no-await-in-loop
    chunk = await get<T[]>(
      endpoint,
      { ...queryParams, limit: limit.toString(), offset: offset.toString() },
      userAddress
    );
    result.push(...chunk)
    offset += limit;
  } while (chunk.length)
  return result;
}

export const getTimeStampOfBlock = async (block: number) => {
  const response = await get(`blocks/${block}`) as any;

  return response.timestamp;
};

export const getDelegates = async (userAddress?: string): Promise<Baker[]> => {
  const data: string[][] = await get(
    'delegates?active=true&select.values=alias,address&sort.desc=stakingBalance&limit=10000',
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
  const data = await getAllChunks<AllOvenDatum>(
    `bigmaps/${CTEZ_CONTRACT_BIGMAP}/keys`,
    10000
  );
  return data;
};

export const getUserOvensAPI = async (userAddress: string, bigMapId: string): Promise<AllOvenDatum[]> => {
  const data = await getAllChunks<AllOvenDatum>(
    `bigmaps/${bigMapId}/keys`,
    1000,
    { 'key.owner': userAddress },
  );
  return data;
};

export const getOvenByAddressAPI = async (ovenAddress: string, ctezContractBigMap = CTEZ_CONTRACT_BIGMAP): Promise<AllOvenDatum> => {
  const data = await getAllChunks<AllOvenDatum>(
    `bigmaps/${ctezContractBigMap}/keys`,
    1000,
    {
      'value.address': ovenAddress,
    },
  );
  return data?.[0];
};
