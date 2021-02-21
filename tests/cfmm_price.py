import math
from subprocess import run

def drift_from_annual_pct(p):
    return int(math.log(1 + p) * 2**48 / (365.25 * 24 * 3600))

def make_test(annual_drift=0.05, tez_balance=1, ctez_balance=1.03):
    drift = drift_from_annual_pct(annual_drift)
    mutez = int(1e6 * tez_balance)
    muctez = int(1e6 * ctez_balance)
    
    return (f"""
let storage = {{
  ovens = (Big_map.empty : (address, oven) big_map) ;
  target = (Bitwise.shift_left 103n 48n) / 100n ; (* about 1.03 *)
  drift = {drift} ; 
  last_drift_update = ("2020-01-01T00:00:00Z" : timestamp) ;
  ctez_fa12_address = ("tz1Ke2h7sDdakHJQh8WX4Z372du1KChsksyU" : address) ;
  cfmm_address = ("tz1Ke2h7sDdakHJQh8WX4Z372du1KChsksyU" : address) ;
}} in

let (_, storage) = cfmm_price storage {mutez}mutez {muctez}n in
(storage.target, storage.drift)
""")

test = make_test(annual_drift=0.05, tez_balance=1, ctez_balance=1.03)
now = "2020-01-01T00:05:00Z"
command = ["ligo", "interpret", test, "--now", now, "--sender", "tz1Ke2h7sDdakHJQh8WX4Z372du1KChsksyU",  "--init-file", "../ctez.mligo"]
print(command)
process = run(command, capture_output=True)
print(process.stdout.decode('utf8'))
print(process.stderr.decode('utf8'))
