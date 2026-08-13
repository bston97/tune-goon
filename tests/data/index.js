/* Loader for measured fixtures.
   ------------------------------------------------------------------
   Rule from BACKLOG.md's promotion order: a measurement becomes a fixture
   file FIRST, then a test asserts the fixture independently of compute(),
   and only then may compute() change. This module is the "load the fixture"
   step, shared so two test files can never again carry two different values
   for the same reading — which is exactly the defect E2 recorded.

   THE AXIS MAXIMUM IS NOT A MEASUREMENT. It used to be treated as one here:
   an axis(fallback, who) helper returned the caller's historical literal and
   printed an UNRESOLVED notice until someone re-read the number and settled
   whether 157 or 159 was the typo.

   Neither was. Resolved 2026-08-12 — see BACKLOG.md E2 and
   gearing-gr86-fit-apptune-2026-08-12.json. The axis is the chart's scale and
   the fit is the final drive at which the top gear reaches the end of it, so
   when the axis moves the fit moves to compensate and

       k = axisMax * fit * topRatio

   is conserved. Measured k across two builds, three tunes and BOTH axis
   readings spans 588.1 to 590.7 — 0.44%. The old helper could not express
   that, because it assumed the axis was a single global truth that one file
   had got wrong.

   So this module exposes TRIPLES, never a bare axis. A caller asks for a
   measured (axis, fit, topRatio) and the k it implies. Anything that wants
   "the constant" asks for k. If a future test finds itself reaching for an
   axis on its own, that is the bug this rewrite exists to prevent. */
const fs = require('fs');
const path = require('path');

const load = name => JSON.parse(
  fs.readFileSync(path.join(__dirname, name + '.json'), 'utf8'));

/* Every gearing fixture on the reference car. Kept named rather than globbed
   so a new file has to be wired in deliberately, with a human deciding what
   it is evidence of. */
const JULY    = load('gearing-gr86-2026-07-31');
const AUG     = load('gearing-gr86-2026-08-12');
const AUG_DEF = load('gearing-gr86-defaulttune-2026-08-12');
const AUG_FIT = load('gearing-gr86-fit-apptune-2026-08-12');

/* The MB sweep and its solve. */
const MB      = load('balance-mb-gr86-2026-08-12');
const MB_PAIR = load('balance-mb-solved-gr86-2026-08-12');
const DEFTUNE = load('balance-gr86-default-2026-08-12');

/* ---------------------------------------------------------------------------
   Gearing: measured (axis, fit, topRatio) triples.

   `topRatio` is the top gear of the gearbox that was ACTUALLY FITTED when the
   fit was swept — not whatever SPREAD says the car should have. That
   distinction is the whole point: the app builds k from SPREAD's top ratio
   while the user reads the fit on the game's gearbox, which is why its k comes
   out 3.8% low.
   ------------------------------------------------------------------------ */
const TRIPLES = [
  { who: 'july build, axis 157',
    axis: 157, fit: JULY.readings.fit, topRatio: JULY.held.ratios[JULY.held.ratios.length - 1],
    note: "July's other build. The axis was recorded twice for this sitting, 157 and 159; " +
          'both are real and the fit is what pairs with them.' },
  { who: "2026-08-12, app's old tune",
    axis: 157, fit: AUG.readings.fit, topRatio: AUG.held.ratios[AUG.held.ratios.length - 1],
    note: 'A completely different build — AWD swap, 472 lb lighter, 60 hp down.' },
  /* This fixture holds the axis and the ratios under `held`, because they were
     the conditions the final drive was swept against rather than the readings
     taken. `fit` is null in it on purpose — Boston swept 4.51/4.52/4.53 and did
     not say which he judged as just touching, so all three are carried. */
  { who: "2026-08-12, app's tune, fd 4.51",
    axis: AUG_FIT.held.axisMax, fit: 4.51,
    topRatio: AUG_FIT.held.ratios[AUG_FIT.held.ratios.length - 1] },
  { who: "2026-08-12, app's tune, fd 4.52",
    axis: AUG_FIT.held.axisMax, fit: 4.52,
    topRatio: AUG_FIT.held.ratios[AUG_FIT.held.ratios.length - 1] },
  { who: "2026-08-12, app's tune, fd 4.53",
    axis: AUG_FIT.held.axisMax, fit: 4.53,
    topRatio: AUG_FIT.held.ratios[AUG_FIT.held.ratios.length - 1] }
];

/* k for one triple. The only sanctioned way to get the speed constant. */
const kOf = t => t.axis * t.fit * t.topRatio;

/* Every measured k, for invariance assertions. */
const allK = () => TRIPLES.map(kOf);

/* The reference constant: the mean of everything measured on this car. Tests
   that need "the" k use this rather than any single reading, because no single
   reading is privileged — that was the E2 mistake in miniature. */
const K = () => {
  const ks = allK();
  return ks.reduce((a, b) => a + b, 0) / ks.length;
};

/* The game's own default ratios, measured — NOT SPREAD's. Any test that wants
   to know what a real FH6 race box looks like reads this. */
const DEFAULT_RATIOS = AUG_DEF.held.ratios;
const DEFAULT_FD = AUG_DEF.held.fd;

/* ---------------------------------------------------------------------------
   Mechanical Balance: the solved model and every row it was tested against.

   Coefficients are the GR86's and do not transfer; the structure should,
   because it is roll stiffness. Both facts are asserted in mb.test.js.
   ------------------------------------------------------------------------ */
const MB_MODEL = { ws: 0.150, tF: 50.5, tR: 72.3 };

/* MB = R/(F+R) — the REAR axle's share. Every candidate model in MEASURE.md
   Phase 1 was written front-over-total and the whole list was inverted. */
function mbOf({ arF, arR, spF, spR }, m = MB_MODEL) {
  const F = arF + m.ws * spF + m.tF;
  const R = arR + m.ws * spR + m.tR;
  return R / (F + R);
}

/* Every (setting, printed readout) pair measured on the reference car,
   gathered from the two sweep fixtures plus the two whole-tune rows the model
   was NOT fitted to. `fitted` marks which is which — an out-of-sample row is
   the only kind that can falsify anything. */
const MB_ROWS = [
  ...MB.rows.filter(r => r.mb != null).map(r => ({
    arF: r.arF, arR: r.arR, spF: r.spF, spR: r.spR, mb: r.mb, fitted: true,
    who: 'mb sweep row ' + r.n
  })),
  ...MB_PAIR.rows.filter(r => r.mb != null).map(r => ({
    arF: r.arF, arR: r.arR, spF: MB_PAIR.held.spF, spR: MB_PAIR.held.spR,
    mb: r.mb, fitted: true, who: 'same-ratio pair row ' + r.n
  })),
  { arF: 31.30, arR: 30.10, spF: 468.1, spR: 374.9, mb: 0.51, fitted: false,
    who: "the app's own tune" },
  { arF: DEFTUNE.defaultTune.arF, arR: DEFTUNE.defaultTune.arR,
    spF: DEFTUNE.defaultTune.spF, spR: DEFTUNE.defaultTune.spR,
    mb: DEFTUNE.readouts.mechBalance, fitted: false,
    who: "the game's default tune (different ride height and pressure)" }
];

/* ---------------------------------------------------------------------------
   The second car. Springs are held on every row, so the spring term and the
   axle constant cannot be separated — they lump into one per-axle constant:

       F = arF + A       R = arR + B       MB = R/(F+R)

   Which means this car gets `lumpedMb`, not `mbOf`. Keeping them as different
   functions is deliberate: reaching for mbOf here would silently import the
   GR86's coefficients into a car they are known not to fit.
   ------------------------------------------------------------------------ */
const CIVIC = load('balance-civic-default-2026-08-12');

const lumpedMb = ({ arF, arR }, { A, B }) => (arR + B) / (arF + A + arR + B);

const CIVIC_ROWS = CIVIC.rows.filter(r => r.mb != null).map(r => ({
  arF: r.arF, arR: r.arR, mb: r.mb, panel: r.panel,
  /* Row 0 is the game's default bars, read before the sweep and fitted to
     nothing. It is the only row here capable of falsifying a solve. */
  fitted: r.n !== 0,
  who: r.n === 0 ? "the game's default bars" : 'bar row ' + r.n
}));

/* Every (A,B) on a 0.5 grid that reproduces all four printed readouts. The
   region is a narrow diagonal band: the SCALE is loose, the SHARE is pinned.
   Computed rather than stored so the bound moves if a row is ever corrected. */
function civicRegion(rows = CIVIC_ROWS, step = 0.5) {
  const out = [];
  for (let A = 100; A <= 900; A += step)
    for (let B = 100; B <= 900; B += step)
      if (rows.every(r => Math.round(lumpedMb(r, { A, B }) * 100) / 100 === r.mb))
        out.push({ A, B, sum: A + B, share: A / (A + B) });
  return out;
}

module.exports = {
  JULY, AUG, AUG_DEF, AUG_FIT, MB, MB_PAIR, DEFTUNE,
  TRIPLES, kOf, allK, K,
  DEFAULT_RATIOS, DEFAULT_FD,
  MB_MODEL, mbOf, MB_ROWS,
  CIVIC, CIVIC_ROWS, lumpedMb, civicRegion,
  /* Back-compat shim: GR86 was the only export two test files used. */
  GR86: JULY
};
