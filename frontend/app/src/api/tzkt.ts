import axios from 'axios';
import { Baker, Block, CTezTzktStorage } from '../interfaces';
import { TZKT_API, CTEZ_ADDRESS } from '../utils/globals';

const get = async <T, P>(endpoint: string, queryParams?: P): Promise<T> => {
  return (await axios.get(`${TZKT_API}/${endpoint}`, { params: queryParams })).data;
};

export const getDelegates = async (): Promise<Baker[]> => {
  const data: string[][] = await get(
    'delegates?active=true&offset=0&limit=100&select.values=alias,address&sort.desc=stakingBalance',
  );
  return data.map(([name, address]) => ({ name, address }));
};

export const getLastBlockOfTheDay = async (date: string): Promise<Block> => {
  const data: Block[] = await get(
    `blocks?timestamp.gt=${date}T00:00:00Z&timestamp.lt=${date}T23:59:59Z&sort.desc=level&limit=1`,
  );
  return data[0];
};

export const getCTezTzktStorage = async (level?: number): Promise<CTezTzktStorage> => {
  const storage: CTezTzktStorage = await get(`contracts/${CTEZ_ADDRESS}/storage`, { level });
  return storage;
};
