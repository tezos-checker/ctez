from tests.ctez2.base import Ctez2BaseTestCase
from tests.helpers.addressable import get_address
from tests.helpers.contracts.ctez2.ctez2 import Ctez2
from tests.helpers.utility import NULL_ADDRESS

class Ctez2SetCtezFa12AddressTestCase(Ctez2BaseTestCase):
    def test_should_fail_if_tez_in_transaction(self) -> None:
        ctez2 = self.deploy_ctez2()
        ctez_token = self.deploy_fa12(ctez2)

        with self.raises_michelson_error(Ctez2.Errors.TEZ_IN_TRANSACTION_DISALLOWED):
            ctez2.set_ctez_fa12_address(ctez_token).with_amount(1).send()

    def test_should_fail_if_not_originator_call(self) -> None:
        ctez2 = self.deploy_ctez2()
        ctez_token = self.deploy_fa12(ctez2)
        not_originator = self.bootstrap_account()

        with self.raises_michelson_error(Ctez2.Errors.ONLY_ORIGINATOR_CAN_CALL):
            ctez2.using(not_originator).set_ctez_fa12_address(ctez_token).send()

    def test_should_set_ctez_fa12_address_correctly(self) -> None:
        ctez2 = self.deploy_ctez2()
        ctez_token = self.deploy_fa12(ctez2)
        assert ctez2.get_ctez_fa12_address() == NULL_ADDRESS

        ctez2.set_ctez_fa12_address(ctez_token).send()
        self.bake_block()
        assert ctez2.get_ctez_fa12_address() == get_address(ctez_token)

        # then it should prevent any other attempts of changing ctez token address
        with self.raises_michelson_error(Ctez2.Errors.CTEZ_FA12_ADDRESS_ALREADY_SET):
            ctez2.set_ctez_fa12_address(NULL_ADDRESS).send()
