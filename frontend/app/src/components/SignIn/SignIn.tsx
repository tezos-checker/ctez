import { Box, Button, Grid } from '@material-ui/core';
import { useDispatch, useSelector } from 'react-redux';
import styled from '@emotion/styled';
import { GiChickenOven } from 'react-icons/gi';
import React, { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { setWalletProvider } from '../../contracts/client';
import { APP_NAME, NETWORK } from '../../utils/globals';
import { getBeaconInstance } from '../../wallet';
import { useWallet } from '../../wallet/hooks';
import Identicon from '../Identicon';
import ProfilePopover from '../ProfilePopover';
import { OvenSlice } from '../../redux/slices/OvenSlice';
import { RootState } from '../../redux/rootReducer';
import { useUserBalance } from '../../api/queries';

const SignedInBoxStyled = styled(Box)`
  cursor: pointer;
`;

export const SignIn: React.FC = () => {
  const { t } = useTranslation(['header']);
  const dispatch = useDispatch();
  const [{ wallet, pkh: userAddress, network }, setWallet, disconnectWallet] = useWallet();
  const [isOpen, setOpen] = useState(false);
  const userOvenData = useSelector((state: RootState) => state.oven.userOvenData);
  const { data: balance } = useUserBalance(userAddress);
  const connectWallet = async () => {
    const newWallet = await getBeaconInstance(APP_NAME, true, NETWORK);
    newWallet?.wallet && setWalletProvider(newWallet.wallet);
    newWallet && setWallet(newWallet);
  };

  const onWalletDisconnect = () => {
    dispatch(OvenSlice.actions.setUserOvenData({ ctez: 0, xtz: 0, totalOvens: 0 }));
    disconnectWallet();
  };

  return (
    <div>
      <Grid container direction="row" style={{ flexWrap: 'nowrap' }}>
        <Box component="span" pr={1}>
          <Button
            variant="outlined"
            component={RouterLink}
            to="/create"
            endIcon={<GiChickenOven />}
            sx={{ textTransform: 'none' }}
          >
            {t('createOven')}
          </Button>
        </Box>
        {!wallet ? (
          <Box component="span">
            <Button variant="outlined" onClick={connectWallet} sx={{ textTransform: 'none' }}>
              {t('signIn')}
            </Button>
          </Box>
        ) : (
          <Grid item>
            <SignedInBoxStyled>
              <Identicon seed={userAddress ?? ''} onClick={() => setOpen(true)} type="tzKtCat" />
              <ProfilePopover
                isOpen={isOpen}
                onClose={() => setOpen(false)}
                handleAction={onWalletDisconnect}
                address={userAddress ?? ''}
                network={network ?? ''}
                actionText={t('signOut')}
                balance={balance}
                ovenDetails={userOvenData}
              />
            </SignedInBoxStyled>
          </Grid>
        )}
      </Grid>
    </div>
  );
};
