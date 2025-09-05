from tests.fa12.base import Fa12BaseTestCase

class Fa12ViewAllowanceTestCase(Fa12BaseTestCase):
    def test_view_allowance(self) -> None:
        account1, account2, fa12, *_ = self.default_setup(
            get_allowances = lambda account1, account2: [
                (account1, account2, 44444),
            ]
        )
        assert fa12.view_allowance(account1, account2) == 44444
        assert fa12.view_allowance(account2, account1) == 0
