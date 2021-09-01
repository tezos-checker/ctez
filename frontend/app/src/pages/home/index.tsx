import React, { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Button, Paper, Tabs, Typography, Tab } from '@material-ui/core';
import Swap from '../../components/Swap';

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    height: `calc(100vh - ${theme.spacing(4)})`, // TODO set in accordance with app bar height
  },
  mainRow: {
    display: 'flex',
    margin: theme.spacing('auto', 0),
  },

  swapLiqCard: {
    height: 410,
    width: 400,
    padding: theme.spacing(2),
    borderRadius: 20,
  },
}));

function TabPanel(props: any) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`full-width-tabpanel-${index}`}
      aria-labelledby={`full-width-tab-${index}`}
      {...other}
    >
      {value === index && children}
    </div>
  );
}

const HomePage: React.FC = () => {
  const classes = useStyles();
  const [tab, setTab] = useState(0);
  return (
    <div className={classes.root}>
      <div className={classes.mainRow}>
        <div>
          <Typography>No governance, completely mechanical, straightforward.</Typography>
          <Typography>Unlock liquidity on Tezos and stay in control</Typography>
          <Typography>
            ctez can be used directly in smart-contracts that would normally pool tez together
            without the thorny question of "who's baking".
          </Typography>
          <div>
            <Button>Create Oven</Button>
            <Button>Learn More</Button>
          </div>
        </div>

        <div>
          <Paper square className={classes.swapLiqCard}>
            <Tabs
              value={tab}
              indicatorColor="primary"
              textColor="primary"
              onChange={(ev, val) => setTab(val)}
              aria-label="disabled tabs example"
            >
              <Tab label="Swap" />
              <Tab label="Liquidity" />
            </Tabs>

            <TabPanel value={tab} index={0}>
              <Swap />
            </TabPanel>

            <TabPanel value={tab} index={1}>
              Item Two
            </TabPanel>
          </Paper>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
