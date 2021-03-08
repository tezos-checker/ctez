export const getLastOvenId = (address: string) => {
  return Number(localStorage.getItem(`oven:${address}:last`) ?? 0);
};

export const saveLastOven = (address: string, ovenId: number) => {
  return localStorage.setItem(`oven:${address}:last`, String(ovenId));
};
