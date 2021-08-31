import {
  makeStyles,
  Theme,
  createStyles,
  useTheme,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@material-ui/core';
import React from 'react';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import { GiCookingGlove, GiSwapBag } from 'react-icons/gi';
import { useHistory } from 'react-router';
import { useTranslation } from 'react-i18next';

const drawerWidth = 240;

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      display: 'flex',
    },
    appBar: {
      transition: theme.transitions.create(['margin', 'width'], {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
      }),
    },
    appBarShift: {
      width: `calc(100% - ${drawerWidth}px)`,
      marginLeft: drawerWidth,
      transition: theme.transitions.create(['margin', 'width'], {
        easing: theme.transitions.easing.easeOut,
        duration: theme.transitions.duration.enteringScreen,
      }),
    },
    menuButton: {
      marginRight: theme.spacing(2),
    },
    hide: {
      display: 'none',
    },
    drawer: {
      width: drawerWidth,
      flexShrink: 0,
    },
    drawerPaper: {
      width: drawerWidth,
    },
    drawerHeader: {
      display: 'flex',
      alignItems: 'center',
      padding: theme.spacing(0, 1),
      // necessary for content to be below app bar
      ...theme.mixins.toolbar,
      justifyContent: 'flex-end',
    },
    content: {
      flexGrow: 1,
      padding: theme.spacing(3),
      transition: theme.transitions.create('margin', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
      }),
      marginLeft: -drawerWidth,
    },
    contentShift: {
      transition: theme.transitions.create('margin', {
        easing: theme.transitions.easing.easeOut,
        duration: theme.transitions.duration.enteringScreen,
      }),
      marginLeft: 0,
    },
  }),
);

interface NavigationDrawerProps {
  open?: boolean;
  handleDrawerClose: () => void | Promise<void>;
  showSettings?: boolean;
}

export const NavigationDrawer: React.FC<NavigationDrawerProps> = ({
  open,
  handleDrawerClose,
  showSettings,
}) => {
  const classes = useStyles();
  const theme = useTheme();
  const history = useHistory();
  const { t } = useTranslation(['header']);
  return (
    <Drawer
      className={classes.drawer}
      variant="temporary"
      anchor="left"
      open={open}
      onBackdropClick={handleDrawerClose}
      classes={{
        paper: classes.drawerPaper,
      }}
    >
      <div className={classes.drawerHeader}>
        <IconButton onClick={handleDrawerClose}>
          {theme.direction === 'ltr' ? <ChevronLeftIcon /> : <ChevronRightIcon />}
        </IconButton>
      </div>
      <Divider />
      <List>
        <ListItem button onClick={() => history.push('/')}>
          <ListItemIcon>
            <GiCookingGlove />
          </ListItemIcon>
          <ListItemText primary={t('myOvens')} />
        </ListItem>
        <ListItem button onClick={() => history.push('/buy-sell')}>
          <ListItemIcon>
            <GiSwapBag />
          </ListItemIcon>
          <ListItemText primary={t('buyOrSell')} />
        </ListItem>
        {showSettings && (
          <ListItem button onClick={() => history.push('/settings')}>
            <ListItemIcon>
              <GiSwapBag />
            </ListItemIcon>
            <ListItemText primary={t('settings')} />
          </ListItem>
        )}
      </List>
    </Drawer>
  );
};
