from typing import Callable
from tests.ctez2.base import BalanceDiffs, Ctez2BaseTestCase
from tests.helpers.contracts.ctez2.ctez2 import Ctez2
from tests.helpers.utility import get_consumed_mutez, print_dict
from parameterized import parameterized
from pytezos.client import PyTezosClient

class Ctez2RemoveTezLiquidityTestCase(Ctez2BaseTestCase):
    def test_should_fail_if_tez_in_transaction(self) -> None:
        ctez2, _, sender, receiver, *_ = self.default_setup()

        with self.raises_michelson_error(Ctez2.Errors.TEZ_IN_TRANSACTION_DISALLOWED):
            ctez2.using(sender).remove_tez_liquidity(receiver, 0, 0, 0, 0, self.get_future_timestamp()).with_amount(1).send()

    def test_should_fail_if_deadline_has_passed(self) -> None:
        ctez2, _, sender, receiver, *_ = self.default_setup()

        with self.raises_michelson_error(Ctez2.Errors.DEADLINE_HAS_PASSED):
            ctez2.using(sender).remove_tez_liquidity(receiver, 0, 0, 0, 0, self.get_passed_timestamp()).send()

    def test_should_fail_if_insufficient_liquidity_in_account(self) -> None:
        deposit_amount = 100
        ctez2, _, not_owner, receiver, owner = self.default_setup(
            tez_liquidity = deposit_amount
        )

        with self.raises_michelson_error(Ctez2.Errors.INSUFFICIENT_LIQUIDITY):
            ctez2.using(not_owner).remove_tez_liquidity(receiver, 1, 0, 0, 0, self.get_future_timestamp()).send()

        with self.raises_michelson_error(Ctez2.Errors.INSUFFICIENT_LIQUIDITY):
            ctez2.using(owner).remove_tez_liquidity(receiver, deposit_amount + 1, 0, 0, 0, self.get_future_timestamp()).send()

    def test_should_transfer_tokens_correctly(self) -> None:
        deposit_amount = 100
        ctez2, ctez_token, owner, receiver, *_ = self.default_setup()

        ctez2.using(owner).add_tez_liquidity(owner, 0, self.get_future_timestamp()).with_amount(deposit_amount).send()
        self.bake_block()

        prev_receiver_tez_balance = self.get_balance_mutez(receiver)
        prev_ctez2_tez_balance = self.get_balance_mutez(ctez2)
        prev_ctez2_ctez_balance = ctez_token.view_balance(ctez2)

        ctez2.using(owner).remove_tez_liquidity(receiver, deposit_amount, 0, 0, 0, self.get_future_timestamp()).send()
        self.bake_block()

        assert self.get_balance_mutez(receiver) == prev_receiver_tez_balance + deposit_amount
        assert self.get_balance_mutez(ctez2) == prev_ctez2_tez_balance - deposit_amount
        assert ctez_token.view_balance(ctez2) == prev_ctez2_ctez_balance

    def test_should_withdraw_from_tez_dex_at_the_beginning(self) -> None:
        deposit_amount = tez_liquidity = 10_000_000
        ctez2, _, receiver, _, depositor_0 = self.default_setup(
            tez_liquidity = tez_liquidity,
            ctez_total_supply = tez_liquidity * 10_000,
            bootstrap_all_tez_balances = True
        )

        prev_sell_tez_dex = ctez2.get_sell_tez_dex()
        prev_depositor_0_account = ctez2.get_tez_liquidity_owner(depositor_0)

        assert prev_sell_tez_dex.total_liquidity_shares == tez_liquidity
        assert prev_sell_tez_dex.self_reserves == tez_liquidity
        assert prev_sell_tez_dex.proceeds_reserves == 0
        assert prev_sell_tez_dex.proceeds_debts == 0
        assert prev_sell_tez_dex.subsidy_reserves == 0
        assert prev_sell_tez_dex.subsidy_debts == 0

        assert prev_depositor_0_account.liquidity_shares == 10_000_000
        assert prev_depositor_0_account.proceeds_owed == 0
        assert prev_depositor_0_account.subsidy_owed == 0

        prev_receiver_tez_balance = self.get_balance_mutez(receiver)
        ctez2.using(depositor_0).remove_tez_liquidity(receiver, prev_depositor_0_account.liquidity_shares, 0, 0, 0, self.get_future_timestamp()).send()
        self.bake_block()

        current_sell_tez_dex = ctez2.get_sell_tez_dex()
        current_depositor_0_account = ctez2.get_tez_liquidity_owner(depositor_0)

        assert current_sell_tez_dex.total_liquidity_shares == prev_sell_tez_dex.total_liquidity_shares - prev_depositor_0_account.liquidity_shares
        assert current_sell_tez_dex.self_reserves == prev_sell_tez_dex.self_reserves - deposit_amount
        assert current_sell_tez_dex.proceeds_reserves == 0
        assert current_sell_tez_dex.proceeds_debts == 0
        assert current_sell_tez_dex.subsidy_reserves == 0
        assert current_sell_tez_dex.subsidy_debts == 0

        assert current_depositor_0_account.liquidity_shares == 0
        assert current_depositor_0_account.proceeds_owed == 0
        assert current_depositor_0_account.subsidy_owed == 0

        assert self.get_balance_mutez(receiver) == prev_receiver_tez_balance + deposit_amount
        
    @parameterized.expand([
        (lambda d0, d1, d2: (d0, d1, d2)),
        (lambda d0, d1, d2: (d0, d2, d1)),
        (lambda d0, d1, d2: (d1, d0, d2)),
        (lambda d0, d1, d2: (d1, d2, d0)),
        (lambda d0, d1, d2: (d2, d0, d1)),
        (lambda d0, d1, d2: (d2, d1, d0)),
    ])
    def test_should_withdraw_correctly_from_tez_dex_for_several_depositors_regardless_of_order(
            self, 
            order_depositors : Callable[[tuple[PyTezosClient, PyTezosClient, PyTezosClient]], tuple[PyTezosClient, PyTezosClient, PyTezosClient]]
        ) -> None:
        ctez2, ctez_token, depositor_0, depositor_1, depositor_2 = self.prepare_tez_dex_liquidity()

        depositors = (depositor_0, depositor_1, depositor_2)
        depositor_names = dict((t[1], f'depositor_{t[0]}') for t in enumerate(depositors))
        depositor_accounts = dict((depositor_names[d], ctez2.get_tez_liquidity_owner(d)) for d in depositors)
        prev_depositor_tez_balances = dict((depositor_names[d], self.get_balance_mutez(d)) for d in depositors)
        prev_depositor_ctez_balances = dict((depositor_names[d], ctez_token.view_balance(d)) for d in depositors)
        prev_sell_ctez_dex = ctez2.get_sell_ctez_dex()
        prev_tez_dex_ctez_balance = ctez_token.view_balance(ctez2) - prev_sell_ctez_dex.self_reserves - prev_sell_ctez_dex.subsidy_reserves

        print('Start withdrawing...')

        dep_ops = {}
        for d in order_depositors(*depositors):
            d_name = depositor_names[d]
            print(f'{d_name} withdraws')
            opg = ctez2.using(d).remove_tez_liquidity(d, depositor_accounts[d_name].liquidity_shares, 0, 0, 0, self.get_future_timestamp()).send()
            self.bake_block()
            dep_ops[d_name] = opg

        depositor_balances_diffs = dict(
            (
                depositor_names[d], 
                BalanceDiffs(
                    ctez_diff = ctez_token.view_balance(d) - prev_depositor_ctez_balances[depositor_names[d]],
                    tez_diff = self.get_balance_mutez(d) - prev_depositor_tez_balances[depositor_names[d]] + get_consumed_mutez(self.manager, dep_ops[depositor_names[d]])
                )
            ) 
            for d in depositors
        )
        depositor_accounts = dict((depositor_names[d], ctez2.get_tez_liquidity_owner(d)) for d in depositors)

        sell_tez_dex = ctez2.get_sell_tez_dex()
        sell_ctez_dex = ctez2.get_sell_ctez_dex()
        tez_dex_ctez_balance = ctez_token.view_balance(ctez2) - sell_ctez_dex.self_reserves - sell_ctez_dex.subsidy_reserves
        tez_dex_tez_balance = self.get_balance_mutez(ctez2) - sell_ctez_dex.proceeds_reserves

        print_dict('depositor_balances_diffs:', depositor_balances_diffs)
        print_dict('depositor_accounts_after_withdrawals:', depositor_accounts)
        print('current dex state:', sell_tez_dex)
        print('ctez dex ctez balance:', tez_dex_ctez_balance)
        print('ctez dex tez balance:', tez_dex_tez_balance)
        
        assert sell_tez_dex.total_liquidity_shares == 0
        assert sell_tez_dex.subsidy_reserves == 0
        assert sell_tez_dex.proceeds_reserves == 0
        assert sell_tez_dex.proceeds_debts == 0
        assert sell_tez_dex.subsidy_reserves == 0
        assert sell_tez_dex.subsidy_debts == 0
        assert tez_dex_ctez_balance == 0
        assert tez_dex_tez_balance == 0

        # depositors 1 and 2 provided liquidity after proceeds were accumulated, thats why they do not have any of proceeds
        assert depositor_balances_diffs[depositor_names[depositor_0]].tez_diff == 10000000 
        assert depositor_balances_diffs[depositor_names[depositor_0]].ctez_diff in (5248754 + 292, 5248754 + 291) # because of rounding
        assert depositor_balances_diffs[depositor_names[depositor_1]].tez_diff == 10000000 
        assert depositor_balances_diffs[depositor_names[depositor_1]].ctez_diff in (292 - 94, 291 - 94) # because of rounding
        assert depositor_balances_diffs[depositor_names[depositor_2]].tez_diff == 10000000
        assert depositor_balances_diffs[depositor_names[depositor_2]].ctez_diff in (292 - 213, 291 - 213) # because of rounding

        assert all(a.liquidity_shares == 0 and a.proceeds_owed == 0 and a.subsidy_owed == 0 for a in depositor_accounts.values())
        assert sum(d.ctez_diff for d in depositor_balances_diffs.values()) == prev_tez_dex_ctez_balance 

    def test_should_remove_zero_liquidity_from_empty_account_correctly(self) -> None:
        ctez2, _, empty_account, _, _ = self.default_setup()

        prev_tez_dex = ctez2.get_sell_tez_dex()
        prev_depositor_tez_balance = self.get_balance_mutez(empty_account)
        opg = ctez2.using(empty_account).remove_tez_liquidity(empty_account, 0, 0, 0, 0, self.get_future_timestamp()).send()
        self.bake_block()
        
        current_tez_dex = ctez2.get_sell_tez_dex()
        current_account = ctez2.get_tez_liquidity_owner(empty_account)
        assert current_tez_dex.total_liquidity_shares == prev_tez_dex.total_liquidity_shares
        assert current_tez_dex.self_reserves == prev_tez_dex.self_reserves
        assert current_tez_dex.proceeds_reserves == prev_tez_dex.proceeds_reserves
        assert current_tez_dex.proceeds_debts == prev_tez_dex.proceeds_debts
        assert current_tez_dex.subsidy_reserves == prev_tez_dex.subsidy_reserves
        assert current_tez_dex.subsidy_debts == prev_tez_dex.subsidy_debts
        assert current_account.liquidity_shares == 0
        assert current_account.proceeds_owed == 0
        assert current_account.subsidy_owed == 0
        assert self.get_balance_mutez(empty_account) == prev_depositor_tez_balance - get_consumed_mutez(empty_account, opg)


    def test_should_remove_zero_liquidity_from_not_empty_account_correctly(self) -> None:
        ctez2, _, _, depositor_1, _ = self.prepare_tez_dex_liquidity()

        prev_tez_dex = ctez2.get_sell_tez_dex()
        prev_account = ctez2.get_tez_liquidity_owner(depositor_1)
        prev_depositor_tez_balance = self.get_balance_mutez(depositor_1)
        opg = ctez2.using(depositor_1).remove_tez_liquidity(depositor_1, 0, 0, 0, 0, self.get_future_timestamp()).send()
        self.bake_block()
        
        current_tez_dex = ctez2.get_sell_tez_dex()
        current_account = ctez2.get_tez_liquidity_owner(depositor_1)
        assert current_tez_dex.total_liquidity_shares == prev_tez_dex.total_liquidity_shares
        assert current_tez_dex.self_reserves == prev_tez_dex.self_reserves
        assert current_tez_dex.proceeds_reserves == prev_tez_dex.proceeds_reserves
        assert current_tez_dex.proceeds_debts == prev_tez_dex.proceeds_debts
        assert current_tez_dex.subsidy_reserves == prev_tez_dex.subsidy_reserves
        assert current_tez_dex.subsidy_debts == prev_tez_dex.subsidy_debts
        assert current_account.liquidity_shares == prev_account.liquidity_shares
        assert current_account.proceeds_owed == prev_account.proceeds_owed
        assert current_account.subsidy_owed == prev_account.subsidy_owed
        assert self.get_balance_mutez(depositor_1) == prev_depositor_tez_balance - get_consumed_mutez(depositor_1, opg)

    def test_should_remove_partial_liquidity_correctly(self) -> None:
        ctez2, ctez_token, _, depositor_1, _ = self.prepare_tez_dex_liquidity()

        redeemed_liquidity = 7_500_000
        prev_tez_dex = ctez2.get_sell_tez_dex()
        prev_depositor_tez_balance = self.get_balance_mutez(depositor_1)
        prev_depositor_ctez_balance = ctez_token.view_balance(depositor_1)
        # remove 50% of liquidity
        opg = ctez2.using(depositor_1).remove_tez_liquidity(depositor_1, redeemed_liquidity, 0, 0, 0, self.get_future_timestamp()).send()
        self.bake_block()
        
        current_tez_dex = ctez2.get_sell_tez_dex()
        current_account = ctez2.get_tez_liquidity_owner(depositor_1)
        assert current_tez_dex.total_liquidity_shares == prev_tez_dex.total_liquidity_shares - redeemed_liquidity
        assert current_tez_dex.self_reserves == prev_tez_dex.self_reserves - 5_000_000
        assert current_tez_dex.proceeds_reserves == prev_tez_dex.proceeds_reserves - 2624377
        assert current_tez_dex.proceeds_debts == prev_tez_dex.proceeds_debts - 2624377
        assert current_tez_dex.subsidy_reserves == prev_tez_dex.subsidy_reserves - 145
        assert current_tez_dex.subsidy_debts == prev_tez_dex.subsidy_debts - 94
        assert current_account.liquidity_shares == 7500000 # 50% of shares have been removed
        assert current_account.proceeds_owed == 2624377 # 50% of debts have been removed
        assert current_account.subsidy_owed == 0 # 146 earned - 94 debts = 52 to send and 0 is rest debt
        assert self.get_balance_mutez(depositor_1) == prev_depositor_tez_balance + 5_000_000 - get_consumed_mutez(depositor_1, opg) # 50% of deposited self token
        assert ctez_token.view_balance(depositor_1) == prev_depositor_ctez_balance + 51 # earned subsidy

    def test_should_fail_if_insufficient_amount_received(self) -> None:
        ctez2, _, depositor_0, *_ = self.prepare_tez_dex_liquidity()
        account = ctez2.get_tez_liquidity_owner(depositor_0)

        with self.raises_michelson_error(Ctez2.Errors.INSUFFICIENT_SELF_RECEIVED):
            ctez2.using(depositor_0).remove_tez_liquidity(depositor_0, account.liquidity_shares, 10000001, 0, 0, self.get_future_timestamp()).send()

        with self.raises_michelson_error(Ctez2.Errors.INSUFFICIENT_PROCEEDS_RECEIVED):
            ctez2.using(depositor_0).remove_tez_liquidity(depositor_0, account.liquidity_shares, 0, 5248755, 0, self.get_future_timestamp()).send()

        with self.raises_michelson_error(Ctez2.Errors.INSUFFICIENT_SUBSIDY_RECEIVED):
            ctez2.using(depositor_0).remove_tez_liquidity(depositor_0, account.liquidity_shares, 0, 0, 293, self.get_future_timestamp()).send()
        