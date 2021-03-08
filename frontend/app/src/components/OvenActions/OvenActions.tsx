import React from 'react';
import { makeStyles, Theme } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';
import {
  FcBusiness,
  FcMoneyTransfer,
  FcPrint,
  FcConferenceCall,
  FcBrokenLink,
} from 'react-icons/fc';
import { Deposit } from '../../pages/Deposit';
import { Withdraw } from '../../pages/Withdraw';
import { MintOrBurn } from '../../pages/MintOrBurn';
import { Delegate } from '../../pages/Delegate';
import { Liquidate } from '../../pages/Liquidate';

interface TabPanelProps {
  index: any;
  value: any;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index, ...other }) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`scrollable-force-tabpanel-${index}`}
      aria-labelledby={`scrollable-force-tab-${index}`}
      {...other}
    >
      {value === index && <Box p={3}>{children}</Box>}
    </div>
  );
};

function a11yProps(index: any) {
  return {
    id: `scrollable-force-tab-${index}`,
    'aria-controls': `scrollable-force-tabpanel-${index}`,
  };
}

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    flexGrow: 1,
    width: '100%',
    backgroundColor: theme.palette.background.paper,
  },
  tab: {
    minWidth: '2rem',
  },
}));

export const OvenActions: React.FC = () => {
  const classes = useStyles();
  const [value, setValue] = React.useState(0);

  const handleChange = (event: any, newValue: number) => {
    setValue(newValue);
  };

  return (
    <div className={classes.root}>
      <AppBar position="static" color="default">
        <Tabs
          value={value}
          onChange={handleChange}
          variant="scrollable"
          indicatorColor="primary"
          textColor="primary"
          aria-label="scrollable force tabs example"
          scrollButtons="auto"
        >
          <Tab className={classes.tab} label="Deposit" icon={<FcBusiness />} {...a11yProps(0)} />
          <Tab
            className={classes.tab}
            label="Withdraw"
            icon={<FcMoneyTransfer />}
            {...a11yProps(1)}
          />
          <Tab className={classes.tab} label="Mint or Burn" icon={<FcPrint />} {...a11yProps(2)} />
          <Tab
            className={classes.tab}
            label="Delegate"
            icon={<FcConferenceCall />}
            {...a11yProps(3)}
          />
          <Tab
            className={classes.tab}
            label="Liquidate"
            icon={<FcBrokenLink />}
            {...a11yProps(4)}
          />
        </Tabs>
      </AppBar>
      <TabPanel value={value} index={0}>
        <Deposit />
      </TabPanel>
      <TabPanel value={value} index={1}>
        <Withdraw />
      </TabPanel>
      <TabPanel value={value} index={2}>
        <MintOrBurn />
      </TabPanel>
      <TabPanel value={value} index={3}>
        <Delegate />
      </TabPanel>
      <TabPanel value={value} index={4}>
        <Liquidate />
      </TabPanel>
    </div>
  );
};
