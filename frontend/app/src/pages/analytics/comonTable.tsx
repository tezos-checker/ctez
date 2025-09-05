import { Box, ButtonProps, Container, Flex, Icon, SkeletonText, Table, TableContainer, Tbody, Td, Th, Thead, Tr, useMediaQuery } from "@chakra-ui/react";
import { Next, PageGroup, Paginator, Previous, usePaginator } from "chakra-paginator";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import * as timeago from 'timeago.js';
import { ReactComponent as leftIcon } from '../../assets/images/icons/left-icon.svg';
import { ReactComponent as rightIcon } from '../../assets/images/icons/right-icon.svg';
import { ReactComponent as linkLight } from '../../assets/images/icons/link-light.svg';
import { useTableNumberUtils } from "../../hooks/useTableUtils";
import { useThemeColors } from "../../hooks/utilHooks";
import { trimAddress } from "../../utils/addressUtils";
import { numberToMillionOrBillionFormate } from "../../utils/numberFormate";
import { NETWORK } from "../../utils/globals";

interface CommonTable {
  column: ColData[]
  data: Array<any>
}
export interface ColData {
  dataKey: string,
  isTrimAddress?: boolean,
  isTimeFormat?: boolean,
  isCtez?: boolean,
  accessor: string,
  isDescription?: boolean,
  isDescriptionAdd?: boolean,
  isDescriptionRemove?: boolean,
  isDescriptionCollect?: boolean,
  isTez?: boolean,
  isCtez2?: boolean,
  isShowOperationHash?: boolean,
  operationHashDataKey?: string,
  isConsiderLogicChange?: boolean,
}

const TableCommon: React.FC<CommonTable> = ({ column, data = [] }) => {
  const { positiveOrNegative, valueFormat } = useTableNumberUtils();
  const [textcolor] = useThemeColors(['homeTxt']);
  const [textHighlight] = useThemeColors(['sideBarBg']);
  const [largerScreen] = useMediaQuery(['(min-width: 900px)']);
  const [background, inputbg] = useThemeColors([
    'cardbg2',
    'inputbg',
  ]);
  const baseStyles: ButtonProps = {
    w: 7,
    fontSize: 'sm',
    backgroundColor: 'transparent'
  };
  const activeStyles: ButtonProps = {
    ...baseStyles,
    backgroundColor: inputbg,
    _hover: {
      bg: 'light.text4',
    },
    bg: 'light.text4',
  };
  const outerLimit = 2;
  const innerLimit = 2;
  // graph options
  const ovenTransactionTable = data;
  const [currentPageOvens, setCurrentPageOvens] = useState<any>([]);
  const { pagesQuantity, offset, currentPage, setCurrentPage, isDisabled, pageSize } = usePaginator(
    {
      total: ovenTransactionTable?.length,
      initialState: {
        pageSize: largerScreen ? 5 : 5,
        isDisabled: false,
        currentPage: 1,
      },
    },
  );

  useEffect(() => {
    const indexOfLastOven = currentPage * pageSize;
    const indexOfFirstOven = indexOfLastOven - pageSize;
    const currentTodos = ovenTransactionTable && ovenTransactionTable.slice(indexOfFirstOven, indexOfLastOven);
    setCurrentPageOvens(currentTodos);
  }, [currentPage, pageSize, ovenTransactionTable.length]);
  const handlePageChange = (nextPage: number) => {
    setCurrentPage(nextPage);
  };

  const getExplorerUrl = useCallback((hash: string) => {
    return `https://${NETWORK}.tzkt.io/${hash}`;
  }, [NETWORK])

  const modals = useMemo(() => {
    return (
      <>
        <Paginator
          isDisabled={isDisabled}
          innerLimit={largerScreen ? innerLimit : 1}
          currentPage={currentPage}
          outerLimit={largerScreen ? outerLimit : 1}
          pagesQuantity={pagesQuantity}
          activeStyles={activeStyles}
          normalStyles={baseStyles}
          onPageChange={handlePageChange}
        >
          <Container align="center" display='flex' justifyContent='center' flexDirection={largerScreen ? 'row' : 'column'} gridGap={5} w="full" pt={4}>
            {largerScreen && <Previous className="pagignationIcon">
              <Icon
                color="light.tradebg"
                _hover={{ cursor: 'pointer' }}
                as={leftIcon}
              />
            </Previous>}
            {!largerScreen && <Flex justifyContent='center' alignItems='center' gridGap='2px'>
              <Previous className="pagignationIcon">
                <Icon
                  color="light.tradebg"
                  _hover={{ cursor: 'pointer' }}
                  as={leftIcon}
                />
              </Previous>
              <Next className="pagignationIcon">
                <Icon
                  color="light.tradebg"
                  _hover={{ cursor: 'pointer' }}
                  as={rightIcon}
                />
              </Next>
            </Flex>}
            <PageGroup justifyContent={largerScreen ? '' : 'center'} className="pageNavigation-center-btn" isInline align="center" />
            {largerScreen && <Next className="pagignationIcon">

              <Icon
                color="light.tradebg"
                _hover={{ cursor: 'pointer' }}
                as={rightIcon}
              />
            </Next>}
          </Container>
        </Paginator>
      </>
    );
  }, [ovenTransactionTable]);
  if (!ovenTransactionTable.length) {
    return (<Table variant='simple'>
      <Thead>
        <Tr>
          {column.map((coldata, mainkey) => {
            if (mainkey === 0)
              return <Th key={`coldataaccessor${mainkey}`} textAlign='left' >{coldata.accessor}</Th>;
            return <Th key={`coldataaccessor${mainkey}`}   >{coldata.accessor}</Th>;
          })}
        </Tr>
      </Thead>
      <Tbody>
        {Array(pageSize).fill(0).map((_, i) => (<Tr key={`loaderSreen${i}`}>

          {column.map((coldata, mainkey) => (<Td key={`loaderSreenIndividual${mainkey}`} >
            <SkeletonText noOfLines={1} />
          </Td>))}

        </Tr>))}
      </Tbody>
    </Table>);
  }
  return (
    <Box>
      <TableContainer
        textAlign='center'
      >
        <Table variant='simple'>
          <Thead>
            <Tr>
              {column.map((coldata, mainkey) => {
                if (mainkey === 0)
                  return <Th key={`coldataaccessor${mainkey}`} className="tableFirstCell" textAlign='left' >{coldata.accessor}</Th>;
                return <Th key={`coldataaccessor${mainkey}`} textAlign='right'  >{coldata.accessor}</Th>;
              })}
            </Tr>
          </Thead>
          <Tbody>
            {currentPageOvens.map((pageData: any, index: number) => {
              const rowKey = pageData.id;
              return (
                <Tr key={rowKey + index}>
                  {column.map((coldata, mainkey) => {
                    const { dataKey, isTrimAddress, isTimeFormat, isCtez, isDescription, isDescriptionAdd, isDescriptionRemove, isDescriptionCollect, isTez, isCtez2, isShowOperationHash, isConsiderLogicChange } = coldata;
                    const operationHashDataKey = coldata.operationHashDataKey || 'operationHash';
                    if (isTimeFormat)
                      return <Td key={rowKey + index + mainkey} className={mainkey === 0 ? "tableFirstCell" : ''} textAlign={mainkey === 0 ? 'left' : 'right'}>{timeago.format(pageData[dataKey])}</Td>;
                    if (isCtez && isShowOperationHash)
                      return <Td key={rowKey + index + mainkey} className={mainkey === 0 ? "tableFirstCell" : ''} textAlign={mainkey === 0 ? 'left' : 'right'}>
                        <div >
                          <a className="addresslinktd"
                            href={getExplorerUrl(pageData[operationHashDataKey])}
                            rel="noreferrer"
                            target="_blank">
                            {`${numberToMillionOrBillionFormate(pageData[dataKey], 6)} ctez`}

                            <Icon
                              color="light.tradebg"
                              _hover={{ cursor: 'pointer' }}
                              className="addresslinktdIcon"
                              as={linkLight}

                            />
                          </a>
                        </div>
                      </Td>;
                    if (isCtez)
                      return <Td key={rowKey + index + mainkey} className={mainkey === 0 ? "tableFirstCell" : ''} textAlign={mainkey === 0 ? 'left' : 'right'}>{numberToMillionOrBillionFormate(pageData[dataKey], 6)} ctez</Td>;

                    if (isTrimAddress)
                      return (<Td key={rowKey + index + mainkey} className={mainkey === 0 ? "tableFirstCell" : ''} textAlign={mainkey === 0 ? 'left' : 'right'}>
                        <div >
                          <a
                            className="addresslinktd2"
                            href={getExplorerUrl(pageData[dataKey])}
                            rel="noreferrer"
                            target="_blank">
                            {
                              trimAddress(pageData[dataKey])
                            }
                            <Icon
                              color="light.tradebg"
                              _hover={{ cursor: 'pointer' }}
                              className="addresslinktdIcon"
                              as={linkLight}

                            />
                          </a>
                        </div>

                      </Td>);
                    if (isDescription)
                      return (<Td key={rowKey + index + mainkey} className={mainkey === 0 ? "tableFirstCell" : ''} textAlign={mainkey === 0 ? 'left' : 'right'} >
                        <div>
                          <a className="addresslinktd"
                            href={getExplorerUrl(pageData[operationHashDataKey])}
                            rel="noreferrer"
                            target="_blank">
                            {pageData.direction === 'tez_to_ctez' ? <p>Swap {numberToMillionOrBillionFormate(pageData.amount_xtz, 6)} tez for {numberToMillionOrBillionFormate(pageData.amount_ctez, 6)} ctez</p> : <p>Swap {numberToMillionOrBillionFormate(pageData.amount_ctez, 6)} ctez for {numberToMillionOrBillionFormate(pageData.amount_xtz, 6)} tez</p>}


                            <Icon
                              color="light.tradebg"
                              _hover={{ cursor: 'pointer' }}
                              className="addresslinktdIcon"
                              as={linkLight}

                            />
                          </a>
                        </div>

                      </Td>);
                    if (isDescriptionAdd)
                      return (<Td key={rowKey + index + mainkey} className={mainkey === 0 ? "tableFirstCell" : ''} textAlign={mainkey === 0 ? 'left' : 'right'} >
                        <div>
                          <a className="addresslinktd"
                            href={getExplorerUrl(pageData[operationHashDataKey])}
                            rel="noreferrer"
                            target="_blank">
                            Add {numberToMillionOrBillionFormate(pageData.self_amount, 6)} {pageData.dex === 'sell_ctez' ? 'ctez' : 'tez'}
                            <Icon
                              color="light.tradebg"
                              _hover={{ cursor: 'pointer' }}
                              className="addresslinktdIcon"
                              as={linkLight}
                            />
                          </a>
                        </div>

                      </Td>);
                    if (isDescriptionRemove)
                      return (<Td key={rowKey + index + mainkey} className={mainkey === 0 ? "tableFirstCell" : ''} textAlign={mainkey === 0 ? 'left' : 'right'} >
                        <div>
                          <a className="addresslinktd"
                            href={getExplorerUrl(pageData[operationHashDataKey])}
                            rel="noreferrer"
                            target="_blank">
                            Remove {numberToMillionOrBillionFormate(pageData.self_redeemed, 6)} {pageData.dex === 'sell_ctez' ? 'ctez' : 'tez'}
                            <Icon
                              color="light.tradebg"
                              _hover={{ cursor: 'pointer' }}
                              className="addresslinktdIcon"
                              as={linkLight}

                            />
                          </a>
                        </div>

                      </Td>);
                    if (isDescriptionCollect)
                      return (<Td key={rowKey + index + mainkey} className={mainkey === 0 ? "tableFirstCell" : ''} textAlign={mainkey === 0 ? 'left' : 'right'} >
                        <div>
                          <a className="addresslinktd"
                            href={getExplorerUrl(pageData[operationHashDataKey])}
                            rel="noreferrer"
                            target="_blank">
                            Redeemed from {pageData.dex === 'sell_ctez' ? 'ctez' : 'tez'} liquidity
                              <Icon
                              color="light.tradebg"
                              _hover={{ cursor: 'pointer' }}
                              className="addresslinktdIcon"
                              as={linkLight}

                            />
                          </a>
                        </div>

                      </Td>);
                    if (isTez && isShowOperationHash)
                      return <Td key={rowKey + index + mainkey} className={mainkey === 0 ? "tableFirstCell" : ''} textAlign={mainkey === 0 ? 'left' : 'right'}>
                        <div >
                          <a className="addresslinktd"
                            href={getExplorerUrl(pageData[operationHashDataKey])}
                            rel="noreferrer"
                            target="_blank">
                            {`${numberToMillionOrBillionFormate(pageData[dataKey], 6)} tez`}
                            <Icon
                              color="light.tradebg"
                              _hover={{ cursor: 'pointer' }}
                              className="addresslinktdIcon"
                              as={linkLight}

                            />
                          </a>
                        </div>
                      </Td>;
                    if (isTez && isConsiderLogicChange)
                      return <Td key={rowKey + index + mainkey} className={mainkey === 0 ? "tableFirstCell" : ''} textAlign={mainkey === 0 ? 'left' : 'right'}>{
                        pageData.direction === 'tez_to_ctez' || pageData.dex === 'sell_tez' ? `${numberToMillionOrBillionFormate(pageData.amount_xtz ?? pageData[dataKey], 6)} tez` : `${numberToMillionOrBillionFormate(pageData.amount_ctez ?? pageData[dataKey], 6)} ctez`
                      }
                      </Td>;
                    if (isCtez2 && isConsiderLogicChange)
                      return <Td key={rowKey + index + mainkey} className={mainkey === 0 ? "tableFirstCell" : ''} textAlign={mainkey === 0 ? 'left' : 'right'}>
                        {pageData.direction === 'ctez_to_tez' || pageData.dex === 'sell_ctez' ? `${numberToMillionOrBillionFormate(pageData.amount_xtz ?? pageData[dataKey], 6)} tez` : `${numberToMillionOrBillionFormate(pageData.amount_ctez ?? pageData[dataKey], 6)} ctez`}
                      </Td>;

                    if (isTez)
                      return <Td key={rowKey + index + mainkey} className={mainkey === 0 ? "tableFirstCell" : ''} textAlign={mainkey === 0 ? 'left' : 'right'}>{numberToMillionOrBillionFormate(pageData[dataKey], 6)} tez</Td>;
                    if (isCtez2)
                      return <Td key={rowKey + index + mainkey} className={mainkey === 0 ? "tableFirstCell" : ''} textAlign={mainkey === 0 ? 'left' : 'right'}>{numberToMillionOrBillionFormate(pageData[dataKey], 6)} ctez</Td>;

                    return <Td key={rowKey + index + mainkey} className={mainkey === 0 ? "tableFirstCell" : ''} textAlign={mainkey === 0 ? 'left' : 'right'} >{numberToMillionOrBillionFormate(pageData[dataKey], 6)}</Td>;
                  })}
                </Tr>)
            })}

          </Tbody>
        </Table>
      </TableContainer>

      {modals}

    </Box>)
}
export default TableCommon;
