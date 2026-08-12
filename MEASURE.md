# Session sheets

Two sessions, different jobs. **Session A** (gearing) settles specific
constants by isolating one variable at a time. **Session B** (whole-tune
validation) tests whether the tune the app hands you is actually good, across
several cars and disciplines. Do A first — it is shorter and B inherits its
gearing numbers — but B is the one that answers "is our system right."

---

# Session A — gearing first

Read-and-type sheet for the first measurement session. Everything here is
**no driving**: tuning-menu gearing graph and the Performance panel only, both
deterministic, both about a second per reading.

Fill the blanks in this file as you go, then run `node tests/run.js`. The
fixture is wired so that filling in the axis maximum makes the suite tell you
something — see step 1.

Method rules that matter today (full list in `BACKLOG.md` A):
type the number, never photograph it; one variable per row; record what the
screen said, not what it means.

---

## Step 1 — The axis maximum, read cold (5 min) — settles E2

The single number the whole gear-speed model hangs off, via
`k = axisMax × fit × topRatio`. It was recorded twice on the same car and
screen, 1.3% apart, and nobody knows which reading was wrong.

**Read it before reading the rest of this section.** The two candidates are
below and knowing them first will anchor you.

Car: **2022 Toyota GR86, A 700, 7-speed race box**, ratios at default.
Open the tuning menu → gearing. Read the number at the right-hand end of the
bottom axis.

```
axis maximum = ________ mph
```

Write it into `tests/data/gearing-gr86-2026-07-31.json` →
`readings.axisMax`, then run `node tests/run.js`.

<details>
<summary>What the two candidates are, and what each one costs (open after reading)</summary>

157 (used by `sweep.test.js`) and 159 (used by `gearing.test.js`). Both were
dry-run against the suite on 2026-08-08. **They are not symmetric — each is
contradicted by a different independent measurement:**

| you enter | what fails | by how much |
|---|---|---|
| 157 | 5th at fd 3.73 predicts 143.55 against a **145.4 Performance-panel readout** | 1.85 mph |
| 159 | 2nd at fd 4.82 predicts 60.4 against **59 read off the chart** | 1.4 mph, 2.4% |

So neither number is simply "the typo." But the two contradictions are not
equally strong: 145.4 is a **digit readout off the Performance panel**, and 59
is a **gear endpoint eyeballed off a chart**, where ±1 mph is nothing. On that
basis 159 is better supported and the gear-2 miss is within reading error.

That is an argument, not a measurement, which is why you read the axis first.
If your cold reading says 157, the interesting question becomes whether the
145.4 was genuinely read off the screen or back-computed from 159 at the time —
because if it was back-computed it is not evidence at all.
</details>

**Also worth settling in the same sitting** (both are one reading each):

- Does the axis maximum move when the **gearing** moves? It should not — set
  fd to 3.50 and then 4.82 and re-read.
  ```
  axis at fd 3.50 = ________     axis at fd 4.82 = ________
  ```
- Does it move when **power parts** are fitted? It probably does, and if the
  two historical readings were taken at different build states then both are
  right and the real defect is that neither recorded the build.
  ```
  axis before power upgrade = ________   after = ________
  what changed: ______________________
  ```

---

## Step 2 — `SPREAD` for every gear count (~20 min) — A3

`SPREAD[7]` is the only row confirmed against the game. **4, 5, 6, 8, 9 and 10
are invented** — they look interpolated off a curve — and they feed both the
per-gear speeds and `ratioSet()`.

Fit a **race transmission** on a car with each gear count and copy the default
ratios straight off the screen. No interpretation, just transcription.

| gears | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | car used |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 4 | | | | | | | | | | | |
| 5 | | | | | | | | | | | |
| 6 | | | | | | | | | | | |
| 7 | 2.92 | 2.05 | 1.60 | 1.30 | 1.10 | 0.95 | 0.82 | — | — | — | GR86 ✓ |
| 8 | | | | | | | | | | | |
| 9 | | | | | | | | | | | |
| 10 | | | | | | | | | | | |

**Do step 1 before this.** `sweep.test.js` derives its speed constant from
`SPREAD[7]` while `gearing.test.js` used to hardcode the top ratio; both now go
through the fixture, but rewriting the table still moves every constant that
reads it. Settle the axis first so only one thing is moving.

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

1. Put the numbers in `tests/data/` — one file per car per session, named
   `<topic>-<car>-<yyyy-mm-dd>.json`, following the schema of the GR86 file
   already there. One `varied` key per file; if two things moved it is two
   files or it is nothing.
2. Run `node tests/run.js`. Expect failures — that is the fixture doing its
   job. A green suite after new measurements means the measurements were not
   wired to anything.
3. Only then does `compute()` change, with the date and the car in the comment
   above the constant.

Two cars minimum before a constant is treated as general. One car gives you
that car's fit — the lesson `vFrac` taught twice.

---

# Session B — whole-tune validation

## What this is, and why it is not just "tune 4 cars and see how it goes"

The instinct is right: nothing currently tests whether a *whole tune* is any
good. The 532 assertions check structure — in range, finite, bump ≤ rebound,
nulls handled — and `sweep.test.js` checks one constant against measured data.
Nothing checks the package.

But "tune 4 cars for each discipline and see how it goes" has two problems
worth fixing before spending the evening on it:

1. **4 cars × 7 disciplines = 28 builds**, and most of that time is *shopping*
   — buying parts and managing PI — not tuning. 
2. **The verdict would be feel**, which cannot tell you *which* part of the
   tune was wrong. Everything moved at once. That is precisely how `vFrac`
   got set to 0.95 and then 1.14: a conclusion drawn from a comparison where
   more than one thing differed.

Two changes make it cheap and diagnostic instead:

**Parts stay fixed; only the tune changes.** Switching discipline in the app
changes slider values, not the build. So one physical build per car can be
re-tuned four ways and measured four times without buying anything. That turns
28 builds into **4 builds and 20 readings**.

**The Performance panel is the verdict, not feel.** It scores a whole tune in
about a second, with no run-to-run variance: 0-60, 0-100, top speed, 60-0,
100-0, lateral G. Six objective numbers per configuration.

## What the panel can and cannot judge — read before choosing disciplines

It sees straight-line performance plus one lateral-G figure. So it validates
**gearing, brakes, aero, and pressures**; it partly sees the **diff**; and it
barely sees springs, ARBs or damping except as they move lateral G. It cannot
see balance, kerb compliance or trail-braking at all.

**And it cannot judge the loose-surface disciplines.** Dirt and cross-country
tunes measured on the panel will simply look worse than tarmac tunes, because
the panel is not testing them on dirt. That is not a finding, it is the wrong
instrument. Those need A9's best-of-5 lap protocol — expensive, do it later.

**So Session B covers the four tarmac disciplines only: Road, Sprint, Touge,
Drag.**

## The cars — pick for spread, or you test one car four times

The formulas key off weight, front %, drivetrain and gear count. Four Evos
would be four readings of the same point in that space. Suggested four, all
from the garage:

| slot | car | why |
|---|---|---|
| 1 | **GR86** | RWD, ~2,900 lb, 53% front, 7-speed. Continuity — every existing fixture is this car. |
| 2 | **A Civic** | FWD, ~2,600 lb, 62%+ front. The only way to touch the FWD diff band and the front-heavy ARB split. |
| 3 | **Lancer Evo VI TME** | AWD, ~3,200 lb, mid. Already on the G6 roster, so the build counts twice. |
| 4 | **Challenger / Charger Hellcat** | RWD, ~4,400 lb, 8-speed. Weight scaling and a long gearbox, from the heavy end. |

That spans 2,600–4,400 lb, ~53–62% front, all three drivetrains, and gear
counts 6/7/8. Substitute freely as long as the spread survives.

## What you type INTO the app, per car

Only **four numbers are required**: weight, front %, HP, torque
(`index.html:2469`). Everything else defaults. But the ones below all change
the tune, so enter them or the test is measuring defaults:

| field | where it comes from | notes |
|---|---|---|
| Weight | Upgrade screen, post-build | **post-upgrade**, not stock |
| Front % | Upgrade screen | rejected outside 20–80 |
| HP | Upgrade screen, post-build | post-upgrade |
| Torque | Upgrade screen, post-build | drives the diff accel lock |
| Class + PI | Upgrade screen | PI drives the spring frequency curve |
| Drivetrain | the car | |
| Gears | the transmission fitted | |
| Tire compound | what you fitted | drives pressures |
| Tire widths F/R | steps above stock, 0–3 | only the **difference** matters — 0/0 and 3/3 give an identical tune |
| Aero fitted | front / rear / both / none | gates the aero values entirely |
| Susp / ARB / trans / diff tier | what you fitted | gates which sliders exist at all |
| Fit (`fdfit`) | gearing graph — FD where top gear's line just touches the right edge | Session A step 1 |
| Graph max (`vgraph`) | gearing graph bottom axis | Session A step 1 |
| Final drive you run (`fdset`) | whatever you actually set | wins over the app's recommendation |

## What you read OUT of the game, per configuration

Five configurations per car: the game's own default tune as a control, then the
app's tune for each of the four tarmac disciplines. **Buy nothing between
rows** — only the tuning sliders move.

### Car 1: ______________________  class ____  gears ____  drivetrain ____

Stat block entered: wt ______ · fw ______ · hp ______ · tq ______ · PI ______

| tune | 0-60 | 0-100 | top speed | 60-0 | 100-0 | lateral G |
|---|---|---|---|---|---|---|
| game default (control) | | | | | | |
| app — Road | | | | | | |
| app — Sprint | | | | | | |
| app — Touge | | | | | | |
| app — Drag | | | | | | |

*(repeat this block per car — four in total)*

## Write your predictions down BEFORE you read the panel

This is the step that makes it a test rather than a story told afterwards. The
app claims each discipline does something specific; the panel can check four of
those claims. Expected ordering, from the constants currently in `DISC`:

- **Drag** should win 0-60 and top speed, and lose lateral G and both braking
  distances. It is the most distinctive tune the app produces — pressures
  forced to 50/15, aero suppressed at both ends, decel lock 0 — so if drag does
  *not* separate clearly from the others, the discipline constants are not
  doing their job and that is the headline finding.
- **Touge** should win lateral G and lose top speed (softest tarmac springs,
  shortest gearing).
- **Road** should take the best braking and sit mid-pack elsewhere.
- **Sprint** should sit between Road and Drag on top speed.
- **Every app tune should beat the game default on something.** If the default
  wins a column outright across several cars, that column's formulas are wrong
  — and that is worth knowing far more than any of the orderings above.

Write the four orderings you expect in the margin, then read. Where the panel
disagrees with the prediction, that is the row to chase.

## What this can and cannot conclude

It can conclude: the discipline constants produce measurably different cars in
the direction claimed; the gearing lands where it should; the app's tune beats
doing nothing. Those are the claims currently resting on nothing.

It cannot conclude anything about ARBs, damping or balance. Those need A2 —
Mechanical Balance is a live readout that responds to the tune, which makes it
solvable outright rather than measurable by proxy. That is the highest-value
session in the backlog and it is 40 minutes standing still. **Do it after
this**, because Session B will probably generate the motivation for it.

## Filing the results

One JSON per car under `tests/data/`, named `tune-<car>-<yyyy-mm-dd>.json`,
same shape as the GR86 gearing fixture: `car / class / pi / date / screen /
build / rows`, with `varied: "disc"` and one row per configuration. Then a
`disc.test.js` that asserts the measured orderings hold — the Layer 2
signature matrix from `BACKLOG.md` B, with real numbers behind it instead of
internal comparisons.
