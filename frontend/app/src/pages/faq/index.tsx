import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Box,
  Divider,
  Stack,
  Text,
  useMediaQuery,
} from '@chakra-ui/react';
import data from '../../components/data/faq.json';
import { useThemeColors } from '../../hooks/utilHooks';

const FaqPage: React.FC = () => {
  const [largerScreen] = useMediaQuery(['(min-width: 800px)']);
  const [background, text2, text4, divider] = useThemeColors([
    'cardbg',
    'text2',
    'text4',
    'divider',
  ]);

  const faq1 = data.faq1.map((item) => {
    return (
      <Accordion key={item.id} allowMultiple>
        <AccordionItem border="none" mx={5} my={2}>
          <h2>
            <AccordionButton _hover={{ bg: { background }, color: { text2 } }}>
              <Box fontWeight="600" color={text2} flex="1" textAlign="left">
                {item.question}
              </Box>
              <AccordionIcon />
            </AccordionButton>
          </h2>
          <AccordionPanel fontWeight="500" color={text4} pb={2}>
            {item.answer}
          </AccordionPanel>
          <Divider color={divider} />
        </AccordionItem>
      </Accordion>
    );
  });

  const faq2 = data.faq2.map((item) => {
    return (
      <Accordion key={item.id} allowMultiple>
        <AccordionItem border="none" mx={5} my={2}>
          <h2>
            <AccordionButton _hover={{ bg: { background }, color: { text2 } }}>
              <Box fontWeight="600" color={text2} flex="1" textAlign="left">
                {item.question}
              </Box>
              <AccordionIcon />
            </AccordionButton>
          </h2>
          <AccordionPanel fontWeight="500" color={text4} pb={2}>
            {item.answer}
          </AccordionPanel>
          <Divider color={divider} />
        </AccordionItem>
      </Accordion>
    );
  });

  return (
    <>
      <Stack
        direction="column"
        maxWidth={1200 - 32}
        mx="auto"
        my={4}
        p={4}
        w="100%"
        backgroundColor={background}
        borderRadius={16}
      >
        <Text fontWeight="600" color={text2} m={4}>
          Why ctez?
        </Text>
        <Text color={text2} fontWeight="400" px={5}>
          The Tezos blockchain is built to evolve continuously. Therefore, Tezos has a unique
          governance system that allows the blockchain to upgrade seamlessly, without the need for
          inconvenient hard forks. Anyone can participate in Tezos governance, although voting on
          protocol upgrades requires ownership of the native Tezos token tez (XTZ). To stake tez,
          most users 'delegate' their tez to a baker, meaning that the bakers will vote on protocol
          upgrades on behalf of the users.
        </Text>
        <Text color={text2} fontWeight="400" px={5} pb={4}>
          With the rise of decentralized finance (DeFi) on Tezos, an increasing amount of tez is
          being locked into smart contracts and pooled. This raises the question: who's baking? In
          addition, the pooling of large amounts of tez in a single smart contract may also
          introduce the risk of centralization. This is where ctez comes into play, which is
          essentially a synthetic version of tez designed to have the same value. While ctez can be
          used for e.g. DeFi purposes, you'll stay in control of your native tez tokens for
          governance and baking rewards.
        </Text>
      </Stack>
      <Stack
        direction={largerScreen ? 'row' : 'column'}
        maxWidth={1200}
        mx="auto"
        my={4}
        p={4}
        w="100%"
        spacing={4}
      >
        <Stack
          direction="column"
          w={largerScreen ? '50%' : '100%'}
          spacing={4}
          backgroundColor={background}
          borderRadius={16}
          P={8}
        >
          {faq1}
          {!largerScreen && faq2}
        </Stack>
        {largerScreen && (
          <Stack
            direction="column"
            w={largerScreen ? '50%' : '100%'}
            spacing={4}
            backgroundColor={background}
            borderRadius={16}
            P={8}
          >
            {faq2}
          </Stack>
        )}
      </Stack>
    </>
  );
};

export default FaqPage;
