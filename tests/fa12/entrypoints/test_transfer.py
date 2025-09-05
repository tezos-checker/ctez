from tests.fa12.base import Fa12BaseTestCase
from tests.helpers.contracts.fa12.fa12 import Fa12

class Fa12TransferTestCase(Fa12BaseTestCase):
    def test_should_fail_if_tez_in_transaction(self) -> None:
        owner, recipient, fa12, *_ = self.default_setup(
            get_balances = lambda owner, *_: {
                owner: 100,
            }
        )
        with self.raises_michelson_error(Fa12.Errors.DONT_SEND_TEZ):
            fa12.using(owner).transfer(owner, recipient, 10).with_amount(1).send()

    def test_should_fail_if_not_enough_balance(self) -> None:
        owner, recipient, fa12, *_ = self.default_setup(
            get_balances = lambda owner, *_: {
                owner: 100,
            }
        )
        with self.raises_michelson_error(Fa12.Errors.NOT_ENOUGH_BALANCE):
            fa12.using(owner).transfer(owner, recipient, 101).send()

    def test_should_fail_if_sender_is_not_allowed(self) -> None:
        owner, recipient, fa12, *_ = self.default_setup(
            get_balances = lambda owner, *_: {
                owner: 100,
            }
        )
        with self.raises_michelson_error(Fa12.Errors.NOT_ENOUGH_ALLOWANCE):
            fa12.using(recipient).transfer(owner, recipient, 10).send()

    def test_should_fail_if_sender_has_not_enough_allowance(self) -> None:
        owner, recipient, fa12, *_ = self.default_setup(
            get_balances = lambda owner, *_: {
                owner: 100,
            },
            get_allowances=lambda owner, recipient: [
                (owner, recipient, 50)
            ]
        )
        with self.raises_michelson_error(Fa12.Errors.NOT_ENOUGH_ALLOWANCE):
            fa12.using(recipient).transfer(owner, recipient, 51).send()

    def test_should_transfer_correctly_if_sender_is_owner(self) -> None:
        owner, recipient, fa12, *_ = self.default_setup(
            get_balances = lambda owner, *_: {
                owner: 100,
            }
        )

        prev_owner_balance = fa12.view_balance(owner)
        prev_recipient_balance = fa12.view_balance(recipient)
        transfer_amount = 10

        fa12.using(owner).transfer(owner, recipient, transfer_amount).send()
        self.bake_block()

        assert fa12.view_balance(owner) == prev_owner_balance - transfer_amount
        assert fa12.view_balance(recipient) == prev_recipient_balance + transfer_amount

    def test_should_transfer_correctly_if_sender_is_allowed(self) -> None:
        allowed_amount = 50
        transfer_amount = 30

        owner, recipient, fa12, *_ = self.default_setup(
            get_balances = lambda owner, *_: {
                owner: 100,
            },
            get_allowances= lambda owner, recipient: [
                (owner, recipient, allowed_amount)
            ]
        )

        owner_prev_balance = fa12.view_balance(owner)
        recipient_prev_balance = fa12.view_balance(recipient)

        fa12.using(recipient).transfer(owner, recipient, transfer_amount).send()
        self.bake_block()

        assert fa12.view_balance(owner) == owner_prev_balance - transfer_amount
        assert fa12.view_balance(recipient) == recipient_prev_balance + transfer_amount
        assert fa12.view_allowance(owner, recipient) == allowed_amount - transfer_amount
