# Forza Tune Goon

A Forza Horizon 6 tuning calculator: enter a car's stat block, get a full tune,
fix what the car actually did on track, plan the upgrade path, and export a
sheet. Single self-contained `index.html` — no server, no build step, no
dependencies. Deployed via GitHub Pages, auto-publishing from `main` on every
push (usually live within a couple of minutes; verify with
`gh api repos/bston97/forza-tune-goon/pages/builds/latest --jq .status`).

Live at **https://bston97.github.io/forza-tune-goon/**.

**The project is Forza Tune Goon; the page heading is not.** The repo, URL, PWA
name and docs all say Forza Tune Goon, but the `<h1>` still reads "FH6 Tune
Builder" and the exported sheet still says "Forza Horizon 6 · Tune Sheet" —
that is deliberate, asked for directly, not something left half-renamed.

Renamed from **Tune Goon** on 2026-08-08 (repo slug `tune-goon` →
`forza-tune-goon`, so the Pages URL moved with it). GitHub redirects the old
repo path indefinitely and the old Pages URL for a while, but nothing should
rely on either — if you find a surviving `tune-goon` reference, it is a miss,
not a deliberate exception.

## Before changing anything

**Run the tests before and after every change:**

```
node tests/run.js
```

**567 assertions across seventeen files**, plus a 684-build structural sweep, a
2,304-combination render/export sweep over every gated-part combination, and a
monotonicity sweep. Exits non-zero on any failure or crash — safe to use as a
gate. See `tests/shim.js` for how a plain-Node DOM shim runs the app's real
`<script>` block with no browser; see any `tests/*.test.js` for the pattern
(`ok(label, condition, extraInfoIfFailed)`).

**`mb.test.js` is the odd one out and deliberately so** — it never loads
`index.html`. It asserts the solved Mechanical Balance model against the
measurements, which is the middle step of the promotion rule: fixture → a test
asserting it *independently of `compute()`* → only then `compute()` changes. A
test that imported the app would be checking the app against itself.

`run.js` only collects `*.test.js`. Two other scripts live in `tests/` and are
run by hand, never as part of the gate — see the measurement program below.

**What the tests do NOT catch:** calibration drift. A change that shifts every
ARB value by 10x still passes the stress sweep, because that sweep only checks
structural validity (in-range for the game's real sliders, finite, bump ≤
rebound) — not "is this the right number." There is no automated check against
the community baselines (HokiHoshi's axle-share method, ForzaTune's documented
FH6 bands). If you touch a formula in the `compute()` function, sanity-check
the output against a few real cars by hand, not just the test suite.

## The measurement program — read this before touching any constant

Started 2026-08-12. **Nothing has been measured yet.** Every constant in
`compute()` is still a house heuristic or FH4/FH5 carry-over (see the tier list
further down), and the green suite proves *structure*, not calibration — it
would pass just as happily with every ARB off by 10×.

Three documents and three tools:

| file | what it is |
|---|---|
| **`TESTS.md`** | the master catalogue — every case across every subsystem, the car-selection reasoning, the photo protocol, and the suggested order |
| **`MEASURE.md`** | fill-in working sheets for the sessions in flight (Session A gearing, Session B the reverse-engineering plan) |
| `tests/data/*.json` | measured fixtures, one per car per session, plus `*-TEMPLATE.json` scaffolds to copy |
| `node tests/status.js` | coverage report — which cases have real numbers, which have somewhere to type, which are still design |
| `node tests/fit-balance.js <fixture>` | solves a Mechanical/Aero Balance sweep against five candidate models and says which the data rules out |
| `tests/data/index.js` | shared fixture loader, so two test files can never again disagree about the same reading |

**The organising idea is a classification, not a car list.** Every constant sits
in one of four classes by *what in the game responds to it*: a live readout
(Mechanical/Aero Balance — solvable outright, it is algebra not calibration),
the Performance panel (objective, no driving), telemetry (driving), or nothing
short of lap times. Push each constant as far up that table as it goes and
spend driving time only on what is genuinely stuck. `TESTS.md` opens with this.

**Promotion order, no exceptions.** Fixture file with provenance → a test that
asserts it independently of `compute()` → only then `compute()` changes, with
the date and the car in the comment above the constant. **Two cars minimum**
before a constant is treated as general — that is the lesson `vFrac` taught
twice. And a green suite after new measurements means the measurements were
not wired to anything.

**The fixtures are built to fail informatively.** `tests/data/index.js` returns
a caller's historical literal while a reading is unresolved and prints an
`[UNRESOLVED]` line; filling the number in switches every consumer at once and
fails whichever assertion was tuned to the other value. That failure is the
mechanism, not a problem.

## Three modes, chosen before anything is typed

`setMode('plan'|'tune'|'sheet')` — default `tune`. The picker sits above the car
name because the answer decides which fields are worth showing:

- **Plan build** hides `#fitted` entirely (tires, widths, suspension, ARBs,
  transmission, diff, aero, and the gearing readings). Planning happens before a
  single part is bought, so those are not optional there — they are
  unanswerable, and showing them invited filling them in with guesses.
- **Calculate tune** shows everything. This is the default job.
- **Tune sheet** swaps the form for `renderPreflight()` — a checklist of exactly
  what is about to land on the sheet, with what is missing marked. It never
  blocks the export (a sheet with no year is still a usable sheet); it only
  refuses when nothing has been calculated. The one item worth reading is
  "Chart readings": without them the final drive is a power-to-weight guess, and
  the sheet would print it as though it were a tune.

`preflight()` returns structured rows so it can be asserted directly; it reads
the live form rather than `BASE`, so it reflects edits made since the last
calculate. `modes.test.js` covers the visibility matrix and the gap-flagging.

**Tune mode walks three steps** (`setStep`, `STEP`): 1 the car (stats panel),
2 what's fitted (upgrade list), 3 gearing readings (Gearing tab) — one
physical screen per step. Every field stays in the DOM whichever step shows,
so restore/save/tests see one flat form; only visibility moves. Step 1 blocks
Next until the four required stats exist, with the refusal shown where the
fields are rather than two steps later. The gearing block stopped being a
`<details>` — a collapsed disclosure is how the 3.73 disaster shipped, and a
dedicated step cannot be scrolled past. Enter advances the step; on step 3 it
calculates. `newcar` returns to step 1, Find/Library loads land on step 3.

**The results end with a "Verify In Game" section** — the in-game half of the
process as one ordered list (enter values top-to-bottom, Mechanical Balance
0.55–0.65, Aero Balance 0.42–0.48 when fitted, gearing, then drive and come
back to the fine-tune box). The formulas get close; the readouts catch what
the numbers cannot carry — track width, cage stiffness, the power curve. A
car with widened tires additionally gets a line on the ARB note saying the
readout sees the wider track and the formula does not, so trust the readout.

## Architecture

Everything lives in `index.html`: styles, the tune-calculation engine
(`compute()`), the fine-tune symptom→fix engine (`FIX`, `applyDeltas()`), the
build-plan generator (`buildPlan()`, `carNotes()`), two localStorage-backed
stores (finished builds in `fh6lib`, per-car starting stats in `fh6plan`), and
the sheet exporter (`sheet()`, using the `SHEET_CSS` template — the user's own
card design, kept deliberately separate from the on-page working view).

**One CSS ordering constraint that bit us once, will bite again if violated:**
the `@media(max-width:900px)` mobile block must stay the *last* rule in
`<style>`. Earlier control styles use the `font` shorthand, which resets
`font-size` — an earlier media query gets silently overridden by rules later
in the file. Cost real mobile usability before it was caught by literally
measuring rendered font sizes in a browser, not by reading the CSS.

**Upgrade gating is load-bearing, not cosmetic.** Which sliders exist depends
on what's installed — a Sport diff gives acceleration lock only, no decel, no
AWD centre split; a Street/Sport suspension gives spring rate and ride height
but not damping or alignment; stock ARBs/diff/suspension/transmission give
nothing at all. `compute()` sets the corresponding `v.*` fields to `null` when
locked, and every render path (on-page card, sheet export, library row) must
treat `null` as "not adjustable," never as zero or blank-string. See the
`gates.test.js` suite for the full matrix — extend it if you add a new
gated part.

**The gating matrix itself is FH5 carryover and has never been confirmed on an
FH6 screen.** Audited 2026-07-31 at Boston's request: ForzaTune's guide does not
cover part-to-slider unlocks at all, and no other credible source exists. The
two load-bearing, most-likely-wrong claims are (1) Street/Sport suspension =
spring rate + ride height but NO damping/alignment, and (2) Street/Sport diff =
accel only, no decel. Each is a 30-second in-game check: fit the part, open the
tuning menu, see which sliders exist. If Boston reports a difference, fix
`compute()`'s gate and `gates.test.js` together. Confirmed FH6 facts so far:
tire width upgrades run **stock to +3** (a +4 option shipped for a while and
was wrong), ARB steps 0.1, and everything in the gearing section.

**The prose has to be gated too, not just the values.** This is the failure
mode that actually shipped: values correctly rendered as `—` while the notes
beside them went on coaching a slider the car does not have — an exported sheet
telling you to target Mechanical Balance on a car with stock anti-roll bars,
and an aero note that said "rear aero only" whichever end was fitted. The sheet
is read away from the app, at the console, so it also has to account for its
own dashes: `sheet()` closes the tune notes with a "Not adjustable on this
build" list and marks locked sections in their headers. `locked.test.js` holds
the line on all three render paths, including a sweep of every gated-part
combination.

**Stock stats vs. finished-build stats are genuinely different data,** stored
separately on purpose: `fh6plan` (one entry per car+year, written by Build
Plan, pre-upgrade numbers — weight, HP, PI as it stands) and `fh6lib` (one
entry per car+year+class+event, written by Save Sheet, post-upgrade numbers).
Find searches both and labels which is which. Don't merge them — a stock HP
figure prefilling a tune would be confidently wrong.

## Formula provenance — what's verified vs. house heuristic

Comments in `compute()` say where each formula comes from and how confident it
is. Rough tiers, most to least trustworthy:

0. **Solved against measurement** — a new tier as of 2026-08-12, and it has one
   member. **Mechanical Balance is a solved function**, fitted to six settings
   on one car with three parameters and matching every one on the printed
   digit, plus two rows it was not fitted to:

   ```
   MB = R / (F + R)     F = arF + 0.150·spF + 50.5     R = arR + 0.150·spR + 72.3
   ```

   It is the **rear** axle's share of roll stiffness — stiffening the rear bar
   raises the readout, stiffening the front spring lowers it. One bar point is
   worth ≈6.7 lb/in of spring, and the two per-axle constants are large and
   rear-biased (tires, geometry, unsprung mass — which is why tire pressure
   moves MB). **The coefficients are that car's and do not transfer**; the
   structure should, because it is roll stiffness. See
   `tests/data/balance-mb-solved-gr86-2026-08-12.json`.

1. **Confirmed on Boston's own screen** — Mechanical Balance and Aero Balance
   are real in-game readouts (confirmed 2026-07-30); the exact target bands
   (0.55–0.65 / 0.42–0.48) are still house numbers, not published, and **the
   app's own tune measures 0.51 against its own 0.55–0.65 band**. The gearing
   graph (confirmed 2026-07-31). ARB range 1–65 and step 0.1, confirmed
   2026-08-12 when 80 proved unsettable. **Aero Balance is a function of the two
   downforce figures in pounds plus a large per-axle body term** (≈175 front /
   215 rear on the GR86) — validated on an out-of-sample point, one car only.
   **The `SPREAD` gear tables were listed here too and are demoted to tier 4 as
   of 2026-08-12** — the screen that "confirmed" them was showing the app's own
   ratio set read back off a car it had been applied to, and the game's real
   defaults contradict it. See the gearing section below.
2. **Traceable FH6-specific source** — ForzaTune's guide, Game8, official
   patch notes. Diff accel bands, aero balance range, the drag-tire nerf.
   Re-scanned 2026-08-01: ForzaTune's FH6 guide moved three of our values —
   warm tire target 32-34 → the FH6 window of 30-40, road-family caster
   6.7 → 6.5 (their band 5.5-6.5), AWD centre neutral base 55 → 60 (their
   band 60-70). `scan.test.js` locks those and the deliberate deviations kept
   against them (RWD decel stays low per Boston; aero balance 0.42-0.48 is
   confirmed on his own screen; bump=0.63×rebound they corroborate).
3. **Community-standard but FH4/FH5-era** (carried forward, not FH6-confirmed)
   — HokiHoshi's axle-share ARB/damper method, the bump=0.63×rebound
   convention, the spring frequency-vs-PI curve.
4. **House heuristics with no external source** — the final-drive fallbacks
   (see gearing below), brake-bias-per-width-step, the `vFrac` per-discipline
   targets, most of the `carNotes()` discipline-fit thresholds.

### Gearing — and a worked example of getting it wrong

The Gearing tab's graph plots **rpm against speed, one straight line per gear**.
There is no power curve on it, so the long-standing instruction to "move the
final drive until the power curve reaches the edge of the graph" was describing
something that does not exist.

**The bottom axis does not rescale.** Its range is a property of the car, not of
the gearing, so a gear geared taller than the chart runs off the right-hand end
and is not drawn at all. Confirmed on Boston's screen 2026-07-31: a 7-speed
GR86 at final drive 3.73, axis reading 159 mph, **no 7th gear visible and only
the tail of 6th** — consistent with 6th ending at the edge and 7th at
159 × 0.95/0.82 ≈ 184 mph.

So the reading is visual and needs no numbers: sweep the final drive until the
top gear's line just reaches the right edge. At that setting top gear redlines
at the car's maximum usable speed — call it `fdFit` — and since speed at redline
goes as 1/FD, gearing to `vFrac` of that maximum is just `FD = fdFit / vFrac`.

~~The `SPREAD` tables are the game's own race-box ratios: the 7-speed on that
screen was 2.92/2.05/1.60/1.30/1.10/0.95/0.82, matching `SPREAD[7]` exactly.~~
**Withdrawn 2026-08-12 — this was circular and is false.** With the game's
default tune restored on a race-transmission GR86, the actual default ratios
are **4.17/2.89/2.17/1.66/1.32/1.07/0.85 at final drive 3.63** — nowhere near
`SPREAD[7]`, and wider at every gear. The screen that "confirmed" the table was
showing *the app's own ratio set read back off a car it had been applied to*.
The numbers matched exactly because they were the same numbers.

This is load-bearing, not cosmetic. `index.html:1083` takes the top ratio from
`SPREAD` to build the speed constant — `topGear = SPREAD[gr][gr-1]`, then
`kSpeed = vgraph × fdfit × topGear` — so on a car running the game's ratios
`k` is out by 0.82/0.85 ≈ **3.5%**, and `index.html:1146` prints every per-gear
speed off the same wrong table. What rescues it: the app also *emits* a ratio
set (`ratioSet()`), and if that is applied then `SPREAD` is what the car has
and everything is self-consistent. So the defect is not "the gearing maths is
wrong" — it is **"the app assumes its own ratios are fitted and never says
so."** Only the final drive is solved, but the gear speeds beside it quietly
assume a gearbox the car may not have.

**Measured in the live workflow 2026-08-12, and it is worse than the ratio
mismatch suggests.** The form tells the user *"Leave the individual ratios alone
while you sweep"* (`index.html:440`), so the fit is **always** read on whatever
gearbox is currently fitted — in practice the game's. On the GR86 that gave
fit 4.34, which the app duly returned as its recommendation, and then:

```
what it computed   159 × 4.34 × 0.82  =  565.9
what it should be  159 × 4.34 × 0.85  =  586.6
measured on the car's own gearbox     ≈  588.3
```

**3.8% low, and every per-gear speed with it.** The two gearboxes cross-check
exactly as the model requires — the fit moved 4.34 → ≈4.52 when the app's
ratios went on, a ratio of 1.041 against a top-ratio ratio of 1.037 — so the
model was never wrong, only the constant fed into it. **The fix is to ask for
the top ratio of the gearbox the fit was read on**, one number off a screen
already open, which also stops `SPREAD` being load-bearing at all.

### `k` is the invariant — the axis on its own means nothing

The reference car's axis maximum was recorded as both 157 and 159, and the repo
spent two weeks treating that as one reading being wrong. **Neither was.**
Measured across two builds and three tunes:

| reading | `axis × fit × topRatio` |
|---|---|
| July build | 157 × 4.575 × 0.82 = **589.0** |
| 2026-08-12, app's old tune | 157 × 4.570 × 0.82 = **588.3** |
| 2026-08-12, app's new tune | 159 × 4.510 × 0.82 = **588.1** |
| " | 159 × 4.520 × 0.82 = **589.4** |
| " | 159 × 4.530 × 0.82 = **590.7** |

0.44% across the lot. **When the axis moves, the fit moves to compensate** — the
axis is the chart's scale and the fit is the final drive at which top gear
reaches the end of it, so a longer scale needs a shorter final drive and the
product is conserved. `k` is the physical constant; the axis alone is chart
furniture. (Honest sample size: the last three rows are one sitting at adjacent
final drives, so this is nearer three independent points than five. Enough to
retire the 157-vs-159 question; a second car — `TESTS.md` `G5` — is what makes
the invariance general.)

**The one rule this leaves:** read the axis and the fit **on the same tune, in
the same sitting**. Pair them and `k` is right whatever either reads; mix them
and it is not. The 157/159 confusion was never an axis problem — it was two
half-measurements filed as though they were one. Every argument this repo has
had about which value is correct is retired, including the ones made on the day
it was settled.

The axis does move with the tune, incidentally, and not with the final drive
(held at 157 from fd 3.50 to 4.60). Final drive, top gear ratio, aero and tire
pressure have all been eliminated as the cause; it is unexplained and no longer
matters.

**How this got shipped wrong, because the failure mode will recur.** An earlier
revision inferred from a photo that the axis *rescaled* with the gearing, so the
top gear always touched the edge — and built an exact-looking ratio solve
(`FD_now × graphMax / target`) plus card copy stating there was "nothing to line
up". Boston caught it in one line: *"I don't see 7th gear even on the chart and
6 is barely on there."* Three lessons worth keeping:

1. **A blurry photo is not a reading.** The gear-endpoint spacing was measured
   off a phone picture taken at an angle and matched the wrong model about as
   well as the right one. Perspective distortion ate the difference.
2. **The wrong version was more confident than the right one**, because it
   produced a tidy closed-form answer. Tidiness is not evidence.
3. **The original text had the right action under the wrong noun.** "Until it
   reaches the edge of the graph" was correct about the edge and wrong about
   what reaches it. Rewriting inherited text, check whether the part being
   discarded was the part that was true.

**The other trap, which cost a whole cycle:** the field feeding this lived in a
collapsed `<details>`, so it stayed blank, the power-to-weight guess ran, and
the only hint was body text under the number. Boston got the same wrong 3.73
back and reasonably asked what had changed. The block now defaults to `open`,
and an unsolved final drive raises a top-level warning rather than a footnote.
If you ever add another input the tune quietly degrades without, do the same.

**And the third wrong claim, for completeness.** Once the fit worked, the app
printed the top gear's limiter speed as a predicted top speed: "should read
about 151 mph". Measured at final drive 4.82 the car did **140.0**. Top gear's
limiter is a *ceiling*, not a prediction — the car only reaches it if the engine
still makes power that high, and at 140 mph in that gear it was already at
~7,600 rpm, past peak. The axis maximum is not reachable either. Nothing in the
gearing geometry can predict top speed, because none of it knows the power
curve.

**So geometry picks the starting point and the Performance panel picks the
setting.** That panel — same screen, left-hand side — reports 0-60, 0-100, Top
Speed, braking distances and lateral G for whatever is currently set. Those are
the actual objective, and they are simulation output rather than driving.
Sweeping the final drive against them is how `vFrac` finally got measured.

**Measured 2026-08-12, and the claim holds.** The panel visibly prints
`SIMULATING…` while it recomputes, so a reading taken before it settles is
stale and must be discarded — but once settled it is effectively
deterministic. One setting re-entered six times, three approached from above
and three from below, returned identical figures on 0-60, 0-100, top speed,
60-0, both lateral G values and all three Miscellaneous readouts; the only
movement anywhere was 100-0 reading 145.9 ft once against 145.8 the other five
times. No difference between approach directions, so there is no path
dependence in how a slider is arrived at either.

That makes the panel a genuinely exact instrument, which cuts both ways: a
0.4 mph difference in top speed is a **result**, not noise, and cannot be
waved away. See `tests/data/gearing-gr86-defaulttune-2026-08-12.json`.

**The calibration sweep** (GR86, 2026-07-31, ratios held at the race-box
default, final drive the only variable, fit = 4.575):

| final drive | 0-60 | 0-100 | top speed | tops out in |
|---|---|---|---|---|
| 4.82 | **3.040** | 8.723 | 140.0 | 7th |
| 4.58 | 3.056 | 8.636 | 141.4 | 7th |
| 4.30 | 3.088 | 8.671 | 142.7 | 6th |
| 4.00 | 3.104 | **8.601** | 143.5 | 6th |
| 3.73 | 3.088 | 8.671 | 143.8 | 6th |
| 3.50 | 3.153 | 8.671 | **144.4** | 5th |

Three things came out of it:

1. **`vFrac` for road is 1.00 — gear at the fit.** Getting here took two wrong
   answers, and the reasoning matters more than the number. The original 0.95
   was a guess and pushed toward 4.82, which measured **worst of the six**. The
   replacement, 1.14, was fitted to whichever setting won 0-100 (4.00, by
   0.035s) — but nothing dominates: 4.58 wins 0-60 by 0.048s, 3.50 wins top
   speed, and the whole range spans 0.12s. **Fitting a constant to the winner
   of one metric across noise that small is overfitting, and it produced a
   recommendation that left the 7th ratio doing nothing.** What actually breaks
   the tie is that at the fit every gear engages, while at 4.00 the car tops out
   in 6th. Same lap time either way; one of them uses the gearbox you paid for.
   The other six disciplines are scaled from road, preserving the ordering that
   was already there; **only road is measured.**

   Note this is a **PI** argument, not a shift-quality one. The rpm drop per
   shift is fixed by the ratio steps (70/78/81/85/86/86% on the GR86 7-speed)
   and final drive scales all gears together, so it cannot change shift quality
   — only where in the speed range the gears sit.
2. **The surface is flat.** 0.12s across the whole 0-100 range and 4.4 mph of
   top speed, with four of six settings inside 1%. Quoting a final drive to two
   decimals implies precision the game does not reward, so `compute()` returns
   `fdBand` and the card asks for a sweep rather than pretending to an answer.
3. **The 7th ratio was dead at every setting worth running.** At 4.30 and below
   the car tops out in 6th; the settings that do reach 7th are the slow ones. A
   6-speed would have performed identically for less PI, which is a build
   finding no amount of tuning fixes.

**Whether a gear is dead has nothing to do with whether it fits the chart.**
You shift *into* gear N at the speed where gear N−1 runs out, so the test is
that shift-in speed against top speed. The two conditions are independent: a
gear can hang off the right-hand edge and be perfectly useful, or sit inside
the chart and never be touched. And whether the top gear is even *visible*
depends on where the gear below it ends — at final drive 4.02 the GR86's 7th
showed as a ~3 mph stub because 6th ran out at 154 on a 157 chart, which is the
shift point drawn rather than the gear fitting. Without a measured top speed
there is nothing honest to compare against, since the axis sits ~13 mph above
anything the car reaches; `compute()` says so and asks for the number rather
than guessing.

### The Performance panel's Top Speed is NOT an achieved speed — do not use it

Settled 2026-07-31 by Boston: that figure is the maximum the car would reach
with **the entire build and tune aimed at top speed — aero included**, not the
speed it does on the gearing and setup currently fitted. On a downforce circuit
build it sits far above anything you will ever see.

The app spent several revisions treating it as achieved speed and built three
things on it: naming the gear the car runs out in, marking gears "never used",
and warning when it sat above the top gear's limiter. Under the correct reading
the last of those fires on almost every build, which is exactly what Boston
reported. **All three are withdrawn and the input is gone from the form.** Do
not reintroduce anything that measures a tune against that number.

> **⚠️ CONTRADICTED 2026-08-12, PENDING CASE `S1` — do not act on this yet.**
> Across today's rows the readout moved with the **rear wing** (141.1 → 139.1
> when downforce went up), with the **final drive**, with the **springs**
> (138.2 → 137.4) and with **tire pressure** (137.4 → 137.1). A figure computed
> with "the entire build and tune aimed at top speed" should not fall when you
> add downforce to the tune it is supposedly ignoring.
>
> **This is not enough to overturn it, and the section stays as written.** Every
> one of those observations is incidental — taken while measuring something
> else, never with top speed as the controlled variable. Three claims were
> reversed on exactly that kind of evidence today and all three had to be
> withdrawn again. `TESTS.md` case **`S1`** is the deliberate 20-minute test
> that settles what the readout responds to, and it is now the most valuable
> unrun case in the catalogue. Run it before changing a line of this.

What replaced it: the ratio set aims top gear at the **graph maximum** instead.
That is a fixed reading off the chart with one meaning, it needs no
interpretation, and it is exactly where the fit puts top gear — a setting that
measured well on the sweep. Everything the gearing section does now derives from
two unambiguous chart readings (fit, graph max) plus the final drive the user
chooses.

### The final drive is the user's input, not the app's output

The last recurring gearing failure (2026-07-31, "it keeps saying something is
wrong"): the impossible-top-speed check judged the entered top speed against
the ceiling at the app's *own recommendation*, but Boston sets his own final
drive — so any setting longer than the rec made his real top speed
"impossible" on every build. `fdset` ("Final drive you run") now exists and
wins outright over the fit-derived recommendation; the pair (fdset, vmax) is
read at one setting and everything — gear speeds, verdict, ratio set, the
disagree check — is computed at it. Do not reintroduce any check that compares
a user measurement against a setting the user is not running.

### Inputs that were removed, and one that looks redundant but isn't

**Tire size and redline are gone** (2026-07-31). They fed only the old absolute
final-drive solve — rolling circumference × redline ÷ top gear — which was
strictly dominated: three numbers off in-game screens to produce a worse answer
than the fit's one, when you have to be in the tuning menu to apply a final
drive either way, and it trusted a tire size that is easy to get wrong after a
width upgrade. `tireCirc()` went with them. Two paths remain: the fit, or an
admitted guess.

**Tire width is read only as a difference.** `wStep = twr − twf` shifts brake
bias toward the wider axle; nothing else uses either value. So 0/0 and +3/+3
produce an identical tune, which was not obvious from the form and now says so.

**The fit at `vFrac` 1.00 hands back the number you typed, and that is fine.**
Boston asked, fairly, why he should type a final drive in just to be told to set
it. For road the division genuinely does nothing. What the input earns is
everything downstream: with Graph max it gives the car's speed constant, which
is what puts real mph on each gear and identifies ratios that never engage. The
card says that outright at 1.00 rather than dressing "÷ 1.00" up as a
calculation — if it ever reads like arithmetic theatre again, that is the bug.

### Why there is no simulator, and what `sweep.test.js` does instead

Asked 2026-07-31 whether the sweep data could be reverse-engineered into a
model to test constants against before shipping them. Worth answering properly,
because the instinct is right and the answer is split:

**The gear-speed model was reverse-engineered and does hold.** `k/(FD·G)` is
pure kinematics — no unknown physics — so it generalises to any car and checks
out against both the graph (all seven gears within 2%) and an independent
readout.

**The performance figures cannot be.** Demonstrated on the data we have: at
final drive 3.50 and 4.82 the engine sits at 7551 and 7516 rpm at top speed,
0.5% apart, while the drag those speeds imply differs by 9.7%. One engine speed
cannot make 10% more power, so either the derived constants are slightly off or
the Top Speed readout is not a drag equilibrium. Six points on one car
underdetermine it, and a fit would be *this car's* fit regardless — generalising
would need the engine's power curve, which no screen exposes as numbers.

And the game already is the simulator: the Performance panel returns exact
figures for any setting in about a second. Rebuilding that badly is worse than
telling the user which three numbers to read.

So `sweep.test.js` holds the measured table as a **fixture**, not a model. Any
future change to `vFrac` must still produce, for the reference car, a setting
the game actually liked — top half of the measured six, never 4.82. That is the
check that was missing when 0.95 and then 1.14 shipped untested against data
already sitting in the repo.

### Searching for outside confirmation: don't bother

Asked to check this against published sources 2026-07-31, the result was
nothing usable, and it is worth recording so nobody spends the tokens again:

- The one forza.net thread on exactly this subject ("Gear/speed graph not
  correct in tuning menu") **301s to a forums landing page** — the shutdown
  took the content with it.
- `forza.guide` and `traxion.gg` both return **403** to fetches.
- **ForzaTune's gearing guides do not discuss the graph at all.** Their only
  relevant lines are "pick a top gear and final drive combination that reach
  your top speed" and that changing forward gears is not recommended. No axis,
  no overrun, no unused gears.
- The AI-written search summaries assert that gearing **too short** makes the
  top gear overrun the chart. That is backwards — short gearing pulls every
  line left — and our own sweep contradicts it directly. One summary also
  repeated the "move the final drive until the curve reaches the edge of the
  graph" line, which is very likely where this repo's original wrong text came
  from in the first place.

Everything real about the gearing graph in this file was measured off Boston's
screen. Treat that as the only source.

The verified core, which survived all three corrections: per-gear limiter speeds
from `k/(FD·G)` with `k = axisMax · fdFit · G_top`. Checked against the graph at
final drive 4.82 — 42/59/76/94/111/129/148 measured, 42/60/77/95/113/130/151
computed, inside 1.5% across all seven gears.

`gearing.test.js` holds all of it, with the GR86 screen as the reference case,
including assertions that each discredited claim stays dead.

### ARB increments

Anti-roll bars move in **0.1 steps** — 29.60, 29.70, 29.80, never 29.65
(confirmed 2026-07-31). `VMETA.arF/arR` already carry `s:0.1, d:1` and `snap()`
enforces it on every path including the multiplicative fix deltas; `arb.test.js`
sweeps 17k baseline values plus every fix stacked 25 deep to keep it that way.
Worth knowing the grain differs per slider — final drive is 0.01, ARBs and
damping 0.1, springs and the percentage sliders 1 — so `s` is the single source
of truth, not a shared rounding constant.

Search results for "FH6 tuning" are dominated by AI content farms that
fabricate specifics and copy each other; `forums.forza.net` is dead. Treat any
new source with real suspicion — cross-check against Boston's own tuning menu
before trusting a specific number over what's already here. The build-plan's
"Worth reading" section links the two sources that held up.

## Working style

Boston is an experienced FH6 tuner — no beginner explanations, no hedging on
a direct question, dense stat blocks worked from directly. Minimize input
friction relentlessly (this is why nearly every field either auto-defaults
from class/event or is optional), but never at the cost of correctness —
"quick is not as important as making the perfect build" was said explicitly
when the tradeoff came up. When a claim can be verified against the actual
game, that beats any external source, including prior research in this repo's
history.

**A rounded readout cannot confirm a model to more digits than it prints.**
Learned expensively on 2026-08-12, when three conclusions were published and
withdrawn inside one session. Two of them died the same way: a computed value
matched a two-decimal readout and the match was read as exact. `190/(190+232) =
0.4502` against a printed `0.45` looks like four-decimal agreement and is
nothing of the kind — anything in `[0.445, 0.455]` prints as `0.45`, so a single
point confirms almost nothing. Both times the second point killed the model.

Two habits fall out of that, and they are cheap:

- **One point is a coincidence.** Before believing a fit, ask what the *next*
  measurement would have to read to falsify it, and take that one.
- **When a model exists, use it — do not eyeball.** The `+14 rear bar` figure
  in the MB fixture was estimated by eye off two rows while the solved model
  sat directly above it; differentiating the model gives `+27`. A user
  following the wrong number would have stopped short of the band believing
  they had complied.

The pattern is older than that session — the 3.73 gearing solve and the
`SPREAD` "confirmation" are the same shape. **The wrong version is consistently
the tidier one**, because a coincidence that survives one check looks like a
law.

**Git: commit straight to `main`.** Solo personal project — no branches, no
PRs, no reviewers for routine work. Branch only if something genuinely gets
complicated enough to need it. Clear commit messages, no process theatre; a
one-line `.gitignore` change should not become a branch, a push, a PR and a
merge. Open items live in `BACKLOG.md`, which is tracked, not ignored.

## Known gaps / honest limitations

- No car database. Deliberate — there's no FH6 API and the one real stat
  source (Kudosprime) is stock-only, which would be actively wrong for a
  tune that needs post-upgrade numbers. `fh6plan`/`fh6lib` are the only
  "database," and they only know cars you've entered.
- localStorage is per-device and per-browser. The build library and starting
  stats don't sync across phone/PC. No backend exists to fix this; would need
  one (Boston's other project, Budgeter, already uses Supabase — same pattern
  would work here if this ever becomes worth it).
- Discipline constants (camber targets, damping ratios, ARB multipliers,
  final-drive bases) are theory-derived, not validated against extensive
  seat time. They're plain data tables at the top of the script — expect
  Boston to report specific values feeling off after driving builds, and
  treat that feedback as higher-priority than any published source.
