import {
  ProSidebar,
  SidebarHeader,
  SidebarFooter,
  SidebarContent,
  Menu,
  MenuItem,
  SubMenu,
} from 'react-pro-sidebar';
import clsx from 'clsx';
import { Text, Flex, Box } from '@chakra-ui/react';
import React, { useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { ReactComponent as MyOvens } from '../../assets/images/sidebar/myovens.svg';
import { ReactComponent as AllOvens } from '../../assets/images/sidebar/allovens.svg';
import { ReactComponent as CreateOven } from '../../assets/images/sidebar/createoven.svg';
import { ReactComponent as Trade } from '../../assets/images/sidebar/trade.svg';
import { ReactComponent as Faq } from '../../assets/images/sidebar/faq.svg';
import { ReactComponent as Github } from '../../assets/images/sidebar/github.svg';
import { ReactComponent as Wrap } from '../../assets/images/sidebar/wrap.svg';
import { ReactComponent as Plenty } from '../../assets/images/sidebar/plenty.svg';
import { ReactComponent as ArrowLeft } from '../../assets/images/sidebar/arrowleft.svg';
import { ReactComponent as ArrowRight } from '../../assets/images/sidebar/arrowright.svg';
import { ReactComponent as Logo } from '../../assets/images/sidebar/logo.svg';
import 'react-pro-sidebar/dist/css/styles.css';

export interface Props {
  handleCollapsed: React.MouseEventHandler;
  handleToggled: ((value: boolean) => void) | undefined;
  collapsed: boolean;
  toggled: boolean;
}

export const Sidebar: React.FC<Props> = ({
  handleCollapsed,
  handleToggled,
  collapsed,
  toggled,
}) => {
  const location = useLocation();

  const stats = () => {
    return (
      <Flex direction="column">
        <Flex direction="row">
          <Text color="#CCD2E3" fontSize="xs" cursor="default">
            Current Target
          </Text>
          <Text marginLeft="auto" color="#CCD2E3" fontSize="xs" cursor="default">
            0.963025
          </Text>
        </Flex>
        <Flex direction="row">
          <Text color="#CCD2E3" fontSize="xs" cursor="default">
            Current Price
          </Text>
          <Text marginLeft="auto" color="#CCD2E3" fontSize="xs" cursor="default">
            2.847894
          </Text>
        </Flex>
        <Flex direction="row">
          <Text color="#CCD2E3" fontSize="xs" cursor="default">
            Premium
          </Text>
          <Text marginLeft="auto" color="#CCD2E3" fontSize="xs" cursor="default">
            196.36%
          </Text>
        </Flex>
        <Flex direction="row">
          <Text color="#CCD2E3" fontSize="xs" cursor="default">
            Current Anual Drift
          </Text>
          <Text marginLeft="auto" color="#CCD2E3" fontSize="xs" cursor="default">
            196.36%
          </Text>
        </Flex>
        <Flex direction="row">
          <Text color="#CCD2E3" fontSize="xs" cursor="default">
            Annual Drift (Past week)
          </Text>
          <Text marginLeft="auto" color="#CCD2E3" fontSize="xs" cursor="default">
            196.36%
          </Text>
        </Flex>
      </Flex>
    );
  };

  return (
    <div id="sidebar">
      <ProSidebar collapsed={collapsed} breakPoint="md" toggled={toggled} onToggle={handleToggled}>
        <SidebarHeader>
          <Flex alignItems="center" padding="16px 35px 16px 20px">
            <Box marginRight="10px">
              <Logo />
            </Box>
            <Text
              flexGrow={1}
              flexShrink={1}
              overflow="hidden"
              color="white"
              fontWeight={600}
              fontSize="xl"
              whiteSpace="nowrap"
              textOverflow="ellipsis"
            >
              ctez
            </Text>
          </Flex>
          <Box role="button" className="menu-expand-button" onClick={handleCollapsed}>
            <Flex justifyContent="center" width="8px">
              {collapsed ? <ArrowRight /> : <ArrowLeft />}
            </Flex>
          </Box>
        </SidebarHeader>
        <SidebarContent>
          <Menu iconShape="square">
            <MenuItem
              className={clsx(
                {
                  hide: collapsed,
                },
                'no-cursor',
              )}
            >
              <Text color="#51CBFF">Ovens</Text>
            </MenuItem>
            <MenuItem
              className={clsx({
                highlight: location.pathname === '/createoven',
              })}
              icon={<CreateOven />}
            >
              <NavLink to="/createoven">Create Oven</NavLink>
            </MenuItem>
            <MenuItem
              className={clsx({
                highlight: location.pathname === '/allovens',
              })}
              icon={<AllOvens />}
            >
              <Link to="/allovens">All Ovens</Link>
            </MenuItem>
            <MenuItem
              className={clsx(
                {
                  hide: collapsed,
                },
                'no-cursor',
              )}
            >
              <Text fontSize="sm" color="#51CBFF">
                Manage
              </Text>
            </MenuItem>
            <MenuItem
              className={clsx({
                highlight: location.pathname === '/myovens',
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
              <Text fontSize="sm" color="#51CBFF">
                Info
              </Text>
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
              <a href="https://github.com" target="_blank" rel="noreferrer">
                GitHub
              </a>
            </MenuItem>
            <MenuItem
              className={clsx(
                {
                  hide: collapsed,
                },
                'no-cursor',
              )}
            >
              <Text fontSize="sm" color="#51CBFF" cursor="default">
                Ctez Stats
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
              className={clsx({
                hide: collapsed,
              })}
            >
              <Text fontSize="sm" color="#51CBFF" cursor="default">
                ctez adopters
              </Text>
            </MenuItem>
            <MenuItem icon={<Wrap />}>
              <a href="https://app.tzwrap.com/wrap">Wrap Protocol</a>
            </MenuItem>
            <MenuItem icon={<Plenty />}>
              <a href="https://www.plentydefi.com/">Plenty</a>
            </MenuItem>
          </Menu>
        </SidebarContent>
      </ProSidebar>
    </div>
  );
};
