import { Flex, HStack, Stack, Text, useMediaQuery } from '@chakra-ui/react';
import { Link } from 'react-router-dom';
import Button from '../../components/button';
import Trade from '../../components/Trade';
import { useThemeColors } from '../../hooks/utilHooks';

const HomePage: React.FC = () => {
  const [textcolor] = useThemeColors(['homeTxt']);
  const [largerScreen] = useMediaQuery(['(min-width: 900px)']);

  return (
    <Flex maxWidth={1200} mx="auto" height="calc(100vh - 72px)" alignItems="center">
      <Flex alignItems="center" flexDirection={largerScreen ? 'row' : 'column'}>
        <Stack
          spacing={5}
          pl={largerScreen ? 4 : 1}
          pr={largerScreen ? 0 : 1}
          textAlign={largerScreen ? 'left' : 'center'}
          alignItems={largerScreen ? 'left' : 'center'}
        >
          <Text
            color={textcolor}
            fontSize={largerScreen ? '48px' : '26px'}
            as="strong"
            lineHeight="50px"
          >
            Ctez, your portal to Tezos DeFi.
          </Text>
          <Text opacity="0.5" color={textcolor} fontSize="md" pr={15}>
            Collateralized tez that is fungible, decentralized, and without opportunity cost
            from missing out on delegation. Achieved with a bit of mathematics.
          </Text>
          <HStack
            mt={10}
            w={largerScreen ? '60%' : '90%'}
            justifyContent="space-between"
            spacing={largerScreen ? '24px' : '15px'}
          >
            <Button variant="solid" w="50%">
              <Link to="/faq">
                <Button variant="solid" w={largerScreen ? '200px' : '180px'}>
                  Why ctez?
                </Button>
              </Link>
            </Button>
            <Button variant="ghost" w="50%">
              <a
                href="https://github.com/trilitech/ctez/blob/ctez2/description_v2.md"
                target="_blank"
                rel="noreferrer"
              >
                <Button variant="outline" w={largerScreen ? '200px' : '180px'}>
                  How does it work?
                </Button>
              </a>
            </Button>
          </HStack>
        </Stack>
        <Trade />
      </Flex>
    </Flex>
  );
};

export default HomePage;
