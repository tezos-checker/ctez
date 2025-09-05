import { Box, Button, ButtonGroup, Flex, Text, useMediaQuery } from "@chakra-ui/react";
import React, { useState } from "react";
import { useAddLiquidityTransactionsGql, useCollectFromLiquidityTransactionsGql, useRemoveLiquidityTransactionsGql, useSwapTransactionsGql } from "../../api/analytics";
import { useTableNumberUtils } from "../../hooks/useTableUtils";
import { useThemeColors } from "../../hooks/utilHooks";
import TableCommon, { ColData } from "./comonTable";


enum Transactiontype {
    Swaps = 'Swaps',
    Adds = 'Adds',
    Removes = 'Removes',
    Collects = 'Collects',
}

const TransactionTableAMM: React.FC = () => {
    const [textcolor] = useThemeColors(['homeTxt']);
    const [largerScreen] = useMediaQuery(['(min-width: 900px)']);
    const [background] = useThemeColors([
        'cardbg2',
    ]);
    const { data: swapTransaction = [] } = useSwapTransactionsGql();
    const { data: addTransaction = [] } = useAddLiquidityTransactionsGql();
    const { data: removeTransaction = [] } = useRemoveLiquidityTransactionsGql();
    const { data: collectTransaction = [] } = useCollectFromLiquidityTransactionsGql();

    const [transactionType, setTransactionType] = useState<Transactiontype>(Transactiontype.Swaps);
    const columSwap: ColData[] = [
        {
            accessor: 'Description',
            dataKey: 'description',
            isDescription: true,
            operationHashDataKey: 'transaction_hash'
        },
        {
            accessor: 'Amount X',
            dataKey: 'amount_xtz',
            isTez: true,
            isConsiderLogicChange: true,
        },
        {
            accessor: 'Amount Y',
            dataKey: 'amount_ctez',
            isCtez2: true,
            isConsiderLogicChange: true,
        },
        {
            accessor: 'Ctez Price',
            dataKey: 'price',
            isTez: true,
        },
        {
            accessor: 'Account',
            dataKey: 'account',
            isTrimAddress: true,
        },
        {
            accessor: 'Time',
            dataKey: 'timestamp',
            isTimeFormat: true
        }

    ]
    const columAdds: ColData[] = [
        {
            accessor: 'Description',
            dataKey: 'description',
            isDescriptionAdd: true,
            operationHashDataKey: 'transaction_hash'
        },
        {
            accessor: 'Amount',
            dataKey: 'self_amount',
            isTez: true,
            isConsiderLogicChange: true
        },
        {
            accessor: 'Account',
            dataKey: 'account',
            isTrimAddress: true,
        },
        {
            accessor: 'Time',
            dataKey: 'timestamp',
            isTimeFormat: true
        }
    ]

    const columRemoves: ColData[] = [
        {
            accessor: 'Description',
            dataKey: 'description',
            isDescriptionRemove: true,
            operationHashDataKey: 'transaction_hash'
        },
        {
            accessor: 'Self token',
            dataKey: 'self_redeemed',
            isConsiderLogicChange: true,
            isTez: true,
        },
        {
            accessor: 'Proceeds',
            dataKey: 'proceeds_redeemed',
            isConsiderLogicChange: true,
            isCtez2: true,
        },
        {
            accessor: 'Subsidy',
            dataKey: 'subsidy_redeemed',
            isCtez2: true,
        },
        {
            accessor: 'Account',
            dataKey: 'account',
            isTrimAddress: true,
        },
        {
            accessor: 'Time',
            dataKey: 'timestamp',
            isTimeFormat: true
        }

    ]

    const columCollects: ColData[] = [
        {
            accessor: 'Description',
            dataKey: 'description',
            isDescriptionCollect: true,
            operationHashDataKey: 'transaction_hash'
        },
        {
            accessor: 'Proceeds',
            dataKey: 'proceeds_withdrawn',
            isConsiderLogicChange: true,
            isCtez2: true,
        },
        {
            accessor: 'Subsidy',
            dataKey: 'subsidy_withdrawn',
            isCtez2: true,
        },
        {
            accessor: 'Account',
            dataKey: 'account',
            isTrimAddress: true,
        },
        {
            accessor: 'Time',
            dataKey: 'timestamp',
            isTimeFormat: true
        }
    ]

    return (<Box
        backgroundColor={background}
        fontSize='14px'
        borderRadius={16}
        paddingX={largerScreen ? '35px' : '19px'}
        paddingY={largerScreen ? '27px' : '24px'}
    >
        <Flex justifyContent='space-between' wrap='wrap'>
            <Text
                color={textcolor}
                fontSize={largerScreen ? '20px' : '16px'}
                lineHeight="29px"
                fontWeight={600}
            >
                Transactions
            </Text>
            <ButtonGroup variant='ghost' textColor={textcolor} spacing='-1' gridGap={2}>
                <Button fontSize='12px' textDecoration='underline' onClick={() => setTransactionType(Transactiontype.Swaps)} className={transactionType === Transactiontype.Swaps ? 'btnactive' : ''} >Swaps</Button>
                <Button fontSize='12px' textDecoration='underline' onClick={() => setTransactionType(Transactiontype.Adds)} className={transactionType === Transactiontype.Adds ? 'btnactive' : ''}>Adds</Button>
                <Button fontSize='12px' textDecoration='underline' onClick={() => setTransactionType(Transactiontype.Removes)} className={transactionType === Transactiontype.Removes ? 'btnactive' : ''}>Removes</Button>
                <Button fontSize='12px' textDecoration='underline' onClick={() => setTransactionType(Transactiontype.Collects)} className={transactionType === Transactiontype.Collects ? 'btnactive' : ''}>Redeems</Button>
            </ButtonGroup>

        </Flex>
        {transactionType === Transactiontype.Swaps && <TableCommon column={columSwap} data={swapTransaction} />}
        {transactionType === Transactiontype.Adds && <TableCommon column={columAdds} data={addTransaction} />}
        {transactionType === Transactiontype.Removes && <TableCommon column={columRemoves} data={removeTransaction} />}
        {transactionType === Transactiontype.Collects && <TableCommon column={columCollects} data={collectTransaction} />}
    </Box>)
}
export default TransactionTableAMM;
