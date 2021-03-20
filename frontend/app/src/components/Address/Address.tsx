import React, { useState } from 'react';
import { Grid } from '@material-ui/core';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import FileCopyOutlinedIcon from '@material-ui/icons/FileCopyOutlined';
import DoneRoundedIcon from '@material-ui/icons/DoneRounded';
import styled from '@emotion/styled';
import { Typography, TypographyProps } from '../Typography';
import { AddressTrimSizeType } from '../../interfaces';
import { trimAddress } from '../../utils/addressUtils';

export interface AddressProps {
  label?: string;
  address: string;
  trim?: boolean;
  onCopy?: () => void | Promise<void>;
  size?: TypographyProps['size'];
  component?: TypographyProps['component'];
  trimSize?: AddressTrimSizeType;
}

const CopyClipBoardStyled = styled(CopyToClipboard)`
  padding-top: 0.3rem;
  padding-left: 0.5rem;
  &.MuiSvgIcon-root {
    font-size: 1rem;
  }
`;

export const Address: React.FC<AddressProps> = ({
  label,
  address,
  trim,
  onCopy,
  size = 'inherit',
  component = 'span',
  trimSize,
}) => {
  const str = trim ? trimAddress(address, trimSize) : address;
  const [checked, setChecked] = useState(false);
  return (
    <Grid container>
      <Grid item>
        <Typography size={size} component={component}>
          {label ? `${label}: ${str}` : str}
        </Typography>
        <CopyClipBoardStyled
          onCopy={() => {
            onCopy && onCopy();
            setChecked(true);
            setInterval(() => {
              setChecked(false);
            }, 1000);
          }}
          text={address}
        >
          {!checked ? <FileCopyOutlinedIcon /> : <DoneRoundedIcon />}
        </CopyClipBoardStyled>
      </Grid>
    </Grid>
  );
};
