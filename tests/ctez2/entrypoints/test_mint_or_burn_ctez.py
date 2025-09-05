from math import ceil
from tests.ctez2.base import Ctez2BaseTestCase
from tests.helpers.contracts.ctez2.ctez2 import Ctez2
from tests.helpers.utility import get_consumed_mutez

class Ctez2MintOrBurnTestCase(Ctez2BaseTestCase):
    def test_should_fail_if_tez_in_transaction(self) -> None:
        ctez2, _, owner, *_ = self.default_setup()

        oven_id = 2
        with self.raises_michelson_error(Ctez2.Errors.TEZ_IN_TRANSACTION_DISALLOWED):
            ctez2.using(owner).mint_or_burn(oven_id, 123).with_amount(1).send()

    def test_should_fail_if_oven_not_exist(self) -> None:
        ctez2, _, owner, *_ = self.default_setup()

        oven_id = 2
        with self.raises_michelson_error(Ctez2.Errors.OVEN_NOT_EXISTS):
            ctez2.using(owner).mint_or_burn(oven_id, 123).send()

    def test_should_fail_if_burn_more_than_outstanding_ctez(self) -> None:
        ctez2, _, owner, *_ = self.default_setup(
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

        with self.raises_michelson_error(Ctez2.Errors.EXCESSIVE_CTEZ_BURNING):
            ctez2.using(owner).mint_or_burn(oven_id, -(outstanding_balance + 1)).send()

    def test_should_fail_if_mint_led_to_liquidation(self) -> None:
        ctez2, _, owner, *_ = self.default_setup(
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
        with self.raises_michelson_error(Ctez2.Errors.EXCESSIVE_CTEZ_MINTING):
            ctez2.using(owner).mint_or_burn(oven_id, 1).send()

    def test_should_mint_ctez_correctly(self) -> None:
        ctez2, ctez_token, owner, *_ = self.default_setup(
            ctez_liquidity = 100_000_000,
            tez_liquidity = 100_000_000
        )

        oven_id = 12
        balance = 100
        ctez_minted = 50

        ctez2.using(owner).create_oven(oven_id, None, None).with_amount(balance).send()
        self.bake_block()

        prev_oven_info = ctez2.get_oven(owner, oven_id)
        oven = ctez2.get_oven_contract(owner, owner, oven_id)
        prev_oven_tez_balance = self.get_balance_mutez(oven)
        prev_owner_tez_balance = self.get_balance_mutez(owner)
        prev_owner_ctez_balance = ctez_token.view_balance(owner)
        prev_total_supply = ctez_token.view_total_supply()

        opg = ctez2.using(owner).mint_or_burn(oven_id, ctez_minted).send()
        self.bake_block()

        assert self.get_balance_mutez(owner) == prev_owner_tez_balance - get_consumed_mutez(owner, opg)
        assert ctez_token.view_balance(owner) == prev_owner_ctez_balance + ctez_minted
        assert ctez_token.view_total_supply() == prev_total_supply + ctez_minted
        assert ctez2.get_oven(owner, oven_id).ctez_outstanding == prev_oven_info.ctez_outstanding + ctez_minted
        assert self.get_balance_mutez(oven) == prev_oven_tez_balance
    
    def test_should_burn_ctez_correctly(self) -> None:
        ctez2, ctez_token, owner, *_ = self.default_setup(
            ctez_liquidity = 100_000_000,
            tez_liquidity = 100_000_000
        )

        oven_id = 12
        balance = 100
        ctez_minted = 50
        ctez_burned = 20

        owner.bulk(
            ctez2.create_oven(oven_id, None, None).with_amount(balance),
            ctez2.mint_or_burn(oven_id, ctez_minted)
        ).send()
        self.bake_block()

        prev_oven_info = ctez2.get_oven(owner, oven_id)
        oven = ctez2.get_oven_contract(owner, owner, oven_id)
        prev_oven_tez_balance = self.get_balance_mutez(oven)
        prev_owner_tez_balance = self.get_balance_mutez(owner)
        prev_owner_ctez_balance = ctez_token.view_balance(owner)
        prev_total_supply = ctez_token.view_total_supply()

        opg = ctez2.using(owner).mint_or_burn(oven_id, -ctez_burned).send()
        self.bake_block()

        assert self.get_balance_mutez(owner) == prev_owner_tez_balance - get_consumed_mutez(owner, opg)
        assert ctez_token.view_balance(owner) == prev_owner_ctez_balance - ctez_burned
        assert ctez_token.view_total_supply() == prev_total_supply - ctez_burned
        assert ctez2.get_oven(owner, oven_id).ctez_outstanding == prev_oven_info.ctez_outstanding - ctez_burned
        assert self.get_balance_mutez(oven) == prev_oven_tez_balance
