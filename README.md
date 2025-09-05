# ctez
Ctez contract and frontend

## IMPORTANT

**The code within is currently unverified, unaudited, and untested.
You are absolutely mad if you try to use it for anything serious.**

Ctez V2 technical documentation can be [found here](description_v2.md).

## Introduction

The following describes a simplified version of Checker in the special case of tez collateralized by tez. Since 99% of the complexity of Checker comes from handling potentially faulty oracles and liquidation auctions, the resulting system is quite simple. There is no governance involved, the system is completely mechanical and straightforward.

## Target factor

The target factor represents the number of tez that a ctez should be pegged to. It starts out at 1.0, but changes over time. Typically given the current state of baking on the Tezos chain, this target factor might be around 1.05 or 1.06 after a year representing the accrual of more tez through baking. The target evolves over time based on its drift.

## Drift

The drift is a system-wide parameter which varies over time. The relationship between the target and the drift is as follows:

`target[t+dt] = target[t] exp[drift[t] * dt]`

Note that given realistic values of `drift` and `dt`, in general `target[t+dt] = target[t] * (1 + drift[t] * dt)` is an excellent approximation and sufficient for our purposes.

## Ovens

An oven is a smart contract following a certain pattern and controlled by a single user. It lets them place tez in it, pick any delegate they want, and mint ctez.

## Liquidation

If a vault has less tez in collateral than the number of outstanding ctez outstanding times the target factor, times 1.0667 (16/15th, as a safety buffer), then anyone can grab the collateral in that vault (or a fraction thereof) by sending to it the outstanding ctez (or a fraction thereof) which is burned.

## Liquidity incentives

Liquidity incentives, also known as subsidies, are fees for using outstanding ctez, charged to oven owners in favor of liquidity providers who supply liquidity to the protocol's built-in DEX. Subsidies cannot exceed 1% per year and are only charged when the DEX has low liquidity. These subsidies are ctez tokens, which are automatically deducted and transferred to the DEX address. As a result, oven owners may notice that the outstanding ctez balance in their oven periodically increases slightly.

## DEX

The Ctez smart contract utilizes two unidirectional DEXs. The Sell Ctez Dex exchanges ctez for tez and accepts ctez tokens as liquidity. The Sell Tez Dex exchanges tez for ctez and accepts tez tokens as liquidity. There is no baker for that contract.

When a user provides liquidity to the DEX, they contribute only the self token. Since they haven’t contributed the corresponding share of proceeds and subsidy, they accumulate a debt based on their share. Upon removing liquidity, the user retrieves their share of self tokens along with their share of proceeds and subsidy, after subtracting the accumulated debt. It is also possible to withdraw only the proceeds and subsidy without removing the liquidity. This process is similar to the scenario where the user removes all liquidity and then re-adds the same amount of self tokens.

Swapping tez for ctez or vice versa, adding / removing liquidity adjust the drift and target factor. Each time the Ctez main contract is called, the drift, and the target factor for ctez, are adjusted.

The change in drift depends on actual liquidity amount in the dexes and it is calculated using the following formula:

`d_drift = (q_ctez * target_price - q_tez)^3 / Q_tez^3`

Where *q_ctez* is self token reserves in sell ctez dex, *q_tez* is self token reserves in sell tez dex, *Q_tez* is target amount of sell tez dex. *Q_tez = floor(Q_ctez * target_price)*. *Q_ctez* = 5% of Ctez FA12 token total supply.

This corresponds roughly to a maximum adjustment of the annualized drift of one percentage point for every fractional day since the last adjustment. The adjustment saturates when the discrepancy exceeds one 32ndth. Note that, by a small miracle, `ln(1.01) / year / day ~ 1.027 * 2^(-48) / second^2` which we use to simplify the computation in the implementation.

## Rationale

If the price of ctez remains below its target, the drift will keep increasing and at some point, under a quadratically compounding rate vaults are forced into liquidation which may cause ctez to be bid up to claim the tez in the vaults.

If the price of ctez remains above its target, the drift will keep decreasing which might make it attractive to mint and sell ctez while collecting baking rewards.

The drift is a mechanism that automatically discovers a competitive rate at which one might delegate.

## Why it's useful

ctez can be used directly in smart-contracts that would normally pool tez together without the thorny question of "who's baking".Given that there's almost no real movement in this pair, it doesn't need a whole lot of liquidity to function effectively, just a tad enough that the rate read from the contract isn't too noisy, hence the lack of baking shouldn't be a huge hindrance.

## Commands

### Build
```
make compile
```

### Test
The testing stack for the contracts is based on Python and requires [poetry](https://python-poetry.org/), [pytezos](https://pytezos.org/), and [pytest](https://docs.pytest.org/en/7.4.x/) to be installed.

install dependencies
```
poetry install
```

run tests
```
poetry run pytest
```

### Deploy Ctez contracts
Deploys ctez and ctez_fa12 contracts with initial storage states. There are two options

1. RPC url and private key are set in the `.env` file. See `example.env`. If some is missed in the `.env` file the script will ask the value further:
```
poetry run deploy
```
2. RPC url and private key are passed as arguments:
```
poetry run deploy --rpc-url <URL> --private-key <KEY>
```
