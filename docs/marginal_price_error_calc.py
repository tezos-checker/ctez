import numpy as np
import random


def step(x, y, q, Q):
    num = 80 * Q**3 * x + 6*(Q-q)**2 * y**2 + 8*(Q-q)*y**3 + 3*y**4
    den = 4*(21*Q**3 + 3*Q**2*(y-q) + 3*Q*(y-q)**2 +(y-q)**3)
    return max(num // den, 0)

def guess(x, q, Q):
    y = x
    y = max(step(x, y, q, Q), 0)
    y = max(step(x, y, q, Q), 0)
    y = max(step(x, y, q, Q), 0)
    # y = max(y - y // 1_000_000_000 - 1, 0)
    return y

def paid(dq, q, Q):
    # what should need to be paid to buy dq, notice the rounding up
    return -((-dq)*(dq**3 + 6*dq*(Q-q)**2 + 4*dq**2*(Q-q) - 4*(q**3-3*q**2*Q+3*q*Q**2-21*Q**3))//(80*Q**3))

def samplerange(n):
    # sample between 0 and n inclujsive
    # with probability 0.025 first 10, with probability 0.025 last 10
    # with probability 0.025 first 5%, with probability 0.025 last 5%
    # otherwise uniform
    u = np.random.rand()
    if u < 0.025:
        k = random.randint(0, 10)
    elif u < 0.05:
        k = random.randint(n-10, n)
    elif u < 0.95:
        k = random.randint(0, n)
    elif u < 0.975:
        k = random.randint(0, n//20)
    else:
        k = random.randint(19*n//20, n)
    # clip k to [0,n]
    return max(min(k, n), 0)



def test():
    # we decide to pay some amount x, we receive guess(x, q, Q), we need to ensure that this
    # paid(guess(x, q, Q)), what we would have needed to pay to get this, is actually less than x but still close to x


    for _ in range(1_000_000):
        Q = 10**np.random.randint(0, 6)
        q = samplerange(Q)
        dq = samplerange(q)

        x = paid(dq, q, Q)
        y = guess(x, q, Q)
        y_ = max(y - y // 1_000_000_000 - 1, 0)
        assert (y_ <= dq)
        assert (dq <= y + 1)


test()
