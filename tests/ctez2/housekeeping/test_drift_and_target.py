from math import floor
from tests.ctez2.base import Ctez2BaseTestCase
from parameterized import parameterized
from tests.ctez2.test_cases import drift_and_target
from tests.helpers.contracts.ctez2.ctez2 import Ctez2

class Ctez2DriftAndTargetTestCase(Ctez2BaseTestCase):
    @parameterized.expand(drift_and_target)
    def test_should_update_drift_and_target_correctly(
        self, 
        _name, 
        ctez_liquidity: int,
        target_ctez_liquidity: int,
        tez_liquidity: int, 
        target_ctez_price: float,
        delta: int,
        expected_drift_change_percent: int,
    ) -> None:
        ctez2, _, sender, _, *_ = self.default_setup(
            target_ctez_price = target_ctez_price,
            ctez_liquidity = ctez_liquidity,
            ctez_total_supply = target_ctez_liquidity * 20, # because Q is 5% of total supply
            tez_liquidity = tez_liquidity,
            bootstrap_all_tez_balances = True
        )

        context = ctez2.get_context()
        assert context.drift == 0
        assert context.target == floor(target_ctez_price * Ctez2.FLOAT_DENOMINATOR)

        # do something to inject housekeeping (update Q)
        ctez2.using(sender).collect_from_ctez_liquidity(sender).send()
        self.bake_block()

        context = ctez2.get_context()
        prev_drift = context.drift

        self.bake_blocks(delta - 1) # 1 block is 1 second
        ctez2.using(sender).collect_from_ctez_liquidity(sender).send()
        self.bake_block()

        context = ctez2.get_context()
        prev_target = context.target

        new_drift = context.drift
        d_drift = new_drift - prev_drift
        assert round(100 * d_drift / (delta * 2**16)) == expected_drift_change_percent

        delta = 2
        self.bake_blocks(delta - 1) # to make new delta is 2
        ctez2.using(sender).collect_from_ctez_liquidity(sender).send() # force housekeeping again to apply new drift to target
        self.bake_block()

        context = ctez2.get_context()
        d_target = context.target - prev_target
        assert d_target == (prev_target * abs(new_drift) * delta // Ctez2.FLOAT_DENOMINATOR) * (-1 if new_drift < 0 else 1) # to check that drift applied correctly

    def test_should_not_fail_when_target_lt_1_and_Q_is_1(self) -> None:
        ctez2, _, sender, _, *_ = self.default_setup()
        
        # provide only tez liquidity which should make negative drift in next block
        ctez2.add_tez_liquidity(sender, 0, self.get_future_timestamp()).with_amount(100_000_000).send()
        self.bake_block()

        # update drift to negative value by any action (just to call housekeeping)
        ctez2.collect_from_tez_liquidity(sender).send()
        self.bake_block()
        context = ctez2.get_context()
        prev_drift = context.drift
        prev_target = context.target
        assert prev_drift < (1 * Ctez2.FLOAT_DENOMINATOR)

        # update target to the value less then 1. target += drift) by any action (just to call housekeeping)
        ctez2.collect_from_tez_liquidity(sender).send()
        self.bake_block()
        context = ctez2.get_context()
        assert context.target == prev_target + prev_drift
        assert context.target < (1 * Ctez2.FLOAT_DENOMINATOR)

        # check that housekeeping does not fail
        ctez2.collect_from_tez_liquidity(sender).send()
        self.bake_block()

    # def test_drift_and_target_calc(self) -> None:
    #     self.manager.context.now
    #     seconds_in_day = 60*60*24
    #     d_drift_per_day = (2**16 * seconds_in_day)
    #     drift = 0
    #     initial_target = Ctez2.FLOAT_DENOMINATOR
    #     target = initial_target
    #     days = 366 // 2

    #     for i in range(days):
    #         target += (drift * seconds_in_day * target) // Ctez2.FLOAT_DENOMINATOR 
    #         drift += d_drift_per_day

    #     print('target', target / Ctez2.FLOAT_DENOMINATOR)
    #     print('grow_%', (target - initial_target) / initial_target * 100)
    #     assert False
