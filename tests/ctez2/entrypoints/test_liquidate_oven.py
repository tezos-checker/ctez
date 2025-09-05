from math import ceil, floor
from tests.ctez2.base import Ctez2BaseTestCase
from tests.helpers.contracts.ctez2.ctez2 import Ctez2
from tests.helpers.utility import get_consumed_mutez

class Ctez2LiquidateTestCase(Ctez2BaseTestCase):
    def test_should_fail_if_tez_in_transaction(self) -> None:
        ctez2, _, owner, receiver, *_ = self.default_setup()

        oven_id = 2
        with self.raises_michelson_error(Ctez2.Errors.TEZ_IN_TRANSACTION_DISALLOWED):
            ctez2.using(owner).liquidate_oven(owner, oven_id, 123, receiver).with_amount(1).send()

    def test_should_fail_if_oven_not_exist(self) -> None:
        ctez2, _, owner, receiver, *_ = self.default_setup()

        oven_id = 2
        with self.raises_michelson_error(Ctez2.Errors.OVEN_NOT_EXISTS):
            ctez2.using(owner).liquidate_oven(owner, oven_id, 123, receiver).send()

    def test_should_fail_if_not_undercollateralized(self) -> None:
        ctez2, _, owner, receiver, *_ = self.default_setup(
            ctez_liquidity = 100_000_000,
            tez_liquidity = 100_000_000
        )

        oven_id = 2
        outstanding_balance = 123
        owner.bulk(
            ctez2.create_oven(oven_id, None, None).with_amount(ceil(outstanding_balance * 16/15)),
            ctez2.mint_or_burn(oven_id, outstanding_balance)
        ).send()
        self.bake_block()

        with self.raises_michelson_error(Ctez2.Errors.NOT_UNDERCOLLATERALIZED):
            ctez2.using(owner).liquidate_oven(owner, oven_id, outstanding_balance, receiver).send()

    def test_should_fail_if_burning_more_than_outstanding_ctez(self) -> None:
        ctez2, _, owner, receiver, *_ = self.default_setup()

        oven_id = 2
        outstanding_balance = 150_000_000
        owner.bulk(
            ctez2.create_oven(oven_id, None, None).with_amount(ceil(outstanding_balance * 16/15)),
            ctez2.mint_or_burn(oven_id, outstanding_balance)
        ).send()
        self.bake_blocks(100)
        with self.raises_michelson_error(Ctez2.Errors.EXCESSIVE_CTEZ_BURNING):
            ctez2.using(owner).liquidate_oven(owner, oven_id, outstanding_balance + 100, receiver).send()

    def test_should_liquidate_oven_correctly(self) -> None:
        target_price = 2
        
        oven_id = 12
        ctez_minted = 150_000_000
        ctez_burned = 100_000_000
        balance = ceil(ctez_minted * 16/15 * target_price)
        ctez2, ctez_token, owner, liquidator, receiver = self.default_setup(
            target_ctez_price = target_price,
            get_ctez_token_balances = lambda _, liquidator: {
                liquidator: ctez_burned
            } 
        )

        prev_donor_oven_ctez_outstanding = ctez2.get_oven(receiver, 0).ctez_outstanding
        donor_oven = ctez2.get_oven_contract(self.manager, receiver, 0)
        owner.bulk(
            ctez2.create_oven(oven_id, None, None).with_amount(balance),
            ctez2.mint_or_burn(oven_id, ctez_minted)
        ).send()
        self.bake_blocks(100)

        prev_oven_info = ctez2.get_oven(owner, oven_id)
        oven = ctez2.get_oven_contract(owner, owner, oven_id)
        prev_oven_tez_balance = self.get_balance_mutez(oven)
        prev_liquidator_tez_balance = self.get_balance_mutez(liquidator)
        prev_owner_tez_balance = self.get_balance_mutez(owner)
        prev_receiver_tez_balance = self.get_balance_mutez(receiver)
        prev_liquidator_ctez_balance = ctez_token.view_balance(liquidator)
        prev_owner_ctez_balance = ctez_token.view_balance(owner)
        prev_receiver_ctez_balance = ctez_token.view_balance(receiver)
        prev_total_supply = ctez_token.view_total_supply()

        opg = liquidator.bulk(
            ctez2.liquidate_oven(owner, oven_id, ctez_burned, receiver),
            donor_oven.deposit().with_amount(0) # to update donor outstanding ctez
        ).send()
        self.bake_block()

        sell_ctez_dex = ctez2.get_sell_ctez_dex()
        sell_tez_dex = ctez2.get_sell_tez_dex()
        total_subsidies = sell_ctez_dex.subsidy_reserves + sell_tez_dex.subsidy_reserves
        donor_oven_subsidies_fee = ctez2.get_oven(receiver, 0).ctez_outstanding - prev_donor_oven_ctez_outstanding
        owner_oven_subsidies_fee = total_subsidies - donor_oven_subsidies_fee + 1

        expected_tez_earned = floor(ctez_burned * target_price * 32/31)
        assert self.get_balance_mutez(receiver) == prev_receiver_tez_balance + expected_tez_earned
        assert self.get_balance_mutez(oven) == prev_oven_tez_balance - expected_tez_earned
        assert ctez2.get_oven(owner, oven_id).tez_balance == prev_oven_info.tez_balance - expected_tez_earned
        assert self.get_balance_mutez(liquidator) == prev_liquidator_tez_balance - get_consumed_mutez(liquidator, opg)
        assert self.get_balance_mutez(owner) == prev_owner_tez_balance

        assert ctez_token.view_balance(liquidator) == prev_liquidator_ctez_balance - ctez_burned
        assert ctez_token.view_total_supply() == prev_total_supply + total_subsidies - ctez_burned 
        assert ctez2.get_oven(owner, oven_id).ctez_outstanding == prev_oven_info.ctez_outstanding + owner_oven_subsidies_fee - ctez_burned
        assert ctez_token.view_balance(owner) == prev_owner_ctez_balance
        assert ctez_token.view_balance(receiver) == prev_receiver_ctez_balance

    def test_should_liquidate_oven_completely(self) -> None:
        target_price = 1.05
        
        oven_id = 12
        ctez_minted = 150_000_000
        expected_subsidies = 9
        ctez_burned = 150_000_000 + expected_subsidies
        balance = ceil(ctez_minted * 16/15 * target_price)
        ctez2, ctez_token, owner, liquidator, receiver = self.default_setup(
            target_ctez_price = target_price,
            get_ctez_token_balances = lambda _, liquidator: {
                liquidator: ctez_burned
            } 
        )

        donor_oven = ctez2.get_oven_contract(self.manager, receiver, 0)
        owner.bulk(
            ctez2.create_oven(oven_id, None, None).with_amount(balance),
            ctez2.mint_or_burn(oven_id, ctez_minted)
        ).send()
        self.bake_blocks(100)

        prev_oven_info = ctez2.get_oven(owner, oven_id)
        oven = ctez2.get_oven_contract(owner, owner, oven_id)
        prev_oven_tez_balance = self.get_balance_mutez(oven)
        prev_liquidator_tez_balance = self.get_balance_mutez(liquidator)
        prev_owner_tez_balance = self.get_balance_mutez(owner)
        prev_receiver_tez_balance = self.get_balance_mutez(receiver)
        prev_liquidator_ctez_balance = ctez_token.view_balance(liquidator)
        prev_owner_ctez_balance = ctez_token.view_balance(owner)
        prev_receiver_ctez_balance = ctez_token.view_balance(receiver)
        prev_total_supply = ctez_token.view_total_supply()

        opg = liquidator.bulk(
            ctez2.liquidate_oven(owner, oven_id, ctez_burned, receiver),
            donor_oven.deposit().with_amount(0) # to update donor outstanding ctez
        ).send()
        self.bake_block()

        sell_ctez_dex = ctez2.get_sell_ctez_dex()
        sell_tez_dex = ctez2.get_sell_tez_dex()
        total_subsidies = sell_ctez_dex.subsidy_reserves + sell_tez_dex.subsidy_reserves

        expected_tez_earned = floor(ctez_burned * target_price * 32/31)
        assert self.get_balance_mutez(receiver) == prev_receiver_tez_balance + expected_tez_earned
        assert self.get_balance_mutez(oven) == prev_oven_tez_balance - expected_tez_earned
        assert ctez2.get_oven(owner, oven_id).tez_balance == prev_oven_info.tez_balance - expected_tez_earned
        assert self.get_balance_mutez(liquidator) == prev_liquidator_tez_balance - get_consumed_mutez(liquidator, opg)
        assert self.get_balance_mutez(owner) == prev_owner_tez_balance

        assert ctez_token.view_balance(liquidator) == prev_liquidator_ctez_balance - ctez_burned
        assert ctez_token.view_total_supply() == prev_total_supply + total_subsidies - ctez_burned 
        assert ctez2.get_oven(owner, oven_id).ctez_outstanding == 0
        assert ctez_token.view_balance(owner) == prev_owner_ctez_balance
        assert ctez_token.view_balance(receiver) == prev_receiver_ctez_balance
