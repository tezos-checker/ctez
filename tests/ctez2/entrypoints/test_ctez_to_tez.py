from tests.ctez2.base import Ctez2BaseTestCase
from tests.helpers.contracts.ctez2.ctez2 import Ctez2
from parameterized import parameterized
from tests.ctez2.test_cases import swap_ctez_to_tez_cases
from tests.helpers.utility import NULL_ADDRESS, TEST_ADDRESSES_SET
from math import floor, ceil

class Ctez2CtezToTezTestCase(Ctez2BaseTestCase):
    def test_should_fail_if_tez_in_transaction(self) -> None:
        ctez2, _, sender, receiver, *_ = self.default_setup(
            tez_liquidity = 100
        )

        sent_ctez = 10
        with self.raises_michelson_error(Ctez2.Errors.TEZ_IN_TRANSACTION_DISALLOWED):
            ctez2.using(sender).ctez_to_tez(receiver, sent_ctez, 10, 0).with_amount(1).send()

    def test_should_fail_if_deadline_has_passed(self) -> None:
        ctez2, _, sender, receiver, *_ = self.default_setup(
            tez_liquidity = 100
        )

        sent_ctez = 10
        with self.raises_michelson_error(Ctez2.Errors.DEADLINE_HAS_PASSED):
            ctez2.using(sender).ctez_to_tez(receiver, sent_ctez, 10, self.get_passed_timestamp()).send()

    def test_should_fail_if_insufficient_tokens_liquidity(self) -> None:
        ctez2, _, sender, receiver, *_ = self.default_setup(
            tez_liquidity = 7
        )

        sent_ctez = 10
        with self.raises_michelson_error(Ctez2.Errors.INSUFFICIENT_TOKENS_LIQUIDITY):
            ctez2.using(sender).ctez_to_tez(receiver, sent_ctez, 8, self.get_future_timestamp()).send()

    def test_should_fail_if_insufficient_tokens_bought(self) -> None:
        ctez2, _, sender, receiver, *_ = self.default_setup(
            tez_liquidity = 100
        )

        sent_ctez = 10
        with self.raises_michelson_error(Ctez2.Errors.INSUFFICIENT_TOKENS_BOUGHT):
            ctez2.using(sender).ctez_to_tez(receiver, sent_ctez, 1_000_000, self.get_future_timestamp()).send()

    def test_should_not_fail_if_all_liquidity_removed(self) -> None:
        all_liquidity = 8
        sent_ctez = 10
        ctez2, ctez_token, sender, receiver, *_ = self.default_setup(
            tez_liquidity = all_liquidity,
            get_ctez_token_balances = lambda sender, *_: {
                sender: sent_ctez 
            }
        )

        sender.bulk(
            ctez_token.approve(ctez2, sent_ctez),
            ctez2.ctez_to_tez(receiver, sent_ctez, all_liquidity, self.get_future_timestamp())
        ).send()
        self.bake_block()

        # we need to ensure contract works well
        ctez2.add_tez_liquidity(receiver, 0, self.get_future_timestamp()).with_amount(all_liquidity).send()
        self.bake_block()

    @parameterized.expand(range(0, 2))
    def test_should_fail_if_sell_token_amount_too_small(self, sell_amount) -> None:
        ctez2, _, sender, receiver, *_ = self.default_setup(
            tez_liquidity = 1
        )

        with self.raises_michelson_error(Ctez2.Errors.INSUFFICIENT_TOKENS_BOUGHT):
            ctez2.using(sender).ctez_to_tez(receiver, sell_amount, 0, self.get_future_timestamp()).send()

    def test_should_not_fail_if_bought_token_amount_is_zero(self) -> None:
        sell_amount = 3
        ctez2, ctez_token, sender, receiver, *_ = self.default_setup(
            tez_liquidity = 100_000_000,
            get_ctez_token_balances = lambda sender, *_: {
                sender : sell_amount
            }
        )

        prev_receiver_ctez_balance = ctez_token.view_balance(receiver)
        sender.bulk(
            ctez_token.approve(ctez2, sell_amount),
            ctez2.ctez_to_tez(receiver, sell_amount, 0, self.get_future_timestamp())
        ).send()
        self.bake_block()

        assert ctez_token.view_balance(receiver) == prev_receiver_ctez_balance

    @parameterized.expand(swap_ctez_to_tez_cases)
    def test_should_swap_ctez_to_tez_tokens_correctly(self, _, tez_liquidity, target_liquidity, sent_ctez, tez_bought, target_price) -> None:
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

        sender.bulk(
            ctez_token.approve(ctez2, sent_ctez),
            ctez2.ctez_to_tez(receiver, sent_ctez, tez_bought, self.get_future_timestamp())
        ).send()
        self.bake_block()

        subsidies = ctez2.get_sell_ctez_dex().subsidy_reserves + ctez2.get_sell_tez_dex().subsidy_reserves
        Q_ctez = ctez2.contract.storage()['context']['_Q']
        Q_tez = floor(Q_ctez * target_price)
        assert target_liquidity - 1 <= Q_tez <= target_liquidity # because of rounding
        assert self.get_balance_mutez(receiver) == prev_receiver_tez_balance + tez_bought
        assert ctez_token.view_balance(sender) == prev_sender_ctez_balance - sent_ctez
        assert ctez_token.view_balance(ctez2) == prev_ctez2_ctez_balance + sent_ctez + subsidies
        
        current_sell_ctez_dex = ctez2.get_sell_ctez_dex()
        current_sell_tez_dex = ctez2.get_sell_tez_dex()
        assert current_sell_ctez_dex.self_reserves == prev_sell_ctez_dex.self_reserves
        assert current_sell_ctez_dex.proceeds_reserves == prev_sell_ctez_dex.proceeds_reserves
        assert current_sell_tez_dex.self_reserves == prev_sell_tez_dex.self_reserves - tez_bought
        assert current_sell_tez_dex.proceeds_reserves == prev_sell_tez_dex.proceeds_reserves + sent_ctez
