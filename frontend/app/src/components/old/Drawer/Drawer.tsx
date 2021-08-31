import styled from '@emotion/styled';
import { Drawer as MaterialDrawer, DrawerProps } from '@material-ui/core';

const StyledDrawer = styled(MaterialDrawer)`
  & .MuiDrawer-paperAnchorBottom {
    height: 74%;
  }
`;

export const Drawer: React.FC<DrawerProps> = ({ anchor = 'bottom', children, open, ...rest }) => {
  return (
    <StyledDrawer anchor={anchor} open={open} {...rest}>
      {children}
    </StyledDrawer>
  );
};
