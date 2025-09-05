from math import ceil, floor
from tests.ctez2.base import Ctez2BaseTestCase
from tests.helpers.contracts.ctez2.ctez2 import Ctez2
from tests.helpers.contracts.fa12.fa12 import Fa12
from tests.helpers.utility import NULL_ADDRESS
from tests.ctez2.test_cases import ctez_dex_subsidies, tez_dex_subsidies
from parameterized import parameterized
from pytezos.client import PyTezosClient

class Ctez2SubsidiesTestCase(Ctez2BaseTestCase):
    @parameterized.expand(ctez_dex_subsidies)
    def test_should_mint_subsidies_for_ctez_dex_correctly(
        self, 
        name: str, 
        ctez_liquidity: int, 
        target_ctez_liquidity: int,
        target_price: float, 
        expected_subsidies_per_sec: int
    ) -> None:
        total_supply = target_ctez_liquidity * 20 # ctez_target_liquidity(Q) is 5% of total supply
        ctez2, ctez_token, sender, _, *_ = self.default_setup(
            target_ctez_price = target_price,
            ctez_liquidity = ctez_liquidity,
            ctez_total_supply = total_supply,
            tez_liquidity = floor(target_ctez_liquidity * target_price),
            bootstrap_all_tez_balances = True
        )
        
        prev_last_update = ctez2.contract.storage()['last_update']
        prev_sell_ctez_dex = ctez2.get_sell_ctez_dex()
        prev_sell_tez_dex = ctez2.get_sell_tez_dex()
        prev_total_supply = ctez_token.view_total_supply()
        prev_ctez2_balance = ctez_token.view_balance(ctez2)

        assert prev_sell_ctez_dex.self_reserves == ctez_liquidity

        ctez2.using(sender).collect_from_ctez_liquidity(sender).send()
        self.bake_block()

        current_last_update = ctez2.contract.storage()['last_update']
        current_sell_ctez_dex = ctez2.get_sell_ctez_dex()
        current_sell_tez_dex = ctez2.get_sell_tez_dex()
        delta_sec = current_last_update - prev_last_update
        ctez_dex_subsidies = current_sell_ctez_dex.subsidy_reserves - prev_sell_ctez_dex.subsidy_reserves
        subsidies_per_sec = ctez_dex_subsidies / delta_sec
        print('subsidies_diff_per_sec', subsidies_per_sec)
        print('interest_rate_year', f'{(subsidies_per_sec*60*60*24*365.25*100)/prev_total_supply}%')
        assert ctez2.contract.storage()['context']['_Q'] == target_ctez_liquidity
        assert delta_sec > 0
        assert subsidies_per_sec == expected_subsidies_per_sec
        assert prev_sell_tez_dex.subsidy_reserves == current_sell_tez_dex.subsidy_reserves
        assert ctez_token.view_total_supply() == prev_total_supply + ctez_dex_subsidies
        assert ctez_token.view_balance(ctez2) == prev_ctez2_balance + ctez_dex_subsidies

    @parameterized.expand(tez_dex_subsidies)
    def test_should_mint_subsidies_for_tez_dex_correctly(
        self, 
        name: str, 
        tez_liquidity: int, 
        target_tez_liquidity: int,
        target_price: float, 
        expected_subsidies_per_sec: int
    ) -> None:
        target_ctez_liquidity = ceil(target_tez_liquidity / target_price)
        total_supply = target_ctez_liquidity * 20 # ctez_target_liquidity(Q) is 5% of total supply
        ctez2, ctez_token, sender, _, *_ = self.default_setup(
            target_ctez_price = target_price,
            ctez_liquidity = target_ctez_liquidity,
            ctez_total_supply = total_supply,
            tez_liquidity = tez_liquidity,
            bootstrap_all_tez_balances = True
        )
        
        prev_last_update = ctez2.contract.storage()['last_update']
        prev_sell_ctez_dex = ctez2.get_sell_ctez_dex()
        prev_sell_tez_dex = ctez2.get_sell_tez_dex()
        prev_total_supply = ctez_token.view_total_supply()
        prev_ctez2_balance = ctez_token.view_balance(ctez2)

        assert prev_sell_tez_dex.self_reserves == tez_liquidity

        ctez2.using(sender).collect_from_ctez_liquidity(sender).send()
        self.bake_block()

        current_last_update = ctez2.contract.storage()['last_update']
        current_sell_ctez_dex = ctez2.get_sell_ctez_dex()
        current_sell_tez_dex = ctez2.get_sell_tez_dex()
        delta_sec = current_last_update - prev_last_update
        tez_dex_subsidies = current_sell_tez_dex.subsidy_reserves - prev_sell_tez_dex.subsidy_reserves
        subsidies_per_sec = tez_dex_subsidies / delta_sec
        print('subsidies_diff_per_sec', subsidies_per_sec)
        print('interest_rate_year', f'{(subsidies_per_sec*60*60*24*365.25*100)/prev_total_supply}%')
        assert floor(ctez2.contract.storage()['context']['_Q'] * target_price) == target_tez_liquidity
        assert delta_sec > 0
        assert subsidies_per_sec == expected_subsidies_per_sec
        assert prev_sell_ctez_dex.subsidy_reserves == current_sell_ctez_dex.subsidy_reserves
        assert ctez_token.view_total_supply() == prev_total_supply + tez_dex_subsidies
        assert ctez_token.view_balance(ctez2) == prev_ctez2_balance + tez_dex_subsidies

    def test_should_mint_subsidies_for_both_half_dexes(self) -> None:
        target_price = 1.5
        ctez_liquidity = 50_000_000_000
        tez_liquidity = ctez_liquidity
        target_ctez_liquidity = 100_000_000_000 
        total_supply = target_ctez_liquidity * 20 # ctez_target_liquidity(Q) is 5% of total supply
        ctez2, ctez_token, sender, _, *_ = self.default_setup(
            target_ctez_price = target_price,
            ctez_liquidity = ctez_liquidity,
            ctez_total_supply = total_supply,
            tez_liquidity = tez_liquidity,
            bootstrap_all_tez_balances = True
        )
        
        prev_sell_ctez_dex = ctez2.get_sell_ctez_dex()
        prev_sell_tez_dex = ctez2.get_sell_tez_dex()
        prev_ctez2_balance = ctez_token.view_balance(ctez2)

        assert prev_sell_ctez_dex.self_reserves == ctez_liquidity
        assert prev_sell_tez_dex.self_reserves == tez_liquidity
        prev_total_supply = ctez_token.view_total_supply()

        ctez2.using(sender).collect_from_ctez_liquidity(sender).send()
        self.bake_block()

        current_sell_ctez_dex = ctez2.get_sell_ctez_dex()
        current_sell_tez_dex = ctez2.get_sell_tez_dex()
        ctez_dex_subsidies = current_sell_ctez_dex.subsidy_reserves - prev_sell_ctez_dex.subsidy_reserves
        tez_dex_subsidies = current_sell_tez_dex.subsidy_reserves - prev_sell_tez_dex.subsidy_reserves
        
        assert tez_dex_subsidies == 457
        assert ctez_dex_subsidies == 316
        assert ctez_token.view_total_supply() == prev_total_supply + tez_dex_subsidies + ctez_dex_subsidies
        assert ctez_token.view_balance(ctez2) == prev_ctez2_balance + tez_dex_subsidies + ctez_dex_subsidies

    def test_should_increase_outstanding_ctez_in_ovens_accordingly_to_subsidies(self) -> None:
        target_price = 1.5
        ctez_liquidity = 50_000_000_000
        tez_liquidity = ctez_liquidity
        target_ctez_liquidity = 100_000_000_000 
        total_supply = target_ctez_liquidity * 20 # ctez_target_liquidity(Q) is 5% of total supply
        ctez2, ctez_token, sender, _, owner = self.default_setup(
            target_ctez_price = target_price,
            ctez_liquidity = ctez_liquidity,
            ctez_total_supply = total_supply,
            tez_liquidity = tez_liquidity,
            bootstrap_all_tez_balances = True
        )
        
        prev_last_update = ctez2.contract.storage()['last_update']
        prev_sell_ctez_dex = ctez2.get_sell_ctez_dex()
        prev_sell_tez_dex = ctez2.get_sell_tez_dex()
        prev_oven0 = ctez2.get_oven(owner, 0)

        oven0_ctez_minted_by_owner = 2_000_000_000_000
        oven1_ctez_minted_by_owner = 0
        oven2_ctez_minted_by_owner = 0

        assert prev_sell_ctez_dex.self_reserves == ctez_liquidity
        assert prev_sell_tez_dex.self_reserves == tez_liquidity
        assert prev_sell_ctez_dex.subsidy_reserves == 0
        assert prev_sell_tez_dex.subsidy_reserves == 0
        assert prev_oven0.ctez_outstanding == oven0_ctez_minted_by_owner
        assert ctez_token.view_total_supply() == oven0_ctez_minted_by_owner

        delta = 10
        self.bake_blocks(delta - 1)
        oven0 = ctez2.get_oven_contract(owner, owner, 0)
        owner.bulk(
            # place deposit in oven0 to calculate subsidies and update outstanding
            oven0.deposit().with_amount(100),
            # create oven1 with no outstanding ctez
            ctez2.create_oven(1, None, None).with_amount(100),
            ctez2.mint_or_burn(1, 1),
            # create oven2 with no outstanding ctez
            ctez2.create_oven(2, None, None).with_amount(200_000_000_000),
        ).send()
        self.bake_block()

        oven0_ctez_minted_by_owner = 2_000_000_000_000
        oven1_ctez_minted_by_owner = 1
        oven2_ctez_minted_by_owner = 0


        current_last_update = ctez2.contract.storage()['last_update']
        current_sell_ctez_dex = ctez2.get_sell_ctez_dex()
        current_sell_tez_dex = ctez2.get_sell_tez_dex()

        total_subsidies = current_sell_ctez_dex.subsidy_reserves + current_sell_tez_dex.subsidy_reserves
        oven0_subsidies = ctez2.get_oven(owner, 0).ctez_outstanding - oven0_ctez_minted_by_owner
        oven1_subsidies = ctez2.get_oven(owner, 1).ctez_outstanding - oven1_ctez_minted_by_owner
        oven2_subsidies = ctez2.get_oven(owner, 2).ctez_outstanding - oven2_ctez_minted_by_owner

        assert delta == current_last_update - prev_last_update
        assert total_subsidies == 7745
        assert oven0_subsidies == 7746
        assert oven1_subsidies == 0 # subsidies have not been charged because ctez minted in the same block
        assert oven2_subsidies == 0

        oven1 = ctez2.get_oven_contract(owner, owner, 1)
        oven2 = ctez2.get_oven_contract(owner, owner, 2)

        self.bake_blocks(delta - 1)
        owner.bulk(
            # place deposit in ovens to calculate subsidies and update outstanding
            oven0.deposit().with_amount(100),
            oven1.deposit().with_amount(100),
            oven2.deposit().with_amount(100),
            ctez2.mint_or_burn(2, 100_000_000_000)
        ).send()
        self.bake_block()

        oven0_ctez_minted_by_owner = 2_000_000_000_000
        oven1_ctez_minted_by_owner = 1
        oven2_ctez_minted_by_owner = 100_000_000_000

        prev_last_update = current_last_update
        current_last_update = ctez2.contract.storage()['last_update']
        current_sell_ctez_dex = ctez2.get_sell_ctez_dex()
        current_sell_tez_dex = ctez2.get_sell_tez_dex()

        total_subsidies = current_sell_ctez_dex.subsidy_reserves + current_sell_tez_dex.subsidy_reserves
        oven0_subsidies = ctez2.get_oven(owner, 0).ctez_outstanding - oven0_ctez_minted_by_owner
        oven1_subsidies = ctez2.get_oven(owner, 1).ctez_outstanding - oven1_ctez_minted_by_owner
        oven2_subsidies = ctez2.get_oven(owner, 2).ctez_outstanding - oven2_ctez_minted_by_owner
        
        assert delta == current_last_update - prev_last_update
        assert total_subsidies == 15490
        assert oven0_subsidies == 15492
        assert oven1_subsidies == 0
        assert oven2_subsidies == 0 # subsidies have not been charged because ctez minted in the same block

        self.bake_blocks(delta - 1)
        owner.bulk(
            # place deposit in ovens to calculate subsidies and update outstanding
            oven0.deposit().with_amount(100),
            oven1.deposit().with_amount(100),
            oven2.deposit().with_amount(100),
        ).send()
        self.bake_block()

        oven0_ctez_minted_by_owner = 2_000_000_000_000
        oven1_ctez_minted_by_owner = 1
        oven2_ctez_minted_by_owner = 100_000_000_000

        prev_last_update = current_last_update
        current_last_update = ctez2.contract.storage()['last_update']
        current_sell_ctez_dex = ctez2.get_sell_ctez_dex()
        current_sell_tez_dex = ctez2.get_sell_tez_dex()

        total_subsidies = current_sell_ctez_dex.subsidy_reserves + current_sell_tez_dex.subsidy_reserves
        oven0_subsidies = ctez2.get_oven(owner, 0).ctez_outstanding - oven0_ctez_minted_by_owner
        oven1_subsidies = ctez2.get_oven(owner, 1).ctez_outstanding - oven1_ctez_minted_by_owner
        oven2_subsidies = ctez2.get_oven(owner, 2).ctez_outstanding - oven2_ctez_minted_by_owner
        
        assert delta == current_last_update - prev_last_update
        assert total_subsidies == 23974
        assert oven0_subsidies == 23573
        assert oven1_subsidies == 0
        assert oven2_subsidies == 404
