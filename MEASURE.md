# Session sheets

Two sessions, different jobs. **Session A** (gearing) settles the specific
constants that thread is stuck on. **Session B** is the real reverse-engineering
plan: it classifies every constant by what in the game responds to it, then
attacks them in that order. Do A first — it is short and B inherits its numbers
— but B is the one that answers "is our system right."

Roughly **four hours standing still** covers Phases 1–4 of Session B. The
driving work is the last 20% of the value, not the first.

---

# Where we are — updated 2026-08-12

**Measuring has started.** Three fixtures exist in `tests/data/`, all on the
GR86. This section is maintained so the file never shows a step as pending that
is already done; if it disagrees with `tests/data/`, the fixtures win.

| what | result | what it changed |
|---|---|---|
| **Axis maximum, read cold** | **157** on the app's tune, **159** on the game's default, same parts | E2's mechanism found — the axis moves with the **tune**, not only with parts. Not yet attributed to *which* part of the tune |
| **The fit** | **4.57** (July's other build: 4.575) | `k = 588.3`. Two very different builds agreeing to 0.1% is what makes 157 the reading that survives |
| **Axis vs final drive** | unchanged 3.50 → 4.60 | `G2` answered. The axis is not a function of the final drive |
| **Panel repeat variance** | six identical reads bar one 0.1 ft blip | `S0` created as a standing control. Small differences are **real** — the 0.4 mph top-speed wobble is signal |
| **`SPREAD[7]`** | **wrong** — game default is 4.17/2.89/2.17/1.66/1.32/1.07/0.85 at fd 3.63 | Demoted tier 1 → tier 4. The old "confirmation" was the app's own ratios read back off a car they were applied to |
| **Default vs app tune** | both now exist on one build | the `C1` control row, better than the plan asked for |

Still open and now urgent: **which part of the tune moves the axis**, and
**`SPREAD` for every gear count** — the one row believed measured turned out to
be ours.

---

# The plan — do these in this order

Each step says what to do, what comes back, and why it goes where it does.
Steps 1 and 2 are the current sitting.

### Step 1 — Capture the default tune, before anything perturbs it *(5 min)*

Eight whole-screen screenshots on the build as it stands: **Tires, Alignment,
Antiroll Bars, Springs, Damping, Aero, Brake, Differential.** Gearing is
already captured.

Why first: step 2 deliberately changes this tune, and right now it is pristine.
It also lands the `C1` control — the game's own baseline for every slider on a
known build, which is what the app's output finally gets compared against.

### Step 2 — Attribute the axis shift *(5 min, two readings)*

From the default tune, one variable each, returning to default in between:

1. change **only 7th gear's ratio** (0.85 → 0.75 will do), read the axis
2. restore it, change **only the rear wing**, read the axis

This closes E2 by measurement rather than by argument. **It also decides
whether a stock GR86 is worth buying:** if either reading moves the axis, the
mechanism is the tune and a stock car adds nothing; if *neither* moves it, the
mechanism is parts and a second part state becomes the next thing to get.

### Step 3 — `SPREAD` for every gear count *(~20 min)*

Now the highest-value gearing work, because the table is known wrong rather
than merely unconfirmed. Details in Session A step 2 below.

### Step 4 — The screening pass on the candidate cars *(~35 min)*

The rig for everything after gearing. Block and rules are in `TESTS.md`.

### Step 5 — Mechanical Balance, the five discriminating readings

Session B Phase 1 below. The platform car, not the GR86.

**`TESTS.md` is the master catalogue** — every case across every subsystem,
including the slider-range and parts groups that sit upstream of both sessions
here, the photo protocol, and the fine-tune phase that closes the loop. These
sheets are the fill-in working pages for the sessions in flight; that file is
the full list and the suggested order.

---

# Session A — gearing first

Read-and-type sheet for the first measurement session. Everything here is
**no driving**: tuning-menu gearing graph and the Performance panel only, both
deterministic, both about a second per reading.

**How readings actually arrive:** Boston reads them off the screen and sends
them, with screenshots, in the session. The fixture in `tests/data/` is written
from those, and `node tests/run.js` and `node tests/status.js` are run against
the result. The blanks below are the shape of what to read, not a form to fill.

Method rules that matter today (full list in `TESTS.md`):

- **One variable per observation.** If two moved, the row is discarded.
- **Photograph digits freely; never take a position off a photo.** Slider
  values, panel figures, axis labels — a screenshot is as good as typing. But
  where a *line lands on the chart* gets read on the real screen and typed,
  because that judgement off a compressed image is exactly the 3.73 error.
- **Record what the screen said, not what it means.**
- **Nothing may say `SIMULATING…`** when a figure is read — it is still
  recomputing and the number is stale.
- **Open a panel session with `S0`**, the repeat check, and use *that
  session's* spread as its noise floor.

---

## Step 1 — The axis maximum ✅ DONE 2026-08-12

Read cold on the 2022 GR86, A 700, before the candidates were looked at.

```
axis maximum = 157 mph   (app's tune)      fit = 4.57      k = 588.3
             = 159 mph   (game's default tune, SAME PARTS)
```

**Both old readings were real.** The 157-versus-159 disagreement was never a
misreading — the axis moves with the **tune**, and nobody had recorded which
tune was loaded. That is E2's mechanism, found.

What each part of the sitting settled:

- **The fit came back 4.57**, against 4.575 on July's completely different
  build — AWD instead of RWD, 472 lb lighter, 60 hp down. `k = 588.3` versus
  July's 589.0 at axis 157, **0.1% apart**. At axis 159 July's k would be
  596.5, 1.4% away. That is what makes 157 the reading that survives *for a
  given tune*.
- **The axis does not move with the final drive** — held at 157 from 3.50 to
  4.60. `G2` answered.
- **It does move with the tune** — 157 → 159 on the default, parts untouched.
  Which *part* of the tune is step 2 of the plan.
- **The axis prints a midpoint label** (78, then 79 on default) at half the
  maximum, so it is linear and evenly divided — an assumption every gear-speed
  calculation makes and nothing had checked.

Fixtures: `gearing-gr86-2026-08-12.json` and
`gearing-gr86-defaulttune-2026-08-12.json`.

<details>
<summary>What the two candidates were, and why the argument was inconclusive (kept for the reasoning)</summary>

157 (used by `sweep.test.js`) and 159 (used by `gearing.test.js`). **They are
not symmetric — each was contradicted by a different independent
measurement:**

| candidate | what fails | by how much |
|---|---|---|
| 157 | 5th at fd 3.73 predicts 143.55 against a **145.4 Performance-panel readout** | 1.85 mph |
| 159 | 2nd at fd 4.82 predicts 60.4 against **59 read off the chart** | 1.4 mph, 2.4% |

The pre-measurement reasoning preferred 159, because 145.4 is a digit readout
while 59 was a gear endpoint eyeballed off a chart. **That reasoning was sound
and still reached the wrong shape of answer**, because it assumed one of the
two had to be a mistake. Neither was. Worth keeping as the example: a tidy
argument between two options is worthless when the real answer is "it depends
on something nobody recorded."
</details>
  ```
---

## Step 2 — `SPREAD` for every gear count (~20 min) — the urgent one now

**`SPREAD[7]` is wrong, and it was the row we thought was solid.** Measured
2026-08-12: with the game's default tune restored on this race-transmission
GR86, the actual defaults are **4.17 / 2.89 / 2.17 / 1.66 / 1.32 / 1.07 / 0.85
at final drive 3.63** — wider at every gear than the table claims.

The old "confirmation" was the app's own ratio set read back off a car it had
been applied to. The numbers matched exactly because they were the same
numbers. So every row in this table is now unconfirmed, and the 7-speed row is
worse than unconfirmed — it is known false.

Fit a **race transmission**, restore the **default tune** (this is the step
that was missing before — an applied tune hides the answer), and copy the
ratios straight off the screen. Transcription, no interpretation.

| gears | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | fd | car used |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 4 | | | | | | | | | | | | |
| 5 | | | | | | | | | | | | |
| 6 | | | | | | | | | | | | |
| 7 | 4.17 | 2.89 | 2.17 | 1.66 | 1.32 | 1.07 | 0.85 | — | — | — | 3.63 | GR86 ✓ |
| 8 | | | | | | | | | | | | |
| 9 | | | | | | | | | | | | |
| 10 | | | | | | | | | | | | |

**The open question this table cannot answer on its own:** whether the default
ratios are a property of the *transmission tier* or of the *car*. If a second
7-speed race box on a different car shows something other than 4.17…0.85, then
there is no universal table to fill in and `SPREAD` has to become either a
per-car reading or an admitted approximation the app declares. **So take one
extra 7-speed from a different car before filling in the other rows** — it
decides whether the rest of the table is worth measuring at all.

Note the app also *emits* ratios (`ratioSet()`), and if those are applied the
car really does have `SPREAD`'s gearing and everything downstream is
self-consistent. The defect is that the app never says which world it is in.

---

## Step 3 — The speed constant on a second car (~15 min) — A4

`k = axisMax × fit × topRatio` holds on the GR86 within 1.5% across all seven
gears. It is pure kinematics so it *should* generalise — but "should" is how
tier-4 constants are born.

Pick a car with a different gear count and weight class from the GR86 (the
backlog's R3 heavy AWD or R5 high-power RWD slots are ideal).

```
car ______________________  class ____  gears ____

axis maximum        = ________ mph
fit (final drive at which top gear's line just touches the right edge) = ________

then set some other final drive and read three gear endpoints off the chart:
final drive set = ________
gear __ = ________    gear __ = ________    gear __ = ________
```

Check: each endpoint should match `k / (FD × G)` where `k = axis × fit × topRatio`
for that car's ratio set. Within ~2% is a pass.

---

## When you come back

1. The numbers land in `tests/data/` — one file per car **per tune state** per
   session, named `<topic>-<car>-<yyyy-mm-dd>.json`. One `varied` key per file;
   if two things moved it is two files or it is nothing.

   **Per tune state is not pedantry, it is the E2 lesson.** The same car on the
   same screen gave 157 and 159 because two different tunes were loaded and
   neither reading recorded which. A fixture whose header cannot tell you what
   was on the car is not a measurement.
2. Run `node tests/run.js` and `node tests/status.js`. Expect failures — that
   is the fixture doing its job. A green suite after new measurements means the
   measurements were not wired to anything.
3. Only then does `compute()` change, with the date and the car in the comment
   above the constant.

Two cars minimum before a constant is treated as general. One car gives you
that car's fit — the lesson `vFrac` taught twice, and `SPREAD` taught a third
time by being "confirmed" against a single screen showing our own numbers.

---

# Session B — reverse-engineering the tuning system

## The idea that shapes everything below

Every constant in `compute()` falls into one of four classes, defined by
**what in the game responds when you move it**. That classification, not car
choice, is what decides how a constant gets tested and how expensive it is.

| class | what responds | constants in it | cost |
|---|---|---|---|
| **A — solvable** | a live readout that changes with the tune | ARBs, springs¹, ride height¹, aero (via Mechanical / Aero Balance) | minutes, no driving |
| **B — objective** | Performance panel figures | gearing, brakes, aero drag, diff accel², pressures² | minutes, no driving |
| **C — telemetry** | per-corner tire data | pressures, camber, diff lock | ~30 min each, driving |
| **D — lap times only** | nothing measurable | damping, touge/sprint split, loose-surface `vFrac` | hours, best-of-5 |

¹ conditional — see Phase 1 step 0, which decides it.  ² weakly.

**Class A is not calibration, it is algebra.** Mechanical Balance is a number
the game prints that responds to the sliders. So we do not need statistics or
lap times for those — we move an input, read the output, and solve the
function. Once solved, the app can *compute* the ARB pair that lands on any
target instead of approximating it with FH4-era multipliers.

That reframes the whole exercise. The job is not "tune some cars and see." It
is: **push every constant as far up that table as it will go, then spend the
expensive driving time only on what is genuinely stuck in class D.**

## Why the car list is short, and mostly one car

The dependency list, read straight out of `compute()`:

| output | depends on | does NOT depend on |
|---|---|---|
| springs | PI, weight, front %, aero fitted, discipline | power, torque, drivetrain, tires |
| damping | front %, discipline, weight (mild) | PI, power, tires |
| **ARBs** | **weight, front %, discipline** | **PI, power, torque, tires, aero** |
| pressures | tire compound, weight, drivetrain | PI, front %, power |
| alignment | discipline, front % | everything else |
| brakes | **tire width delta only** | everything else |
| diff | torque, weight, drivetrain, discipline | PI, front %, tires |
| gearing | gear count, fit, graph max, discipline | weight, power, front % |

Two things fall out that make this far cheaper than four cars × seven
disciplines:

**1. ARBs ignore PI and power entirely.** So while testing ARBs you may change
parts freely — PI drift is irrelevant to that formula. The only things that
matter are weight and front %, and within one car those barely move.

**2. Between-car comparisons are the *worst* instrument, not the best.** Two
different cars differ on weight, front %, drivetrain, gear count and power at
once. One car reconfigured differs on one or two. So the default is **one car,
many configurations**, and other cars enter only where a factor cannot be moved
within a car — which is essentially just weight and front %.

Nothing in Forza is perfectly clean, because PI moves with every part. But PI
only enters the **spring** formula, so for six of the eight outputs above, PI
drift costs nothing.

## Choosing the platform car

One car carries most of the work. It wants:

- **The widest upgrade tree** — engine swap, drivetrain swap, aspiration
  options, several transmissions. Each swap is a factor you can move without
  changing cars.
- **A wide usable PI range** — ideally buildable from D to S1/S2, so the spring
  frequency curve can be swept across classes on one chassis.
- **A middling stat block**, near 3,000 lb and near 55% front, so it sits at the
  centre of the formulas rather than at an edge where a clamp might hide a
  defect. Note `ab = 33 + (W−3000)×0.004` pivots exactly on 3,000 lb, and the
  damping `wNudge` pivots there too — a platform car near 3,000 lb makes the
  weight term ≈ 1 and takes it out of the algebra while the other terms are
  being solved.
- **Not the GR86** for this role. It is the gearing reference and should stay
  untouched as a control, so Session A's fixtures keep meaning what they say.

Shortlist candidates by stock weight, front % and upgrade options. **Kudosprime
is fine for this** — CLAUDE.md rejects it as a source of *tune inputs* because
it is stock-only and a tune needs post-upgrade numbers, but shortlisting cars
by their stock stats is exactly what stock data is good for. Confirm the real
figures on the upgrade screen before entering anything.

Then a **satellite set** of 4–6 cars, chosen not to be interesting but to be
**extreme and matched**:

| slot | wants | isolates |
|---|---|---|
| W-low | ~2,200 lb, front % near the platform car | the weight term in `ab`, and `wNudge` |
| W-high | ~4,600 lb, front % near the platform car | same, other end — this is where damping pinned at 19.2 before |
| F-low | front % ≤ 45, weight near the platform car | every axle-share formula from the rear-biased side |
| F-high | front % ≥ 62, weight near the platform car | the FWD-ish end of the same |
| G-long | 9 or 10 gears | `SPREAD` at the long end |
| DT | same chassis as the platform car, drivetrain swapped | drivetrain, at near-constant everything |

The point of "weight near the platform car" is that a pair differing on one
factor is worth more than six cars differing on all of them. Pairs, not
variety.

---

## Phase 1 — Solve Mechanical Balance (no driving, ~45 min)

The highest-value session available, and it is not a calibration — it is a
**solve**. MB is a number the game prints that responds to the sliders, so the
function can be recovered exactly. Once it is, the app computes the ARB pair
that lands on a target instead of approximating it with FH4-era multipliers.

### The trick that makes the whole thing easy

Every plausible model has the form `MB = F / (F + R)`. Invert it:

```
r  =  MB / (1 - MB)  =  F / R
```

and the balance becomes a plain front-to-rear ratio. Ratios linearise: if the
slider is linear in roll rate then `r` is linear in the slider pair, and the
model shows up as a straight line instead of an S-curve. **Never fit MB
directly — fit `r`.** `tests/fit-balance.js` does this for you.

### The candidate models, stated before any data is taken

Writing these down first is what makes the sweep a test rather than a
curve-drawing exercise. They are nested, so the simplest one that survives wins.

| id | model | says |
|---|---|---|
| **M1** | `r = arF / arR` | bars only, slider linear in rate, axles symmetric |
| **M2** | `r = (arF+k) / (arR+k)` | as M1 but the bar has a base rate at slider 0 |
| **M3** | `r = (arF/arR)^p` | slider is non-linear in rate |
| **M4** | `r = (arF + c·spF) / (arR + c·spR)` | springs contribute roll stiffness too |
| **M5** | `r = (arF + k + c·spF) / (arR + k + c·spR)` | both |

## ✅ SOLVED 2026-08-12 — and the list above was the right shape upside down

MB is the **rear** axle's share, not the front's. Every model in that table is
written `F/(F+R)`; stiffening the rear bar *raises* the readout and stiffening
the front spring *lowers* it. The solved form, on the GR86:

```
MB = R / (F + R)      F = arF + 0.150·spF + 50.5      R = arR + 0.150·spR + 72.3
```

Bars in slider points, springs in lb/in. **Six settings, three free parameters,
every row landing on the printed digit** — plus two rows it was not fitted to,
one of them exact and the other one rounding step out.

- **One bar point ≈ 6.7 lb/in of spring.** Across their full ranges the two
  have comparable authority, which is why no bars-only or springs-only model
  could ever have fitted.
- **The axle constants are large and rear-biased** — together about 40% of the
  total. They are the tires, geometry and unsprung mass, and they are why tire
  pressure moves MB.

The same-ratio pair is what proved the additive terms real: `20/40` reads 0.54
and `32.5/65` reads 0.56, same ratio, different readout. (The bar slider maxes
at **65**, so the original `40/80` was unreachable.)

**The coefficients are this car's and will not transfer** — they encode its
tires, geometry and weight distribution. What transfers is the shape, and a
two-reading calibration that needs no constants at all: read MB, add 10 to the
rear bar, read again, and scale the difference to the distance to target. On
this car that is ≈0.028 per 10 points of rear bar.

Not on the list, and worth watching the residuals for: track width and roll
centre. Neither is a tuning slider, so both would show up as a **per-car
constant** — a car whose residuals are all offset one way is the signature.

### The five readings that do most of the work

Ordered by discriminating power, not convenience. If there are only ten
minutes, do these five and stop — they choose the model, and everything after
refines it.

| # | set | hold | what it decides |
|---|---|---|---|
| 1 | `arF` 30, `arR` 30 | springs, ride height at the app's values | **Symmetry.** Is MB exactly 0.500? If yes, nothing but the bars is moving it. If not, springs, track or an axle asymmetry is in there — and every model without a car term is already in trouble. |
| 2 | `arF` 20, `arR` 40 | as above | **Same-ratio pair (a).** |
| 3 | `arF` 40, `arR` 80 | as above | **Same-ratio pair (b).** Identical F:R at double the magnitude. Equal readouts ⇒ pure ratio, M1 survives and M2/M4/M5 die. Different ⇒ there is an additive term and M1 is dead. Two readings that split the model space in half. |
| 4 | `spF` −30% | bars at 30/30 | **Do springs enter?** |
| 5 | `spF` +30% | bars at 30/30 | If MB moves across 4–5, springs are class A and solvable. If it does not, springs have **no readout anywhere in the game** and drop to lap-times-only — which is worth knowing before designing an hour of spring sweeps. |

Rows 6–7 (ride height at fixed bars) test the roll-centre question and cost two
more readings.

### Then the shape, and then the car

Rows 8–15: sweep `arF` = 1, 15, 45, 65 at `arR` = 30, then `arR` = 1, 15, 45,
65 at `arF` = 30. Fifteen rows total on the platform car. The two sweeps
together also answer whether the rear term is the mirror of the front or has
its own gain.

Then **rows 1–3 only, on three more cars** — W-low, W-high, F-low. Nine
readings. This is the step that turns a curve fitted to one car into a function
of the car, and it is where a track-width or weight-distribution term would
finally show itself.

### Doing it

Copy `tests/data/balance-TEMPLATE.json` to
`tests/data/balance-<car>-<date>.json`. The row plan above is already in it
with the purpose of each row written on the row. Fill in `mb` as you read, then:

```
node tests/fit-balance.js tests/data/balance-<car>-<date>.json
```

It reports every candidate's fit, applies Occam properly (among models
statistically indistinguishable from the best, it prefers the fewest
parameters), names which models the data has **ruled out**, and prints the
discriminating checks by name. Run it after five rows — if it says *"nothing
ruled out yet, the sweep is not discriminating"*, that is the sweep telling you
which reading is missing.

**Record every digit the game prints.** The same-ratio pair is decided by
differences of a few thousandths; rounding to two decimals throws away exactly
the discrimination it exists to provide.

### What this does NOT settle

Whether **0.55–0.65 is the right target**. Solving MB tells you how to hit any
band precisely; it says nothing about which band is fast. That is a class-D
driving question — but solving the function first makes it a one-variable test
instead of a two-variable one, which is the whole reason to do it in this
order.

---

## Phase 2 — Solve Aero Balance (no driving, ~25 min)

Same method, same solver (`readout: "ab"`, sliders `aeF`/`aeR`), but the
interesting readings are different because aero has a floor the bars do not.

**Expect AB at 50/50 not to be 0.5.** The bodyshell makes downforce the wings
do not, so the symmetric-slider reading is a measurement of the car's own
balance rather than a check on symmetry. That is the useful part, not a
problem.

The two readings that matter most here are the **floor and ceiling**:

| # | set | what it decides |
|---|---|---|
| 4 | `aeF` 0, `aeR` 0 | the bodyshell's own aero balance, with the wings contributing nothing |
| 5 | `aeF` 100, `aeR` 100 | the other end |

Together they **bracket every AB the car can produce**. This is the reachability
check, and it is the failure mode worth catching: the app prints the 0.42–0.48
target on every build with aero fitted, and on a car whose bracket does not
contain that range the target is unreachable — the user would chase it to the
end of a slider and never arrive. If that happens on even one car, the app
needs to say so rather than print the band.

Then the same-ratio pair (25/50 vs 50/100), an `aeF` sweep at `aeR` = 50, and
two rake rows (ride height min/max at wings 50/50) to test whether AB moves
with attitude or only with the wings.

Also worth one row: AB with **only one end fitted**. The app gates aero values
when a wing is missing, but if AB is still printed and still off-target with no
front wing, that is a case where the readout is real and the tune cannot reach
it — which is a note the card should carry.

---

## Phase 3 — What the Performance panel can settle (no driving, ~90 min)

Six figures per configuration, deterministic, about a second each: 0-60, 0-100,
top speed, 60-0, 100-0, lateral G.

### 3a — Brakes, fully objectively (~15 min)

The cleanest experiment in the whole plan, because brake balance depends on
**nothing but the tire-width delta** and the panel measures braking directly.

Platform car, 5 balance points × 3 pressure points = 15 readings. The optimum
is read straight off 60-0 and 100-0. This confirms or kills
brake-bias-per-width-step (currently 1.5% per step, no source at all).

Caveat to record with the result: the panel's braking figures are straight-line
only. They cannot see trail-braking stability, which is what balance actually
trades against — so this sets the floor and the `entry_us`/`entry_os` fix path
still owns the rest.

### 3b — Discipline signatures (~45 min)

Parts fixed, only the tune changes, so this costs no shopping. Per car: the
game's default tune as a control, then the app's tune for each tarmac
discipline.

**Tarmac only.** Dirt and cross-country tunes measured on the panel just look
worse, because the panel is not testing them on dirt. That is the wrong
instrument, not a finding.

| tune | 0-60 | 0-100 | top speed | 60-0 | 100-0 | lateral G |
|---|---|---|---|---|---|---|
| game default (control) | | | | | | |
| app — Road | | | | | | |
| app — Sprint | | | | | | |
| app — Touge | | | | | | |
| app — Drag | | | | | | |

Run on the platform car plus W-high and F-low — three cars, 15 configurations.

**Write the expected ordering down before reading.** Drag should win 0-60 and
top speed and lose lateral G and braking; touge the reverse; road best braking;
sprint between road and drag. Drag is the most distinctive tune the app
produces, so if it does not separate cleanly the discipline constants are not
doing their job.

**The finding that matters most:** if the game's default tune beats the app
outright in any column, across more than one car, that column's formulas are
wrong. That is worth more than every ordering above.

### 3c — Diff accel lock (~30 min)

Panel 0-60 responds to launch, so accel lock can be swept objectively on an
RWD and an AWD configuration: 5 lock settings each. Weaker than the telemetry
version (Phase 5) but free, and it brackets the useful range before spending
driving time.

---

## Phase 4 — Cross-car generalisation (no driving, ~30 min)

Not a sweep — a check. Enter 10–12 varied cars, one build each, and confirm the
Phase 1–3 conclusions still hold. Two cars minimum before a constant is treated
as general is the standing rule; this is what makes the constants general rather
than the platform car's.

This is also where the **satellite pairs** pay off: W-low against W-high with
front % matched isolates the weight term in `ab = 33 + (W−3000)×0.004`
directly, which is otherwise buried.

---

## Phase 5 — The driving sessions, in value order (hours)

Only what genuinely cannot be read standing still.

1. **Tire pressure against tire temperature** (~30 min per compound). Telemetry
   reports per-corner temperature, so the target is directly observable: fixed
   route, 3 laps at each of 5 pressures per axle, steady-state temp at lap end.
   Sport and race slick first; dirt compounds last, the surface dominates.
2. **Camber against inner/outer contact-patch temperature** (~30 min). Sweep 5
   points per axle, find where inner and outer converge. This also gives the
   `out_f`/`in_f` fix deltas a real slope instead of a flat 0.3°.
3. **Diff lock via per-wheel speed** (~40 min). Fixed corner exit, 5 lock
   settings, watch where the inner/outer driven-wheel difference collapses.
4. **The MB target band.** Now a one-variable test: the function is solved, so
   sweep MB itself across 0.50–0.70 and drive it.
5. **Loose-surface `vFrac`.** Fixed route, best-of-5, all five recorded,
   anything inside the spread of those five is no result.

---

## Sequencing and budget

| phase | driving | rough time | converts |
|---|---|---|---|
| A (gearing) | no | 40 min | the axis, `SPREAD`, the speed constant |
| 1 (MB) | no | 45 min | ARBs: tier 4 → solved function |
| 2 (AB) | no | 25 min | aero balance: house band → reachability check |
| 3 (panel) | no | 90 min | brakes, discipline signatures, diff bracket |
| 4 (cross-car) | no | 30 min | one car's fit → general |
| 5 (driving) | yes | hours | pressures, camber, diff, MB target, loose `vFrac` |

**Roughly four hours standing still buys most of it.** That is the headline:
the expensive driving work is the last 20% of the value, not the first.

## Rules that keep the data worth having

- **One variable per observation.** If two things moved, the row is discarded,
  not interpreted.
- **Type the number, never photograph it.** The 3.73 disaster came from
  measuring gear-line spacing off a phone photo at an angle.
- **Record raw readings, never conclusions.** The interpretation lives in the
  analysis, where it can be revised without re-driving anything.
- **Predictions before readings** wherever an ordering is expected.
- **Every session ends with a committed fixture**, even one that changes
  nothing. Confirming a constant is worth as much as overturning it, and worth
  nothing if it is not written down.
- **Promotion order, no exceptions:** fixture file with provenance → a test
  asserting it independently of `compute()` → only then `compute()` changes,
  with the date and the car in the comment above the constant.
- **Two cars minimum** before a constant is treated as general.

## Filing

`tests/data/<topic>-<car>-<yyyy-mm-dd>.json`, schema as the GR86 gearing
fixture. One `varied` key per file. Then one test file per topic asserting the
fixture — `mb.test.js`, `brakes.test.js`, `disc.test.js` — each able to fail if
the formula moves. A green suite after new measurements means the measurements
were not wired to anything.
