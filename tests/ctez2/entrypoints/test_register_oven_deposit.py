from tests.ctez2.base import Ctez2BaseTestCase
from tests.helpers.contracts.ctez2.ctez2 import Ctez2

class Ctez2RegisterOvenDepositTestCase(Ctez2BaseTestCase):
    def test_should_fail_if_oven_not_exist(self) -> None:
        ctez2, _, owner, *_ = self.default_setup()

        oven_id = 2
        with self.raises_michelson_error(Ctez2.Errors.OVEN_NOT_EXISTS):
            ctez2.using(owner).register_oven_deposit(oven_id, owner, 123).send()

    def test_should_fail_if_called_not_by_oven(self) -> None:
        ctez2, _, owner, *_ = self.default_setup()

        oven_id = 2
        ctez2.using(owner).create_oven(oven_id, None, None).send()
        self.bake_block()

        with self.raises_michelson_error(Ctez2.Errors.ONLY_OVEN_CAN_CALL):
            ctez2.using(owner).register_oven_deposit(oven_id, owner, 123).send()
