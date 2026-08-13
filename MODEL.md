# The working model

**What FH6 has been measured to do, and what that means for building a tune.**

This file is the answer to "what do we actually know?". Everything in it is
measured off Boston's screen. It is maintained as findings land, and it is the
document to reflect against when a discipline's tuning approach changes or the
way builds are put together needs tightening.

It is deliberately separate from the other four:

| file | question it answers |
|---|---|
| **`MODEL.md`** | **what the game does, and what follows for how we tune** |
| `CLAUDE.md` | how to work in this repo, and where each constant came from |
| `TESTS.md` | what is still unmeasured, and how to measure it |
| `MEASURE.md` | the session in flight — what to read next |
| `BACKLOG.md` | open items and decisions |

`tests/data/*.json` is the evidence. **Where this file and a fixture disagree,
the fixture wins** and this file is stale — say so in the same commit that
fixes it.

---

## How to read a claim here

Every statement carries one of these. Nothing may be promoted a rung without
the evidence that rung requires.

| rung | means | required |
|---|---|---|
| **MEASURED** | seen on the screen, two or more cars | ≥2 cars, one variable at a time |
| **ONE CAR** | real, but might be that car | 1 car, clean measurement |
| **INFERRED** | follows from measured facts, not directly seen | stated derivation |
| **HYPOTHESIS** | fits the data, not tested against an alternative | the test that would kill it |
| **ASSUMED** | house heuristic or FH4/FH5 carry-over, never checked | — |

**A two-decimal readout cannot confirm a model to more digits than it prints.**
Anything in `[0.445, 0.455]` prints as `0.45`. Four conclusions have died on
that in this programme. Where a figure is quoted here, its honest range is
quoted with it or the figure is not quoted at all.

---

## 1. Mechanical Balance

### What it is — MEASURED, two cars

**Mechanical Balance is the rear axle's share of lateral LOAD TRANSFER.**
Not of roll stiffness. Track width enters as a **divisor**.

| | widen FRONT | widen REAR |
|---|---|---|
| GR86 | 0.48 → 0.50 | 0.52 → 0.50 |
| Civic | 0.44 → 0.46 | 0.48 → 0.46 |

Roll stiffness goes as track *squared* and would predict the opposite on both
axles of both cars — four chances to be right, four misses. Only `K ÷ track`
has the observed signs.

**Why it took so long to notice:** at fixed geometry, roll stiffness and load
transfer differ only by a constant. Every bar and spring row ever taken fits
both readings equally well. Only changing the *track* separates them.

### Its shape — MEASURED structure, ONE CAR coefficients

```
MB = R / (F + R)
F = arF + g(spF) + tF        R = arR + g(spR) + tR
```

- **Linear in the bar.** Confirmed on both cars over 20–65.
- **Sub-linear in the spring.** `g` is *not* linear — feasible exponents
  `p ∈ [0.45, 0.61]` over a 5× spring range. **p = 1 is excluded outright.**
- **Large additive per-axle terms.** They are why equal bars do not read 0.500
  (GR86 0.51, Civic 0.49) and why the same bar *ratio* at different magnitudes
  gives different readouts.
- **The terms are the car, not the tune** — tires, geometry, unsprung mass.
  Tire pressure moves MB; ride height is untested.

**`p = 0.5` is a HYPOTHESIS worth naming:** suspension frequency goes as
`√(k/m)`, so a square-root spring term is what you get if the game builds this
from *frequencies* rather than rates. Untested against alternatives.

### The trap that cost the most — read before fitting anything

The GR86 was fitted over **1.85×** of spring range and the Civic's first pass
over **1.86×**. Over ~1.9× a concave curve is indistinguishable from a line at
two-decimal resolution — re-run on the GR86's rows, *every* exponent from 0.3
to 1.0 fits.

**The linear model was never confirmed. It was never stressed.** If you fit
inside a narrow window, say so, and go to the slider stops before believing the
shape.

### What it means for tuning

- **Do not quote a sensitivity.** It is per-car *and* the curve is not linear,
  so any single number is wrong somewhere. **Measure the local slope instead:**
  read MB, add 10 to the rear bar, read again, scale the gap by the difference.
  That is what the app does, and it is correct precisely *because* the function
  is curved.
- **Expect a bigger move than feels right.** On the GR86, 10 points of rear bar
  moved MB by ≈0.015, so closing 0.51 → 0.55 wanted **≈+27 bar**. The rule this
  replaced implied about 2, which would have made the target band look
  unreachable rather than the advice look wrong.
- **A stiffer rear bar raises MB. A softer front bar or front spring also
  raises it.**
- **Track width changes the balance and the app does not model it.** Widening
  the front raises MB; widening the rear lowers it. A build with asymmetric
  width upgrades has a balance the formulas cannot see — this is what the
  app's "trust the readout" note is about, and now it can say which way.

### Still open

- The **0.55–0.65 target band is a house number** (`ASSUMED`) and the app's own
  tune measures 0.51 against it. Now that MB is known to be load transfer, the
  band should be re-reasoned rather than re-guessed — case `T6`.
- Ride height's effect: predicted by the model, never measured.
- Coefficients on a third car.

---

## 2. Aero Balance

**The sliders are in POUNDS of downforce, and the two ends have different
ranges.** — MEASURED

```
AB = (F + a) / (F + a + R + b)        a ≈ 175 lb front, b ≈ 215 lb rear  [ONE CAR]
```

`a` and `b` are the **bodyshell's own downforce**, which no slider touches, and
they are comparable in size to the wings. Validated out-of-sample on the GR86.

**Consequences:**

- **A percentage cannot target the readout.** 60% front and 60% rear are not
  equal downforce, and the same percentages on another car are not even the
  same pounds. The app therefore prints "% of travel" — a *starting position* —
  and hands the target to the readout.
- **The rear body term is the larger one** on both cars measured (GR86 b−a ≈ 40;
  Civic b−a ≈ 25, both loosely bounded). Same sign, weak evidence.
- Track width does **not** move AB — measured as a control on both cars.
- The **0.42–0.48 target band is a house number** (`ASSUMED`), never published.
- Whether the band is even *reachable* on a given car is unknown until its floor
  and ceiling are read — case `A3`.

---

## 3. Gearing

### `k` is the invariant — MEASURED

**One caveat on the evidence, found by audit.** The July sitting's axis was
never actually read — the fixture records it as null. The 157 used for it is
what k-invariance *implies*, not an independent reading, so it is excluded from
any claim about invariance and the remaining four triples carry that on their
own. Using it as evidence for the thing that produced it would be circular.

```
speed at redline in gear G = k / (FD · G)        k = axisMax · fdFit · G_top
```

Measured across two builds and three tunes on the GR86: **588.1–590.7, a 0.44%
spread**, while the axis itself read 157 on some and 159 on others. When the
axis moves the fit moves to compensate, because the axis is the chart's scale
and the fit is the final drive at which top gear reaches its end.

**The one rule:** read the axis, the fit and the top ratio **on the same tune,
in the same sitting.** Paired that way any of them is right; mixed, none are.
The axis alone is chart furniture.

*Honest sample size: three of the five readings are one sitting at adjacent
final drives, so this is nearer three independent points than five.*

### The race 7-speed — MEASURED, two cars, one confound

```
4.17 / 2.89 / 2.17 / 1.66 / 1.32 / 1.07 / 0.85   at final drive 3.63
```

Identical to every digit on a 2022 GR86 and a 2023 Civic Type R, 571 lb apart
with opposite original layouts. `SPREAD[7]` is now this.

**Unresolved confound:** both cars were AWD-swapped, so "the race 7-speed has
fixed ratios" and "the AWD swap installs a standard gearbox" fit equally well.
One screenshot of a race 7-speed on a car that was never drivetrain-swapped
settles it.

**The other six gear counts are still invented** (`ASSUMED`). That is what the
Top gear ratio input exists for: enter it and none of them are load-bearing.

### What it means for tuning

- **Geometry picks the starting point; the Performance panel picks the
  setting.** Nothing in the gearing geometry can predict top speed, because
  none of it knows the power curve.
- **The measured flat zone is wide.** On the GR86, 0-100 spanned 0.12 s and top
  speed 4.4 mph across final drives 3.50–4.82, with four of six settings inside
  1%. Quoting a final drive to two decimals implies precision the game does not
  reward — sweep the band instead.
- **`vFrac` for road is 1.00 — gear at the fit**, because at the fit every gear
  engages while shorter settings leave the top ratio doing nothing. Same lap
  time, one of them uses the gearbox you paid for. **Only road is measured**;
  the other six disciplines are scaled from it (`ASSUMED`).

---

## 4. The Performance panel — what it does and does not see

**Deterministic within a sitting** — MEASURED. One setting re-entered six
times, three approached from above and three from below, returned identical
figures on every column. There is no path dependence.

- **Acceleration is quantised to exactly 1/60 s.** Confirmed on both cars.
- **It drifts between sittings.** Open every panel session with a repeat check
  (`S0`) and use *that* session's spread as its noise floor.
- **`SIMULATING…` means the number is stale.** This cost two rows the day the
  rule was written.

### What moves which readout — MEASURED

| readout | responds to |
|---|---|
| **Lateral G** | **parts only — never the tune** |
| Braking distance | anti-roll bars (~1.5%), springs (~2.9%), track width, parts |
| 0-60 / 0-100 | parts, gearing |
| Top speed | **unsettled — see below** |

**Lateral G is the sharp one.** It has read the same value through every bar
setting, every spring setting from slider stop to slider stop, tire pressure,
gearing and aero sliders, across two cars — and then moved when a body kit went
on. So the readout is responsive and simply does not see the tune.

That is worth sitting with: bars and springs genuinely should change
steady-state cornering grip. That this figure cannot see them suggests it is a
**tire-and-downforce limit rather than a whole-car cornering measurement**.

**Braking responds to the tune, and non-monotonically.** Front spring rate moved
60-0 by 2.9% with the *baseline* worst of three settings. Three points cannot
tell a real optimum from a misreading, and nothing is concluded — but any brake
work (`S4`) must hold bars *and* springs or it will measure this instead.

### Top Speed — CONTRADICTED, do not act on it

`CLAUDE.md` records the settled reading: that figure is the maximum with the
entire build aimed at top speed, aero included, not the speed on the gearing
fitted. Three app features were withdrawn on that basis.

Today's rows moved it with the wing, the gearing, the springs and the pressure,
which is hard to square with a projection that ignores the tune. **Every one of
those observations was incidental**, taken while measuring something else — and
three conclusions were reversed on exactly that kind of evidence and had to be
withdrawn again. **Case `S1` is the deliberate test and it is unrun.** Nothing
changes until it runs.

---

## 5. The game's default tune

**Most of it is a fixed template, not a calculation** — MEASURED, two cars.

Identical to every digit on a 2022 GR86 and a 2023 Civic Type R:

```
camber   -2.0 / -1.5      toe  0.0 / 0.0      caster  5.0
brakes   50% balance, 100% pressure
diff     30/10 front, 55/13 rear, 60 centre
gearing  all seven ratios and the final drive
```

Different on the two: **bars, springs, ride height, damping, tire pressure,
aero**. The split is clean — anything depending on the car's mass, its
distribution or its bodywork varies; everything else is stamped on.

Three things fall out:

- **Caster defaults to 5.0.** The app prints 6.5 for the road family; the
  forums say 7.0. A default is where the game starts you, not where it is
  fastest — but 5.0 is no longer a one-car quirk. Case `S7`.
- **Centre diff defaults to 60**, which is where the app already sits. First
  direct confirmation from the game.
- **Bump is 0.62–0.63 × rebound** on all four axles of both cars. The app's
  0.63 convention is FH4/FH5 carry-over that had never been FH6-confirmed. Now
  corroborated four times — **the ratio only**, nothing about the absolute
  damping values.

### The uncomfortable one

On the GR86, **the game's default tune beat the app's tune on 5 of 6 panel
columns**, braking by 8%. One car, and the panel does not measure lap time —
but it is the single most useful calibration signal the programme has produced
and it points at the app, not at the game. Case `C1` needs a second car.

---

## 6. Parts

**The upgrade screen is a controlled A/B** — MEASURED. It shows every readout
for the installed part *and* the alternative, side by side, with no tune drift
between the halves, and **it shows the game's DEFAULT tune** (confirmed three
ways on the GR86). So it is directly comparable to a default-tune reading, and
it can be read without restoring the default tune first.

Five pages cycle. Page 1 (the six star ratings) is the only one not worth
capturing — rounded to one decimal, derived, and the PI is on page 2 anyway.

### Track width — ONE CAR for the performance figures, MEASURED for MB

Front track width on the Civic, stock → max, for **one point of PI**:

```
60-0        72.5 -> 71.5 ft        0-60    3.483 -> 3.467 s   (one frame)
100-0      159.3 -> 158.3 ft       0-100   8.533 -> 8.500 s   (two frames)
top speed  165.8 -> 166.5 mph
weight, front %, power, torque, lateral G, aero:  ALL UNCHANGED
```

**The app is right that width does not move the stat block and is not a grip
upgrade in the lateral-G sense. It is wrong that width does nothing but shift
brake bias** — `wStep = twr − twf` means 0/0 and +3/+3 produce an identical
tune, and a PI point buying 1.4% of braking is a trade the build plan never
mentions.

### Widebody — MEASURED that it is PER-KIT

|  | GR86 Rocket Bunny | Civic FH6 kit |
|---|---|---|
| PI | 700 → 660 (**−40**) | 700 → 683 (−17) |
| lateral G 120 | 1.41 → 1.31 (**−0.10**) | 1.36 → 1.45 (**+0.09**) |
| aero balance | 0.45 → 0.44 | 0.50 → 0.33 |
| 60-0 | 63.4 → 69.2 ft | 71.5 → 72.1 ft |

One kit buys cornering speed with straight-line speed. The other loses grip at
both speeds and gives up 40 PI. **There is no general statement about
widebodies.** "The widebody is a downforce kit" was published off the Civic
alone and withdrawn by the GR86 the same day.

**A widebody is a per-part decision that has to be read off the screen**, and
the screen will tell you in four presses of Toggle.

---

## 7. What is still ASSUMED — the honest list

Everything below is a house heuristic or FH4/FH5 carry-over. **None of it has
been checked against an FH6 screen.** These are where the app is most likely
wrong, ranked by how much rides on them:

1. **The gating matrix** — which sliders each part tier unlocks. This decides
   *which controls the app shows you at all*, so it outranks every calibration
   question: everything else is a number being wrong, this is a control being
   invented or hidden. The two most likely wrong: street/sport suspension gives
   spring rate and ride height but **no** damping or alignment; street/sport
   diff gives acceleration lock only, **no** decel. Case `P1`, 30 seconds each.
2. **The MB and AB target bands** (0.55–0.65, 0.42–0.48) — house numbers, and
   the app's own tune misses its own MB band.
3. **Discipline constants** — camber targets, damping ratios, ARB multipliers,
   final-drive bases, the `vFrac` table. Only road `vFrac` is measured; the
   other six are scaled from it. Expect Boston's seat-time feedback to beat any
   published source here.
4. **`SPREAD` for 4, 5, 6, 8, 9 and 10 gears** — invented. The 7-speed row is
   measured; the rest have never been seen.
5. **Brake bias per width step**, and brake pressure generally. Case `S4`, and
   it now has two confounds to hold (bars and springs both move braking).
6. **Slider ranges.** One real range has ever been recorded: the Civic's front
   spring, 310.7–1553.7 lb/in. ARBs are 1–65 step 0.1, confirmed.

---

## 8. How to keep this file honest

- **Update it in the same commit that lands the finding.** The recurring failure
  in this repo is prose lagging fixtures — twice caught by review, both times
  because a paragraph carried whichever version of the argument was current when
  it was last touched.
- **When something is withdrawn, withdraw it in place.** Keep the reasoning
  under a header saying it failed. Watching a sound argument fail is the lesson;
  deleting it throws that away.
- **Two cars minimum before a rung says MEASURED.** Three claims have died on
  one-car generalisation: `vFrac` twice, and the widebody.
- **Quote ranges, not point estimates**, wherever the input was a two-decimal
  readout. Agreement to three digits off two-decimal inputs is a coincidence,
  and it has happened four times.
- **Before believing a fit, ask what the next measurement would have to read to
  falsify it — then take that one.** The row nobody intends to fit is the only
  one that can falsify anything.
