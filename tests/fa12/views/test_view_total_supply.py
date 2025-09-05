from tests.fa12.base import Fa12BaseTestCase
from tests.helpers.utility import NULL_ADDRESS, TEST_ADDRESSES_SET

class Fa12ViewTotalSupplyTestCase(Fa12BaseTestCase):
    def test_view_total_supply(self) -> None:
        _, _, fa12, *_ = self.default_setup(
            get_balances = lambda *_: {
                TEST_ADDRESSES_SET[0]: 1,
                TEST_ADDRESSES_SET[1]: 2,
                TEST_ADDRESSES_SET[2]: 3
            }
        )
        assert fa12.view_total_supply() == 6

        _, _, fa12, *_ = self.default_setup(
            get_balances = lambda *_: {
                NULL_ADDRESS: 123,
            }
        )
        assert fa12.view_total_supply() == 123
