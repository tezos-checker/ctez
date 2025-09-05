from typing import Callable, Optional
from tests.helpers.addressable import Addressable, get_address
from tests.helpers.contracts.oven.oven import Oven
from tests.helpers.utility import get_consumed_mutez
from tests.oven.base import OvenBaseTestCase
from parameterized import parameterized
from pytezos.client import PyTezosClient


class OvenDepositTestCase(OvenBaseTestCase):
    def test_should_fail_if_not_authorized_depositor(self) -> None:
        oven, _, _, _, depositor, not_depositor = self.default_setup(
            depositors = lambda depositor, *_: [depositor]
        )

        with self.raises_michelson_error(Oven.Errors.UNAUTHORIZED_DEPOSITOR):
            oven.using(not_depositor).deposit().with_amount(123).send()


    @parameterized.expand([
        ('owner_call__any_allowed',             lambda owner, _: owner,         lambda *_ : None ),
        ('owner_call__no_allowed_depositors',   lambda owner, _: owner,         lambda *_ : [] ),
        ('not_owner_call__any_allowed',         lambda _, not_owner: not_owner, lambda *_ : None ),
        ('not_owner_call__not_owner_allowed',   lambda _, not_owner: not_owner, lambda _, not_owner : [not_owner] ),
    ])
    def test_should_deposit_correctly(
        self, 
        _name: str, 
        get_sender: Callable[[PyTezosClient, PyTezosClient], PyTezosClient],
        get_allowed_depositors: Callable[[PyTezosClient, PyTezosClient], Optional[list[Addressable]]]
    ) -> None:
        oven_id = 1
        oven, ctez2, ctez_token, owner, not_owner, *_ = self.default_setup(
            oven_id = 1,
            depositors = lambda owner, not_owner, *_ : get_allowed_depositors(owner, not_owner),
            ctez_liquidity = 100_000_000,
            tez_liquidity = 100_000_000
        )

        sender = get_sender(owner, not_owner)

        deposit_amount = 123

        prev_ctez2_tez_balance = self.get_balance_mutez(ctez2)
        prev_ctez2_ctez_balance = ctez_token.view_balance(ctez2)
        prev_oven_info = ctez2.get_oven(owner, oven_id)
        prev_oven_tez_balance = self.get_balance_mutez(oven)
        prev_oven_ctez_balance = ctez_token.view_balance(oven)
        prev_depositor_tez_balance = self.get_balance_mutez(sender)
        prev_depositor_ctez_balance = ctez_token.view_balance(sender)

        opg = oven.using(sender).deposit().with_amount(deposit_amount).send()
        self.bake_block()

        oven_info = ctez2.get_oven(owner, oven_id)
        assert self.get_balance_mutez(ctez2) == prev_ctez2_tez_balance
        assert ctez_token.view_balance(ctez2) == prev_ctez2_ctez_balance
        assert oven_info.ctez_outstanding == prev_oven_info.ctez_outstanding
        assert oven_info.tez_balance == prev_oven_info.tez_balance + deposit_amount
        assert self.get_balance_mutez(oven) == prev_oven_tez_balance + deposit_amount
        assert ctez_token.view_balance(oven) == prev_oven_ctez_balance
        assert self.get_balance_mutez(sender) == prev_depositor_tez_balance - deposit_amount - get_consumed_mutez(sender, opg)
        assert ctez_token.view_balance(sender) == prev_depositor_ctez_balance
