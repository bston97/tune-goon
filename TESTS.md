# Test case catalogue — unravelling FH6

The complete list of what has to be measured to stop guessing. Every case is
self-contained: what it answers, what to set, what to hold, what to read, what
each possible answer would mean.

`MEASURE.md` holds the fill-in working sheets for the sessions in flight.
This file is the master list. `BACKLOG.md` A–G is the surrounding plan.

---

## The car question, answered

**A fixed core of three cars, each tuned to every discipline.** Not different
cars for different disciplines.

The reason is not tidiness. Discipline effects and car effects are
*confounded* the moment a discipline only ever appears on one car — and no
amount of later data separates them, because the comparison was never made.
If the drift tune only ever ran on a 350Z and the dirt tune only on an Evo,
"drift is softer" and "the 350Z is lighter" are the same observation forever.
Measuring every discipline **within** each car is what makes the discipline
constants attributable at all.

| slot | wants | role |
|---|---|---|
| **CORE-1 platform** | ~3,000 lb, ~55% front, wide upgrade tree, buildable D→S1 | carries every deep sweep. 3,000 lb because `ab = 33 + (W−3000)×0.004` and the damping `wNudge` both pivot exactly there, so the weight term ≈ 1 and drops out of the algebra while the rest is being solved |
| **CORE-2 light** | ~2,400–2,700 lb, RWD | the low end of every weight term |
| **CORE-3 heavy** | ~4,300 lb+, 8+ gears | the high end, and the long-gearbox case. This is where damping pinned at 19.2 of 20 before |
| SAT-F-low | front % ≤ 45, weight near CORE-1 | axle-share formulas from the rear-biased side |
| SAT-F-high | front % ≥ 62, FWD | the other side, plus the FWD diff band |
| SAT-DT | CORE-1's chassis, drivetrain swapped | drivetrain at near-constant everything else |
| SAT-G | 9 or 10 gears | `SPREAD` at the long end |

**Not the GR86 as platform.** It is the gearing reference and stays untouched
as a control so Session A's fixtures keep meaning what they say.

Satellites appear in individual cases only. The three-car core is what carries
the discipline work.

## What actually decides the platform car

Not the stat block. **How many configurations it reaches without becoming a
different car** — because the whole design is one car reconfigured, and two
different cars differ on weight, front %, drivetrain, gear count and power at
once. Five requirements, in the order that a failure costs the most:

1. **Both aero ends available.** Plenty of cars offer a rear wing only. Phase 2
   and case A3 are unrunnable on one of those, and it is the kind of thing
   discovered an hour in rather than at the dealership.
2. **Drivetrain swap available.** That makes SAT-DT the same car with one part
   changed rather than a seventh car with six differences.
3. **Engine swap and aspiration options, buildable D→S1**, so the spring
   frequency curve can be swept across classes on one chassis.
4. **Near 3,000 lb and near 55% front** — the pivot, as above.
5. **RWD.** No centre-diff slider in the way while MB is being solved, and the
   swap then goes outward from there rather than inward.

## The roster — agreed 2026-08-12, none of it confirmed in game yet

Shortlisted on FH5-era figures, which is what stock data is good for. **Every
number below is a candidate to check, not data**; weight and front % get read
off the upgrade screen before anything is entered.

| slot | first pick | alternates |
|---|---|---|
| CORE-1 | **2003 Nissan 350Z** ~3,190 lb, ~53% F | 1999 Silvia S15 Spec-R (2,755/55) · 2002 RX-7 Spirit R (2,870/50) |
| CORE-2 | **2016 Mazda MX-5** ~2,340 lb | 1985 AE86 · 2004 Honda S2000 (2,800) |
| CORE-3 | **2015 Challenger SRT Hellcat** ~4,500 lb, 8-spd RWD | 2020 Audi RS 6 Avant · Bentley Continental GT |
| SAT-F-low | **Porsche 911 GT3** ~39% F, ~3,150 lb | 1995 Toyota MR2 (43%) |
| SAT-F-high | **2018 Civic Type R (FK8)** ~3,100 lb, ~62% F | 2015 Golf GTI · Mini Cooper S |
| SAT-DT | CORE-1 with the drivetrain swapped | — |
| SAT-G | **2018 Mustang GT** (10-spd) | 2017 Camaro ZL1 (10-spd) |

Three notes that come out of the roster rather than the slots:

- **CORE-3 doubles as the old R5 slot** — heavy, 8-speed, RWD and high-power at
  once, which gets the long gearbox without adding AWD as a confound.
- **The 911 and the Civic are a matched pair**, ~39% and ~62% front at weights
  either side of CORE-1. Front % bracketed from both ends at near-constant
  weight is worth more than either car alone.
- **No Evo as CORE-1.** All seven Mitsubishis in `G6` are AWD turbos near 60%
  front, so they cluster in one corner and bring a centre diff into every row
  while MB is being solved. They are the right cars for **D3** — the AWD centre
  split, whose neutral base moved 55 → 60 on ForzaTune's band without ever
  being measured — and for the dirt and cross-country work.

**G4 needs its own list.** With a race box fitted the gear count is a property
of the car, so `SPREAD[4]` and `[5]` mean old muscle and 90s cars while `[8]`,
`[9]` and `[10]` mean modern ones. That case is transcription only — no tuning,
nothing owned, borrowed or rented cars are fine.

## Screening pass — 5 minutes per candidate, before any measurement

The roster is a shortlist. This is what turns it into the rig, and it is the
next physical action. Per candidate, in the dealership or the garage, no
driving:

```
car ____________________  slot ____   owned? ____

stock weight ______ lb    front % ______    PI ______   drivetrain ______
front aero available?  ____     rear aero available?  ____
race ARBs, both ends?  ____     drivetrain swap?      ____
engine swap options?   ____     lowest / highest class buildable ____ / ____
gear count with a race transmission fitted: ______
```

The aero line is the one that disqualifies. Anything missing a front wing
cannot be CORE-1 whatever its stat block says, because Phase 2 and A3 both
need the pair. Record the whole block even for a car that fails — a rejected
candidate with its reason written down is what stops it being re-proposed.

---

## Photo protocol

Photos are welcome, with one hard rule drawn from how the 3.73 disaster
happened:

- **Photograph numbers — always fine.** A digit is legible or it is not, and
  there is no interpretation in between. Slider values, Performance panel
  figures, Mechanical Balance, part lists, stat blocks: photograph freely, as
  many as needed.
- **Never measure geometry from a photo.** The 3.73 error came from measuring
  gear-line *spacing* off a phone picture taken at an angle; perspective
  distortion ate the difference between the right model and the wrong one. If a
  case needs a position on a chart, read it off the screen and type the number.

One photo per configuration is enough if the numbers are legible. Say which
case ID it belongs to.

---

# Group R — Slider ranges

**Why this is first.** The app emits spring rates as absolute lb/in and tells
the user *"type them straight in, the game clamps to the car's range if it's
narrower"* (`index.html:1379`, `:2183`). It never checks whether the clamp
fired. If it does fire — and worse, if it fires on one axle and not the other —
then the F/R ratio the whole spring model rests on is silently destroyed and
the tune is not the tune the app printed. Nobody has ever checked this. It is
minutes to settle and it sits upstream of Phase 1.

### R1 — Do the app's spring rates fit inside the car's slider range?
*(5 min per car, no driving)*
- **Set:** nothing. Build each core car, run the app, note the spring rates it
  emits for a road tune.
- **Read:** the spring slider's own minimum and maximum, front and rear, off
  the tuning menu.
- **Photo:** the spring section showing both sliders at their extremes.
- **Means:** if the app's value sits outside the range on any core car, the
  spring formula is decorative on that car. If it lands outside on **one axle
  only**, that is worse than it sounds — the ratio is what carries the balance,
  so an asymmetric clamp changes the car's handling in a direction the app does
  not know about and cannot warn about.

### R2 — Is the spring range a property of the car, the parts, or both?
*(10 min)*
- **Vary:** suspension tier — street → sport → race — on CORE-1.
- **Read:** spring slider min and max at each tier.
- **Means:** if race springs widen the range, then "fit race springs" is not
  only a gating question and the build plan should say what it buys you
  numerically. If the range is fixed by the car, the app can be taught each
  car's range only by measuring every car — which is not viable, so it would
  have to warn instead.

### R3 — Are the other sliders' ranges universal?
*(10 min, one car, then spot-check a second)*
- **Read:** min and max for ARB, damping (bump/rebound), camber, toe, caster,
  brake balance, brake pressure, diff lock, ride height.
- **Means:** `VMETA` (`index.html:540`) assumes fixed limits for all of them —
  ARB 1–65, damping 1–20, camber −10…+2, brake balance 30–70, pressure 50–150.
  Each one that turns out to be car-specific is a place the app can emit an
  impossible value. Spot-check the same list on CORE-3 (heavy): if any differ,
  the assumption is dead generally, not just for that slider.

### R4 — Does ride height range depend on the car?
*(5 min)*
- The app already treats ride height as **% of range** rather than absolute, so
  it is immune to this — but confirm the slider really is a bounded position and
  that 0% means minimum on every car.

### R5 — What happens at the boundary?
*(5 min)*
- **Set:** a spring rate below the minimum and above the maximum.
- **Means:** confirms whether the game clamps silently, refuses, or rounds.
  Decides whether the app should warn ("this will be clamped") or hard-fail.

---

# Group P — Parts: what actually changes

### P1 — The gating matrix *(20 min, no driving)* — settles BACKLOG A1 and E4
- **Procedure:** fit each part tier, open the tuning menu, write down exactly
  which sliders exist.
- **Cover:** suspension stock/street/sport/race (+rally, off-road); ARBs
  stock/street/sport/race and front-only/rear-only if separately purchasable;
  diff stock/street/sport/race/drift/rally/off-road; transmission
  stock/street/sport/race; both aero ends fitted and not.
- **Photo:** the tuning menu at each tier — this is the case where photos are
  most useful, since it is a list of what is present.
- **Two claims most likely wrong:** street/sport suspension = spring rate and
  ride height but **no** damping or alignment (`index.html:1217` nulls camber,
  toe and *caster* too — caster being a suspension-tier unlock is the least
  obvious part); and street/sport diff = acceleration only, **no** decel.
- **Also note:** the form only offers stock/sport/race for transmission with
  Stock and Street collapsed, and offers no street/sport ARB tier at all. If
  the screen shows those tiers behaving differently, the form needs new options,
  not just a gate change.

### P2 — Does a part change the stat block? *(15 min)*
- **Vary:** one part at a time on CORE-1 — each aero end, each tire compound,
  each width step, weight reduction, each suspension tier.
- **Read:** weight, front %, PI, hp, torque after each.
- **Means:** tells us which inputs move when a part is fitted, which is what
  makes "hold everything else" achievable in every later case. Also feeds the
  build plan, which currently carries no numbers at all by design.

### P3 — What does tire compound actually buy? *(10 min)*
- **Vary:** compound, everything else held. **Read:** lateral G, 60-0, 100-0.
- **Means:** gives the `PSI` table's compounds an objective grip ordering and
  tests whether the app's compound advice per discipline matches it.

### P4 — What does tire width actually buy? *(10 min)*
- **Vary:** width front and rear independently, 0→3.
- **Read:** lateral G, 60-0, weight, PI.
- **Means:** the app moves **only brake balance** on width, via `wStep = twr −
  twf`, so 0/0 and 3/3 produce an identical tune. If width measurably changes
  grip or braking, that is a formula the app does not have.

### P5 — Does the gearing graph's axis move with power? *(5 min)*
- **Read:** axis maximum before and after a power upgrade on CORE-1.
- **Means:** settles whether the axis is a property of the car or of the build.
  If it moves with power, the two historical GR86 readings (157 and 159) may
  **both** be right and taken at different build states — which would make E2 a
  recording defect rather than a misreading.

### P6 — Do part tiers change the slider *range*, not just its presence?
- Merged with R2; noted here so the parts group is complete.

---

# Group M — Mechanical Balance

Full design, candidate models and the solver are in `MEASURE.md` Phase 1. The
case list in short:

| id | question | rows |
|---|---|---|
| M1 | Is MB exactly 0.500 at equal bars? | 1 |
| M2 | Same-ratio pair 20/40 vs 40/80 — pure ratio, or is there an additive term? | 2 |
| M3 | Do springs enter MB? (bars held, `spF` ±30%) | 2 |
| M4 | Does ride height enter MB? | 2 |
| M5 | `arF` sweep at `arR`=30 — shape of the front term | 4 |
| M6 | `arR` sweep at `arF`=30 — is the rear the mirror of the front? | 4 |
| M7 | M1–M2 repeated on CORE-2, CORE-3, SAT-F-low — does the car enter? | 9 |
| M8 | Does MB move when *nothing* is touched but the discipline preset? | 1 |

M1–M3 are five readings and they choose the model on their own. M7 is what
turns one car's curve into a function of the car, and is where a track-width
or weight-distribution term would show up as a per-car offset in the residuals.

---

# Group A — Aero Balance

Full design in `MEASURE.md` Phase 2.

| id | question | rows |
|---|---|---|
| A1 | AB at equal sliders — expected *not* 0.5, since the body makes downforce the wings do not | 1 |
| A2 | Same-ratio pair 25/50 vs 50/100 | 2 |
| A3 | **Floor and ceiling — 0/0 and 100/100** | 2 |
| A4 | `aeF` sweep at `aeR`=50 | 4 |
| A5 | Rake — ride height min/max at wings 50/50 | 2 |
| A6 | AB with only one end fitted | 1 |

**A3 is the one that matters most.** Those two readings bracket every AB the car
can produce. The app prints the 0.42–0.48 target on every build with aero
fitted; on a car whose bracket excludes that range, it is printing a goal the
user would chase to the end of a slider and never reach.

---

# Group G — Gearing

Working sheet in `MEASURE.md` Session A.

| id | question | status |
|---|---|---|
| G1 | The axis maximum, read cold | **next up** — settles E2, fixture already wired |
| G2 | Does the axis move with gearing? (should not) | with G1 |
| G3 | Does the axis move with power? | = P5 |
| G4 | `SPREAD` default ratios for 4, 5, 6, 8, 9, 10 gears | only 7 is measured; the rest look interpolated off a curve |
| G5 | `k = axis × fit × topRatio` on a second and third car | "pure kinematics so it should generalise" is how tier-4 constants are born |
| G6 | Is the fit reading repeatable? Read it, leave the menu, read again | never checked, and everything downstream rests on it |

---

# Group S — Speed, acceleration, braking

**The honest starting position.** The repo already tried to reverse-engineer the
performance figures from the GR86 sweep and concluded it could not: at final
drive 3.50 and 4.82 the engine sits at 7551 and 7516 rpm at top speed — 0.5%
apart — while the drag those speeds imply differs by 9.7%. One engine speed
cannot make 10% more power, so either the derived constants are off or Top
Speed is not a drag equilibrium.

**That is a reason to design the experiment better, not to skip it.** Six points
on one car, all varying the same input, cannot separate the variables. The
cases below vary the inputs *independently*, which the original sweep never did.

### S1 — What does the Top Speed readout actually respond to? *(20 min)*
The most important unresolved question in the app. Boston's reading is that it
is the projected maximum with the whole build aimed at top speed — but it moved
140.0 → 144.4 across the final-drive sweep, so it is not independent of the
tune either. Both cannot be true as stated.
- **Vary, one at a time, everything else held:** final drive; aero front; aero
  rear; tire compound; tire pressure; ride height; camber.
- **Read:** Top Speed after each.
- **Means:** the set of inputs it responds to *defines* what the number is. If
  it moves with aero and gearing but not camber or pressure, it is a
  drag-and-gearing projection. If it moves with nothing but gearing, Boston's
  reading is right and the sweep's variation needs another explanation.
- Everything the app says about top speed is currently withdrawn pending this.

### S2 — 0-60 factor sweep *(30 min)*
- **Vary independently:** final drive; diff accel lock; tire compound; tire
  pressure; weight (via weight reduction); power.
- **Read:** 0-60 and 0-100 after each.
- **Means:** ranks what actually drives launch, and gives the diff accel lock
  an objective optimum per drivetrain. Run on CORE-1 in both RWD and AWD form
  (SAT-DT) — launch is the case where drivetrain should dominate.

### S3 — Is 0-60 traction-limited or power-limited? *(10 min)*
- **Set:** the same car on the worst and best tire compound.
- **Means:** if 0-60 barely moves, it is power-limited and the diff/pressure
  work below is low value on that car. If it moves a lot, traction is the
  binding constraint and the whole launch group matters. Answering this first
  tells you whether S2 is worth its 30 minutes on that car.

### S4 — Brake balance and pressure against measured stopping distance *(15 min)*
- **Set:** 5 balance points × 3 pressure points on CORE-1.
- **Read:** 60-0 and 100-0.
- **Means:** the cleanest experiment in the catalogue — brake balance depends on
  nothing but `wStep`, and the panel measures braking directly. Confirms or
  kills brake-bias-per-width-step (currently 1.5% per step, no source at all).
- **Caveat to record with the result:** panel braking is straight-line only. It
  cannot see trail-braking stability, which is what balance actually trades
  against. This sets the floor; the `entry_us`/`entry_os` fix path owns the rest.

### S5 — Does lateral G respond to the tune at all? *(10 min)*
- **Vary:** ARB pair, spring rates, camber, tire pressure — one at a time.
- **Means:** decides whether lateral G is a usable proxy for grip-side tuning or
  is essentially a tire-compound readout. If it responds to camber and pressure,
  a whole group of currently class-D constants moves up to class B and becomes
  measurable without driving. **High value if it works.**

### S6 — Does weight alone move the panel figures predictably? *(10 min)*
- **Vary:** weight reduction stages only.
- **Means:** isolates the mass term that is otherwise tangled with PI in every
  other case.

---

# Group D — Differential

### D1 — Accel lock against 0-60 *(15 min)* — panel only, no driving
5 lock settings on RWD and on AWD. Brackets the useful range before spending
driving time.

### D2 — Decel lock — what is it even observable through? *(10 min)*
Panel figures almost certainly will not move. If nothing responds, decel lock
is class D and the app's RWD-low convention stays a house rule, explicitly
labelled as one.

### D3 — AWD centre split *(10 min)*
Sweep centre bias, read 0-60 and lateral G. The app's neutral base moved from
55 to 60 on ForzaTune's band without ever being measured.

---

# Group C — Discipline signatures

### C1 — The full matrix *(45 min)*
Each core car, parts fixed, tuned to each of the four tarmac disciplines plus
the game's default tune as a control. 3 cars × 5 configurations = 15 rows,
six panel figures each.

**Tarmac only.** Dirt and cross-country tunes measured on the panel just look
worse because the panel is not testing them on dirt — wrong instrument, not a
finding. Those go to Group T.

**Write the predicted ordering down before reading.** Drag should win 0-60 and
top speed and lose lateral G and braking; touge the reverse; road best braking;
sprint between road and drag.

**The finding that matters most:** if the game's *default* tune beats the app
outright in any column across more than one car, that column's formulas are
wrong. That outranks every ordering above.

### C2 — Does the discipline preset change anything the panel cannot see?
Diff the app's own output between two disciplines on one car and list which
values moved. Any value that moves but that no case in this catalogue can
measure is, by definition, currently unfalsifiable — and should be labelled
that way in `MODEL.md` rather than presented as a tuned number.

### C3 — Touge vs road, and sprint vs road, on one car
The two narrowest distinctions the app makes. If the panel cannot separate them
and neither can lap times, the honest move is to merge them or ship the
difference as documented wording rather than different numbers.

---

# Group T — Telemetry and driving

Only what genuinely cannot be read standing still. Fixed route, best-of-5, all
five runs recorded, anything inside the spread of those five is **no result**.

| id | question | time |
|---|---|---|
| T1 | Tire pressure against steady-state tire temperature, per compound | 30 min each |
| T2 | Camber against inner/middle/outer contact-patch temperature | 30 min |
| T3 | Diff lock against per-wheel speed difference on a fixed corner exit | 40 min |
| T4 | Damping — the one group with no readout anywhere. Best-of-5 lap times only | hours |
| T5 | Loose-surface `vFrac` for dirt and cross-country | hours |
| T6 | **The MB target band.** Once Phase 1 solves the function, sweep MB itself 0.50→0.70 and drive it | 1 hour |

T6 is the payoff from doing Group M first: it turns a two-variable problem
(what is MB, and what should it be) into a one-variable one.

---

# Group V — The fine-tune phase, after the numbers are reversed

This is the phase that closes the loop, and it only works once Groups R–S have
produced solved forms.

### V1 — Rebuild `compute()` on measured functions
Each solved model replaces its heuristic, one at a time, with the fixture and
its test committed first. Never two at once — a suite that goes red on a
two-constant change cannot tell you which one did it.

### V2 — Re-run the full catalogue as a regression
The same cases, same cars, after the rewrite. Every number should land where
the solved model says. Divergence means the model was fitted to noise.

### V3 — Blind test on cars never used in fitting
Three cars that appear nowhere in Groups R–S. Enter the stat block, apply the
app's tune unmodified, read the panel. This is the only case in the catalogue
that can detect overfitting, and it is the one that says whether the app is
actually foolproof or merely well-fitted to the core three.

### V4 — The fine-tune loop itself
The 23 symptom→fix mappings have never been tested at all. For each: induce the
symptom deliberately, apply the app's fix, confirm the symptom reduces. Most
need driving; a few (`lockup`, `hits the limiter early`) are panel-visible.

---

## Standing rules

- **One variable per observation.** If two things moved, the row is discarded,
  not interpreted.
- **Record raw readings, never conclusions.**
- **Predictions before readings**, wherever an ordering is expected.
- **Every session ends with a committed fixture**, even one that changes
  nothing. Confirming a constant is worth as much as overturning it.
- **Promotion order:** fixture with provenance → a test asserting it
  independently of `compute()` → only then `compute()` changes, with the date
  and the car in the comment above the constant.
- **Two cars minimum** before a constant is treated as general.
- **A green suite after new measurements means the measurements were not wired
  to anything.**

## Suggested order

R1 → P1 → G1 → M1–M3 → A3 → S1 → S3 → then the rest.

Those seven are each under fifteen minutes, and each one can invalidate work
further down the list — R1 can undermine the spring model, P1 decides what the
app is even allowed to print, G1 unblocks the gearing fixtures, M1–M3 choose
the balance model, A3 can prove a printed target unreachable, and S1 decides
what the Top Speed number means. Cheap tests that can kill expensive ones go
first.
