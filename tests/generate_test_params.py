# This file generates (1) test cases that populate test_params.mligo,
# and (2) the expected values from these test cases

import random 

# (1) Generate the random data using a fixed seed for reproducibility
#     This random data comes in the form:
#      - (x, y, dx, target, rounds, const_fee) *OR* 
#      - (y, x, dy, target, rounds, const_fee)
#     depending on if we're testing 
#      - trade_dtez_for_dcash or 
#      - trade_dcash_for_dtez

# The data in test_params is generated with n = 50
def generate_random_data(n):
    # Fix the seed
    random.seed(0)
    accum = []
    # Generate the following vector:
    # (x, y, dx, target, rounds, const_fee)
    for i in range(n):
        x = random.randint(0,100000000000000) # between 0 and 100_000_000 XTZ
        y = random.randint(0,100000000000000) # between 0 and 100_000_000 CTEZ
        dx = random.randint(0, min(x,y)) # so as to not exceed the supply
        target = random.randint(0, 28147497671065600) # betweeen 0 and 100
        rounds = 4 # constant at 4 rounds
        const_fee = (995, 1000) # constant at 0.5% fee
        accum = accum + [(x,y,dx,target,rounds,const_fee)]
    return accum


# (2) Generate the expected values dataset from the given random data
def newton_x_to_y (x,y,dx,dy_approx,a,b,rounds):
    rounds = rounds - 1
    xp = x + dx 
    yp = y - dy_approx 
    num = x * y * ((a*x)**2 + (b*y)**2) - xp * yp * ((a*xp)**2 + (b*yp)**2)
    denom = xp*((a*xp)**2 + 3*((b*yp)**2))
    adjust = num/denom 
    if (rounds == 0):
        return dy_approx
    else:
        return newton_x_to_y(x,y,dx,(dy_approx-adjust),a,b,rounds)

def x_to_y(x,y,dx,a,b,rounds):
    dy_approx = 0
    return newton_x_to_y(y,x,dx,dy_approx,a,b,rounds)

def generate_expected_values(rand_data, switch):
    for i in range(len(rand_data)):
        if switch:
            (x,y,dy,a,rounds,const_fee) = rand_data[i]
            b = 281474976710656
            rand_data[i] = x_to_y(y,x,dy,b,a,rounds)
        else:
            (x,y,dx,a,rounds,const_fee) = rand_data[i]
            b = 281474976710656
            rand_data[i] = x_to_y(x,y,dx,a,b,rounds)
    return rand_data



def main():
    n = 50 # we use 50 random cases
    expected_dcash_to_dtez = generate_expected_values(generate_random_data(n), 0)
    expected_dtez_to_dcash = generate_expected_values(generate_random_data(n), 1)
    print("Random data:")
    print(generate_random_data(n))
    print("Expected dtez for dcash:")
    print(expected_dtez_to_dcash)
    print("Expected dcash for dtez")
    print(expected_dcash_to_dtez)


if __name__ == "__main__":
    main()
