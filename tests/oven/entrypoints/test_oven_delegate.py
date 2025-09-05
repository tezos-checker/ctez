from tests.helpers.addressable import get_address
from tests.helpers.contracts.oven.oven import Oven
from tests.oven.base import OvenBaseTestCase

class OvenDelegateTestCase(OvenBaseTestCase):
    def test_should_fail_if_tez_in_transaction(self) -> None:
        oven, _, _, owner, *_ = self.default_setup()

        with self.raises_michelson_error(Oven.Errors.TEZ_IN_TRANSACTION_DISALLOWED):
            oven.using(owner).oven_delegate(None).with_amount(1).send()

    def test_should_fail_if_called_not_by_owner(self) -> None:
        oven, _, _, _, not_owner, *_ = self.default_setup()

        with self.raises_michelson_error(Oven.Errors.ONLY_OWNER_CAN_CALL):
            oven.using(not_owner).oven_delegate(None).send()

    def test_should_set_and_unset_delegate_correctly(self) -> None:
        oven, _, _, owner, *_ = self.default_setup()
        baker = self.bootstrap_baker()

        assert self.get_contract_delegate(oven) == None

        oven.using(owner).oven_delegate(baker).send()
        self.bake_block()
        assert self.get_contract_delegate(oven) == get_address(baker)

        oven.using(owner).oven_delegate(None).send()
        self.bake_block()
        assert self.get_contract_delegate(oven) == None