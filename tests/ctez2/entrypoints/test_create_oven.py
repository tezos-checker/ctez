from tests.ctez2.base import Ctez2BaseTestCase
from tests.helpers.addressable import get_address
from parameterized import parameterized
from pytezos import Unit
from tests.helpers.contracts.ctez2.ctez2 import Ctez2
from tests.helpers.utility import TEST_ADDRESSES_SET

class Ctez2CreateOvenTestCase(Ctez2BaseTestCase):
    @parameterized.expand([
        ('without_initial_balance',           0, False, None),
        ('with_initial_balance',    100_000_000, False, None),
        ('with_delegate',           100_000_000, True, None),
        ('with_depositors',         100_000_000, True, [TEST_ADDRESSES_SET[0], TEST_ADDRESSES_SET[1]]),
    ])
    def test_should_create_oven_correctly(self, _name: str, initial_balance: int, with_delegate: bool, depositors: list | None) -> None:
        ctez2, _, owner, *_ = self.default_setup()
        delegate = get_address(self.bootstrap_baker()) if with_delegate else None

        oven_id = 2
        ctez2.using(owner).create_oven(oven_id, delegate, depositors).with_amount(initial_balance).send()
        self.bake_block()

        ctez_dex = ctez2.get_sell_ctez_dex()
        tez_dex = ctez2.get_sell_tez_dex()
        oven_info = ctez2.get_oven(owner, oven_id)
        assert oven_info.tez_balance == initial_balance 
        assert oven_info.ctez_outstanding == 0 
        assert oven_info.fee_index == ctez_dex.fee_index * tez_dex.fee_index

        oven = ctez2.get_oven_contract(owner, owner, oven_id)
        assert self.get_balance_mutez(oven) == initial_balance
        assert self.get_contract_delegate(oven) == delegate
        assert oven.get_admin() == get_address(ctez2)
        assert oven.get_depositors() == True if depositors == None else depositors

    def test_should_fail_if_oven_with_the_same_id_already_created(self) -> None:
        ctez2, _, owner, *_ = self.default_setup()

        oven_id = 2
        ctez2.using(owner).create_oven(oven_id, None, None).send()
        self.bake_block()

        with self.raises_michelson_error(Ctez2.Errors.OVEN_ALREADY_EXISTS):
            ctez2.using(owner).create_oven(oven_id, None, None).send()
