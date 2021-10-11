import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Box,
  Divider,
  Stack,
  useColorModeValue,
  useMediaQuery,
} from '@chakra-ui/react';
import data from '../../components/data/faq.json';

const FaqPage: React.FC = () => {
  const [largerScreen] = useMediaQuery(['(min-width: 800px)']);
  console.log(data);
  const background = useColorModeValue('white', 'cardbgdark');
  const text2 = useColorModeValue('text2', 'darkheading');

  const faq1 = data.map((item) => {
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
          <AccordionPanel fontWeight="500" color="#B0B7C3" pb={2}>
            {item.answer}
          </AccordionPanel>
          <Divider color="#F1F1F1" />
        </AccordionItem>
      </Accordion>
    );
  });

  const faq2 = data.map((item) => {
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
          <AccordionPanel fontWeight="500" color="#B0B7C3" pb={2}>
            {item.answer}
          </AccordionPanel>
          <Divider color="#F1F1F1" />
        </AccordionItem>
      </Accordion>
    );
  });

  return (
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
  );
};

export default FaqPage;
