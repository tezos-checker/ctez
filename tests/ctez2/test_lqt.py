from math import ceil
from tests.ctez2.base import Ctez2BaseTestCase
from parameterized import parameterized
from tests.helpers.utility import get_consumed_mutez
from typing import List, Tuple
from dataclasses import dataclass

@dataclass
class Action:
    pass

@dataclass
class InitSenderWithBalance(Action):
    sender_id: int
    amount: int

@dataclass
class Deposit(Action):
    sender_id: int
    amount: int

@dataclass
class Swap(Action):
    sender_id: int
    amount: int

@dataclass
class CheckDexReserves(Action):
    amount: int

@dataclass
class RemoveAllLiquidity(Action):
    sender_id: int
    expected_self_token: int
    expected_proceeds: int

lqt_test_cases: List[Tuple[str, List[Action]]] = [
    (
        "simple", 
        [
            InitSenderWithBalance(sender_id=0, amount=1_000_000_000),
            InitSenderWithBalance(sender_id=1, amount=2_000_000_000),
            Deposit(sender_id=0, amount=1_000_000_000),
            Deposit(sender_id=1, amount=2_000_000_000),
            RemoveAllLiquidity(sender_id=0, expected_self_token=1_000_000_000, expected_proceeds=0),
            RemoveAllLiquidity(sender_id=1, expected_self_token=2_000_000_000, expected_proceeds=0),
        ],
    ),
    (
        "simple_reversed_withdraw", 
        [
            InitSenderWithBalance(sender_id=0, amount=1_000_000_000),
            InitSenderWithBalance(sender_id=1, amount=2_000_000_000),
            Deposit(sender_id=0, amount=1_000_000_000),
            Deposit(sender_id=1, amount=2_000_000_000),
            RemoveAllLiquidity(sender_id=1, expected_self_token=2_000_000_000, expected_proceeds=0),
            RemoveAllLiquidity(sender_id=0, expected_self_token=1_000_000_000, expected_proceeds=0),
        ],
    ),
    (
        "deposit_x1_000_000_liquidity", 
        [
            InitSenderWithBalance(sender_id=0, amount=1_000_000),
            InitSenderWithBalance(sender_id=1, amount=1_000_000),
            Deposit(sender_id=0, amount=1_000_000),
            Swap(sender_id=1, amount=1_001_252), # dex reserves from 1_000_000 to 0
            CheckDexReserves(amount=0),
            Deposit(sender_id=1, amount=1_000_000),
            RemoveAllLiquidity(sender_id=0, expected_self_token=0, expected_proceeds=1_001_252),
            RemoveAllLiquidity(sender_id=1, expected_self_token=1_000_000, expected_proceeds=0),
        ]
    ),
    (
        "deposit_x1_000_000_liquidity_reversed_withdraw", 
        [
            InitSenderWithBalance(sender_id=0, amount=1_000_000),
            InitSenderWithBalance(sender_id=1, amount=1_000_000),
            Deposit(sender_id=0, amount=1_000_000),
            Swap(sender_id=1, amount=1_001_252), # dex reserves from 1_000_000 to 0
            CheckDexReserves(amount=0),
            Deposit(sender_id=1, amount=1_000_000),
            RemoveAllLiquidity(sender_id=1, expected_self_token=999_999, expected_proceeds=0),
            RemoveAllLiquidity(sender_id=0, expected_self_token=1, expected_proceeds=1_001_252),
        ]
    ),
    (
        "deposit_x1_000_000_liquidity_twice_withdraw_0_1_2", 
        [
            InitSenderWithBalance(sender_id=0, amount=1_000_000),
            InitSenderWithBalance(sender_id=1, amount=1_000_000),
            Deposit(sender_id=0, amount=1_000_000),
            Swap(sender_id=1, amount=1_001_252), # dex reserves from 1_000_000 to 0
            CheckDexReserves(amount=0),
            Deposit(sender_id=1, amount=1_000_000),
            Swap(sender_id=2, amount=1_001_253), # dex reserves from 1_000_000 to 0
            CheckDexReserves(amount=0),
            Deposit(sender_id=2, amount=1_000_000),
            RemoveAllLiquidity(sender_id=0, expected_self_token=0, expected_proceeds=1_001_253),
            RemoveAllLiquidity(sender_id=1, expected_self_token=0, expected_proceeds=1_001_251),
            RemoveAllLiquidity(sender_id=2, expected_self_token=1_000_000, expected_proceeds=1),
        ]
    ),
    (
        "deposit_x1_000_000_liquidity_twice_withdraw_0_2_1", 
        [
            InitSenderWithBalance(sender_id=0, amount=1_000_000),
            InitSenderWithBalance(sender_id=1, amount=1_000_000),
            Deposit(sender_id=0, amount=1_000_000),
            Swap(sender_id=1, amount=1_001_252), # dex reserves from 1_000_000 to 0
            CheckDexReserves(amount=0),
            Deposit(sender_id=1, amount=1_000_000),
            Swap(sender_id=2, amount=1_001_253), # dex reserves from 1_000_000 to 0
            CheckDexReserves(amount=0),
            Deposit(sender_id=2, amount=1_000_000),
            RemoveAllLiquidity(sender_id=0, expected_self_token=0, expected_proceeds=1_001_253),
            RemoveAllLiquidity(sender_id=2, expected_self_token=999_999, expected_proceeds=0),
            RemoveAllLiquidity(sender_id=1, expected_self_token=1, expected_proceeds=1_001_252),
        ]
    ),
    (
        "deposit_x1_000_000_liquidity_twice_withdraw_1_0_2", 
        [
            InitSenderWithBalance(sender_id=0, amount=1_000_000),
            InitSenderWithBalance(sender_id=1, amount=1_000_000),
            Deposit(sender_id=0, amount=1_000_000),
            Swap(sender_id=1, amount=1_001_252), # dex reserves from 1_000_000 to 0
            CheckDexReserves(amount=0),
            Deposit(sender_id=1, amount=1_000_000),
            Swap(sender_id=2, amount=1_001_253), # dex reserves from 1_000_000 to 0
            CheckDexReserves(amount=0),
            Deposit(sender_id=2, amount=1_000_000),
            RemoveAllLiquidity(sender_id=1, expected_self_token=0, expected_proceeds=1_001_251),
            RemoveAllLiquidity(sender_id=0, expected_self_token=0, expected_proceeds=1_001_253),
            RemoveAllLiquidity(sender_id=2, expected_self_token=1_000_000, expected_proceeds=1),
        ]
    ),
    (
        "deposit_x1_000_000_liquidity_twice_withdraw_1_2_0", 
        [
            InitSenderWithBalance(sender_id=0, amount=1_000_000),
            InitSenderWithBalance(sender_id=1, amount=1_000_000),
            Deposit(sender_id=0, amount=1_000_000),
            Swap(sender_id=1, amount=1_001_252), # dex reserves from 1_000_000 to 0
            CheckDexReserves(amount=0),
            Deposit(sender_id=1, amount=1_000_000),
            Swap(sender_id=2, amount=1_001_253), # dex reserves from 1_000_000 to 0
            CheckDexReserves(amount=0),
            Deposit(sender_id=2, amount=1_000_000),
            RemoveAllLiquidity(sender_id=1, expected_self_token=0, expected_proceeds=1_001_251),
            RemoveAllLiquidity(sender_id=2, expected_self_token=999_999, expected_proceeds=0),
            RemoveAllLiquidity(sender_id=0, expected_self_token=1, expected_proceeds=1_001_254),
        ]
    ),
    (
        "deposit_x1_000_000_liquidity_twice_withdraw_2_0_1", 
        [
            InitSenderWithBalance(sender_id=0, amount=1_000_000),
            InitSenderWithBalance(sender_id=1, amount=1_000_000),
            Deposit(sender_id=0, amount=1_000_000),
            Swap(sender_id=1, amount=1_001_252), # dex reserves from 1_000_000 to 0
            CheckDexReserves(amount=0),
            Deposit(sender_id=1, amount=1_000_000),
            Swap(sender_id=2, amount=1_001_253), # dex reserves from 1_000_000 to 0
            CheckDexReserves(amount=0),
            Deposit(sender_id=2, amount=1_000_000),
            RemoveAllLiquidity(sender_id=2, expected_self_token=999_999, expected_proceeds=0),
            RemoveAllLiquidity(sender_id=0, expected_self_token=0, expected_proceeds=1_001_253),
            RemoveAllLiquidity(sender_id=1, expected_self_token=1, expected_proceeds=1_001_252),
        ]
    ),
    (
        "deposit_x1_000_000_liquidity_twice_withdraw_2_1_0", 
        [
            InitSenderWithBalance(sender_id=0, amount=1_000_000),
            InitSenderWithBalance(sender_id=1, amount=1_000_000),
            Deposit(sender_id=0, amount=1_000_000),
            Swap(sender_id=1, amount=1_001_252), # dex reserves from 1_000_000 to 0
            CheckDexReserves(amount=0),
            Deposit(sender_id=1, amount=1_000_000),
            Swap(sender_id=2, amount=1_001_253), # dex reserves from 1_000_000 to 0
            CheckDexReserves(amount=0),
            Deposit(sender_id=2, amount=1_000_000),
            RemoveAllLiquidity(sender_id=2, expected_self_token=999_999, expected_proceeds=0),
            RemoveAllLiquidity(sender_id=1, expected_self_token=0, expected_proceeds=1_001_251),
            RemoveAllLiquidity(sender_id=0, expected_self_token=1, expected_proceeds=1_001_254),
        ]
    ),
]

class Ctez2LqtTestCase(Ctez2BaseTestCase):
    @parameterized.expand(lqt_test_cases)
    def test_should_create_correct_shares_mixed(
        self, 
        _name: str, 
        actions: list[Action], 
    ) -> None:
        target_ctez_price = 1
        ctez2, ctez_token, sender0, sender1, sender2 = self.default_setup(
            target_ctez_price = target_ctez_price,
            bootstrap_all_tez_balances = True
        )

        senders = {0: sender0, 1: sender1, 2: sender2}
        for action in actions:
            match action:
                case InitSenderWithBalance(sender_id, amount):
                    sender = senders.get(sender_id)
                    if sender is None:
                        sender = self.bootstrap_account(sender_id)
                        senders[sender_id] = sender
                    tez_deposit = ceil(amount * target_ctez_price * 16/15)
                    sender.bulk(
                        ctez2.create_oven(0, None, None).with_amount(tez_deposit),
                        ctez2.mint_or_burn(0, amount),
                    ).send()
                    self.bake_block()

                case Deposit(sender_id, amount):
                    sender = senders[sender_id]
                    sender.bulk(
                        ctez_token.approve(ctez2, amount),
                        ctez2.add_ctez_liquidity(sender, amount, 0, self.get_future_timestamp())
                    ).send()
                    self.bake_block()

                case Swap(sender_id, amount):
                    sender = senders[sender_id]
                    ctez2.using(sender).tez_to_ctez(
                        sender, 0, self.get_future_timestamp()
                    ).with_amount(amount).send()
                    self.bake_block()

                case CheckDexReserves(amount=amount):
                    assert ctez2.get_sell_ctez_dex().self_reserves == amount

                case RemoveAllLiquidity(sender_id, expected_self_token=expected_ctez, expected_proceeds=expected_tez):
                    sender = senders[sender_id]
                    prev_ctez_balance = ctez_token.view_balance(sender)
                    prev_tez_balance = self.get_balance_mutez(sender)
                    shares = ctez2.get_ctez_liquidity_owner(sender).liquidity_shares
                    opg = ctez2.using(sender).remove_ctez_liquidity(sender, shares, 0, 0, 0, self.get_future_timestamp()).send()
                    self.bake_block()
                    op_fee = get_consumed_mutez(sender, opg)
                    assert ctez_token.view_balance(sender) == prev_ctez_balance + expected_ctez
                    assert self.get_balance_mutez(sender) == prev_tez_balance - op_fee + expected_tez
