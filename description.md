# A description of ctez mechanisms

This is a rough outline of how ctez works in practice, with a few worked out examples.

## Motivation

The concept of delegation on Tezos can render certain smart-contracts tricky, especially when assets from multiple participants are pooled together. A wrapped version of tez is useful in those situations, if we can achieve the following properties:

1. fungibility: those tokens must be interchangeable with each other
2. decentralization and trust minimization: they should not benefit any specific baker, nor leave that option open to any governance body
3. no opportunity cost from missing out on delegation

It's fairly easy to satisfy two out of three constraints. If we do not care about missing out on delegation, a simple contracts that wraps tez and does not delegate the tez it holds will do the job. If we do not care about fungibility, we can let everyone create their own wrapped token backed by funds they delegated. Lastly, if we do not care about decentralization or trustlessness, we could leave the decision of where to delegate pooled funds to some third party.

Ctez can achieve all three property with a bit of mathematics!

 ## Glossary

In order to explain and understand ctez, it first helps to define a precise glossary.

### Target

The target represents the target peg between tez and ctez. A target of 1.5 means that the target peg is 1 ctez = 1.5 tez. Inasmuch as the ctez contract "tries" to do anything, it tries to automatically balance economic forces so that ctez is generally exchanged for tez at or around the target peg. The peg is only a target, there is no hard guarantee that, at any given time, ctez can be exchanged for tez at the target peg or vice-versa.

The target peg starts out at 1.0, meaning the smart-contracts initially attempts to balance out incentives so that 1 tez is exchangeable for 1 ctez, but this changes over time. **This is important**, the target peg between tez and ctez is not fixed, it changes over time. It changes smoothly, predictably, and relatively slowly, but it changes. All else equal, at equilibrium this change may tend to compensate for the opportunity cost of delegation

### Drift

**This is the most important number to pay attention to** in ctez, it represents how quickly the target peg between ctez  and tez increases or decreases. If the drift is positive, then the target peg is going to increase, if the drift is negative, the target peg is going to decrease.

### Premium

The premium is **the second most important number to pay attention to** in ctez. It represents the ratio between the price of ctez in tez, as observed in one specific cfmm contract (a so-called "dex"), and the target. If the premium is negative, then ctez is below its target, if the premium is positive, then it is above its target. 

### Oven

A smart contract holding tez, which lets its owner mint new ctez. The number of tez in the contract must exceed the number of ctez minted times the target peg, times 16/15. The last factor represents a safety buffer of 6.667%. The total number of ctez minted by an oven is called the outstanding amount of ctez. If ctez is returned to the oven (burned), the outstanding amount decreases (as does the total supply of ctez).

### Liquidation

If the drift is positive, the target increases over time. When the target increases, it's possible that some ovens end up having more ctez outstanding than they were allowed to mint in the first place. When that happens, anyone can come in and return ctez to the oven, in exchange for tez. The exchange happens **at the target peg** plus 3.226% (1/31), not at the market price. The entirety of the oven can be liquidated, not just the amount necessary to make it properly collateralized again. Ovens owner can avert liquidation and the associated penalty by returning ctez to the oven ahead of time. Liquidations should never come as a surprise if the oven owners are paying attention.


## Economic mechanisms

So how does ctez maintain, or tries to maintain, a peg close to the target, anyway? When the premium is negative, the drift *increases*. This can seem surprising, if the price is below the target, shouldn't we try to make the target smaller to meet the price by decreasing the drift or even making the drift negative? No, this would just lead to a spiral where it ends up at 0.

Assume for the moment that ctez generally succeeds in eventually restoring its peg. It's a very big and very important "if", but it will be motivated below. *If* that is the case, a higher drift makes it more attractive to hold ctez and less attractive to have outstanding ctez in an oven, meaning it leads people to buy ctez or to return it to ovens reducing the supply of ctez, which tends to moves the price in the direction of the peg.

Likewise, if the premium is positive, decreasing the drift makes it less attractive to hold ctez and more attractive to mint it and sell it, which puts downwards pressure on the price of ctez in tez.

### What if a discount persists for a long time?

Let's motivate that important "if". Why do we assume that the peg can be eventually restored? So long as ctez trades at a discount, the drift keeps increasing. This means that the target increases more than exponentially, it increases like the exponential of a quadratic function of time!

To give some concrete numbers, suppose the target starts at 1.0, that the drift starts at 0% per year, and that a premium of at last -3.125% (a discount) persists continuously for a very long time. After one day, the drift will be about 1% per year, after two days, it will be about 2% per year. How does this look for the target over the course of one year?

It looks like this.
![](https://i.imgur.com/3G3h2PC.png)

After one month, the target would be about `1.012`, after 2 months `1.05`, after 3 months, `1.12`, after 6 months, `1.56`, after a year, `5.85`.

Still, what prevents everyone from blissfully ignoring the target? In one word: liquidations. Oven owners cannot (and should not) ignore a rising target forever. They cannot outpace the target for very long and, at some point, they will have to either close their oven or be liquidated and, when that happens, it will be at the target price. So ctez holders may not always be able to redeem at the target, but they can wait for the discount to disappear. They could wait for months, but the longer they are forced to wait, the more attractive it becomes.

If oven owners decided to be very conservative and only mint 1% of the maximum amount of ctez they can mint, it could take 19 to 20 months for the target to rise enough to liquidate them — that's a long time — but at this point the target would be over 100 and liquidation would happen at that price.

### What if a positive premium persists for a long time

If a positive premium persists for a long time, then the drift will start going down, and might even become negative. At this point, oven owners could simply mint ctez, sell them for tez, use those to mint more ctez and not have to worry about liquidation because the target is decreasing. If the premium becomes negative, then they can buy back ctez and unwide the position. Even if liquidity is limited, the mere unwinding of their position can prevent the drift from rising until they are fully unwound.

### A healthy drift

Of course, the normal state of affair is not one where discounts last for two years and allow ctez to be exchanged at 100x in liquidations. Ctez holders and oven owners can and should react to the drift. As a rule of thumb, the drift should be around the baking reward (about 5.5% as these lines are written). If the drift is higher than this, then it can be more attractive to hold ctez than to hold and delegate tez. If the drift is lower than this, then oven owners can mint ctez and increase their balance via baking rewards faster then the target increases. 

A simple rule for oven owners or ctez holders is to pick the drift they are comfortable with, and to increase or decrease their position depending on what the drift is.

## How does the drift change exactly?

The exact formula for the change of the drift is detailed in the github repo for ctez but, overall, when the premium or discount is large (more than 1/32 or 3.125%), then the drift can change by as much as 1%/year every day. When it's in the middle, if follows a quadratic formula. The graph looks like this.

![](https://i.imgur.com/B3wgwdE.png)

Where the y axis represents (approximately) how many percentage points per year are added or removed to the drift on a daily basis, and the y axis represents the premium. As we can see, when the premium or discount is small, the drift changes very little. The drift adjustment for a premium or discount of 0.5% is about 40 times smaller than the drift adjustment for a premium or discount of 3.125%.
