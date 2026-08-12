/* Solver for the Mechanical / Aero Balance sweeps.
   ------------------------------------------------------------------
   Not a test — `run.js` only picks up *.test.js, so this never runs as part
   of the suite. Run it by hand against a measured fixture:

     node tests/fit-balance.js tests/data/balance-<car>-<date>.json

   WHY THIS EXISTS. Mechanical Balance is a live readout that responds to the
   sliders, which makes it the one part of the tune that can be solved outright
   rather than calibrated. But a sweep only tells you the answer if the readings
   were chosen to discriminate between candidate models — otherwise you get a
   curve that six different models all fit. This script holds the candidate
   models explicitly and reports which ones survive the data, so the sweep can
   be judged rather than eyeballed.

   THE TRICK THAT MAKES IT EASY. Every candidate is a share of the form
   MB = F/(F+R). Invert it:

       r = MB / (1 - MB) = F / R

   and the balance becomes a plain ratio of front to rear. Ratios linearise:
   if the slider is linear in rate then r is linear in the slider pair, and a
   log-residual fit is well behaved across the whole range instead of being
   dominated by the middle. Everything below works in r, never in MB. */

const fs = require('fs');
const path = require('path');

const file = process.argv[2];
if (!file) {
  console.log('usage: node tests/fit-balance.js <fixture.json>');
  process.exit(2);
}
const fx = JSON.parse(fs.readFileSync(path.resolve(file), 'utf8'));
const rows = (fx.rows || []).filter(r => r.mb != null || r.ab != null);
if (!rows.length) {
  console.log('No rows with a readout yet — fill in `mb` (or `ab`) and re-run.');
  process.exit(0);
}

const MODE = rows[0].mb != null ? 'mb' : 'ab';
const F = MODE === 'mb' ? 'arF' : 'aeF';
const R = MODE === 'mb' ? 'arR' : 'aeR';
const SF = MODE === 'mb' ? 'spF' : null;
const SR = MODE === 'mb' ? 'spR' : null;

console.log('=== ' + (MODE === 'mb' ? 'Mechanical' : 'Aero') + ' Balance — ' +
  (fx.car || '?') + ', ' + rows.length + ' rows ===\n');

/* ---------- the readings, converted to a front/rear ratio ---------- */
const obs = rows.map(row => {
  const v = row[MODE];
  return { row, v, r: v / (1 - v) };
});
console.log(F.padEnd(6) + R.padEnd(6) + (SF ? SF.padEnd(7) + SR.padEnd(7) : '') +
  MODE.toUpperCase().padEnd(8) + 'r = ' + MODE + '/(1-' + MODE + ')');
obs.forEach(o => console.log(
  String(o.row[F] ?? '-').padEnd(6) + String(o.row[R] ?? '-').padEnd(6) +
  (SF ? String(o.row[SF] ?? '-').padEnd(7) + String(o.row[SR] ?? '-').padEnd(7) : '') +
  o.v.toFixed(4).padEnd(8) + o.r.toFixed(4)));

/* ---------- candidate models ----------
   Each returns the predicted r for a row, given its free parameters. They are
   nested: M1 is M2 with k=0, M2 is M5 with c=0. So a lower model winning is
   meaningful (simpler explains it), and a higher model winning only counts if
   it beats the simpler one by more than reading noise. */
const MODELS = [
  { id: 'M1', name: 'pure ratio, linear slider        F/R',
    params: [], f: (row) => row[F] / row[R] },

  { id: 'M2', name: 'linear slider with offset        (F+k)/(R+k)',
    params: [{ name: 'k', lo: -20, hi: 60 }],
    f: (row, [k]) => (row[F] + k) / (row[R] + k) },

  { id: 'M3', name: 'power law                        (F/R)^p',
    params: [{ name: 'p', lo: 0.2, hi: 3 }],
    f: (row, [p]) => Math.pow(row[F] / row[R], p) },
];

if (MODE === 'mb') {
  MODELS.push(
    { id: 'M4', name: 'bars + springs                   (F+c*spF)/(R+c*spR)',
      params: [{ name: 'c', lo: 0, hi: 0.5 }],
      needs: ['spF', 'spR'],
      f: (row, [c]) => (row[F] + c * row.spF) / (row[R] + c * row.spR) },

    { id: 'M5', name: 'bars + springs + offset          (F+k+c*spF)/(R+k+c*spR)',
      params: [{ name: 'k', lo: -20, hi: 60 }, { name: 'c', lo: 0, hi: 0.5 }],
      needs: ['spF', 'spR'],
      f: (row, [k, c]) => (row[F] + k + c * row.spF) / (row[R] + k + c * row.spR) });
}

/* ---------- fit: coarse grid then refine, on log residuals ---------- */
const rms = (model, p) => {
  let s = 0, n = 0;
  for (const o of obs) {
    const pred = model.f(o.row, p);
    if (!isFinite(pred) || pred <= 0) return Infinity;
    s += Math.pow(Math.log(pred) - Math.log(o.r), 2); n++;
  }
  return n ? Math.sqrt(s / n) : Infinity;
};

function fit(model) {
  if (!model.params.length) return { p: [], err: rms(model, []) };
  let best = null;
  let ranges = model.params.map(q => [q.lo, q.hi]);
  for (let pass = 0; pass < 6; pass++) {
    const steps = 24;
    const grids = ranges.map(([lo, hi]) =>
      Array.from({ length: steps + 1 }, (_, i) => lo + (hi - lo) * i / steps));
    const walk = (ix, acc) => {
      if (ix === grids.length) {
        const e = rms(model, acc);
        if (!best || e < best.err) best = { p: acc.slice(), err: e };
        return;
      }
      for (const v of grids[ix]) walk(ix + 1, acc.concat(v));
    };
    walk(0, []);
    ranges = ranges.map(([lo, hi], j) => {
      const w = (hi - lo) / steps;
      return [best.p[j] - w, best.p[j] + w];
    });
  }
  return best;
}

console.log('\n--- candidate models, best fit, RMS of log residual ---');
console.log('(lower is better; nested models, so prefer the simplest inside noise)\n');

const results = [];
for (const m of MODELS) {
  if (m.needs && !m.needs.every(k => obs.every(o => isFinite(o.row[k])))) {
    console.log('  ' + m.id + '  ' + m.name + '\n        skipped — needs ' +
      m.needs.join(', ') + ' on every row');
    continue;
  }
  const r = fit(m);
  results.push({ m, ...r });
  const ps = m.params.map((q, j) => q.name + ' = ' + r.p[j].toFixed(4)).join(', ');
  console.log('  ' + m.id + '  ' + m.name);
  console.log('        RMS ' + r.err.toFixed(5) + (ps ? '   ' + ps : ''));
}

if (results.length) {
  results.sort((a, b) => a.err - b.err);
  const best = results[0];
  console.log('\n--- verdict ---');
  console.log('  best raw fit: ' + best.m.id + ' (RMS ' + best.err.toFixed(5) + ')');

  /* A model with more free parameters always fits at least as well, so raw RMS
     cannot choose. Occam, applied properly: among the models statistically
     indistinguishable from the best, take the one with the fewest parameters.
     NOISE is the floor set by the readout itself — MB prints to 2-3 dp, so
     ~0.01 in log-r is about as fine as a reading can justify. */
  const NOISE = 0.01;
  const within = results.filter(x => x.err <= best.err + NOISE);
  const pick = within.slice().sort((a, b) =>
    a.m.params.length - b.m.params.length || a.err - b.err)[0];

  console.log('  preferred:    ' + pick.m.id + ' — ' + pick.m.name);
  if (pick.m.params.length)
    console.log('                ' + pick.m.params
      .map((q, j) => q.name + ' = ' + pick.p[j].toFixed(4)).join(', '));
  if (pick.m.id !== best.m.id)
    console.log('                (' + best.m.id + ' fits better by only ' +
      (pick.err - best.err).toFixed(5) + ', inside reading noise — the extra ' +
      'parameter is not earning its place)');

  const beaten = results.filter(x => x.err > best.err + NOISE);
  if (beaten.length)
    console.log('  ruled out:    ' + beaten.map(x =>
      x.m.id + ' (RMS ' + x.err.toFixed(4) + ')').join(', '));
  if (!beaten.length)
    console.log('  ruled out:    nothing yet — every candidate still fits, so ' +
      'the sweep is not discriminating. Add the same-ratio pair and a ' +
      'springs-at-fixed-bars row.');

  console.log('\n--- per-row residuals for ' + pick.m.id + ' ---');
  obs.forEach(o => {
    const pred = pick.m.f(o.row, pick.p);
    const mbPred = pred / (1 + pred);
    console.log('  ' + F + ' ' + String(o.row[F]).padEnd(5) + R + ' ' +
      String(o.row[R]).padEnd(5) +
      'measured ' + o.v.toFixed(4) + '  predicted ' + mbPred.toFixed(4) +
      '  diff ' + (mbPred - o.v >= 0 ? '+' : '') + (mbPred - o.v).toFixed(4));
  });
}

/* ---------- the discriminating checks, called out by name ---------- */
console.log('\n--- discriminating checks ---');
const find = (f, r) => obs.find(o => o.row[F] === f && o.row[R] === r);

const sym = obs.filter(o => o.row[F] === o.row[R]);
if (sym.length) {
  sym.forEach(o => console.log('  equal sliders ' + o.row[F] + '/' + o.row[R] +
    ' → ' + MODE.toUpperCase() + ' ' + o.v.toFixed(4) +
    (Math.abs(o.v - 0.5) < 0.005
      ? '   symmetric: nothing but the bars is moving it'
      : '   NOT 0.5 — springs, track or an axle asymmetry is in there')));
} else {
  console.log('  no equal-slider row yet — that one reading is the cheapest ' +
    'test in the set');
}

/* Scale test: two rows with the same F:R ratio at different magnitudes. A pure
   ratio model predicts identical readouts; anything with an offset does not. */
const pairs = [];
for (let a = 0; a < obs.length; a++) for (let b = a + 1; b < obs.length; b++) {
  const x = obs[a].row, y = obs[b].row;
  if (!x[R] || !y[R]) continue;
  if (Math.abs(x[F] / x[R] - y[F] / y[R]) < 1e-9 && Math.abs(x[F] - y[F]) > 1e-9)
    pairs.push([obs[a], obs[b]]);
}
if (pairs.length) {
  pairs.forEach(([x, y]) => {
    const d = Math.abs(x.v - y.v);
    console.log('  same ratio, different magnitude: ' +
      x.row[F] + '/' + x.row[R] + ' → ' + x.v.toFixed(4) + '   vs   ' +
      y.row[F] + '/' + y.row[R] + ' → ' + y.v.toFixed(4) +
      (d < 0.005 ? '   pure ratio holds (M1)' : '   differs by ' + d.toFixed(4) +
        ' — there is an offset or an additive term (M2/M4/M5)'));
  });
} else {
  console.log('  no same-ratio pair yet — e.g. 20/40 and 40/80. Two readings, ' +
    'and they separate M1 from M2/M4/M5 on their own.');
}

if (MODE === 'mb') {
  const spVaried = new Set(obs.map(o => o.row.spF)).size > 1;
  const barsHeld = new Set(obs.map(o => o.row[F] + '|' + o.row[R])).size < obs.length;
  console.log('  springs ' + (spVaried && barsHeld
    ? 'were varied with bars held — M4/M5 are testable'
    : 'not yet varied at fixed bars — until then springs-in-MB is untested, ' +
      'and M4/M5 cannot be told from M1/M2'));
}
console.log('');
