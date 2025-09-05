import { Box, Button, ButtonGroup, Flex, Text, useMediaQuery } from "@chakra-ui/react";
import React, { useState } from "react";
import { useOvensTransactionsGql } from "../../api/analytics";
import { useThemeColors } from "../../hooks/utilHooks";
import TableCommon, { ColData } from "./comonTable";


enum Transactiontype {
    Mint = 'Mint',
    Burn = 'Burn',
    Deposit = 'Deposit',
    Withdraw = 'Withdraw',
    Liquidate = 'Liquidate'
}

const TransactionTableoven: React.FC = () => {
    const [textcolor] = useThemeColors(['homeTxt']);
    const [largerScreen] = useMediaQuery(['(min-width: 900px)']);
    const [background, inputbg] = useThemeColors([
        'cardbg2',
        'inputbg',
    ]);
    const { data: mintedTransactionTable = [] } = useOvensTransactionsGql('mint');
    const { data: burnTransactionTable = [] } = useOvensTransactionsGql('burn');
    const { data: depositTransactionTable = [] } = useOvensTransactionsGql('deposit');
    const { data: withdrawTransactionTable = [] } = useOvensTransactionsGql('withdraw');
    const { data: liquidateTransactionTable = [] } = useOvensTransactionsGql('liquidate');


    const [transactionType, setTransactionType] = useState<Transactiontype>(Transactiontype.Mint);
    const columBurn: ColData[] = [
        {
            accessor: 'Burned',
            dataKey: 'amount',
            isCtez: true,
            isShowOperationHash: true,
            operationHashDataKey: 'transaction_hash'
        },
        {
            accessor: 'Target',
            dataKey: 'target_price'
        },
        {
            accessor: 'Oven',
            dataKey: 'oven_address',
            isTrimAddress: true,
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

    const columDeposit: ColData[] = [
        {
            accessor: 'Deposit',
            dataKey: 'amount',
            isTez: true,
            isShowOperationHash: true,
            operationHashDataKey: 'transaction_hash'
        },
        {
            accessor: 'Target',
            dataKey: 'target_price'
        },
        {
            accessor: 'Oven',
            dataKey: 'oven_address',
            isTrimAddress: true,
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
    const columWithdraw: ColData[] = [
        {
            accessor: 'Withdraw',
            dataKey: 'amount',
            isTez: true,
            isShowOperationHash: true,
            operationHashDataKey: 'transaction_hash'
        },
        {
            accessor: 'Target',
            dataKey: 'target_price'
        },
        {
            accessor: 'Oven',
            dataKey: 'oven_address',
            isTrimAddress: true,
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
    const columMinted: ColData[] = [
        {
            accessor: 'Minted',
            dataKey: 'amount',
            isCtez: true,
            isShowOperationHash: true,
            operationHashDataKey: 'transaction_hash'
        },
        {
            accessor: 'Target',
            dataKey: 'target_price'
        },
        {
            accessor: 'Oven',
            dataKey: 'oven_address',
            isTrimAddress: true,
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

    ];
    const columLiquidate: ColData[] = [
        {
            accessor: 'Burned',
            dataKey: 'amount',
            isCtez: true,
            isShowOperationHash: true,
            operationHashDataKey: 'transaction_hash'
        },
        {
            accessor: 'Target',
            dataKey: 'target_price'
        },
        {
            accessor: 'Oven',
            dataKey: 'oven_address',
            isTrimAddress: true,
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
        paddingY={27}
        paddingX={35}
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
                <Button fontSize='12px' textDecoration='underline' onClick={() => setTransactionType(Transactiontype.Mint)} className={transactionType === Transactiontype.Mint ? 'btnactive' : ''} >Mint</Button>
                <Button fontSize='12px' textDecoration='underline' onClick={() => setTransactionType(Transactiontype.Burn)} className={transactionType === Transactiontype.Burn ? 'btnactive' : ''}>Burn</Button>
                <Button fontSize='12px' textDecoration='underline' onClick={() => setTransactionType(Transactiontype.Deposit)} className={transactionType === Transactiontype.Deposit ? 'btnactive' : ''}>Deposit</Button>
                <Button fontSize='12px' textDecoration='underline' onClick={() => setTransactionType(Transactiontype.Withdraw)} className={transactionType === Transactiontype.Withdraw ? 'btnactive' : ''}>Withdraw</Button>
                <Button fontSize='12px' textDecoration='underline' onClick={() => setTransactionType(Transactiontype.Liquidate)} className={transactionType === Transactiontype.Liquidate ? 'btnactive' : ''}>Liquidate</Button>
            </ButtonGroup>

        </Flex>
        {transactionType === Transactiontype.Mint && <TableCommon column={columMinted} data={mintedTransactionTable} />}
        {transactionType === Transactiontype.Burn && <TableCommon column={columBurn} data={burnTransactionTable} />}
        {transactionType === Transactiontype.Deposit && <TableCommon column={columDeposit} data={depositTransactionTable} />}
        {transactionType === Transactiontype.Withdraw && <TableCommon column={columWithdraw} data={withdrawTransactionTable} />}
        {transactionType === Transactiontype.Liquidate && <TableCommon column={columLiquidate} data={liquidateTransactionTable} />}
    </Box>)
}
export default TransactionTableoven;
