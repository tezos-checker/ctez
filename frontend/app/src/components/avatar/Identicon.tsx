import { Avatar, AvatarProps } from '@chakra-ui/react';
import { BlockiesOptions, create } from 'blockies-ts';

export interface IdenticonProps extends Omit<Partial<BlockiesOptions>, 'seed'> {
  type?: 'blockies' | 'tzKtCat';
  seed?: string;
  url?: string;
  variant?: AvatarProps['variant'];
  avatarSize?: AvatarProps['size'];
  alt?: string;
  onClick?: () => void | Promise<void>;
}

const Identicon: React.FC<IdenticonProps> = ({
  type = 'blockies',
  seed,
  variant = 'circular',
  alt,
  url,
  onClick,
  avatarSize,
  ...rest
}) => {
  const data = (() => {
    // IIFE
    if (url) return url;

    if (type === 'tzKtCat') return `https://services.tzkt.io/v1/avatars2/${seed}`;

    return create({ seed, ...rest }).toDataURL();
  })();

  return (
    <Avatar
      variant={variant}
      alt={alt}
      src={data}
      onClick={onClick}
      size={avatarSize}
      bgColor="transparent"
    />
  );
};

export default Identicon;
