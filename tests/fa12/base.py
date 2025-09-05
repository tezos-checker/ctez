from typing import Callable, Optional
from tests.base import BaseTestCase
from tests.helpers.addressable import Addressable
from tests.helpers.contracts.fa12.fa12 import Fa12
from pytezos.client import PyTezosClient

from tests.helpers.utility import NULL_ADDRESS

class Fa12BaseTestCase(BaseTestCase):
    def default_setup(
        self,
        get_admin: Optional[Callable[[PyTezosClient, PyTezosClient], Addressable]] = None, 
        get_balances: Optional[Callable[[PyTezosClient, PyTezosClient], dict[Addressable, int]]] = None,
        get_allowances: Optional[Callable[[PyTezosClient, PyTezosClient], list[tuple[Addressable, Addressable, int]]]] = None
    ) -> tuple[PyTezosClient, PyTezosClient, Fa12]:
        account1 = self.bootstrap_account(100_000_000)
        account2 = self.bootstrap_account(100_000_000)
        admin = get_admin(account1, account2) if get_admin is not None else NULL_ADDRESS
        balances = get_balances(account1, account2) if get_balances is not None else {}
        allowances = get_allowances(account1, account2) if get_allowances is not None else []
        fa12 = self.deploy_fa12(admin, balances, allowances)
        
        return account1, account2, fa12
