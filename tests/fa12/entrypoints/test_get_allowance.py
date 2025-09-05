from tests.fa12.base import Fa12BaseTestCase
from tests.helpers.contracts.fa12.fa12 import Fa12

class Fa12GetAllowanceTestCase(Fa12BaseTestCase):
    def test_should_fail_if_tez_in_transaction(self) -> None:
        owner, spender, fa12, *_ = self.default_setup()
        fa12_tester = self.deploy_fa12_tester(fa12, send_tez=True)

        with self.raises_michelson_error(Fa12.Errors.DONT_SEND_TEZ):
            fa12_tester.call_get_allowance(owner, spender).send()

    def test_should_execute_callback_entrypoint_correctly(self) -> None:
        owner, spender, fa12, *_ = self.default_setup(
            get_allowances = lambda owner, spender: [
                (owner, spender, 123)
            ]
        )
        fa12_tester = self.deploy_fa12_tester(fa12)
        
        fa12_tester.call_get_allowance(owner, spender).send()
        self.bake_block()
        assert fa12_tester.get_last_callback() == (fa12_tester.Callbacks.ON_GET_ALLOWANCE, 123)

        fa12_tester.reset().send()
        self.bake_block()
        
        fa12_tester.call_get_allowance(spender, owner).send()
        self.bake_block()
        assert fa12_tester.get_last_callback() == (fa12_tester.Callbacks.ON_GET_ALLOWANCE, 0)
