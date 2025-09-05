from tests.fa12.base import Fa12BaseTestCase
from tests.helpers.contracts.fa12.fa12 import Fa12

class Fa12GetBalanceTestCase(Fa12BaseTestCase):
    def test_should_fail_if_tez_in_transaction(self) -> None:
        owner, _, fa12, *_ = self.default_setup()
        fa12_tester = self.deploy_fa12_tester(fa12, send_tez=True)

        with self.raises_michelson_error(Fa12.Errors.DONT_SEND_TEZ):
            fa12_tester.call_get_balance(owner).send()

    def test_should_execute_callback_entrypoint_correctly(self) -> None:
        owner, spender, fa12, *_ = self.default_setup(
            get_balances = lambda owner, *_: {
                owner: 777
            }
        )
        fa12_tester = self.deploy_fa12_tester(fa12)
        
        fa12_tester.call_get_balance(owner).send()
        self.bake_block()
        assert fa12_tester.get_last_callback() == (fa12_tester.Callbacks.ON_GET_BALANCE, 777)

        fa12_tester.reset().send()
        self.bake_block()
        
        fa12_tester.call_get_balance(spender).send()
        self.bake_block()
        assert fa12_tester.get_last_callback() == (fa12_tester.Callbacks.ON_GET_BALANCE, 0)
