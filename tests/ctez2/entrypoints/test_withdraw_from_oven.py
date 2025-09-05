from tests.ctez2.base import Ctez2BaseTestCase
from tests.helpers.contracts.ctez2.ctez2 import Ctez2
from tests.helpers.utility import get_consumed_mutez

class Ctez2WithdrawTestCase(Ctez2BaseTestCase):
    def test_should_fail_if_tez_in_transaction(self) -> None:
        ctez2, _, owner, receiver, *_ = self.default_setup()

        oven_id = 2
        with self.raises_michelson_error(Ctez2.Errors.TEZ_IN_TRANSACTION_DISALLOWED):
            ctez2.using(owner).withdraw_from_oven(oven_id, 123, receiver).with_amount(1).send()

    def test_should_fail_if_oven_not_exist(self) -> None:
        ctez2, _, owner, receiver, *_ = self.default_setup()

        oven_id = 2
        with self.raises_michelson_error(Ctez2.Errors.OVEN_NOT_EXISTS):
            ctez2.using(owner).withdraw_from_oven(oven_id, 123, receiver).send()

    def test_should_fail_if_withdraw_more_than_balance(self) -> None:
        ctez2, _, owner, receiver, *_ = self.default_setup()

        oven_id = 2
        balance = 123
        ctez2.using(owner).create_oven(oven_id, None, None).with_amount(balance).send()
        self.bake_block()

        with self.raises_michelson_error(Ctez2.Errors.EXCESSIVE_TEZ_WITHDRAWAL):
            ctez2.using(owner).withdraw_from_oven(oven_id, balance + 1, receiver).send()

    def test_should_fail_if_withdraw_led_to_liquidation(self) -> None:
        ctez2, _, owner, receiver, *_ = self.default_setup(
            ctez_liquidity = 100_000_000,
            tez_liquidity = 100_000_000
        )

        oven_id = 12
        balance = 16
        ctez_minted = 15
        owner.bulk(
            ctez2.create_oven(oven_id, None, None).with_amount(balance),
            ctez2.mint_or_burn(oven_id, ctez_minted)
        ).send()
        self.bake_block()

        with self.raises_michelson_error(Ctez2.Errors.EXCESSIVE_TEZ_WITHDRAWAL):
            ctez2.using(owner).withdraw_from_oven(oven_id, 1, receiver).send()

    def test_should_withdraw_from_oven_correctly(self) -> None:
        ctez2, _, owner, receiver, *_ = self.default_setup(
            ctez_liquidity = 100_000_000,
            tez_liquidity = 100_000_000            
        )

        oven_id = 12
        balance = 17
        withdraw_amount = 1
        ctez_minted = 15
        owner.bulk(
            ctez2.create_oven(oven_id, None, None).with_amount(balance),
            ctez2.mint_or_burn(oven_id, ctez_minted)
        ).send()
        self.bake_block()

        prev_oven_info = ctez2.get_oven(owner, oven_id)
        oven = ctez2.get_oven_contract(owner, owner, oven_id)
        prev_owner_tez_balance = self.get_balance_mutez(owner)
        prev_receiver_tez_balance = self.get_balance_mutez(receiver)
        prev_oven_tez_balance = self.get_balance_mutez(oven)

        opg = ctez2.using(owner).withdraw_from_oven(oven_id, withdraw_amount, receiver).send()
        self.bake_block()

        assert self.get_balance_mutez(owner) == prev_owner_tez_balance - get_consumed_mutez(owner, opg)
        assert self.get_balance_mutez(receiver) == prev_receiver_tez_balance + withdraw_amount
        assert self.get_balance_mutez(oven) == prev_oven_tez_balance - withdraw_amount
        assert ctez2.get_oven(owner, oven_id).tez_balance == prev_oven_info.tez_balance - withdraw_amount
