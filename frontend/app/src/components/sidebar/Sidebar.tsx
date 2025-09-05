import { ProSidebar, SidebarHeader, SidebarContent, Menu, MenuItem } from 'react-pro-sidebar';
import clsx from 'clsx';
import { Text, Flex, Box, Image } from '@chakra-ui/react';
import React, { useCallback, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { ReactComponent as MyOvens } from '../../assets/images/sidebar/myovens.svg';
import { ReactComponent as AllOvens } from '../../assets/images/sidebar/allovens.svg';
import { ReactComponent as CreateOven } from '../../assets/images/sidebar/createoven.svg';
import { ReactComponent as Trade } from '../../assets/images/sidebar/trade.svg';
import { ReactComponent as Faq } from '../../assets/images/sidebar/faq.svg';
import { ReactComponent as Analytics } from '../../assets/images/sidebar/analytics-icon.svg';
import { ReactComponent as Github } from '../../assets/images/sidebar/github.svg';
import { ReactComponent as ArrowLeft } from '../../assets/images/sidebar/arrowleft.svg';
import { ReactComponent as ArrowRight } from '../../assets/images/sidebar/arrowright.svg';
import { ReactComponent as Logo } from '../../assets/images/sidebar/ctez.svg';
import 'react-pro-sidebar/dist/css/styles.css';
import { openModal } from '../../redux/slices/UiSlice';
import { MODAL_NAMES } from '../../constants/modals';
import { useCtezBaseStats } from '../../api/queries';
import { useThemeColors } from '../../hooks/utilHooks';

export interface Props {
  handleCollapsed: React.MouseEventHandler;
  handleToggled: ((value: boolean) => void) | undefined;
  collapsed: boolean;
  toggled: boolean;
}

const Sidebar: React.FC<Props> = ({ handleCollapsed, handleToggled, collapsed, toggled }) => {
  const location = useLocation();
  const dispatch = useDispatch();
  const { data } = useCtezBaseStats();

  const [sideBarBackground, sidebarTxt, sidebarTopic] = useThemeColors([
    'sideBarBg',
    'sidebarTxt',
    'sidebarTopic',
  ]);

  const handleCreateOvenClick = () => {
    dispatch(openModal(MODAL_NAMES.CREATE_OVEN));
  };

  const [devMode, setDevMode] = useState(false);
  const handleClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (e.detail === 3)
      setDevMode((prevValue) => !prevValue);
  }, []);

  const stats = () => {
    return (
      <Flex direction="column" onClick={handleClick}>
        <Text color={sidebarTxt} fontSize="xs" fontWeight="bold" cursor="default">
          Ctez
        </Text>
        <Flex direction="row">
          <Text color={sidebarTxt} fontSize="xs" cursor="default">
            Target
          </Text>
          <Text marginLeft="auto" color={sidebarTxt} fontSize="xs" cursor="default">
            {data?.currentTarget.toFixed(6)}
          </Text>
        </Flex>
        <Flex direction="row">
          <Text color={sidebarTxt} fontSize="xs" cursor="default">
            Premium
          </Text>
          <Text marginLeft="auto" color={sidebarTxt} fontSize="xs" cursor="default">
            {data?.premium.toFixed(2)}%
          </Text>
        </Flex>
        <Flex direction="row">
          <Text color={sidebarTxt} fontSize="xs" cursor="default">
            Drift
          </Text>
          <Text marginLeft="auto" color={sidebarTxt} fontSize="xs" cursor="default">
            {data?.currentAnnualDrift.toFixed(2)}% / year
          </Text>
        </Flex>
        <Text mt={2} color={sidebarTxt} fontSize="xs" fontWeight="bold" cursor="default">
          Dex
        </Text>
        <Flex direction="row">
          <Text color={sidebarTxt} fontSize="xs" cursor="default">
            Best ask
          </Text>
          <Text marginLeft="auto" color={sidebarTxt} fontSize="xs" cursor="default">
            {data?.currentCtezSellPrice.toFixed(6)}
          </Text>
        </Flex>
        <Flex direction="row">
          <Text color={sidebarTxt} fontSize="xs" cursor="default">
            Best bid
          </Text>
          <Text marginLeft="auto" color={sidebarTxt} fontSize="xs" cursor="default">
            {data?.currentCtezBuyPrice.toFixed(6)}
          </Text>
        </Flex>
        <Text color={sidebarTxt} fontSize="xs" cursor="default" fontWeight="bold" mt={2}>
          Liquidity incentives
        </Text>
        <Flex direction="row">
          <Text color={sidebarTxt} fontSize="xs" cursor="default">
            Selling:
          </Text>
          <Text marginLeft="auto" color={sidebarTxt} fontSize="xs" cursor="default">
            {data?.ctezLiquidityIncentives.toFixed(2)}% / year
          </Text>
        </Flex>
        <Flex direction="row">
          <Text color={sidebarTxt} fontSize="xs" cursor="default">
            Buying:
          </Text>
          <Text marginLeft="auto" color={sidebarTxt} fontSize="xs" cursor="default">
            {data?.tezLiquidityIncentives.toFixed(2)}% / year
          </Text>
        </Flex>
        {devMode && <><hr style={{marginTop: '1.5rem'}}/><Text color={sidebarTxt} fontWeight="bold" fontSize="xs" cursor="default" mt={6}>
          Dev Zone:
        </Text>
          <Flex direction="row">
            <Text color={sidebarTxt} fontSize="xs" cursor="default">
              Current Avg Price
          </Text>
            <Text marginLeft="auto" color={sidebarTxt} fontSize="xs" cursor="default">
              {data?.currentAvgPrice.toFixed(6)}
            </Text>
          </Flex>
          <Flex direction="row">
            <Text color={sidebarTxt} fontSize="xs" cursor="default">
              Ctez Total Supply
          </Text>
            <Text marginLeft="auto" color={sidebarTxt} fontSize="xs" cursor="default">
              {data?.ctezTotalSupply.toFixed(6)}
            </Text>
          </Flex>
          <Text color={sidebarTxt} fontSize="xs" cursor="default" fontWeight="bold" mt={2}>
            Sell Ctez Dex:
        </Text>
          <Flex direction="row">
            <Text color={sidebarTxt} fontSize="xs" cursor="default">
              Self tokens
          </Text>
            <Text marginLeft="auto" color={sidebarTxt} fontSize="xs" cursor="default">
              {data?.ctezDexSelfTokens.toFixed(6)}
            </Text>
          </Flex>
          <Flex direction="row">
            <Text color={sidebarTxt} fontSize="xs" cursor="default">
              Proceeds
          </Text>
            <Text marginLeft="auto" color={sidebarTxt} fontSize="xs" cursor="default">
              {data?.ctezDexProceeds.toFixed(6)}
            </Text>
          </Flex>
          <Flex direction="row">
            <Text color={sidebarTxt} fontSize="xs" cursor="default">
              Subsidy
          </Text>
            <Text marginLeft="auto" color={sidebarTxt} fontSize="xs" cursor="default">
              {data?.ctezDexSubsidy.toFixed(6)}
            </Text>
          </Flex>
          <Flex direction="row">
            <Text color={sidebarTxt} fontSize="xs" cursor="default">
              Q_ctez
          </Text>
            <Text marginLeft="auto" color={sidebarTxt} fontSize="xs" cursor="default">
              {data?.ctezDexTargetLiquidity.toFixed(6)}
            </Text>
          </Flex>
          <Flex direction="row">
            <Text color={sidebarTxt} fontSize="xs" cursor="default">
              Fee Rate
          </Text>
            <Text marginLeft="auto" color={sidebarTxt} fontSize="xs" cursor="default">
              {data?.ctezDexAnnualFeeRate.toFixed(2)}% / year
          </Text>
          </Flex>
          <Text color={sidebarTxt} fontSize="xs" cursor="default" fontWeight="bold" mt={2}>
            Sell Tez Dex:
        </Text>
          <Flex direction="row">
            <Text color={sidebarTxt} fontSize="xs" cursor="default">
              Self tokens
          </Text>
            <Text marginLeft="auto" color={sidebarTxt} fontSize="xs" cursor="default">
              {data?.tezDexSelfTokens.toFixed(6)}
            </Text>
          </Flex>
          <Flex direction="row">
            <Text color={sidebarTxt} fontSize="xs" cursor="default">
              Proceeds
          </Text>
            <Text marginLeft="auto" color={sidebarTxt} fontSize="xs" cursor="default">
              {data?.tezDexProceeds.toFixed(6)}
            </Text>
          </Flex>
          <Flex direction="row">
            <Text color={sidebarTxt} fontSize="xs" cursor="default">
              Subsidy
          </Text>
            <Text marginLeft="auto" color={sidebarTxt} fontSize="xs" cursor="default">
              {data?.tezDexSubsidy.toFixed(6)}
            </Text>
          </Flex>
          <Flex direction="row">
            <Text color={sidebarTxt} fontSize="xs" cursor="default">
              Q_tez
          </Text>
            <Text marginLeft="auto" color={sidebarTxt} fontSize="xs" cursor="default">
              {data?.tezDexTargetLiquidity.toFixed(6)}
            </Text>
          </Flex>
          <Flex direction="row">
            <Text color={sidebarTxt} fontSize="xs" cursor="default">
              Fee Rate
          </Text>
            <Text marginLeft="auto" color={sidebarTxt} fontSize="xs" cursor="default">
              {data?.tezDexAnnualFeeRate.toFixed(2)}% / year
          </Text>
          </Flex></>}
      </Flex>
    );
  };

  return (
    <Box id="sidebar">
      <ProSidebar collapsed={collapsed} breakPoint="md" toggled={toggled} onToggle={handleToggled}>
        <Box background={sideBarBackground} flexGrow={1}>
          <SidebarHeader>
            <Flex alignItems="center" justifyContent="center" padding="16px 0px 16px 20px">
              <Box>
                <NavLink to="/">
                  <Logo width="40px" height="40px" />
                </NavLink>
              </Box>
              <Text
                flexGrow={1}
                flexShrink={1}
                overflow="hidden"
                color="white"
                fontWeight={600}
                fontSize="xl"
                marginLeft="10px"
                whiteSpace="nowrap"
                textOverflow="ellipsis"
              >
                <NavLink to="/">ctez</NavLink>
              </Text>
            </Flex>
            <Box role="button" className="menu-expand-button" onClick={handleCollapsed}>
              <Flex justifyContent="center" width="8px">
                {collapsed ? <ArrowRight /> : <ArrowLeft />}
              </Flex>
            </Box>
          </SidebarHeader>
          <SidebarContent>
            <Box height="calc(100vh - 72px)" overflow="auto">
              <Menu iconShape="square">
                <MenuItem
                  className={clsx({
                    highlight: location.pathname === '/createoven',
                  })}
                  icon={<CreateOven />}
                >
                  <NavLink to={(loc) => loc.pathname} onClick={handleCreateOvenClick}>
                    Create Oven
                  </NavLink>
                </MenuItem>
                <MenuItem
                  className={clsx({
                    highlight: location.pathname === '/ovens',
                  })}
                  icon={<AllOvens />}
                >
                  <Link to="/ovens">All Ovens</Link>
                </MenuItem>
                <MenuItem
                  className={clsx({
                    highlight: ['/myovens', '/myV1Ovens'].some(path => location.pathname === path),
                  })}
                  icon={<MyOvens />}
                >
                  <Link to="/myovens">My Ovens</Link>
                </MenuItem>
                <MenuItem
                  className={clsx({
                    highlight: location.pathname === '/trade',
                  })}
                  icon={<Trade />}
                >
                  <Link to="/trade">Trade</Link>
                </MenuItem>
                <MenuItem
                  className={clsx(
                    {
                      hide: collapsed,
                    },
                    'no-cursor',
                  )}
                >
                  <Text fontSize="sm" color={sidebarTopic} cursor="default">
                    Stats
                  </Text>
                </MenuItem>
                <MenuItem
                  className={clsx(
                    {
                      hide: collapsed,
                    },
                    'no-cursor',
                    'highlight',
                  )}
                >
                  {stats()}
                </MenuItem>
                <MenuItem
                  className={clsx(
                    {
                      hide: collapsed,
                    },
                    'no-cursor',
                  )}
                >
                  <Text fontSize="sm" color={sidebarTopic}>
                    Info
                  </Text>
                </MenuItem>
                <MenuItem
                  className={clsx({
                    highlight: location.pathname === '/analytics',
                  })}
                  icon={<Analytics />}
                >
                  <Link to="/analytics">Analytics</Link>
                </MenuItem>
                <MenuItem
                  className={clsx({
                    highlight: location.pathname === '/faq',
                  })}
                  icon={<Faq />}
                >
                  <Link to="/faq">FAQ</Link>
                </MenuItem>
                <MenuItem icon={<Github />}>
                  <a href="https://github.com/Tezsure/ctez" target="_blank" rel="noreferrer">
                    GitHub
                  </a>
                </MenuItem>
                {/* <MenuItem
                  className={clsx({
                    hide: collapsed,
                  })}
                >
                  <Text fontSize="sm" color={sidebarTopic} cursor="default">
                    Adopters
                  </Text>
                </MenuItem>
                <MenuItem icon={<Image src={BenderLabs} w={21} />}>
                  <a href="https://www.benderlabs.io/" target="_blank" rel="noreferrer">
                    Bender Labs
                  </a>
                </MenuItem>
                <MenuItem icon={<Plenty />}>
                  <a href="https://www.plentydefi.com/" target="_blank" rel="noreferrer">
                    Plenty
                  </a>
                </MenuItem>
               */}
              </Menu>
            </Box>
          </SidebarContent>
        </Box>
      </ProSidebar>
    </Box>
  );
};

export { Sidebar };
