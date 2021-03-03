import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Popover, Divider, Button } from '@material-ui/core';
import Address from '../Address';
import Identicon from '../Identicon';
import { Typography } from '../Typography';
import { Oven } from '../../interfaces/ctez';

const useStyles = makeStyles((theme: any) => ({
  popover: {
    width: theme.spacing(40),
    borderRadius: theme.shape.borderRadius,
  },
  container: {
    display: 'flex',
    padding: theme.spacing(2),
    flexDirection: 'column',
    alignItems: 'center',
  },
  accountDetails: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    paddingLeft: theme.spacing(1),
  },
  actionBar: {
    padding: theme.spacing(2),
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonAction: {
    borderRadius: theme.spacing(0.5),
    padding: theme.spacing(0.5, 2),
    fontSize: '0.8rem',
    fontWeight: 500,
    textTransform: 'none',
  },
}));

export interface ProfilePopoverProps {
  address: string;
  network: string;
  oven?: Oven;
  isOpen: boolean;
  actionText: string;
  onClose: () => void | Promise<void>;
  handleAction: () => void | Promise<void>;
}

export const ProfilePopover: React.FC<ProfilePopoverProps> = ({
  address,
  network,
  isOpen,
  oven,
  onClose,
  handleAction,
  actionText,
}) => {
  const classes = useStyles();
  const id = isOpen ? 'profile-popover' : undefined;

  return (
    <div>
      <Popover
        id={id}
        open={isOpen}
        onClose={onClose}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        classes={{
          paper: classes.popover,
        }}
      >
        <div className={classes.container}>
          <Identicon alt={address} seed={address} />
          <div className={classes.accountDetails}>
            <Address address={address} trim trimSize="medium" />
            {oven && (
              <>
                <Typography size="caption" component="span" color="textSecondary">
                  <Address
                    address={oven.address}
                    trim
                    trimSize="small"
                    size="caption"
                    label="Oven"
                  />
                </Typography>
                {oven.baker && (
                  <Typography size="caption" component="span" color="textSecondary">
                    <Address
                      address={oven.baker}
                      trim
                      trimSize="small"
                      size="caption"
                      label="Baker"
                    />
                  </Typography>
                )}
                <Typography size="caption" component="span" color="textSecondary">
                  Oven Balance: {oven.tez_balance.shiftedBy(-6).toString()}
                </Typography>
                <Typography size="caption" component="span" color="textSecondary">
                  Outstanding CTez: {oven.ctez_outstanding.shiftedBy(-6).toString()}
                </Typography>
              </>
            )}
            <Typography size="caption" component="span" color="textSecondary">
              {network}
            </Typography>
          </div>
        </div>
        <Divider />
        <div className={classes.actionBar}>
          <Button
            variant="outlined"
            size="small"
            classes={{ root: classes.buttonAction }}
            onClick={handleAction}
          >
            {actionText}
          </Button>
        </div>
      </Popover>
    </div>
  );
};
