# TODO

> [!tip] Start at the [Board](#board)
> Everything open, as cards with stable IDs, in three views: what's blocking it,
> where you have to be, and which topic is piling up. **[In the
> game](#view-2--by-place)** is the bucket to open with FH6 running; **[at the
> repo](#view-2--by-place)** is everything else. Every card is also a [GitHub
> issue](https://github.com/bston97/forza-tune-goon/issues).

Scratch list for the tuning app. Tracked in git so it syncs across the web
session and the VS Code one, and readable from a phone on GitHub. Each item
links to the document that holds the reasoning — `MODEL.md` for what the game
has been measured to do, `TESTS.md` for the case catalogue, `MEASURE.md` for
the working sheets, `BACKLOG.md` for the long-form plans.

**This file does not replace those.** It is the index: what is open, who it is
waiting on, and where to read about it. The argument always lives in the other
file.

## Board

**Every open item, as cards.** 67 items across 16 areas, so the board is one row per area with the detail underneath — tap a card to jump to its items.

**Cards have stable IDs.** Say "do PARTS-1" and I will pick it up without you describing it again. IDs do not change when the board is reordered.

**Three views of the same cards**, because the useful sort depends on what you are asking:

- **[By what's blocking it](#view-1--by-lane)** — the default. What can move right now.
- **[By where you have to be](#view-2--by-place)** — the in-game bucket is the one to open with FH6 running.
- **[By topic](#view-3--by-topic)** — which subjects are piling up.

**Owner** is who a card is actually waiting on: `Claude` means nothing blocks me, **Boston** means I genuinely cannot do it, `Either` means it needs a conversation first.

> [!note] Every card is also a GitHub issue
> One issue per card, labelled `topic:`, `place:`, `owner:` and `lane:`, each linking back to its section here. **[Open issues](https://github.com/bston97/forza-tune-goon/issues)** · **[the in-game bucket](https://github.com/bston97/forza-tune-goon/issues?q=is%3Aopen+label%3Aplace%3Agame)**
>
> **This file stays the source of truth.** The issues are the tracker — a place to filter, sort and see what changed. The reasoning lives here, and answers get written here or in the doc the item points at, never in an issue thread. If the two ever disagree, this file is right.

---

### View 1 — by lane

#### Ready — I can start these now

No input needed. Say the ID and it gets built. **12 items, 2 cards.**

| ID | Card | Items | Owner | Where | Note |
| :--- | :--- | ---: | :--- | :--- | :--- |
| `DEBT-1` | [Known debt](#known-debt) | 5 | Claude | Neither — mine or automatic | Recorded so it is not rediscovered. None of it changes a number the app prints |
| `GH-1` | [GitHub repo files](#github-repo-files) | 7 | Either | At the repo | `.gitattributes` done. CI is the highest-value one left — the run-the-tests discipline currently depends on remembering |

#### Blocked — needs you at a screen I cannot see

A readout, a tuning menu, a garage screen, or a settings page only you can open. **41 items, 10 cards.**

| ID | Card | Items | Owner | Where | Note |
| :--- | :--- | ---: | :--- | :--- | :--- |
| `MEAS-1` | [The measurement queue](#the-measurement-queue) | 3 | **Boston** | In the game | **Start here.** Six queued readings, cheapest first. Items 1–3 are under half an hour together |
| `PARTS-1` | [Parts and the gating matrix](#parts-and-the-gating-matrix) | 5 | **Boston** | In the game | **Highest-risk unmeasured thing in the app** — it decides which sliders get shown at all. Needs the TUNING menu after installing, not the upgrade preview |
| `PANEL-1` | [What the Performance panel can settle](#what-the-performance-panel-can-settle) | 7 | **Boston** | In the game | `S1` is the one that matters — three withdrawn app features ride on what Top Speed actually responds to |
| `RANGE-1` | [Slider ranges](#slider-ranges) | 4 | **Boston** | In the game | Never measured. An asymmetric spring clamp would destroy the F/R ratio silently, on a screen the app cannot see |
| `GEAR-1` | [Gearing — the tables still invented](#gearing--the-tables-still-invented) | 2 | **Boston** | In the game | `SPREAD[7]` is measured; the other six gear counts are house tables feeding real per-gear speeds |
| `BAL-1` | [Balance — the third car and the coefficients](#balance--the-third-car-and-the-coefficients) | 4 | **Boston** | In the game | Structure holds on two cars. The coefficients are per-car and the spring term is a local linearisation |
| `DISC-1` | [Discipline naming and circuit vs sprint](#discipline-naming-and-circuit-vs-sprint) | 4 | **Boston** | In the game | Step one is a screen check, not an edit. Rename labels freely; renaming keys costs a three-store migration |
| `LIB-1` | [Library cull, then two tunes per keeper](#library-cull-then-two-tunes-per-keeper) | 4 | **Boston** | In the game | Deletes are unrecoverable — localStorage, one device, no undo. Do `FAM-1`'s naming rule first |
| `ROSTER-1` | [The garage rosters](#the-garage-rosters) | 4 | **Boston** | In the game | Mitsubishis are 13 builds across 7 cars. GT-R counts still to be filled from the garage |
| `RENAME-1` | [Finish the repo rename](#finish-the-repo-rename) | 4 | **Boston** | At the repo | Code and docs all say forza-tune-goon; the remote is still tune-goon. Two minutes, and it is the only thing left from that job |

#### Waiting on a decision or a fact only you have

Answerable without measuring anything. **4 items, 2 cards.**

| ID | Card | Items | Owner | Where | Note |
| :--- | :--- | ---: | :--- | :--- | :--- |
| `APP-1` | [The game default beats our tune](#the-game-default-beats-our-tune) | 2 | Either | In the game | **The most important unresolved result in the programme, and it points at the app.** One car — needs a second before it is general |
| `FAM-1` | [Nameplate families — many builds, never a best](#nameplate-families--many-builds-never-a-best) | 2 | **Boston** | At the repo | The app already refuses to rank. Mostly a naming convention plus a guard against regressing it |

#### Backlog — real work, no urgency

Mixed ownership. Pick one and it moves to Ready. **10 items, 2 cards.**

| ID | Card | Items | Owner | Where | Note |
| :--- | :--- | ---: | :--- | :--- | :--- |
| `DRIVE-1` | [Telemetry and driving](#telemetry-and-driving) | 6 | **Boston** | In the game | The only group that genuinely needs laps. Fixed route, best-of-5, all five recorded |
| `TEST-1` | [Generative test plan](#generative-test-plan) | 4 | Claude | Neither — mine or automatic | Structural cover is good; calibration cover only exists where a fixture exists |

#### Ongoing — never closes

Fills up from use. Should not hold anything open. **0 items, 0 cards.**

| ID | Card | Items | Owner | Where | Note |
| :--- | :--- | ---: | :--- | :--- | :--- |

---

### View 2 — by place

#### In the game

FH6 has to be open — a tuning menu, the Performance panel, the garage or the upgrade shop. **45 items, 11 cards.**

| ID | Card | Items | Owner | Lane | Note |
| :--- | :--- | ---: | :--- | :--- | :--- |
| `MEAS-1` | [The measurement queue](#the-measurement-queue) | 3 | **Boston** | Blocked — needs you at a screen I cannot see | **Start here.** Six queued readings, cheapest first. Items 1–3 are under half an hour together |
| `PARTS-1` | [Parts and the gating matrix](#parts-and-the-gating-matrix) | 5 | **Boston** | Blocked — needs you at a screen I cannot see | **Highest-risk unmeasured thing in the app** — it decides which sliders get shown at all. Needs the TUNING menu after installing, not the upgrade preview |
| `PANEL-1` | [What the Performance panel can settle](#what-the-performance-panel-can-settle) | 7 | **Boston** | Blocked — needs you at a screen I cannot see | `S1` is the one that matters — three withdrawn app features ride on what Top Speed actually responds to |
| `RANGE-1` | [Slider ranges](#slider-ranges) | 4 | **Boston** | Blocked — needs you at a screen I cannot see | Never measured. An asymmetric spring clamp would destroy the F/R ratio silently, on a screen the app cannot see |
| `GEAR-1` | [Gearing — the tables still invented](#gearing--the-tables-still-invented) | 2 | **Boston** | Blocked — needs you at a screen I cannot see | `SPREAD[7]` is measured; the other six gear counts are house tables feeding real per-gear speeds |
| `BAL-1` | [Balance — the third car and the coefficients](#balance--the-third-car-and-the-coefficients) | 4 | **Boston** | Blocked — needs you at a screen I cannot see | Structure holds on two cars. The coefficients are per-car and the spring term is a local linearisation |
| `DRIVE-1` | [Telemetry and driving](#telemetry-and-driving) | 6 | **Boston** | Backlog — real work, no urgency | The only group that genuinely needs laps. Fixed route, best-of-5, all five recorded |
| `APP-1` | [The game default beats our tune](#the-game-default-beats-our-tune) | 2 | Either | Waiting on a decision or a fact only you have | **The most important unresolved result in the programme, and it points at the app.** One car — needs a second before it is general |
| `DISC-1` | [Discipline naming and circuit vs sprint](#discipline-naming-and-circuit-vs-sprint) | 4 | **Boston** | Blocked — needs you at a screen I cannot see | Step one is a screen check, not an edit. Rename labels freely; renaming keys costs a three-store migration |
| `LIB-1` | [Library cull, then two tunes per keeper](#library-cull-then-two-tunes-per-keeper) | 4 | **Boston** | Blocked — needs you at a screen I cannot see | Deletes are unrecoverable — localStorage, one device, no undo. Do `FAM-1`'s naming rule first |
| `ROSTER-1` | [The garage rosters](#the-garage-rosters) | 4 | **Boston** | Blocked — needs you at a screen I cannot see | Mitsubishis are 13 builds across 7 cars. GT-R counts still to be filled from the garage |

#### At the repo

The editor, GitHub, or a decision. No game needed. **13 items, 3 cards.**

| ID | Card | Items | Owner | Lane | Note |
| :--- | :--- | ---: | :--- | :--- | :--- |
| `GH-1` | [GitHub repo files](#github-repo-files) | 7 | Either | Ready — I can start these now | `.gitattributes` done. CI is the highest-value one left — the run-the-tests discipline currently depends on remembering |
| `FAM-1` | [Nameplate families — many builds, never a best](#nameplate-families--many-builds-never-a-best) | 2 | **Boston** | Waiting on a decision or a fact only you have | The app already refuses to rank. Mostly a naming convention plus a guard against regressing it |
| `RENAME-1` | [Finish the repo rename](#finish-the-repo-rename) | 4 | **Boston** | Blocked — needs you at a screen I cannot see | Code and docs all say forza-tune-goon; the remote is still tune-goon. Two minutes, and it is the only thing left from that job |

#### Neither — mine or automatic

I do these, or a script does. Listed so the board stays complete. **9 items, 2 cards.**

| ID | Card | Items | Owner | Lane | Note |
| :--- | :--- | ---: | :--- | :--- | :--- |
| `DEBT-1` | [Known debt](#known-debt) | 5 | Claude | Ready — I can start these now | Recorded so it is not rediscovered. None of it changes a number the app prints |
| `TEST-1` | [Generative test plan](#generative-test-plan) | 4 | Claude | Backlog — real work, no urgency | Structural cover is good; calibration cover only exists where a fixture exists |

---

### View 3 — by topic

#### App defects

**6 items, 2 cards.**

| ID | Card | Items | Owner | Lane | Note |
| :--- | :--- | ---: | :--- | :--- | :--- |
| `APP-1` | [The game default beats our tune](#the-game-default-beats-our-tune) | 2 | Either | Waiting on a decision or a fact only you have | **The most important unresolved result in the programme, and it points at the app.** One car — needs a second before it is general |
| `DISC-1` | [Discipline naming and circuit vs sprint](#discipline-naming-and-circuit-vs-sprint) | 4 | **Boston** | Blocked — needs you at a screen I cannot see | Step one is a screen check, not an edit. Rename labels freely; renaming keys costs a three-store migration |

#### Docs & debt

**5 items, 1 cards.**

| ID | Card | Items | Owner | Lane | Note |
| :--- | :--- | ---: | :--- | :--- | :--- |
| `DEBT-1` | [Known debt](#known-debt) | 5 | Claude | Ready — I can start these now | Recorded so it is not rediscovered. None of it changes a number the app prints |

#### Garage & rosters

**10 items, 3 cards.**

| ID | Card | Items | Owner | Lane | Note |
| :--- | :--- | ---: | :--- | :--- | :--- |
| `LIB-1` | [Library cull, then two tunes per keeper](#library-cull-then-two-tunes-per-keeper) | 4 | **Boston** | Blocked — needs you at a screen I cannot see | Deletes are unrecoverable — localStorage, one device, no undo. Do `FAM-1`'s naming rule first |
| `FAM-1` | [Nameplate families — many builds, never a best](#nameplate-families--many-builds-never-a-best) | 2 | **Boston** | Waiting on a decision or a fact only you have | The app already refuses to rank. Mostly a naming convention plus a guard against regressing it |
| `ROSTER-1` | [The garage rosters](#the-garage-rosters) | 4 | **Boston** | Blocked — needs you at a screen I cannot see | Mitsubishis are 13 builds across 7 cars. GT-R counts still to be filled from the garage |

#### Measurement

**31 items, 7 cards.**

| ID | Card | Items | Owner | Lane | Note |
| :--- | :--- | ---: | :--- | :--- | :--- |
| `MEAS-1` | [The measurement queue](#the-measurement-queue) | 3 | **Boston** | Blocked — needs you at a screen I cannot see | **Start here.** Six queued readings, cheapest first. Items 1–3 are under half an hour together |
| `PARTS-1` | [Parts and the gating matrix](#parts-and-the-gating-matrix) | 5 | **Boston** | Blocked — needs you at a screen I cannot see | **Highest-risk unmeasured thing in the app** — it decides which sliders get shown at all. Needs the TUNING menu after installing, not the upgrade preview |
| `PANEL-1` | [What the Performance panel can settle](#what-the-performance-panel-can-settle) | 7 | **Boston** | Blocked — needs you at a screen I cannot see | `S1` is the one that matters — three withdrawn app features ride on what Top Speed actually responds to |
| `RANGE-1` | [Slider ranges](#slider-ranges) | 4 | **Boston** | Blocked — needs you at a screen I cannot see | Never measured. An asymmetric spring clamp would destroy the F/R ratio silently, on a screen the app cannot see |
| `GEAR-1` | [Gearing — the tables still invented](#gearing--the-tables-still-invented) | 2 | **Boston** | Blocked — needs you at a screen I cannot see | `SPREAD[7]` is measured; the other six gear counts are house tables feeding real per-gear speeds |
| `BAL-1` | [Balance — the third car and the coefficients](#balance--the-third-car-and-the-coefficients) | 4 | **Boston** | Blocked — needs you at a screen I cannot see | Structure holds on two cars. The coefficients are per-car and the spring term is a local linearisation |
| `DRIVE-1` | [Telemetry and driving](#telemetry-and-driving) | 6 | **Boston** | Backlog — real work, no urgency | The only group that genuinely needs laps. Fixed route, best-of-5, all five recorded |

#### Repo hygiene

**11 items, 2 cards.**

| ID | Card | Items | Owner | Lane | Note |
| :--- | :--- | ---: | :--- | :--- | :--- |
| `GH-1` | [GitHub repo files](#github-repo-files) | 7 | Either | Ready — I can start these now | `.gitattributes` done. CI is the highest-value one left — the run-the-tests discipline currently depends on remembering |
| `RENAME-1` | [Finish the repo rename](#finish-the-repo-rename) | 4 | **Boston** | Blocked — needs you at a screen I cannot see | Code and docs all say forza-tune-goon; the remote is still tune-goon. Two minutes, and it is the only thing left from that job |

#### Testing

**4 items, 1 cards.**

| ID | Card | Items | Owner | Lane | Note |
| :--- | :--- | ---: | :--- | :--- | :--- |
| `TEST-1` | [Generative test plan](#generative-test-plan) | 4 | Claude | Backlog — real work, no urgency | Structural cover is good; calibration cover only exists where a fixture exists |

---

## The measurement queue

The six queued readings from `MEASURE.md`, cheapest and highest-value first.
Items 1–3 are under half an hour together.

- [ ] Re-read the GR86 Rocket Bunny's **Weight and Front %** on the upgrade preview — 30 s. Both were flagged red and illegible so both are recorded `null`, and it is the one number separating "the kit is heavy" from "the GR86 already had the downforce"
- [ ] **A race 7-speed on a car that was never drivetrain-swapped** — one screenshot. The only confound left under `SPREAD[7]`, which is already shipped into the app
- [ ] **A third car for Mechanical Balance** — 3 readings. Turns "two cars" into a rule, and tests whether the per-axle terms sitting ~5.5 points below front weight distribution is a pattern or a coincidence

## Parts and the gating matrix

`TESTS.md` group P. The gating matrix decides which sliders the app shows at
all — every other constant being wrong is a number off; this is a control
invented or hidden. Needs the **tuning** menu after installing, not the upgrade
preview.

- [ ] `P1` — the gating matrix, 30 s per tier while upgrading. Two claims most likely wrong: street/sport suspension gives spring rate and ride height but **no** damping or alignment (including caster, the least obvious one); street/sport diff gives accel lock only, **no** decel
- [ ] `P1` also settles `BACKLOG E4` — the gate comment cites Destructoid's slider guide as a traceable FH6 source while CLAUDE.md's audit says no such source exists. Measuring the matrix makes the argument moot
- [ ] The form cannot express what the matrix may find: transmission collapses Stock and Street into one option, and there is no street/sport ARB tier at all. If those tiers gate differently, that is new options and new gate branches, not a one-line change
- [ ] `P2` — does a part change the stat block? One part at a time, record weight, front %, PI, hp, torque after each
- [ ] `P3`/`P4` — what tire compound and width actually buy. The app moves **only** brake balance on width, so 0/0 and 3/3 give an identical tune. If width changes grip measurably, that is a formula the app does not have

## What the Performance panel can settle

`TESTS.md` group S, plus C and D. Six figures per configuration, deterministic,
about a second each.

- [ ] `S1` — **what Top Speed responds to**, ~20 min. Three withdrawn app features ride on the current reading, and four incidental rows now contradict it. The set of inputs it moves with defines what the number is
- [ ] `S3` — traction-limited or power-limited. Do this before `S2`; if 0-60 barely moves between worst and best tire, `S2`'s thirty minutes are not worth spending on that car
- [ ] `S2` — the 0-60 factor sweep, one variable per row
- [ ] `S4` — brake balance and pressure against measured stopping distance. The cleanest experiment in the catalogue, and it kills or confirms brake-bias-per-width-step, which has no source at all
- [ ] `S5` — **does lateral G respond to the tune?** The sleeper: if it moves with camber and pressure and not just compound, a group of lap-times-only constants becomes measurable standing still
- [ ] `C1` — discipline signatures against the game's default tune, tarmac only
- [ ] `D3` — the AWD centre split. The app's neutral base moved 55 → 60 on ForzaTune's band without ever being measured

## Slider ranges

`TESTS.md` group R. Never measured, and it sits upstream of the spring model.

- [ ] `R1` — do the app's spring rates fit inside the car's slider range? The app emits absolute lb/in and says the game clamps if the range is narrower, then never checks. **An asymmetric clamp destroys the F/R ratio the spring model rests on, silently**
- [ ] `R2` — does the suspension tier move the spring range, or only unlock sliders?
- [ ] `R3` — are the other sliders' ranges universal? `VMETA` assumes fixed limits for all of them
- [ ] `R5` — what happens at the boundary: clamp, refuse, or round?

## Gearing — the tables still invented

- [ ] `G4` — default ratios for **4, 5, 6, 8, 9 and 10 gears**. `SPREAD[7]` is measured; the other six are house tables and they feed real per-gear speeds. The gate is open now, so these generalise. Restore the default tune first
- [ ] `G5` — the speed constant on a second and third car. `k = axis × fit × topRatio` is pure kinematics so it *should* generalise, but "should" is how tier-4 constants are born

## Balance — the third car and the coefficients

Structure is solved and confirmed on two cars. What is left is generality and
the shape of the spring term.

- [ ] A third car for the Mechanical Balance structure *(also queued in `MEAS-1`)*
- [ ] The GR86 coefficients `0.150 / 50.5 / 72.3` are a **local linearisation** over the 1.85× window they were fitted in. The linear spring term is falsified; `(1−MB)/MB` is linear in `spF^p` for `p ∈ [0.45, 0.61]`. Deciding between p = 0.5 and its neighbours needs a car swept to the slider stops
- [ ] The Aero Balance body terms ≈175/215 are a **point estimate the data does not support** — a two-decimal readout pins the front term only to roughly 85–360 lb. A second car is owed, not optional
- [ ] `T6` — the MB **target band**. Solving the function says how to hit any band, not which band is fast. Now a one-variable test

## Telemetry and driving

The only group that genuinely needs laps. Fixed route, best-of-5, all five runs
recorded, anything inside the spread of those five is **no result**.

- [ ] `T1` — tire pressure against steady-state tire temperature, per compound
- [ ] `T2` — camber against inner/middle/outer contact-patch temperature
- [ ] `T3` — diff lock against per-wheel speed difference on a fixed corner exit
- [ ] `T4` — damping. The one group with no readout anywhere; lap times only
- [ ] `T5` — loose-surface `vFrac` for dirt and cross-country
- [ ] `V3` — the blind test on three cars used nowhere in fitting. The only case that can detect overfitting

## The game default beats our tune

The most important unresolved result in the programme, and it points at the app
rather than at the measurements.

- [ ] The game's **default tune wins 5 of 6 panel columns**, braking by 8% — 5.2 ft on 60-0. Measured on one car; needs a second before it is general
- [ ] If it holds on a second car, the question stops being "which column" and becomes which formula. Braking is the obvious suspect and also the cheapest to test — `S4` measures it directly

## Known debt

Recorded so it is not rediscovered. None of it changes a number the app prints.

- [ ] **File:line citations across the docs are stale** — `index.html` grew ~110 lines on 2026-08-12, so references are off by +29 to +105. The durable fix is to cite identifiers rather than line numbers
- [ ] **`status.js` counts per file stem, not per case.** It says so in its own output now, but `P1` still reports data from a parts fixture holding no gating matrix
- [ ] **`TESTS.md` retires `M5`/`M6` on the premise the model is linear**, which is now false. The **bar** term has never been stressed the way the spring term was — a real open question wearing a "retired" label
- [ ] `stress.test.js` still sweeps a `+4` tire width that shipped and was withdrawn
- [ ] The roster lists `SAT-F-high` as a 2018 Civic at ~62% front; the car actually measured is a 2023 at 57%, which lands in the CORE-1 band instead

## GitHub repo files

`BACKLOG.md` C. `.gitattributes` is done. Nothing here changes app behaviour.

- [ ] **`.github/workflows/test.yml`** — the highest-value one left. The suite is a single dependency-free `node tests/run.js` that exits non-zero; CI is ~10 lines. The run-the-tests-before-and-after discipline currently depends on remembering
- [ ] **`LICENSE`** — `package.json` says `UNLICENSED` on a public repo, so the current state is all-rights-reserved by default. A legitimate choice, but it should be explicit
- [ ] **`.github/ISSUE_TEMPLATE/calibration.yml`** — should mirror the fixture schema field-for-field so a filed report transcribes into a fixture mechanically
- [ ] `.github/ISSUE_TEMPLATE/bug.yml` plus `config.yml` with `blank_issues_enabled: false`
- [ ] `.github/pull_request_template.md` — three checkboxes matching the rules already in CLAUDE.md
- [ ] `SECURITY.md` and `.editorconfig` — two minutes each
- [ ] Confirm Pages is the branch-based deploy (no `.github/` exists, so it must be) and decide whether a red build should be able to publish

## Generative test plan

`BACKLOG.md` B. Structural cover is good; calibration cover only exists where a
fixture exists.

- [ ] Layer 0/1 — a seeded generator with a shrinker, and the per-subsystem invariants. Build the field list from `FIELDS`, not by hand
- [ ] Layer 2 — the per-discipline signature matrix, as contrast tests rather than absolute numbers
- [ ] Layer 3 — golden snapshots, labelled a drift detector rather than a correctness check, and preserving `null` versus `0`
- [ ] Layer 4/5 — the real-car corpus with expectation columns left empty and marked `unverified` until a measurement fills them

## Discipline naming and circuit vs sprint

`BACKLOG.md` D. **Step one is a screen check, not an edit.**

- [ ] Transcribe the real event-family names off the screen. Tire compounds are a separate vocabulary and may legitimately differ — confirm both lists separately
- [ ] Rename display labels only. `DISC[x].n` is presentation and nothing keys off it
- [ ] **Do not rename the internal keys** without a migration: `disc` is a stored field value in `fh6lib`, `fh6plan` **and** `fh6last`, and a renamed key reaches `compute()` as `DISC[undefined]` and throws
- [ ] Decide circuit vs sprint — a discipline, or an orthogonal layout modifier. Ship it measured or as a documented no-op, never as a multiplier that felt right

## Library cull, then two tunes per keeper

`BACKLOG.md` F. Deletes are unrecoverable — localStorage, one device, no undo.

- [ ] Do `FAM-1`'s naming rule **first**. The cull merges names, and a family looks exactly like a typo pair to that heuristic
- [ ] Normalise name-variant and year-variant collisions; keep same-car-different-class/discipline entries
- [ ] Give `fh6plan` rows a two-tap Delete. Library builds have one; starting points have no delete path at all, so a cull can currently only remove half the store
- [ ] Then two meaningfully different saved builds per keeper, differing on discipline or class

## Nameplate families — many builds, never a best

`BACKLOG.md` G. The app already refuses to rank; most of the work is not
regressing that.

- [ ] Settle the remaining family substrings — the GT-Rs are answered (`gt-r`, hyphenated); the Subarus are not
- [ ] Hold the guard: `peers` is insertion-ordered on purpose, and the "(your own data, not a rule)" line is the whole no-best-picking policy. The app lists, it does not order

## The garage rosters

`BACKLOG.md` G6 and G7.

- [ ] **Mitsubishis** — 13 builds across 7 cars, allocation proposed. Every copy of a version needs a distinct (class, discipline) pair or the second silently overwrites the first
- [ ] **GT-Rs** — fill the version list and copy counts off the garage. The scaffolding rows are from prior Forza titles, not an FH6 reading
- [ ] Check the R35 sub-variants — NISMO, Black, Track, Forza Editions. Each is a distinct car if the game lists it separately, exactly as the Evo VIII MR Forza Edition turned out to be
- [ ] Decide whether the whole roster gets built or whether it is a standing list. Thirty-odd builds across the two families is a lot of shopping

## Finish the repo rename

- [ ] Rename the repo on GitHub: `tune-goon` → `forza-tune-goon`. Code, docs, manifest and `package.json` all already say the new name; only the remote does not
- [ ] `git remote set-url origin https://github.com/bston97/forza-tune-goon.git` on both machines
- [ ] Confirm Pages republished at the new URL
- [ ] Re-add the PWA on the phone — the site moves origin path, so the old install is a different scope and keeps serving the old shell. Saved builds are keyed to the old origin and **will not follow**
