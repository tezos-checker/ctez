from typing import Callable, Optional
from tests.ctez2.base import Ctez2BaseTestCase
from pytezos.client import PyTezosClient

from tests.helpers.addressable import Addressable
from tests.helpers.contracts.ctez2.ctez2 import Ctez2
from tests.helpers.contracts.fa12.fa12 import Fa12
from tests.helpers.contracts.oven.oven import Oven


class OvenBaseTestCase(Ctez2BaseTestCase):
    def default_setup(
        self,
        oven_id = 0,
        delegate: Optional[Addressable] = None, 
        depositors: Optional[Callable[[PyTezosClient, PyTezosClient, PyTezosClient], list[Addressable]]] = None,
        tez_liquidity: int = 0,
        ctez_liquidity: int = 0,
        get_ctez_token_balances: Optional[Callable[[PyTezosClient, PyTezosClient], dict[Addressable, int]]] = None,
        ctez_total_supply: Optional[int] = None,
        target_ctez_price: float = 1.0,
        bootstrap_all_tez_balances = False # reloads node and transfer all bakers balances to bootstrapped accounts
    ) -> tuple[Oven, Ctez2, Fa12, PyTezosClient, PyTezosClient, PyTezosClient]:
        ctez2, ctez_token, owner, account2, donor = super().default_setup(
            tez_liquidity, 
            ctez_liquidity,
            get_ctez_token_balances,
            ctez_total_supply,
            target_ctez_price,
            bootstrap_all_tez_balances
        )

        depositors = depositors(owner, account2, donor) if depositors is not None else None
        ctez2.using(owner).create_oven(oven_id, delegate, depositors).send()
        self.bake_block()

        oven = ctez2.get_oven_contract(owner, owner, oven_id)
        
        return oven, ctez2, ctez_token, owner, account2, donor
