import { Box, Button, Grid } from '@material-ui/core';
import styled from '@emotion/styled';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { setWalletProvider } from '../../contracts/client';
import { APP_NAME, NETWORK } from '../../utils/globals';
import { getBeaconInstance } from '../../wallet';
import { useWallet } from '../../wallet/hooks';
import Identicon from '../Identicon';
import ProfilePopover from '../ProfilePopover';

const SignedInBoxStyled = styled(Box)`
  cursor: pointer;
`;

export const SignIn: React.FC = () => {
  const { t } = useTranslation(['header']);
  const [{ wallet, pkh: userAddress, network }, setWallet, disconnectWallet] = useWallet();
  const [isOpen, setOpen] = useState(false);

  const connectWallet = async () => {
    const newWallet = await getBeaconInstance(APP_NAME, true, NETWORK);
    newWallet?.wallet && setWalletProvider(newWallet.wallet);
    newWallet && setWallet(newWallet);
  };

  return (
    <div>
      {!wallet ? (
        <Box component="span">
          <Button variant="outlined" onClick={connectWallet} sx={{ textTransform: 'none' }}>
            {t('signIn')}
          </Button>
        </Box>
      ) : (
        <Grid container direction="row-reverse">
          <Grid item>
            <SignedInBoxStyled>
              <Identicon seed={userAddress ?? ''} onClick={() => setOpen(true)} type="tzKtCat" />
              <ProfilePopover
                isOpen={isOpen}
                onClose={() => setOpen(false)}
                handleAction={disconnectWallet}
                address={userAddress ?? ''}
                network={network ?? ''}
                actionText={t('signOut')}
              />
            </SignedInBoxStyled>
          </Grid>
        </Grid>
      )}
    </div>
  );
};
