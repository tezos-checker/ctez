export const FEE = 9995;
export const FEE_DENOM = 10000;

export const newtonDxToDyRecursive = (
  xp: number,
  xp2: number,
  x3yPlusY3x: number,
  y: number,
  dyApprox: number,
  rounds: number,
): number => {
  if (rounds <= 0) return dyApprox;
  const yp = y - dyApprox;
  const yp2 = Math.abs(yp * yp);
  const num = Math.abs(xp * yp * (xp2 + yp2) - x3yPlusY3x);
  const denom = xp * (xp2 + 3 * yp2);
  const adjust = num / denom;
  const newDyApprox = dyApprox + adjust;
  return newtonDxToDyRecursive(xp, xp2, x3yPlusY3x, y, newDyApprox, rounds - 1);
};

export const newtonDxToDy = (x: number, y: number, dx: number, rounds: number): number => {
  const xp = x + dx;
  const xp2 = xp * xp;
  const x3yPlusY3x = x * y * (x * x + y * y);
  return newtonDxToDyRecursive(xp, xp2, x3yPlusY3x, y, 0, rounds);
};

export const tradeDTezForDCash = (
  tez: number,
  cash: number,
  dtez: number,
  target: number,
  rounds = 4,
): number => {
  const x = tez * 2 ** 48;
  const y = target * cash;
  const dx = dtez * 2 ** 48;
  const dyApprox = newtonDxToDy(x, y, dx, rounds);
  const dCashApprox = dyApprox / target;
  if (tez - dCashApprox <= 0) {
    throw new Error('CASH POOL MINUS CASH WITHDRAWN IS NEGATIVE');
  }
  return dCashApprox;
};

export const tradeDCashForDTez = (
  tez: number,
  cash: number,
  dcash: number,
  target: number,
  rounds = 4,
): number => {
  const y = tez * 2 ** 48;
  const x = target * cash;
  const dx = target * dcash;
  const dyApprox = newtonDxToDy(x, y, dx, rounds);
  const dtezApprox = dyApprox / 2 ** 48;
  if (tez - dtezApprox <= 0) {
    throw new Error('TEZ POOL MINUS TEZ WITHDRAWN IS NEGATIVE');
  }
  return dtezApprox;
};

export const calculateMarginalPrice = (tez: number, cash: number, target: number): number => {
  const x = cash * target;
  const y = tez * 2 ** 48;
  const x2 = x * x;
  const y2 = y * y;
  const nom = tez * (3 * x2 + y2);
  const denom = cash * (3 * y2 + x2);
  return (nom * 2 ** 48) / denom / 2 ** 48;
};

export const isMonthFromLiquidation = (
  outstandingCtez: number,
  target: number,
  tezBalance: number,
  currentDrift: number,
): boolean => {
  return (
    outstandingCtez *
      (target / 2 ** 48) *
      (1 + currentDrift / 2 ** 48) ** ((365.25 * 24 * 3600) / 12) *
      (16 / 15) >
    tezBalance
  );
};
