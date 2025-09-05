from tests.fa12.base import Fa12BaseTestCase
from tests.helpers.contracts.fa12.fa12 import Fa12

class Fa12MintOrBurnTestCase(Fa12BaseTestCase):
    def test_should_fail_if_tez_in_transaction(self) -> None:
        admin, target, fa12, *_ = self.default_setup()

        with self.raises_michelson_error(Fa12.Errors.DONT_SEND_TEZ):
            fa12.using(admin).mintOrBurn(10, target).with_amount(1).send()

    def test_should_fail_if_sender_not_admin(self) -> None:
        _, target, fa12, *_ = self.default_setup(
            get_admin = lambda admin, *_: admin
        )

        with self.raises_michelson_error(Fa12.Errors.ONLY_ADMIN):
            fa12.using(target).mintOrBurn(10, target).send()

    def test_should_fail_if_burn_amount_less_then_target_balance(self) -> None:
        admin, target, fa12, *_ = self.default_setup(
            get_balances = lambda _, target: {
                target: 10
            },
            get_admin = lambda admin, *_: admin
        )

        with self.raises_michelson_error(Fa12.Errors.CANNOT_BURN_MORE_THAN_THE_TARGETS_BALANCE):
            fa12.using(admin).mintOrBurn(-11, target).send()

    def test_should_mint_correctly(self) -> None:
        mintAmount = 20
        admin, target, fa12, *_ = self.default_setup(
            get_balances = lambda admin, target: {
                admin: 123,
                target: 10
            },
            get_admin = lambda admin, *_: admin
        )

        prev_admin_balance = fa12.view_balance(admin)
        prev_target_balance = fa12.view_balance(target)
        prev_total_supply = fa12.view_total_supply()

        fa12.using(admin).mintOrBurn(mintAmount, target).send()
        self.bake_block()

        assert fa12.view_balance(admin) == prev_admin_balance
        assert fa12.view_balance(target) == prev_target_balance + mintAmount
        assert fa12.view_total_supply() == prev_total_supply + mintAmount

    def test_should_burn_correctly(self) -> None:
        burnAmount = 40
        admin, target, fa12, *_ = self.default_setup(
            get_balances = lambda admin, target: {
                admin: 123,
                target: 100
            },
            get_admin = lambda admin, *_: admin
        )

        prev_admin_balance = fa12.view_balance(admin)
        prev_target_balance = fa12.view_balance(target)
        prev_total_supply = fa12.view_total_supply()

        fa12.using(admin).mintOrBurn(-burnAmount, target).send()
        self.bake_block()

        assert fa12.view_balance(admin) == prev_admin_balance
        assert fa12.view_balance(target) == prev_target_balance - burnAmount
        assert fa12.view_total_supply() == prev_total_supply - burnAmount
