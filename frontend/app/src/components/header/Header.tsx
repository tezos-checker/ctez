import { Flex, Box, useColorMode, Text, useColorModeValue } from '@chakra-ui/react';
import React, { useEffect, useState } from 'react';
import { useLocation, matchPath } from 'react-router-dom';
import { FiMoon, FiSun } from 'react-icons/fi';
import { GiHamburgerMenu } from 'react-icons/gi';
import { ReactComponent as AllOvens } from '../../assets/images/sidebar/allovens.svg';
import { ReactComponent as MyOvens } from '../../assets/images/sidebar/myovens.svg';
import { ReactComponent as Trade } from '../../assets/images/sidebar/trade.svg';
import { ReactComponent as Faq } from '../../assets/images/sidebar/faq.svg';
import Button from '../button/Button';
import SignIn from '../SignIn/SignIn';

export interface IHeaderProps {
  handleToggled: ((value: boolean) => void) | undefined;
  toggled: boolean;
}

interface HeaderIconText {
  text: string | null;
  icon: JSX.Element | null;
}

export const Header: React.FC<IHeaderProps> = ({ handleToggled, toggled }) => {
  const { colorMode, toggleColorMode } = useColorMode();
  const headerBackground = useColorModeValue('white', 'cardbgdark');
  const location = useLocation();
  // const [headerText, setHeaderText] = useState<string | null>(null);
  const [headerIconText, setHeaderIconText] = useState<HeaderIconText>({ text: null, icon: null });

  const setHeader = (pathName: string) => {
    if (
      matchPath(pathName, {
        path: '/myovens/:ovenId',
      }) != null
    ) {
      const ovenNumber = pathName.substr(pathName.lastIndexOf('/') + 1, pathName.length);
      setHeaderIconText({ text: `My Oven #${ovenNumber}`, icon: null });
    } else if (
      matchPath(pathName, {
        path: '/myovens',
        exact: true,
      })
    ) {
      setHeaderIconText({ text: `My Ovens`, icon: <MyOvens /> });
    } else if (
      matchPath(pathName, {
        path: '/ovens',
        exact: true,
      })
    ) {
      setHeaderIconText({ text: `All Ovens`, icon: <AllOvens /> });
    } else if (
      matchPath(pathName, {
        path: '/trade',
        exact: true,
      })
    ) {
      setHeaderIconText({ text: `Trade`, icon: <Trade /> });
    } else if (
      matchPath(pathName, {
        path: '/faq',
        exact: true,
      })
    ) {
      setHeaderIconText({ text: `FAQ`, icon: <Faq /> });
    } else {
      setHeaderIconText({ text: null, icon: null });
    }
  };

  useEffect(() => {
    const pathName = location.pathname;
    setHeader(pathName);
  }, [location]);

  return (
    <div>
      <Flex padding="16px" alignItems="center" background={headerBackground}>
        <Button
          border="1px solid rgba(0, 0, 0, 0.07)"
          backgroundColor="transparent"
          className="md-menu"
          onClick={() => handleToggled && handleToggled(!toggled)}
        >
          <GiHamburgerMenu />
        </Button>
        <Flex alignItems="center" marginStart={{ base: '5px', md: '30px' }} marginEnd="5px">
          <Box display={{ base: 'none', md: 'block' }} marginEnd={{ md: '5px' }}>
            {headerIconText.icon}
          </Box>
          <Box whiteSpace="nowrap">
            <Text fontWeight={600}>{headerIconText.text}</Text>
          </Box>
        </Flex>
        <Box marginStart="auto" marginEnd="10px" cursor="pointer" onClick={toggleColorMode}>
          {colorMode === 'light' ? <FiSun size={26} /> : <FiMoon size={26} />}
        </Box>
        <SignIn />
      </Flex>
    </div>
  );
};
