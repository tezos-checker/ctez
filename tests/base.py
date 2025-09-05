from pytezos.client import PyTezosClient
from pytezos.sandbox.node import SandboxedNodeTestCase
from typing import Optional
from pytezos.rpc import RpcError
from contextlib import contextmanager
from tests.helpers.addressable import Addressable, get_address
from tests.helpers.contracts.contract import ContractHelper
from tests.helpers.contracts.ctez2.ctez2 import Ctez2
from tests.helpers.contracts.fa12.fa12 import Fa12
from pytezos.contract.result import ContractCallResult
from pytezos.operation.group import OperationGroup
from pytezos.operation.result import OperationResult
from pytezos import Key

from tests.helpers.contracts.fa12.fa12_tester import Fa12Tester
from tests.helpers.utility import pkh

class BaseTestCase(SandboxedNodeTestCase):
    accounts: list = []
    
    def setUp(self) -> None:
        self.accounts = []
        self.manager = self.bootstrap_baker()

    def get_current_level(self) -> int:
        return self.client.shell.head.header()['level']

    def bootstrap_baker(self, n: Optional[int] = None) -> PyTezosClient:
        account_count = n or len(self.accounts)
        bootstrap: PyTezosClient = self.client.using(key=f'bootstrap{account_count + 1}')
        bootstrap.reveal()
        self.accounts.append(bootstrap)
        return bootstrap

    def bootstrap_account(self, balance: Optional[int] = None, n: Optional[int] = None) -> PyTezosClient:
        bootstrap: PyTezosClient = self.bootstrap_baker(n)
        account: PyTezosClient = self.client.using(key=Key.generate(export=False))
        initial_balance = balance if balance is not None else self.get_balance_mutez(bootstrap) - 100_000_000_000
        bootstrap.transaction(pkh(account), initial_balance).autofill().sign().inject()
        self.bake_block()
        account.reveal().autofill().sign().inject()
        self.bake_block()
        
        return account

    def deploy_ctez2(
        self,
        last_update: Optional[int] = None,
        target_ctez_price = 1.0
    ) -> Ctez2:
        last_update = last_update if last_update is not None else self.manager.now()
        opg = Ctez2.originate(self.manager, last_update, target_ctez_price).send()
        self.bake_block()
        return Ctez2.from_opg(self.manager, opg)

    def deploy_fa12(
        self,
        admin: Addressable,
        balances: dict[Addressable, int] = {}, 
        allowances: Optional[list[tuple[Addressable, Addressable, int]]] = None
    ) -> Fa12:
        if allowances is None:
            allowances = []
        opg = Fa12.originate(self.manager, admin, balances, allowances).send()
        self.bake_block()
        return Fa12.from_opg(self.manager, opg)

    def deploy_fa12_tester(
        self,
        fa12_address: Addressable,
        send_tez: bool = False
    ) -> Fa12Tester:
        opg = Fa12Tester.originate(self.manager, fa12_address, send_tez).send()
        self.bake_block()
        return Fa12Tester.from_opg(self.manager, opg)

    @contextmanager
    def raises_michelson_error(self, error_message):
        with self.assertRaises(RpcError) as r:
            yield r

        failed_with = self.extract_runtime_failwith(r.exception)
        self.assertEqual(error_message, failed_with)

    def extract_runtime_failwith(self, e: RpcError):
        return e.args[-1]['with']['string']

    def bake_block_and_get_operation_result(self, opg: OperationGroup) -> ContractCallResult:
        self.bake_block()
        opg = self.client.shell.blocks['head':].find_operation(opg.hash())
        return ContractCallResult.from_operation_group(opg)[0]
    
    def bake_blocks(self, count: int):
        for _ in range(count):
            self.bake_block()

    def find_call_result(self, opg: OperationGroup, idx: int = 0) -> OperationResult:
        blocks = self.manager.shell.blocks['head':]
        operation = blocks.find_operation(opg.hash())
        return ContractCallResult.from_operation_group(operation)[idx]

    def get_future_timestamp(self) -> int:
        return self.manager.now() + 1000

    def get_passed_timestamp(self) -> int:
        return self.manager.now() - 1000

    def get_balance_mutez(self, client_or_contract: Addressable) -> int:
        address = get_address(client_or_contract)
        return int(self.manager.account(address)['balance'])
    
    def get_contract_delegate(self, contract: Addressable) -> str | None:
        return self.client.shell.contracts[get_address(contract)]().get('delegate', None)
