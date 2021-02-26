import { Paper, ListItem, ListItemText, ListItemProps } from '@material-ui/core';
import React, { RefObject } from 'react';
import { Link as RouterLink, LinkProps } from 'react-router-dom';
import styled from '@emotion/styled';

export interface ListItemLinkProps extends ListItemProps {
  primary: string;
  to: LinkProps['to'];
  disabled?: boolean;
}

type LinkListItemRef =
  | ((instance: HTMLAnchorElement | null) => void)
  | RefObject<HTMLAnchorElement>
  | null
  | undefined;

const StyledPaper = styled(Paper)`
  margin: 1em;
`;

export const ListItemLink: React.FC<ListItemLinkProps> = (props: ListItemLinkProps) => {
  const { primary, to, disabled } = props;

  const renderLink = React.useMemo(
    () =>
      // eslint-disable-next-line react/display-name
      React.forwardRef((itemProps, ref: LinkListItemRef) => (
        <RouterLink to={to} ref={ref} {...itemProps} />
      )),
    [to],
  );

  return (
    <StyledPaper>
      <ListItem button component={renderLink} disabled={disabled}>
        <ListItemText primary={primary} />
      </ListItem>
    </StyledPaper>
  );
};
