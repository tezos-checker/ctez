import { SkeletonText, Table, TableContainer, Tbody, Td, Th, Thead, Tr } from "@chakra-ui/react";
import React from "react";
import { useOvensSummaryGql } from "../../api/analytics";
import { useThemeColors } from "../../hooks/utilHooks";
import { numberToMillionOrBillionFormate } from "../../utils/numberFormate";

const OvenTable: React.FC = () => {
    const [background] = useThemeColors([
        'cardbg2',
    ]);
    const { data: overData = false } = useOvensSummaryGql();

    return (<TableContainer
        backgroundColor={background}
        fontSize='14px'
        borderRadius={16}
        textAlign='right'
        padding='12px'
    >
        <Table variant='simple'  >
            <Thead>
                <Tr>
                    <Th borderBottom={0} isNumeric textAlign='left'>Total</Th>
                    <Th isNumeric borderBottom={0} textAlign='right'>Created</Th>
                    <Th isNumeric borderBottom={0} textAlign='right'>Liquidated</Th>
                    <Th isNumeric borderBottom={0} textAlign='right'>Collateral Locked</Th>
                    <Th isNumeric borderBottom={0} textAlign='right'>Total Debt</Th>
                    <Th isNumeric borderBottom={0} textAlign='right'>Collateral Ratio</Th>
                </Tr>
            </Thead>
            <Tbody >
                {overData ? <Tr>
                    <Td isNumeric borderBottom={0} textAlign='left'>{numberToMillionOrBillionFormate(overData.total)}</Td>
                    <Td isNumeric borderBottom={0} textAlign='right'>{numberToMillionOrBillionFormate(overData.created)}</Td>
                    <Td isNumeric borderBottom={0} textAlign='right'>{numberToMillionOrBillionFormate(overData.liquidated)}</Td>
                    <Td isNumeric borderBottom={0} textAlign='right'>{numberToMillionOrBillionFormate(overData.collateral_locked)} tez</Td>
                    <Td isNumeric borderBottom={0} textAlign='right'>{numberToMillionOrBillionFormate(overData.total_debt)} ctez</Td>
                    <Td isNumeric borderBottom={0} textAlign='right'>{numberToMillionOrBillionFormate(overData.collateral_ratio)} %</Td>
                </Tr> : <Tr>
                    <Td isNumeric><SkeletonText pr={6} noOfLines={1} spacing="1" /></Td>
                    <Td isNumeric><SkeletonText pr={6} noOfLines={1} spacing="1" /></Td>
                    <Td isNumeric><SkeletonText pr={6} noOfLines={1} spacing="1" /></Td>
                    <Td isNumeric><SkeletonText pr={6} noOfLines={1} spacing="1" /></Td>
                    <Td isNumeric><SkeletonText pr={6} noOfLines={1} spacing="1" /></Td>
                    <Td isNumeric><SkeletonText pr={6} noOfLines={1} spacing="1" /></Td>
                </Tr>}
            </Tbody>
        </Table>
    </TableContainer>)
}
export default OvenTable;
