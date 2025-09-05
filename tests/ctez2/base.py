from math import ceil
from typing import Callable, NamedTuple, Optional
from tests.base import BaseTestCase
from tests.helpers.addressable import Addressable, get_address
from tests.helpers.contracts.ctez2.ctez2 import Ctez2
from tests.helpers.contracts.fa12.fa12 import Fa12
from pytezos.client import PyTezosClient

from tests.helpers.utility import NULL_ADDRESS

class BalanceDiffs(NamedTuple):
    ctez_diff: int
    tez_diff: int

class Ctez2BaseTestCase(BaseTestCase):
    def default_setup(
        self,
        tez_liquidity: int = 0,
        ctez_liquidity: int = 0,
        get_ctez_token_balances: Optional[Callable[[PyTezosClient, PyTezosClient], dict[Addressable, int]]] = None,
        ctez_total_supply: Optional[int] = None,
        target_ctez_price: float = 1.0,
        bootstrap_all_tez_balances = False # reloads node and transfer all bakers balances to bootstrapped accounts
    ) -> tuple[Ctez2, Fa12, PyTezosClient, PyTezosClient, PyTezosClient]:
        if bootstrap_all_tez_balances:
            self.tearDownClass()
            self.setUpClass()
        initial_tez_balance = None if bootstrap_all_tez_balances else 10_000_000_000
        account1 = self.bootstrap_account(initial_tez_balance)
        account2 = self.bootstrap_account(initial_tez_balance)
        donor = self.bootstrap_account(initial_tez_balance)
        ctez2 = self.deploy_ctez2(target_ctez_price=target_ctez_price)

        ctez_token = self.deploy_fa12(ctez2)
        ctez2.set_ctez_fa12_address(ctez_token).send()
        self.bake_block()

        balances = get_ctez_token_balances(account1, account2) if get_ctez_token_balances is not None else {}
        rest_supply = ctez_total_supply if ctez_total_supply is not None else sum(balances.values()) + ctez_liquidity
        tez_deposit = ceil(rest_supply * target_ctez_price * 16/15) # ctez_outstanding = tez*target_price*16/16 not to get under_collateralized

        if (tez_deposit > 0) or (tez_liquidity > 0):
            donor.bulk(
                ctez2.create_oven(0, None, None).with_amount(tez_deposit),
                ctez2.mint_or_burn(0, rest_supply),
                *(
                    ctez_token.approve(ctez2, ctez_liquidity),
                    ctez2.add_ctez_liquidity(donor, ctez_liquidity, 0, self.get_future_timestamp()),
                ) if ctez_liquidity > 0 else (),
                *(
                    ctez2.add_tez_liquidity(donor, 0, self.get_future_timestamp()).with_amount(tez_liquidity),
                ) if tez_liquidity > 0 else (),
            ).send()
            self.bake_block()

        if len(balances):
            donor.bulk(
                *[ctez_token.transfer(donor, receiver, amount) for receiver, amount in balances.items()]
            ).send()
            self.bake_block()

        return ctez2, ctez_token, account1, account2, donor

    def prepare_ctez_dex_liquidity(self) -> tuple[Ctez2, Fa12, PyTezosClient, PyTezosClient, PyTezosClient]:
        deposit_amount_1 = 10_000_000
        deposit_amount_2 = 10_000_000
        swap_amount = 5_000_000
        ctez_liquidity = 10_000_000 + swap_amount # 10_000_000 is depositor_0 deposit + 5_000_000 to convert into proceeds

        ctez2, ctez_token, depositor_1, depositor_2, depositor_0 = self.default_setup(
            ctez_total_supply = ctez_liquidity * 10_000,
            ctez_liquidity = ctez_liquidity,
            tez_liquidity = ctez_liquidity * 10_000, # to avoid collecting subsidies in sell_tez dex
            get_ctez_token_balances = lambda depositor_1, depositor_2: {
                depositor_1: deposit_amount_1,
                depositor_2: deposit_amount_2
            },
            bootstrap_all_tez_balances = True
        )

        ctez2.using(depositor_0).tez_to_ctez(depositor_0, 5_000_000, self.get_future_timestamp()).with_amount(5_248_754).send()
        self.bake_block()

        for (depositor, deposit_amount) in ((depositor_1, deposit_amount_1), (depositor_2, deposit_amount_2)):
            depositor.bulk(
                ctez_token.approve(ctez2, deposit_amount),
                ctez2.add_ctez_liquidity(depositor, deposit_amount, 0, self.get_future_timestamp())
            ).send()
            self.bake_blocks(5) # to collect more subsidies between deposits

        ctez2.using(depositor_0).mint_or_burn(0, -ctez_token.view_balance(depositor_0)).send() # to stop collecting subsidies (all total_supply is in dex)
        self.bake_block()

        depositors = (depositor_0, depositor_1, depositor_2)
        depositor_accounts = list(map(ctez2.get_ctez_liquidity_owner, depositors))
        assert depositor_accounts[0] == Ctez2.LiquidityOwner(liquidity_shares=15000000, proceeds_owed=0,       subsidy_owed=0)
        assert depositor_accounts[1] == Ctez2.LiquidityOwner(liquidity_shares=15000000, proceeds_owed=5248754, subsidy_owed=142)
        assert depositor_accounts[2] == Ctez2.LiquidityOwner(liquidity_shares=15000000, proceeds_owed=5248754, subsidy_owed=261)

        ctez_dex = ctez2.get_sell_ctez_dex()
        tez_dex = ctez2.get_sell_tez_dex()
        assert ctez_dex.total_liquidity_shares == 45000000
        assert ctez_dex.self_reserves == 30000000
        assert ctez_dex.proceeds_reserves == 15746262 
        assert ctez_dex.proceeds_debts == sum(a.proceeds_owed for a in depositor_accounts) 
        assert ctez_dex.proceeds_reserves - ctez_dex.proceeds_debts == (self.get_balance_mutez(ctez2) - tez_dex.self_reserves)
        assert ctez_dex.subsidy_reserves == 1019
        assert ctez_dex.subsidy_debts == sum(a.subsidy_owed for a in depositor_accounts)
        assert (ctez_dex.subsidy_reserves - ctez_dex.subsidy_debts) == (ctez_token.view_balance(ctez2) - ctez_dex.self_reserves - (tez_dex.proceeds_reserves - tez_dex.proceeds_debts) - (tez_dex.subsidy_reserves - tez_dex.subsidy_debts))

        print('initial dex state:', ctez_dex)
        print('depositor_0:', depositor_accounts[0])
        print('depositor_1:', depositor_accounts[1])
        print('depositor_2:', depositor_accounts[2])

        return ctez2, ctez_token, depositor_0, depositor_1, depositor_2

    def prepare_tez_dex_liquidity(self) -> tuple[Ctez2, Fa12, PyTezosClient, PyTezosClient, PyTezosClient]:
        deposit_amount_1 = 10_000_000
        deposit_amount_2 = 10_000_000
        swap_amount = 5_000_000
        tez_liquidity = 10_000_000 + swap_amount # 10_000_000 is depositor_0 deposit + 5_000_000 to convert into proceeds

        ctez2, ctez_token, depositor_1, depositor_2, depositor_0 = self.default_setup(
            ctez_total_supply = tez_liquidity * 10_000 + 10_000_000,
            ctez_liquidity = tez_liquidity,
            tez_liquidity = tez_liquidity,
            bootstrap_all_tez_balances = True
        )

        depositor_0.bulk(
            ctez_token.approve(ctez2, 5_248_754),
            ctez2.ctez_to_tez(depositor_0, 5_248_754, 5_000_000, self.get_future_timestamp())
        ).send()
        self.bake_block()

        for (depositor, deposit_amount) in ((depositor_1, deposit_amount_1), (depositor_2, deposit_amount_2)):
            ctez2.add_tez_liquidity(depositor, 0, self.get_future_timestamp()).with_amount(deposit_amount).send()
            self.bake_blocks(5) # to collect more subsidies between deposits

        ctez2.using(depositor_0).mint_or_burn(0, -ctez_token.view_balance(depositor_0)).send() # to stop collecting subsidies (all total_supply is in dex)
        self.bake_block()

        depositors = (depositor_0, depositor_1, depositor_2)
        depositor_accounts = list(map(ctez2.get_tez_liquidity_owner, depositors))
        assert depositor_accounts[0] == Ctez2.LiquidityOwner(liquidity_shares=15000000, proceeds_owed=0,       subsidy_owed=0)
        assert depositor_accounts[1] == Ctez2.LiquidityOwner(liquidity_shares=15000000, proceeds_owed=5248754, subsidy_owed=94)
        assert depositor_accounts[2] == Ctez2.LiquidityOwner(liquidity_shares=15000000, proceeds_owed=5248754, subsidy_owed=213)

        tez_dex = ctez2.get_sell_tez_dex()
        ctez_dex = ctez2.get_sell_ctez_dex()
        assert tez_dex.total_liquidity_shares == 45000000
        assert tez_dex.self_reserves == 30000000
        assert tez_dex.proceeds_reserves == 15746262 
        assert tez_dex.proceeds_debts == sum(a.proceeds_owed for a in depositor_accounts) 
        assert tez_dex.proceeds_reserves - tez_dex.proceeds_debts == (ctez_token.view_balance(ctez2) - ctez_dex.self_reserves - (ctez_dex.subsidy_reserves - ctez_dex.subsidy_debts) - (tez_dex.subsidy_reserves - tez_dex.subsidy_debts))
        assert tez_dex.subsidy_reserves == 875
        assert tez_dex.subsidy_debts == sum(a.subsidy_owed for a in depositor_accounts)
        assert (tez_dex.subsidy_reserves - tez_dex.subsidy_debts) == (ctez_token.view_balance(ctez2) - ctez_dex.self_reserves - (ctez_dex.subsidy_reserves - ctez_dex.subsidy_debts) - (tez_dex.proceeds_reserves - tez_dex.proceeds_debts))

        print('initial dex state:', tez_dex)
        print('depositor_0:', depositor_accounts[0])
        print('depositor_1:', depositor_accounts[1])
        print('depositor_2:', depositor_accounts[2])

        return ctez2, ctez_token, depositor_0, depositor_1, depositor_2
