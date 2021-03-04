import axios from 'axios';
import { Baker } from '../interfaces/tzkt';
import { TZKT_API } from '../utils/globals';

const get = async <T>(endpoint: string): Promise<T> => {
  return (await axios.get(`${TZKT_API}/${endpoint}`)).data;
};

export const getDelegates = async (): Promise<Baker[]> => {
  const data: string[][] = await get(
    'delegates?active=true&offset=0&limit=100&select.values=alias,address&sort.desc=stakingBalance',
  );
  return data.map(([name, address]) => ({ name, address }));
};
