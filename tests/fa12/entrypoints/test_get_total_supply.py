from tests.fa12.base import Fa12BaseTestCase
from tests.helpers.contracts.fa12.fa12 import Fa12

class Fa12GetTotalSupplyTestCase(Fa12BaseTestCase):
    def test_should_fail_if_tez_in_transaction(self) -> None:
        _, _, fa12, *_ = self.default_setup()
        fa12_tester = self.deploy_fa12_tester(fa12, send_tez=True)

        with self.raises_michelson_error(Fa12.Errors.DONT_SEND_TEZ):
            fa12_tester.call_get_total_supply().send()

    def test_should_execute_callback_entrypoint_correctly(self) -> None:
        _, _, fa12, *_ = self.default_setup(
            get_balances = lambda owner, spender: {
                owner: 10,
                spender: 1000
            }
        )
        fa12_tester = self.deploy_fa12_tester(fa12)
        
        fa12_tester.call_get_total_supply().send()
        self.bake_block()
        assert fa12_tester.get_last_callback() == (fa12_tester.Callbacks.ON_GET_TOTAL_SUPPLY, 1010)
