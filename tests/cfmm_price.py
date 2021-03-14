import math
from subprocess import run
from datetime import datetime, timedelta


origin = datetime(2020, 1, 1, 0, 0, 0)

def drift_from_annual_pct(p):
    return int(math.log(1 + p) * 2**48 / (365.25 * 24 * 3600))

def make_test(annual_drift=0.0 , tez_balance=1, ctez_balance=1.0, target=1.0):
    drift = drift_from_annual_pct(annual_drift)
    mutez = int(1e6 * tez_balance)
    muctez = int(1e6 * ctez_balance)
    target = int(2**48 * target)
    return (f"""
let storage = {{
  ovens = (Big_map.empty : (oven_handle, oven) big_map) ;
  target = {target}n ;
  drift = {drift} ;
  last_drift_update = ("{origin.strftime(u"%Y-%m-%dT%H:%M:%SZ")}" : timestamp) ;
  ctez_fa12_address = ("tz1Ke2h7sDdakHJQh8WX4Z372du1KChsksyU" : address) ;
  cfmm_address = ("tz1Ke2h7sDdakHJQh8WX4Z372du1KChsksyU" : address) ;
}} in

let (_, storage) = cfmm_price (storage, {mutez}n, {muctez}n) in
(storage.target, storage.drift)
""")


def run_test(
        target = 1.03,
        annual_drift = 0.05,
        ctez_balance = 1.0,
        tez_balance = 1.03,
        delta_t = timedelta(minutes=5)):

    drift = drift_from_annual_pct(annual_drift) / 2**48
    test = make_test(
        annual_drift=annual_drift,
        tez_balance=tez_balance,
        ctez_balance=ctez_balance,
        target=target)

    command = ["ligo", "interpret", test, "--now", (origin + delta_t).strftime(u'%Y-%m-%dT%H:%M:%SZ'), "--sender", "tz1Ke2h7sDdakHJQh8WX4Z372du1KChsksyU",  "--init-file", "../ctez.mligo"]
    # print(command)
    process = run(command, capture_output=True)
    #print(process.stderr.decode('utf8'))
    result = process.stdout.decode('utf8')[1:-1].split(' ')
    new_target, new_drift = int(result[1]) / 2**48, int(result[3]) / 2**48
    new_annual_drift = math.exp(new_drift * 365.25 * 24 * 3600) - 1.0
    target_yearly_growth = math.exp(math.log(new_target / target) / delta_t.total_seconds() * 365.25 * 24 * 3600)

    # Check that the target grew at the expected rate
    assert (abs((target_yearly_growth-1) - annual_drift) < 1e-5)



    # Check that the drift changed by the expected amount
    price = tez_balance / ctez_balance
    d_drift = min(1024 * (new_target / price - 1.0)**2, 1.0)  * delta_t.total_seconds() / 2**48
    #print(target / price ,d_drift,1024 * (target / price - 1.0)**2, min(1024 * (target / price - 1.0)**2, 1.0)  * delta_t.total_seconds())
    expected_drift = drift + d_drift * (1.0 if price < target else -1.0)

    expected_annual_drift = math.exp(expected_drift * 365.25 * 24 * 3600) - 1.0
    assert (abs(new_annual_drift - expected_annual_drift) < 1e-6)


for f in range(-50,50):
    f = (1 + f / 1000.0) # from -5% to 5% in 0.1% increments
    run_test(target = 1.03 * f, annual_drift = 0.05, ctez_balance = 1.0, tez_balance = 1.03, delta_t = timedelta(minutes=10*60))