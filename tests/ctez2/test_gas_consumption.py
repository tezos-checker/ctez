from math import ceil, floor
from tests.ctez2.base import Ctez2BaseTestCase
from tests.helpers.addressable import get_address
from tests.helpers.operation_result_recorder import OperationResultRecorder
from tests.helpers.utility import NULL_ADDRESS, TEST_ADDRESSES_SET, get_consumed_mutez, get_tests_dir
from os.path import join
from parameterized import parameterized

class Ctez2GasConsumptionTestCase(Ctez2BaseTestCase):
    recorder = OperationResultRecorder()

    @classmethod
    def tearDownClass(self) -> None:
        self.recorder.write_to_file(join(get_tests_dir(), 'ctez2', 'gas_consumption.json'))
        super().tearDownClass()

    @parameterized.expand([('with_subsidies', True), ('without_subsidies', False)])
    def test_add_ctez_liquidity_gas(self, name: str, with_subsidies: bool) -> None:
        deposit_amount = 1_000_000
        initial_ctez_total_supply = 100_000_000
        ctez2, ctez_token, sender, owner, *_ = self.default_setup(
            ctez_liquidity= 1_000_000 if with_subsidies else 5_000_000,
            tez_liquidity = 1_000_000 if with_subsidies else 5_000_000,
            ctez_total_supply = initial_ctez_total_supply,
            get_ctez_token_balances = lambda sender, *_: {
                sender: deposit_amount
            },
        )

        ctez_token.using(sender).approve(ctez2, deposit_amount).send()
        self.bake_blocks(100)
        opg = ctez2.using(sender).add_ctez_liquidity(owner, deposit_amount, 0, self.get_future_timestamp()).send()
        self.bake_block()

        self.recorder.add_element(self.manager, f'add_ctez_liquidity_{name}', opg)

        ctez_total_supply = ctez_token.view_total_supply()
        assert (with_subsidies and ctez_total_supply > initial_ctez_total_supply) or (not with_subsidies and ctez_total_supply == initial_ctez_total_supply)

    @parameterized.expand([('with_subsidies', True), ('without_subsidies', False)])
    def test_add_tez_liquidity_gas(self, name: str, with_subsidies: bool) -> None:
        deposit_amount = 1_000_000
        initial_ctez_total_supply = 100_000_000
        ctez2, ctez_token, sender, owner, *_ = self.default_setup(
            ctez_liquidity= 1_000_000 if with_subsidies else 5_000_000,
            tez_liquidity = 1_000_000 if with_subsidies else 5_000_000,
            ctez_total_supply = initial_ctez_total_supply,
            get_ctez_token_balances = lambda sender, *_: {
                sender: deposit_amount
            },
        )

        self.bake_blocks(100)
        opg = ctez2.using(sender).add_tez_liquidity(owner, 0, self.get_future_timestamp()).with_amount(deposit_amount).send()
        self.bake_block()

        self.recorder.add_element(self.manager, f'add_tez_liquidity_{name}', opg)

        ctez_total_supply = ctez_token.view_total_supply()
        assert (with_subsidies and ctez_total_supply > initial_ctez_total_supply) or (not with_subsidies and ctez_total_supply == initial_ctez_total_supply)

    def test_collect_from_ctez_liquidity_gas(self) -> None:
        ctez2, ctez_token, liquidity_owner, *_ = self.prepare_ctez_dex_liquidity()
        receiver = self.bootstrap_account()

        prev_receiver_ctez_balance = ctez_token.view_balance(receiver)
        prev_receiver_tez_balance = self.get_balance_mutez(receiver)
        opg = ctez2.using(liquidity_owner).collect_from_ctez_liquidity(receiver).send()
        self.bake_block()

        self.recorder.add_element(self.manager, 'collect_from_ctez_liquidity', opg)

        assert ctez_token.view_balance(receiver) == prev_receiver_ctez_balance + 339
        assert self.get_balance_mutez(receiver) == prev_receiver_tez_balance + 5248754

    def test_collect_from_tez_liquidity_gas(self) -> None:
        ctez2, ctez_token, liquidity_owner, *_ = self.prepare_tez_dex_liquidity()
        receiver = self.bootstrap_account()

        prev_receiver_ctez_balance = ctez_token.view_balance(receiver)
        prev_receiver_tez_balance = self.get_balance_mutez(receiver)
        opg = ctez2.using(liquidity_owner).collect_from_tez_liquidity(receiver).send()
        self.bake_block()

        self.recorder.add_element(self.manager, 'collect_from_tez_liquidity', opg)

        assert ctez_token.view_balance(receiver) == prev_receiver_ctez_balance + 5248754 + 291
        assert self.get_balance_mutez(receiver) == prev_receiver_tez_balance

    def test_remove_ctez_liquidity_gas(self) -> None:
        ctez2, ctez_token, liquidity_owner, *_ = self.prepare_ctez_dex_liquidity()

        prev_receiver_ctez_balance = ctez_token.view_balance(liquidity_owner)
        prev_receiver_tez_balance = self.get_balance_mutez(liquidity_owner)
        prev_owner_account = ctez2.get_ctez_liquidity_owner(liquidity_owner)

        deposit_amount = 10_000_000
        opg = ctez2.using(liquidity_owner).remove_ctez_liquidity(liquidity_owner, prev_owner_account.liquidity_shares, 0, 0, 0, self.get_future_timestamp()).send()
        self.bake_block()

        self.recorder.add_element(self.manager, 'remove_ctez_liquidity', opg)

        assert ctez_token.view_balance(liquidity_owner) == prev_receiver_ctez_balance + deposit_amount + 339
        assert self.get_balance_mutez(liquidity_owner) == prev_receiver_tez_balance + 5248754 - get_consumed_mutez(liquidity_owner, opg)

    def test_remove_tez_liquidity_gas(self) -> None:
        ctez2, ctez_token, liquidity_owner, *_ = self.prepare_tez_dex_liquidity()

        prev_receiver_ctez_balance = ctez_token.view_balance(liquidity_owner)
        prev_receiver_tez_balance = self.get_balance_mutez(liquidity_owner)
        prev_owner_account = ctez2.get_tez_liquidity_owner(liquidity_owner)

        deposit_amount = 10_000_000
        opg = ctez2.using(liquidity_owner).remove_tez_liquidity(liquidity_owner, prev_owner_account.liquidity_shares, 0, 0, 0, self.get_future_timestamp()).send()
        self.bake_block()

        self.recorder.add_element(self.manager, 'remove_tez_liquidity', opg)

        assert ctez_token.view_balance(liquidity_owner) == prev_receiver_ctez_balance + 5248754 + 291
        assert self.get_balance_mutez(liquidity_owner) == prev_receiver_tez_balance + deposit_amount - get_consumed_mutez(liquidity_owner, opg)

    def test_ctez_to_tez_gas(self) -> None:
        tez_liquidity = 5_000_000 
        target_liquidity = 10_000_000 
        sent_ctez = 1_000_000
        tez_bought = 991_700 
        target_price = 1.0
        total_supply = floor(target_liquidity * 20 / target_price) # ctez_target_liquidity(Q) is 5% of total supply, tez_target liquidity is floor(Q * target)
        ctez2, ctez_token, sender, _, *_ = self.default_setup(
            get_ctez_token_balances = lambda sender, *_: {
                sender: sent_ctez,
            },
            ctez_total_supply = total_supply,
            tez_liquidity = tez_liquidity,
            target_ctez_price = target_price,
            bootstrap_all_tez_balances = True
        )
        receiver = TEST_ADDRESSES_SET[0]

        prev_receiver_tez_balance = self.get_balance_mutez(receiver)
        prev_ctez2_ctez_balance = ctez_token.view_balance(ctez2)
        prev_sender_ctez_balance = ctez_token.view_balance(sender)
        prev_sell_ctez_dex = ctez2.get_sell_ctez_dex()
        prev_sell_tez_dex = ctez2.get_sell_tez_dex()

        ctez_token.using(sender).approve(ctez2, sent_ctez).send()
        self.bake_block()
        opg = ctez2.using(sender).ctez_to_tez(receiver, sent_ctez, tez_bought, self.get_future_timestamp()).send()
        self.bake_block()

        self.recorder.add_element(self.manager, 'ctez_to_tez', opg)
        
        Q_ctez = ctez2.contract.storage()['context']['_Q']
        Q_tez = floor(Q_ctez * target_price)
        error_rate = 1.000001 # because of subsidies and rounding
        assert target_liquidity / error_rate <= Q_tez <= target_liquidity * error_rate
        assert self.get_balance_mutez(receiver) == prev_receiver_tez_balance + tez_bought
        assert ctez_token.view_balance(sender) == prev_sender_ctez_balance - sent_ctez
        assert ctez_token.view_balance(ctez2) >= prev_ctez2_ctez_balance + sent_ctez # + subsidies
        
        current_sell_ctez_dex = ctez2.get_sell_ctez_dex()
        current_sell_tez_dex = ctez2.get_sell_tez_dex()
        assert current_sell_ctez_dex.self_reserves == prev_sell_ctez_dex.self_reserves
        assert current_sell_ctez_dex.proceeds_reserves == prev_sell_ctez_dex.proceeds_reserves
        assert current_sell_tez_dex.self_reserves == prev_sell_tez_dex.self_reserves - tez_bought
        assert current_sell_tez_dex.proceeds_reserves == prev_sell_tez_dex.proceeds_reserves + sent_ctez

    def test_tez_to_ctez_gas(self) -> None:
        ctez_liquidity = 5_000_000 
        target_liquidity = 10_000_000
        sent_tez = 1_000_000
        ctez_bought = 991_700
        target_price = 1.0
        total_supply = target_liquidity * 20 # ctez_target_liquidity(Q) is 5% of total supply
        ctez2, ctez_token, sender, receiver, *_ = self.default_setup(
            ctez_liquidity = ctez_liquidity,
            target_ctez_price = target_price,
            get_ctez_token_balances = lambda *_: {
                NULL_ADDRESS : total_supply - ctez_liquidity
            },
            bootstrap_all_tez_balances = True
        )

        prev_receiver_ctez_balance = ctez_token.view_balance(receiver)
        prev_ctez2_tez_balance = self.get_balance_mutez(ctez2)
        prev_sell_ctez_dex = ctez2.get_sell_ctez_dex()
        prev_sell_tez_dex = ctez2.get_sell_tez_dex()


        opg = ctez2.using(sender).tez_to_ctez(receiver, ctez_bought, self.get_future_timestamp()).with_amount(sent_tez).send()
        self.bake_block()
        
        self.recorder.add_element(self.manager, 'tez_to_ctez', opg)

        Q_ctez = ctez2.contract.storage()['context']['_Q']
        error_rate = 1.000001 # because of subsidies
        assert target_liquidity / error_rate <= Q_ctez <= target_liquidity * error_rate

        assert ctez_token.view_balance(receiver) == prev_receiver_ctez_balance + ctez_bought
        assert self.get_balance_mutez(ctez2) == prev_ctez2_tez_balance + sent_tez
        
        current_sell_tez_dex = ctez2.get_sell_tez_dex()
        current_sell_ctez_dex = ctez2.get_sell_ctez_dex()
        assert current_sell_tez_dex.self_reserves == prev_sell_tez_dex.self_reserves
        assert current_sell_tez_dex.proceeds_reserves == prev_sell_tez_dex.proceeds_reserves
        assert current_sell_ctez_dex.self_reserves == prev_sell_ctez_dex.self_reserves - ctez_bought
        assert current_sell_ctez_dex.proceeds_reserves == prev_sell_ctez_dex.proceeds_reserves + sent_tez

    def test_create_oven_gas(self) -> None:
        ctez2, _, owner, *_ = self.default_setup()
        initial_balance = 100_000_000
        delegate = get_address(self.bootstrap_baker())
        depositors = [TEST_ADDRESSES_SET[0], TEST_ADDRESSES_SET[1]]

        oven_id = 2
        opg = ctez2.using(owner).create_oven(oven_id, delegate, depositors).with_amount(initial_balance).send()
        self.bake_block()

        self.recorder.add_element(self.manager, 'create_oven', opg)

        ctez_dex = ctez2.get_sell_ctez_dex()
        tez_dex = ctez2.get_sell_tez_dex()
        oven_info = ctez2.get_oven(owner, oven_id)
        assert oven_info.tez_balance == initial_balance 
        assert oven_info.ctez_outstanding == 0 
        assert oven_info.fee_index == ctez_dex.fee_index * tez_dex.fee_index

        oven = ctez2.get_oven_contract(owner, owner, oven_id)
        assert self.get_balance_mutez(oven) == initial_balance
        assert self.get_contract_delegate(oven) == delegate
        assert oven.get_admin() == get_address(ctez2)
        assert oven.get_depositors() == True if depositors == None else depositors

    def test_liquidate_oven_gas(self) -> None:
        target_price = 2
        
        oven_id = 12
        ctez_minted = 150_000_000
        ctez_burned = 100_000_000
        balance = ceil(ctez_minted * 16/15 * target_price)
        ctez2, ctez_token, owner, liquidator, receiver = self.default_setup(
            target_ctez_price = target_price,
            get_ctez_token_balances = lambda _, liquidator: {
                liquidator: ctez_burned
            } 
        )

        owner.bulk(
            ctez2.create_oven(oven_id, None, None).with_amount(balance),
            ctez2.mint_or_burn(oven_id, ctez_minted)
        ).send()
        self.bake_blocks(100)

        oven = ctez2.get_oven_contract(owner, owner, oven_id)
        prev_oven_tez_balance = self.get_balance_mutez(oven)
        prev_receiver_tez_balance = self.get_balance_mutez(receiver)

        opg = ctez2.using(liquidator).liquidate_oven(owner, oven_id, ctez_burned, receiver).send()
        self.bake_block()

        self.recorder.add_element(self.manager, 'liquidate_oven', opg)

        expected_tez_earned = floor(ctez_burned * target_price * 32/31)
        assert self.get_balance_mutez(receiver) == prev_receiver_tez_balance + expected_tez_earned
        assert self.get_balance_mutez(oven) == prev_oven_tez_balance - expected_tez_earned

    def test_mint_or_burn_gas(self) -> None:
        ctez2, ctez_token, owner, *_ = self.default_setup(
            ctez_liquidity = 100_000_000,
            tez_liquidity = 100_000_000
        )

        oven_id = 12
        balance = 100
        ctez_minted = 50

        ctez2.using(owner).create_oven(oven_id, None, None).with_amount(balance).send()
        self.bake_block()

        prev_oven_info = ctez2.get_oven(owner, oven_id)
        oven = ctez2.get_oven_contract(owner, owner, oven_id)
        prev_oven_tez_balance = self.get_balance_mutez(oven)
        prev_owner_tez_balance = self.get_balance_mutez(owner)
        prev_owner_ctez_balance = ctez_token.view_balance(owner)
        prev_total_supply = ctez_token.view_total_supply()

        opg = ctez2.using(owner).mint_or_burn(oven_id, ctez_minted).send()
        self.bake_block()

        self.recorder.add_element(self.manager, 'mint_or_burn', opg)

        assert self.get_balance_mutez(owner) == prev_owner_tez_balance - get_consumed_mutez(owner, opg)
        assert ctez_token.view_balance(owner) == prev_owner_ctez_balance + ctez_minted
        assert ctez_token.view_total_supply() == prev_total_supply + ctez_minted
        assert ctez2.get_oven(owner, oven_id).ctez_outstanding == prev_oven_info.ctez_outstanding + ctez_minted
        assert self.get_balance_mutez(oven) == prev_oven_tez_balance
   
    def test_oven_deposit_gas(self) -> None:
        oven_id = 1
        ctez2, ctez_token, owner, *_ = self.default_setup(
            ctez_liquidity = 100_000_000,
            tez_liquidity = 100_000_000
        )

        ctez2.using(owner).create_oven(oven_id, delegate=None, depositors=None).send()
        self.bake_block()

        oven = ctez2.get_oven_contract(owner, owner, oven_id)

        sender = owner
        deposit_amount = 123

        prev_ctez2_tez_balance = self.get_balance_mutez(ctez2)
        prev_ctez2_ctez_balance = ctez_token.view_balance(ctez2)
        prev_oven_info = ctez2.get_oven(owner, oven_id)
        prev_oven_tez_balance = self.get_balance_mutez(oven)
        prev_oven_ctez_balance = ctez_token.view_balance(oven)
        prev_depositor_tez_balance = self.get_balance_mutez(sender)
        prev_depositor_ctez_balance = ctez_token.view_balance(sender)

        opg = oven.using(sender).deposit().with_amount(deposit_amount).send()
        self.bake_block()

        self.recorder.add_element(self.manager, 'oven_deposit', opg)

        oven_info = ctez2.get_oven(owner, oven_id)
        assert self.get_balance_mutez(ctez2) == prev_ctez2_tez_balance
        assert ctez_token.view_balance(ctez2) == prev_ctez2_ctez_balance
        assert oven_info.ctez_outstanding == prev_oven_info.ctez_outstanding
        assert oven_info.tez_balance == prev_oven_info.tez_balance + deposit_amount
        assert self.get_balance_mutez(oven) == prev_oven_tez_balance + deposit_amount
        assert ctez_token.view_balance(oven) == prev_oven_ctez_balance
        assert self.get_balance_mutez(sender) == prev_depositor_tez_balance - deposit_amount - get_consumed_mutez(sender, opg)
        assert ctez_token.view_balance(sender) == prev_depositor_ctez_balance

    def test_withdraw_from_oven_gas(self) -> None:
        ctez2, _, owner, receiver, *_ = self.default_setup(
            ctez_liquidity = 100_000_000,
            tez_liquidity = 100_000_000            
        )

        oven_id = 12
        balance = 17
        withdraw_amount = 1
        ctez_minted = 15
        owner.bulk(
            ctez2.create_oven(oven_id, None, None).with_amount(balance),
            ctez2.mint_or_burn(oven_id, ctez_minted)
        ).send()
        self.bake_block()

        prev_oven_info = ctez2.get_oven(owner, oven_id)
        oven = ctez2.get_oven_contract(owner, owner, oven_id)
        prev_owner_tez_balance = self.get_balance_mutez(owner)
        prev_receiver_tez_balance = self.get_balance_mutez(receiver)
        prev_oven_tez_balance = self.get_balance_mutez(oven)

        opg = ctez2.using(owner).withdraw_from_oven(oven_id, withdraw_amount, receiver).send()
        self.bake_block()

        self.recorder.add_element(self.manager, 'withdraw_from_oven', opg)

        assert self.get_balance_mutez(owner) == prev_owner_tez_balance - get_consumed_mutez(owner, opg)
        assert self.get_balance_mutez(receiver) == prev_receiver_tez_balance + withdraw_amount
        assert self.get_balance_mutez(oven) == prev_oven_tez_balance - withdraw_amount
        assert ctez2.get_oven(owner, oven_id).tez_balance == prev_oven_info.tez_balance - withdraw_amount
