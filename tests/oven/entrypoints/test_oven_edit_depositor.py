from tests.helpers.addressable import Addressable, get_address
from tests.helpers.contracts.oven.oven import Oven
from tests.helpers.utility import TEST_ADDRESSES_SET
from tests.oven.base import OvenBaseTestCase
from parameterized import parameterized

class OvenEditDepositTestCase(OvenBaseTestCase):
    def test_should_fail_if_tez_in_transaction(self) -> None:
        oven, _, _, owner, *_ = self.default_setup()

        with self.raises_michelson_error(Oven.Errors.TEZ_IN_TRANSACTION_DISALLOWED):
            oven.using(owner).oven_edit_depositor(True).with_amount(1).send()

    def test_should_fail_if_called_not_by_owner(self) -> None:
        oven, _, _, _, not_owner, *_ = self.default_setup()

        with self.raises_michelson_error(Oven.Errors.ONLY_OWNER_CAN_CALL):
            oven.using(not_owner).oven_edit_depositor(True).send()

    def test_should_fail_if_allow_depositor_when_anyone_allowed(self) -> None:
        oven, _, _, owner, not_owner, *_ = self.default_setup(
            depositors = None
        )

        for allowed in (True, False):
            with self.raises_michelson_error(Oven.Errors.SET_ANY_OFF_FIRST):
                oven.using(owner).oven_edit_depositor((not_owner, allowed)).send()

    @parameterized.expand([
        ('allow_all', True, True),
        ('disallow_all', False, []),
        ('add_depositor', (TEST_ADDRESSES_SET[1], True), [TEST_ADDRESSES_SET[0], TEST_ADDRESSES_SET[1]]),
        ('remove_depositor', (TEST_ADDRESSES_SET[0], False), []),
    ])  
    def test_should_update_allowed_depositors_correctly(
        self,
        _name: str,
        depositor_or_allow_any: tuple[Addressable, bool] | bool,
        expected_storage_value: list[str] | bool
    ) -> None:
        oven, _, _, owner, *_ = self.default_setup(
            depositors = lambda *_: [TEST_ADDRESSES_SET[0]]
        )

        oven.using(owner).oven_edit_depositor(depositor_or_allow_any).send()
        self.bake_block()
        assert oven.get_depositors() == expected_storage_value