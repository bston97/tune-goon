# Session sheet — gearing first

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
