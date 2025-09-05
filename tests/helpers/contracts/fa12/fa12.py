from pytezos.client import PyTezosClient
from pytezos.contract.call import ContractCall
from tests.helpers.addressable import Addressable, get_address
from tests.helpers.contracts.contract import ContractHelper
from tests.helpers.metadata import Metadata
from tests.helpers.utility import (
    get_build_dir,
    originate_from_file,
)
from pytezos.operation.group import OperationGroup
from os.path import join


class Fa12(ContractHelper):
    class Errors:
        DONT_SEND_TEZ = 'DontSendTez'
        NOT_ENOUGH_BALANCE = 'NotEnoughBalance'
        NOT_ENOUGH_ALLOWANCE = 'NotEnoughAllowance'
        UNSAFE_ALLOWANCE_CHANGE = 'UnsafeAllowanceChange'
        ONLY_ADMIN = 'OnlyAdmin'
        CANNOT_BURN_MORE_THAN_THE_TARGETS_BALANCE = 'CannotBurnMoreThanTheTargetsBalance'

    @classmethod
    def originate(
        self,
        client: PyTezosClient,
        admin: Addressable,
        balances: dict[Addressable, int] = {},
        allowances: list[tuple[Addressable, Addressable, int]] = [],
        metadata: dict[str, any] = None
    ) -> OperationGroup:
        allowances_value = {}
        for _from, to, amount in allowances:
            key = (get_address(_from), get_address(to))
            allowances_value[key] = amount

        metadata = metadata if metadata != None else dict()
        metadata = Metadata.make(**metadata)

        for _from, _, _ in allowances:
            if not balances.get(_from):
                balances[_from] = 0

        ledger = {
            get_address(owner): {
                'amount': amount,
                'allowances': {get_address(spender): allowance for _from, spender, allowance in allowances if get_address(_from) == get_address(owner)}
            } for owner, amount in balances.items()
        }

        storage = {
            'ledger': ledger,
            'admin': get_address(admin), 
            'total_supply': sum(balances.values()),
            'metadata': metadata
        }
        
        filename = join(get_build_dir(), 'fa12.tz')

        return originate_from_file(filename, client, storage)
    
    def transfer(self, _from : Addressable, to : Addressable, value : int) -> ContractCall:
        return self.contract.transfer({
            'from': get_address(_from),
            'to': get_address(to),
            'value': value,
        })
    
    def approve(self, spender : Addressable, value : int) -> ContractCall:
        return self.contract.approve({
            'spender': get_address(spender),
            'value': value,
        })
    
    def mintOrBurn(self, quantity : int, target : Addressable) -> ContractCall:
        return self.contract.mintOrBurn({
            'quantity': quantity,
            'target': get_address(target),
        })

    def view_allowance(self, owner: Addressable, spender: Addressable) -> int:
        return self.contract.viewAllowance({
            'owner': get_address(owner),
            'spender': get_address(spender)
        }).run_view()
    
    def view_balance(self, owner: Addressable) -> int:
        return self.contract.viewBalance(get_address(owner)).run_view()
        
    def view_total_supply(self) -> int:
        return self.contract.viewTotalSupply().run_view()
