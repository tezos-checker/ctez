import axios from 'axios';
import { TZKT_API } from '../utils/globals';

const get = async <T>(endpoint: string): Promise<T> => {
  return (await axios.get(`${TZKT_API}/${endpoint}`)).data;
};

export const getDelegates = async (): Promise<string[]> => {
  return get(
    'delegates?active=true&offset=0&limit=100&select.values=address&sort.desc=stakingBalance',
  );
};
