from pytezos.contract.call import ContractCall
from tests.helpers.addressable import Addressable, get_address
from tests.helpers.contracts.contract import ContractHelper

class Oven(ContractHelper):
    class Errors:
        TEZ_IN_TRANSACTION_DISALLOWED = 'TEZ_IN_TRANSACTION_DISALLOWED'
        ONLY_MAIN_CONTRACT_CAN_CALL = 'ONLY_MAIN_CONTRACT_CAN_CALL'
        ONLY_OWNER_CAN_CALL = 'ONLY_OWNER_CAN_CALL'
        UNAUTHORIZED_DEPOSITOR = 'UNAUTHORIZED_DEPOSITOR'
        SET_ANY_OFF_FIRST = 'SET_ANY_OFF_FIRST'

    def get_depositors(self) -> list[str] | bool: # True for any
        storage_value: dict = self.contract.storage()['depositors']
        if 'any' in storage_value:
            return True
        elif 'whitelist' in storage_value:
            return storage_value['whitelist']
        raise ValueError(f'Unsupported value in storage: {type(storage_value)}')


    def get_admin(self) -> str:
        return self.contract.storage()['admin']

    def deposit(self) -> ContractCall:
        return self.contract.default()

    def oven_withdraw(self, amount: int, to: Addressable) -> ContractCall:
        return self.contract.withdraw((amount, get_address(to)))

    def oven_delegate(self, delegate: Addressable | None) -> ContractCall:
        return self.contract.delegate(
            get_address(delegate) if delegate is not None else None
        )

    def oven_edit_depositor(self, depositor_or_allow_any: tuple[Addressable, bool] | bool) -> ContractCall:
        return self.contract.edit_depositor(
            {'allow_any': depositor_or_allow_any} if isinstance(depositor_or_allow_any, bool) 
                else {'allow_account': (depositor_or_allow_any[1], get_address(depositor_or_allow_any[0]))}
        )
