export const getNodeURL = (userAddress: string): string | null => {
  return localStorage.getItem(`nodeURL:${userAddress}`);
};

export const getNodePort = (userAddress: string): string | null => {
  return localStorage.getItem(`nodePort:${userAddress}`);
};

export const getTzKtURL = (userAddress: string): string | null => {
  return localStorage.getItem(`tzktURL:${userAddress}`);
};

export const getTzKtPort = (userAddress: string): string | null => {
  return localStorage.getItem(`tzktPort:${userAddress}`);
};

export const updateNodeURL = (userAddress: string, nodeUrl: string): void => {
  localStorage.setItem(`nodeURL:${userAddress}`, nodeUrl);
};

export const updateNodePort = (userAddress: string, nodePort: string): void => {
  localStorage.setItem(`nodePort:${userAddress}`, nodePort);
};

export const updateTzKtURL = (userAddress: string, tzktUrl: string): void => {
  localStorage.setItem(`tzktURL:${userAddress}`, tzktUrl);
};

export const updateTzKtPort = (userAddress: string, tzktPort: string): void => {
  localStorage.setItem(`tzktPort:${userAddress}`, tzktPort);
};

export const isValidURL = (str: string): boolean => {
  const regexp = /^(?:(?:https?):\/\/)(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:\/\S*)?$/;
  return regexp.test(str);
};

export const isValidPort = (port: number): boolean => {
  return port >= 1 && port <= 65535;
};
