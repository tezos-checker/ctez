export interface Baker {
  name: string | null;
  address: string;
}

export interface Software {
  date: string;
}

export interface Block {
  level: number;
  hash: string;
  timestamp: string;
  proto: number;
  priority: number;
  validations: number;
  deposit: number;
  reward: number;
  fees: number;
  nonceRevealed: boolean;
  baker: Baker;
  software: Software;
}
