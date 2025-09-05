const SI_SYMBOL = ["", "k", "m", "b", "t", "p", "e"];
// export const numberToMillionOrBillionFormate=(number :any )=>{
//   if(!number || number===undefined || number===""){
//       return 0;
//   }
//   // what tier? (determines SI symbol)
//   const tier = Math.log10(Math.abs(number)) / 3;

//   // if zero, we don't need a suffix
//   if(tier === 0) return number.toFixed(2);

//   // get suffix and determine scale
//   const suffix = SI_SYMBOL[tier]??'';
//   const scale = 10 ** (tier * 3);

//   // scale the number
//   const scaled = number / scale;

//   // format number and add suffix
//   return scaled.toFixed(2) + suffix;
// }
const addZeroes = (num: number, fixDigit: number) => {
  return num.toLocaleString("en", { useGrouping: false, minimumFractionDigits: fixDigit })
}
export const numberToMillionOrBillionFormate = (num: any, digits = 2, isDecimal = false,) => {
  if (num === 0) 
    return '0';

  if (digits === 6) {
    if (!(num % 1 !== 0))
      return num;
    return addZeroes(num, digits)
  }

  if (isDecimal) {
    return num.toFixed(digits)
  }
  const lookup = [
    { value: 1, symbol: "" },
    { value: 1e3, symbol: "k" },
    { value: 1e6, symbol: "m" },
    { value: 1e9, symbol: "g" },
    { value: 1e12, symbol: "t" },
    { value: 1e15, symbol: "p" },
    { value: 1e18, symbol: "e" }
  ];
  const rx = /\.0+$|(\.[0-9]*[1-9])0+$/;
  const item = lookup.slice().reverse().find(function (itemE) {
    return num >= itemE.value;
  });
  return item ?
    (num / item.value).toFixed(0).toString().split('').length > 2 ?
      (num / item.value).toFixed(0).replace(rx, "$1") + item.symbol :
      (num / item.value).toFixed(digits).replace(rx, "$1") + item.symbol

    : (num.toFixed(digits) ? num.toFixed(digits) : '<0.01');
}

export const formatDate = (dateInEpoch: number) => {
  const date = new Date(dateInEpoch);
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const day = date.getDate();
  const monthIndex = date.getMonth();
  const year = date.getFullYear();

  return `${monthNames[monthIndex]} . ${day} ,  ${year}`;
}
export const formatMonth = (dateInEpoch: number) => {
  const date = new Date(dateInEpoch);
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const monthIndex = date.getMonth();

  return `${monthNames[monthIndex]}`;
}
export const parseISO = (timestamp: number | string) => {
  return new Date(timestamp);
}
