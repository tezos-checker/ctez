(* Functions for the isoutility curve (x + y)^8 - (x - y)^8 = k *)

let util (x: nat) (y: nat) : nat * nat =
    let plus = x + y in
    let minus = x - y  in
    let plus_2 = plus * plus in
    let plus_4 = plus_2 * plus_2 in
    let plus_8 = plus_4 * plus_4 in
    let plus_7 = plus_4 * plus_2 * plus in
    let minus_2 = minus * minus in
    let minus_4 = minus_2 * minus_2 in
    let minus_8 = minus_4 * minus_4 in
    let minus_7 = minus_4 * minus_2 * minus in
    (* minus_7 + plus_7 should always be positive *)
    (* since x >0 and y > 0, x + y > x - y and therefore (x + y)^7 > (x - y)^7 and (x + y^7 - (x - y)^7 > 0 *)
    (abs (plus_8 - minus_8), 8n * (abs (minus_7 + plus_7)))

type newton_param =  {x : nat ; y : nat ; dx : nat ; dy : nat ; u : nat ; n : int}

let rec newton (p : newton_param) : nat =
    if p.n = 0 then
        p.dy
    else
        let new_u, new_du_dy = util (p.x + p.dx) (abs (p.y - p.dy)) in
        (* new_u - p.u > 0 because dy remains an underestimate *)
        let dy = p.dy + abs ((new_u - p.u) / new_du_dy) in
        (* dy is an underestimate because we start at 0 and the utility curve is convex *)
        newton {p with dy = dy ; n = p.n - 1}

let rec newton_dx_to_dy (x, y, dx, rounds : nat * nat * nat * int) : nat =
    let xp = x + dx in
    let xp2 = xp * xp in
    let u, _ = util x y in
    newton {x = x; y = y; dx = dx ; dy = 0n ; u = u; n = rounds}

let margin (x: nat) (y: nat) : nat * nat =
    let plus = x + y in
    let minus = x - y  in
    let plus_2 = plus * plus in
    let plus_4 = plus_2 * plus_2 in
    let plus_7 = plus_4 * plus_2 * plus in
    let minus_2 = minus * minus in
    let minus_4 = minus_2 * minus_2 in
    let minus_7 = minus_4 * minus_2 * minus in
    (* plus_7 - minus_7 is always positive because it's 2 y ( 7 (x^6 + 5 x^4 y^2 + 3 x^2 y^4) + y^6) ) *)
    (abs (plus_7 - minus_7), abs (plus_7 + minus_7)) (* that's (du/dx) / (du/dy) , or how many y I get for one x *)
