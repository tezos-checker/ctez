import axios, { AxiosResponse } from "axios";
import { useQuery } from "react-query";
import {
  CtezStatsGql, OvenDonutGql, OvensSummaryGql, OvenTransactionGql, OvenTransactionDtoGql, OvenTvlGql,
  SwapTransactionsGql, TradeVolumeGql, AddLiquidityTransactionsGql, AddLiquidityTransactionsDto,
  RemoveLiquidityTransactionsDto, RemoveLiquidityTransactionsGql, CollectFromLiquidityTransactionsDto, CollectFromLiquidityTransactionsGql, AmmTvlGql
} from "../interfaces/analytics";
import { getBaseStats } from "./contracts";
import { INDEXER_URL as GQL_API_URL } from "../utils/globals"; 
import { getOvenCtezOutstandingAndFeeIndex } from "../utils/ovenUtils";

const getGqlResponse = async (query: string): Promise<AxiosResponse<any>> => {
  return axios({
    url: GQL_API_URL,
    method: "POST",
    data: {
      query
    }
  });
}

const getCountGql = async (entity: string, args = ''): Promise<number> => {
  const header = `${entity}${args && `(${args})`}`;
  const query = `
    query {
      ${header} {
        aggregate {
          count
        }
      }
    }
  `;

  const response = await getGqlResponse(query);
  return response.data.data[entity].aggregate.count as number;
}

const getBatchesGql = async (count: number, queryTemplate: string, batchSize = 1000): Promise<AxiosResponse<any>[]> => {
  const chunkPromises = Array.from(Array(Math.ceil(count / batchSize)), (_, i) => {
    const chunkQuery = queryTemplate
      .replace('<LIMIT>', batchSize.toString())
      .replace('<OFFSET>', (i * batchSize).toString());

    return getGqlResponse(chunkQuery);
  });

  return Promise.all(chunkPromises);
}

export const useCtezGraphGql = (range: 'day' | 'month' | 'hour') => {
  return useQuery<CtezStatsGql[], Error>(
    ['ctez_graph_gql', range],
    async () => {
      const entity = `protocol_price_bucket_${range}`;
      const count = await getCountGql(`${entity}_aggregate`);
      const query = `
        query {
          ${entity}(where: {partial: {_is_null: true}}, order_by: {timestamp: asc}, offset: <OFFSET>, limit: <LIMIT>) {
            timestamp
            current_avg_price: ctez_avg_price
            target_price
            annual_drift_percent
            ctez_sell_price
            ctez_buy_price
          }
        }
      `;

      const chunks = await getBatchesGql(count, query);
      return chunks.flatMap(response => response.data.data[entity]);
    }
  );
};

export const useCtezGraphCurrentPointGql = () => {
  return useQuery<CtezStatsGql, Error>(
    'ctez_graph_current_point',
    async () => {
      const baseStats = await getBaseStats();
      const currentPoint: CtezStatsGql = {
        id: 'now-now-now',
        timestamp: new Date().toISOString(),
        target_price: Number(baseStats.currentTarget.toFixed(6)),
        annual_drift_percent: Number(baseStats.currentAnnualDrift.toFixed(2)),
        ctez_buy_price: Number(baseStats.currentCtezBuyPrice.toFixed(6)),
        ctez_sell_price: Number(baseStats.currentCtezSellPrice.toFixed(6)),
        current_avg_price: Number(baseStats.currentAvgPrice.toFixed(6))
      };

      return currentPoint;
    },
    { refetchInterval: 30_000 },
  );
};

export const useOvensTvlGraphGql = (range: 'day' | 'month' | 'hour') => {
  return useQuery<OvenTvlGql[], Error>(
    ['ovens_tvl_gql', range],
    async () => {
      const entry = `ovens_tvl_bucket_${range}`;
      const filter = 'where: {timestamp: {_gte: "2018-07-01", _lte: "NOW()"}, partial: {_is_null: true}}';
      const count = await getCountGql(`${entry}_aggregate`, filter);
      const query = `
        query {
          ${entry}(${filter}, order_by: {timestamp: asc}, offset: <OFFSET>, limit: <LIMIT>) {
            timestamp
            tvl: tvl_usd
          }
        }
      `;
      const chunks = await getBatchesGql(count, query);
      return chunks.flatMap(response => response.data.data[entry]);
    }
  );
};

export const getOvensSummaryGql = async () => {
  const entity = 'oven_summary';
  const response = await axios({
    url: GQL_API_URL,
    method: "POST",
    data: {
      query: `
        query {
          ${entity} {
            collateral_locked
            collateral_ratio
            created
            liquidated
            total
            total_debt
          }
        }
      `
    }
  });

  return response.data.data[entity][0];
};

export const useOvensSummaryGql = () => {
  return useQuery<OvensSummaryGql, Error>(
    'ovens_summary_gql',
    getOvensSummaryGql,
    { refetchInterval: 30_000 },
  );
};

export const getTezosPriceGql = async () => {
  const entity = 'xtz_block_quote'
  const response = await axios({
    url: GQL_API_URL,
    method: "POST",
    data: {
      query: `
        query {
          ${entity} (order_by: {level: desc}, limit: 1) {
            usd
          }
        }
      `
    }
  });

  return response.data.data[entity][0].usd;
};

export const useTezosPriceGql = () => {
  return useQuery<number, Error>(
    'tezos_price_gql',
    getTezosPriceGql,
    { refetchInterval: 30_000 },
  );
};

export const useOvensTvlCurrentPointGql = () => {
  return useQuery<OvenTvlGql, Error>(
    'ovens_tvl_current_point',
    async () => {
      const [summary, price] = await Promise.all([getOvensSummaryGql(), getTezosPriceGql()]);

      const currentPoint: OvenTvlGql = {
        id: 'now-now-now',
        timestamp: new Date().toISOString(),
        tvl: Number((summary.collateral_locked * price).toFixed(2))
      }
      return currentPoint;
    },
    { refetchInterval: 30_000 },
  );
};

export const useTopOvensGraphGql = () => {
  return useQuery<OvenDonutGql[], Error>(
    'top_ovens_gql',
    async () => {
      const [response, baseStats] = await Promise.all([
        axios({
          url: GQL_API_URL,
          method: "POST",
          data: {
            query: `
              query {
                oven(order_by: {ctez_outstanding: desc}, limit: 25) {
                  ctez_outstanding,
                  address
                  id: address 
                  fee_index
                }
                oven_summary {
                  total_debt
                }
              }
            `
          }
        }),
        getBaseStats(),
      ]);


      let topOvensTotalOutstandingCtez = 0;
      const ovens = response.data.data.oven.map((oven: OvenDonutGql) => {
        const { ctezOutstanding: ctezOutstandingNat } = getOvenCtezOutstandingAndFeeIndex(oven.ctez_outstanding * 1e6, oven.fee_index, baseStats.ctezDexFeeIndex, baseStats.tezDexFeeIndex);
        const ctezOutstanding = ctezOutstandingNat / 1e6
        topOvensTotalOutstandingCtez += ctezOutstanding;
        return {
          ...oven,
          ctez_outstanding: ctezOutstanding
        } as OvenDonutGql
      });

      const othersItem: OvenDonutGql = {
        address: 'Others',
        ctez_outstanding: Number(response.data.data.oven_summary[0].total_debt) - topOvensTotalOutstandingCtez,
        fee_index: 0
      };
      ovens.push(othersItem);
      return ovens;
    },
    { refetchInterval: 60_000 },
  );
};

export const useOvensTransactionsGql = (type: 'deposit' | 'burn' | 'mint' | 'withdraw' | 'liquidate') => {
  return useQuery<OvenTransactionGql[], Error>(
    ['ovens_transactions_deposit_gql', type],
    async () => {
      const entity = 'oven_transaction_history';
      const filter = `where: {transaction_type: {_eq: "${type}"}}`;
      const count = 1000; // await getCountGql(`${entity}_aggregate`, filter);
      const query = `
        query {
          ${entity}(${filter}, order_by: {price_history: {timestamp: desc}}, offset: <OFFSET>, limit: <LIMIT>) {
            account
            amount
            id
            transaction_hash
            oven {
              address
            }
            price_history {
              target_price
              timestamp
            }
          }
        }
      `;

      const chunks = await getBatchesGql(count, query, 1000);
      const data = chunks.flatMap(response => response.data.data[entity].map((dto: OvenTransactionDtoGql) => ({
        account: dto.account,
        amount: dto.amount,
        id: dto.id,
        oven_address: dto.oven.address,
        target_price: dto.price_history.target_price,
        transaction_hash: dto.transaction_hash,
        timestamp: dto.price_history.timestamp,
      } as OvenTransactionGql)));

      return data;
    },
    { refetchInterval: 30_000 },
  );
};

export const useAmmTvlGql = (range: 'day' | 'month' | 'hour') => {
  return useQuery<AmmTvlGql[], Error>(
    ['amm_tvl_gql', range],
    async () => {
      const entity = `amm_tvl_bucket_${range}`;
      const filter = 'where: {timestamp: {_gte: "2018-07-01", _lte: "NOW()"}, partial: {_is_null: true}}';
      const count = await getCountGql(`${entity}_aggregate`, filter);
      const query = `
        query {
         ${entity}(${filter}, order_by: {timestamp: asc}, offset: <OFFSET>, limit: <LIMIT>) {
            timestamp
            tvl: tvl_usd
          }
        }
      `;
      const chunks = await getBatchesGql(count, query);
      const data = chunks.flatMap(response => response.data.data[entity]);

      return data;
    }
  );
};

export const useAmmTvlCurrentPointGql = (range: 'day' | 'month' | 'hour') => {
  return useQuery<AmmTvlGql, Error>(
    ['amm_tvl_current_point_gql', range],
    async () => {
      const entity = `amm_tvl_bucket_${range}`;
      const filter = 'where: {timestamp: {_gte: "2018-07-01", _lte: "NOW()"}, partial: {_eq: true}}';
      const query = `
        query {
         ${entity}(${filter}, order_by: {timestamp: asc}, offset: <OFFSET>, limit: <LIMIT>) {
            timestamp
            tvl: tvl_usd
          }
        }
      `;
      const chunks = await getBatchesGql(1, query);
      const data = chunks.flatMap(response => response.data.data[entity])[0];

      return data;
    }
  );
};

export const useTradeVolumeGql = (range: 'day' | 'month' | 'hour') => {
  return useQuery<TradeVolumeGql[], Error>(
    ['trade_volume_gql', range],
    async () => {
      const entry = `trade_volume_bucket_${range}`;
      const filter = 'where: {timestamp: {_gte: "2018-07-01", _lte: "NOW()"}, partial: {_is_null: true}}';
      const count = await getCountGql(`${entry}_aggregate`, filter);
      const query = `
        query {
          ${entry}(${filter}, order_by: {timestamp: asc}, offset: <OFFSET>, limit: <LIMIT>) {
            timestamp
            volume_usd
          }
        }
      `;
      const chunks = await getBatchesGql(count, query);
      const data = chunks.flatMap(response => response.data.data[entry]);

      return data;
    }
  );
};

export const useTradeVolumeCurrentPointGql = (range: 'day' | 'month' | 'hour') => {
  return useQuery<TradeVolumeGql, Error>(
    ['trade_volume_current_point_gql', range],
    async () => {
      const entry = `trade_volume_bucket_${range}`;
      const filter = 'where: {timestamp: {_gte: "2018-07-01", _lte: "NOW()"}, partial: {_eq: true}}';
      const query = `
        query {
          ${entry}(${filter}, order_by: {timestamp: asc}, offset: <OFFSET>, limit: <LIMIT>) {
            timestamp
            volume_usd
          }
        }
      `;
      const chunks = await getBatchesGql(1, query);
      const data = chunks.flatMap(response => response.data.data[entry])[0];

      return data;
    }
  );
};

export const useSwapTransactionsGql = () => {
  return useQuery<SwapTransactionsGql[], Error>(
    ['swap_transactions_gql'],
    async () => {
      const entity = 'swap_transaction_history';
      const count = 1000; // await getCountGql(`${entity}_aggregate');
      const query = `
        query {
          ${entity}(order_by: {timestamp: desc}, offset: <OFFSET>, limit: <LIMIT>) {
            id
            account
            amount_ctez
            amount_xtz
            direction
            price
            timestamp
            transaction_hash
          }
        }
      `;
      const chunks = await getBatchesGql(count, query, 1000);
      const data = chunks.flatMap(response => response.data.data[entity]);

      return data;
    },
    { refetchInterval: 30_000 },
  );
};

export const useAddLiquidityTransactionsGql = () => {
  return useQuery<AddLiquidityTransactionsGql[], Error>(
    ['add_liquidity_transactions_gql'],
    async () => {
      const entity = 'liquidity_add_transaction_history';
      const count = 1000; // await getCountGql(`${entity}_aggregate`);
      const query = `
        query {
          ${entity}(order_by: {price_history: {timestamp: desc}}, offset: <OFFSET>, limit: <LIMIT>) {
            account
            dex
            self_amount
            id
            price_history {
              timestamp
            }
            transaction_hash
          }
        }
      `;
      const chunks = await getBatchesGql(count, query, 1000);
      const data = chunks.flatMap(response => response.data.data[entity].map((dto: AddLiquidityTransactionsDto) => ({
        id: dto.id,
        account: dto.account,
        dex: dto.dex,
        self_amount: dto.self_amount,
        timestamp: dto.price_history.timestamp,
        transaction_hash: dto.transaction_hash
      } as AddLiquidityTransactionsGql)));

      return data;
    },
    { refetchInterval: 30_000 },
  );
};

export const useRemoveLiquidityTransactionsGql = () => {
  return useQuery<RemoveLiquidityTransactionsGql[], Error>(
    ['remove_liquidity_transactions_gql'],
    async () => {
      const entity = 'liquidity_remove_transaction_history';
      const count = 1000 // await getCountGql(`${entity}_aggregate`);
      const query = `
        query {
          ${entity}(order_by: {price_history: {timestamp: desc}}, offset: <OFFSET>, limit: <LIMIT>) {
            dex
            account
            id
            event {
              self_redeemed
              proceeds_redeemed
              subsidy_redeemed
            }
            transaction_hash
            price_history {
              timestamp
            }
          }
        }
      `;
      const chunks = await getBatchesGql(count, query, 1000);
      const data = chunks.flatMap(response => response.data.data[entity].map((dto: RemoveLiquidityTransactionsDto) => ({
        id: dto.id,
        account: dto.account,
        dex: dto.dex,
        self_redeemed: dto.event.self_redeemed,
        proceeds_redeemed: dto.event.proceeds_redeemed,
        subsidy_redeemed: dto.event.subsidy_redeemed,
        timestamp: dto.price_history.timestamp,
        transaction_hash: dto.transaction_hash
      } as RemoveLiquidityTransactionsGql)));

      return data;
    },
    { refetchInterval: 30_000 },
  );
};

export const useCollectFromLiquidityTransactionsGql = () => {
  return useQuery<CollectFromLiquidityTransactionsGql[], Error>(
    ['collect_from_liquidity_transactions_gql'],
    async () => {
      const entity = 'liquidity_collect_transaction_history';
      const count = 1000; // await getCountGql(`${entity}_aggregate`);
      const query = `
        query {
          ${entity}(order_by: {price_history: {timestamp: desc}}, offset: <OFFSET>, limit: <LIMIT>) {
            dex
            account
            id
            event {
              proceeds_redeemed
              subsidy_redeemed
            }
            transaction_hash
            price_history {
              timestamp
            }
          }
        }
      `;
      const chunks = await getBatchesGql(count, query, 1000);
      const data = chunks.flatMap(response => response.data.data[entity].map((dto: CollectFromLiquidityTransactionsDto) => ({
        id: dto.id,
        account: dto.account,
        dex: dto.dex,
        proceeds_withdrawn: dto.event.proceeds_redeemed,
        subsidy_withdrawn: dto.event.subsidy_redeemed,
        timestamp: dto.price_history.timestamp,
        transaction_hash: dto.transaction_hash
      } as CollectFromLiquidityTransactionsGql)));

      return data;
    },
    { refetchInterval: 30_000 },
  );
};
