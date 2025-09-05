from pytezos.client import PyTezosClient
from pytezos.contract.call import ContractCall
from tests.helpers.addressable import Addressable, get_address
from tests.helpers.contracts.contract import ContractHelper
from tests.helpers.utility import (
    originate_from_file,
)
from pytezos.operation.group import OperationGroup
from os.path import join, dirname

class Fa12Tester(ContractHelper):
    class Callbacks:
        ON_GET_ALLOWANCE = "on_get_allowance"
        ON_GET_BALANCE = "on_get_balance"
        ON_GET_TOTAL_SUPPLY = "on_get_total_supply"

    @classmethod
    def originate(
        self,
        client: PyTezosClient,
        fa12_address: Addressable,
        send_tez: bool = False
    ) -> OperationGroup:
        storage = {
            'send_tez' : send_tez,
            'fa12_address': get_address(fa12_address), 
            'last_callback': None, 
        }
        
        filename = join(dirname(__file__), 'fa12_tester.tz')

        return originate_from_file(filename, client, storage, 100)
    
    def reset(self,) -> ContractCall:
        return self.contract.reset()

    def call_get_allowance(self, owner : Addressable, spender : Addressable) -> ContractCall:
        return self.contract.call_get_allowance({
            'owner': get_address(owner),
            'spender': get_address(spender),
        })
    
    def call_get_balance(self, owner : Addressable) -> ContractCall:
        return self.contract.call_get_balance(get_address(owner))
    
    def call_get_total_supply(self) -> ContractCall:
        return self.contract.call_get_total_supply()
    
    def get_last_callback(self) -> tuple[str, int]:
        return self.contract.storage()['last_callback']
