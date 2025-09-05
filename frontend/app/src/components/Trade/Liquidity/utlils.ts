import BigNumber from "bignumber.js";

export const calcRedeemedAmount = (liquidityRedeemed: BigNumber, reserves: BigNumber, totalLiquidityShares: BigNumber, debt: BigNumber): BigNumber => {
    const denominator = BigNumber.max(totalLiquidityShares, 1);
    const redeemedAmount = liquidityRedeemed.multipliedBy(reserves).dividedBy(denominator).integerValue(BigNumber.ROUND_FLOOR);
    return BigNumber.max(redeemedAmount.minus(debt), 0);
}
