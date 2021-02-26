import React from 'react';
import { BlockiesOptions, create } from 'blockies-ts';
import { Avatar, AvatarProps } from '@material-ui/core';

export interface IdenticonProps extends Omit<Partial<BlockiesOptions>, 'seed'> {
  seed?: string;
  url?: string;
  variant?: AvatarProps['variant'];
  alt?: string;
  onClick?: () => void | Promise<void>;
}

export const Identicon: React.FC<IdenticonProps> = ({
  seed,
  variant = 'circular',
  alt,
  url,
  onClick,
  ...rest
}) => {
  const data = url ?? create({ seed, ...rest }).toDataURL();
  return <Avatar variant={variant} alt={alt} src={data} onClick={onClick} />;
};
