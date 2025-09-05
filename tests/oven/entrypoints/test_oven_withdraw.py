from tests.helpers.contracts.oven.oven import Oven
from tests.oven.base import OvenBaseTestCase

class OvenWithdrawTestCase(OvenBaseTestCase):
    def test_should_fail_if_called_not_by_main_contract(self) -> None:
        oven, _, _, owner, receiver, *_ = self.default_setup()

        with self.raises_michelson_error(Oven.Errors.ONLY_MAIN_CONTRACT_CAN_CALL):
            oven.using(owner).oven_withdraw(123, receiver).send()
