import {
  Flex,
  Box,
  Icon,
  Select,
  Spacer,
  Text,
  useMediaQuery,
  MenuItem,
  MenuList,
  IconButton,
  MenuButton,
  Menu,
  Input,
  Button as ChakraButton,
} from '@chakra-ui/react';
import { MdAdd } from 'react-icons/md';
import { BsArrowRight, BsThreeDotsVertical } from 'react-icons/bs';
import { useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useAppDispatch } from '../../redux/store';
import { openModal } from '../../redux/slices/UiSlice';
import { MODAL_NAMES } from '../../constants/modals';
import Button from '../../components/button/Button';
import { setClear, setSearchValue, setSortBy } from '../../redux/slices/OvenSlice';
import AllOvensContainer from './AllOvensContainer';
import MyOvensContainer from './MyOvensContainer';
import { useThemeColors } from '../../hooks/utilHooks';

const OvensPage: React.FC = () => {
  const location = useLocation();
  const dispatch = useAppDispatch();
  const [background, text4, textcolor] = useThemeColors(['cardbg', 'text4', 'textColor']);
  const [mobileScreen] = useMediaQuery(['(max-width: 600px)']);
  const [searchtext, setSearchtext] = useState('');

  const isMyOven = useMemo(() => {
    return location.pathname === '/myovens' || location.pathname === '/myovens/';
  }, [location]);

  const SetSortType = (value: string) => {
    dispatch(setSortBy(value));
  };

  const SetSearchValue = (value: string) => {
    setSearchtext(value);
    dispatch(setSearchValue(value));
    if (value == null) {
      dispatch(setSearchValue(''));
    }
  };
  const SetClearValue = (value: boolean) => {
    dispatch(setClear(value));
    if (value) {
      setSearchtext('');
      dispatch(setSearchValue(''));
    }
  };

  const toolBarButtons = useMemo(() => {
    if (mobileScreen) {
      return (
        <Menu>
          <MenuButton
            as={IconButton}
            aria-label="Options"
            icon={<BsThreeDotsVertical />}
            variant="outline"
          />
          <MenuList>
            <MenuItem
              icon={<BsArrowRight />}
              onClick={() => dispatch(openModal(MODAL_NAMES.TRACK_OVEN))}
            >
              Track Oven
            </MenuItem>
            <MenuItem icon={<MdAdd />} onClick={() => dispatch(openModal(MODAL_NAMES.CREATE_OVEN))}>
              Create Oven
            </MenuItem>
          </MenuList>
        </Menu>
      );
    }

    return (
      <Flex>
        <Button
          rightIcon={<BsArrowRight />}
          variant="outline"
          onClick={() => dispatch(openModal(MODAL_NAMES.TRACK_OVEN))}
          outerSx={{ mr: 2 }}
        >
          Track Oven
        </Button>

        <Button
          leftIcon={<Icon as={MdAdd} w={6} h={6} />}
          variant="solid"
          onClick={() => dispatch(openModal(MODAL_NAMES.CREATE_OVEN))}
        >
          Create Oven
        </Button>
      </Flex>
    );
  }, [dispatch, mobileScreen]);

  return (
    <Box maxWidth={1200} mx="auto" my={4} p={4}>
      <Flex>
        <Text color={text4} mt={2} mr={1}>
          Sort By:
        </Text>
        <Select
          color={text4}
          w={186}
          backgroundColor={background}
          onChange={(e) => SetSortType(e.target.value)}
        >
          <option value="Oven Balance">Value</option>
          <option value="Outstanding">Outstanding</option>
          <option value="Utilization">Utilization</option>
        </Select>
        {!isMyOven && (
          <div>
            <Input
              type="text"
              name="searchvalue"
              id="searchvalue"
              color={text4}
              value={searchtext}
              bg={background}
              lang="en-US"
              w="200px"
              ml={5}
              placeholder="Search Oven Owner"
              onChange={(e) => SetSearchValue(e.target.value)}
            />
            {searchtext && (
              <ChakraButton color={textcolor} variant="ghost" onClick={(e) => SetClearValue(true)}>
                clear
              </ChakraButton>
            )}
          </div>
        )}
        <Spacer />

        {toolBarButtons}
      </Flex>

      <Box d="table" w="100%" mt={16}>
        {!isMyOven && <AllOvensContainer />}

        {isMyOven && <MyOvensContainer />}
      </Box>
    </Box>
  );
};

export default OvensPage;
