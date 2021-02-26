import { Box, Button, Grid } from '@material-ui/core';
import React, { useState } from 'react';
import { useTranslation, WithTranslation } from 'react-i18next/*';
import { setWalletProvider } from '../../contracts/client';
import { APP_NAME, NETWORK } from '../../utils/globals';
import { getBeaconInstance, disconnectBeacon } from '../../wallet';
import { useWallet } from '../../wallet/hooks';
import Identicon from '../Identicon';
import ProfilePopover from '../ProfilePopover';

export const SignIn: React.FC = () => {
  const { t } = useTranslation(['header']);
  const [wallet, setWallet] = useWallet();
  const [isOpen, setOpen] = useState(false);

  const connectWallet = async () => {
    const newWallet = await getBeaconInstance(APP_NAME, true, NETWORK);
    newWallet?.wallet && setWalletProvider(newWallet.wallet);
    newWallet && setWallet(newWallet);
  };

  return (
    <div>
      {!wallet.wallet ? (
        <Box component="span" sx={{ m: 1 }}>
          <Button variant="outlined" onClick={connectWallet} sx={{ textTransform: 'none' }}>
            {t('signIn')}
          </Button>
        </Box>
      ) : (
        <Grid container direction="row-reverse">
          <Grid item xs={4}>
            <Box sx={{ marginLeft: '2.9em', cursor: 'pointer' }}>
              <Identicon seed={wallet?.pkh ?? ''} onClick={() => setOpen(true)} />
              <ProfilePopover
                isOpen={isOpen}
                onClose={() => setOpen(false)}
                handleAction={() => {
                  wallet?.wallet && disconnectBeacon(wallet?.wallet);
                  setWallet({});
                }}
                address={wallet?.pkh ?? ''}
                network={wallet?.network ?? ''}
                actionText={t('signOut')}
              />
            </Box>
          </Grid>
        </Grid>
      )}
    </div>
  );
};
