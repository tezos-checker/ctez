import { Box, Button, Grid } from '@material-ui/core';
import { useDispatch, useSelector } from 'react-redux';
import styled from '@emotion/styled';
import { GiChickenOven, GiDeerTrack, GiWallet } from 'react-icons/gi';
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
import { useUserBalance, useUserLqtData } from '../../api/queries';

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
  const { data: userLqtData } = useUserLqtData(userAddress);
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
      <Grid container direction="row" style={{ flexWrap: 'nowrap' }} spacing={1}>
        <Grid item>
          <Button
            variant="outlined"
            component={RouterLink}
            to="/track-oven"
            endIcon={<GiDeerTrack />}
            sx={{ textTransform: 'none' }}
          >
            {t('trackOven')}
          </Button>
        </Grid>
        <Grid item>
          <Button
            variant="outlined"
            component={RouterLink}
            to="/create"
            endIcon={<GiChickenOven />}
            sx={{ textTransform: 'none' }}
          >
            {t('createOven')}
          </Button>
        </Grid>
        {!wallet ? (
          <Grid item>
            <Button
              variant="outlined"
              onClick={connectWallet}
              sx={{ textTransform: 'none' }}
              endIcon={<GiWallet />}
            >
              {t('signIn')}
            </Button>
          </Grid>
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
                lqt={userLqtData?.lqt || 0}
                lqtShare={userLqtData?.lqtShare || 0}
              />
            </SignedInBoxStyled>
          </Grid>
        )}
      </Grid>
    </div>
  );
};
