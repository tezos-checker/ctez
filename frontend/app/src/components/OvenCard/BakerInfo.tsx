import {
  Box,
  Divider,
  Flex,
  Icon,
  Select,
  Stack,
  Text,
  useColorModeValue,
  useToast,
} from '@chakra-ui/react';
import { MdInfo } from 'react-icons/md';
import { useTranslation } from 'react-i18next';
import { useCallback, useEffect, useMemo, useState, MouseEvent } from 'react';
import { useDelegates } from '../../api/queries';
import { useWallet } from '../../wallet/hooks';
import Button from '../button/Button';
import { cTezError, delegate } from '../../contracts/ctez';
import Identicon from '../avatar/Identicon';
import { Oven } from '../../interfaces';
import SkeletonLayout from '../skeleton';
import Info from '../info/info';
import data from '../../assets/data/info.json';

const BakerInfo: React.FC<{ oven: Oven | undefined }> = ({ oven }) => {
  const { t } = useTranslation(['common']);
  const [{ pkh: userAddress }] = useWallet();
  const { data: delegates } = useDelegates(userAddress);
  const toast = useToast();

  const background = useColorModeValue('white', 'cardbgdark');
  const textcolor = useColorModeValue('text2', 'white');

  const [delegator, setDelegator] = useState('');
  const [loading, setLoading] = useState(false);
  const [edit, setEdit] = useState(false);
  const [showcontent, setShowContent] = useState(false);
  let content: any;

  data.map((item) => {
    if (item.topic === 'oven stats') {
      content = item.content;
    }
    return content;
  });

  const showTooltip = (e: MouseEvent<SVGAElement>) => {
    setShowContent(!showcontent);
  };
  const handleMouseOut = (e: MouseEvent<SVGAElement>) => {
    setShowContent(!showcontent);
  };

  const modals = useMemo(() => {
    return (
      <>
        <Info mt="-45px" ml="92px">
          {content}
        </Info>
      </>
    );
  }, [showcontent, setShowContent]);

  useEffect(() => {
    setDelegator(oven?.baker ?? '');
  }, [oven]);

  const handleConfirm = useCallback(async () => {
    setLoading(true);
    try {
      const result = await delegate(oven?.address ?? '', delegator);
      if (result) {
        toast({
          description: t('txSubmitted'),
          status: 'success',
        });
      }
    } catch (error) {
      const errorText = cTezError[error?.data?.[1].with.int as number] || t('txFailed');
      toast({
        description: errorText,
        status: 'error',
      });
    } finally {
      setLoading(false);
      setEdit(false);
    }
  }, [delegator, oven?.address, t, toast]);

  const bakerCard = useMemo(() => {
    if (oven?.baker) {
      return (
        <Flex w="100%" boxShadow="lg" px={3} py={1} borderRadius={6}>
          <Identicon seed={oven?.baker ?? undefined} type="tzKtCat" avatarSize="sm" />

          <Text as="span" my="auto" flexGrow={1} mx={2}>
            {oven?.baker}
          </Text>
          <Button variant="ghost" size="sm" onClick={() => setEdit(true)}>
            Edit
          </Button>
        </Flex>
      );
    }

    return <SkeletonLayout count={1} component="AddressCard" />;
  }, [oven?.baker]);

  const editBakerCard = useMemo(() => {
    if (edit) {
      return (
        <>
          <Select
            placeholder={t('delegatePlaceholder')}
            value={delegator}
            onChange={(ev) => {
              setDelegator(ev.target.value);
            }}
            boxShadow="sm"
          >
            {delegates?.map((x) => (
              <option key={x.address} value={x.address}>
                {x.address}
              </option>
            ))}
          </Select>

          <Flex justifyContent="right">
            <Button variant="outline" onClick={() => setEdit(false)}>
              Cancel
            </Button>
            <Box w={2} />
            <Button onClick={handleConfirm} isLoading={loading}>
              Confirm
            </Button>
          </Flex>
        </>
      );
    }

    return null;
  }, [delegates, delegator, edit, handleConfirm, loading, t]);

  return (
    <Stack p={8} spacing={4} borderRadius={16} backgroundColor={background}>
      <Text color={textcolor} fontWeight="600">
        Baker
        <Icon
          opacity="0.3"
          fontSize="lg"
          color="#B0B7C3"
          as={MdInfo}
          m={1}
          mb={1}
          onMouseOver={showTooltip}
          onMouseOut={handleMouseOut}
        />
        {showcontent ? modals : ''}
      </Text>

      <Divider />

      {edit ? editBakerCard : bakerCard}
    </Stack>
  );
};

export default BakerInfo;
