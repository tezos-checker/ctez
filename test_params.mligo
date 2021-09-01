// params: x y dx target rounds OR y x dy target rounds
let trade_params : (nat * nat * nat * nat * int * (nat * nat)) list = [
    (1_000_000_000_000n, 1_000_000_000_000n, 100_000_000n, 1_000n, 4, (1_000n, 1_300n)) ; // defaults
    // TODO : populate
]

// output: tokens
let expected_cash_to_token : nat list = [
    99_999_999n ;
]

// output: cash
let expected_token_to_cash : nat list = [
    99_999_999n ;
]


// fee variation 
let fees : (nat * nat) list = [
    (1_000n,1_000n) ;
]