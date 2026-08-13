/* Mechanical Balance — the solved model, asserted against the measurements.
   ------------------------------------------------------------------
   THIS FILE DELIBERATELY DOES NOT LOAD index.html. The promotion rule in
   BACKLOG.md is: fixture with provenance -> a test asserting it INDEPENDENTLY
   of compute() -> only then compute() changes. compute() does not yet know
   anything about this model; when it learns, this file is what it has to agree
   with, and a test that imported the app would only be checking the app
   against itself.

   Measured 2026-08-12 on a 2022 GR86 at A 700, one variable per row:

       MB = R / (F + R)
       F  = arF + 0.150 x spF + 50.5
       R  = arR + 0.150 x spR + 72.3

   Six settings, three free parameters, so it is overdetermined by three — and
   two further rows it was never fitted to. */
const fs = require('fs');
const path = require('path');
const { ok } = require('./shim');
const FX = require('./data');

const near = (a, b, t) => Math.abs(a - b) <= t;
/* The game prints MB to two decimals, so "matches" means it rounds to the same
   printed value. Nothing here may claim agreement to more digits than the
   screen shows — that mistake killed two conclusions on the day this was
   measured. */
const printsAs = (model, printed) => Math.round(model * 100) / 100 === printed;

console.log('--- the solved model against every measured row ---');
FX.MB_ROWS.forEach(r => {
  const m = FX.mbOf(r);
  const tag = r.fitted ? '' : '  [not fitted to]';
  ok('MB ' + r.who + tag, printsAs(m, r.mb) || (!r.fitted && near(m, r.mb, 0.015)),
     m.toFixed(4) + ' -> prints ' + (Math.round(m * 100) / 100).toFixed(2) +
     ', measured ' + r.mb.toFixed(2));
});

const fitted = FX.MB_ROWS.filter(r => r.fitted);
ok('six independent settings were fitted', fitted.length === 6, fitted.length + ' rows');
ok('every fitted row lands on the printed digit',
   fitted.every(r => printsAs(FX.mbOf(r), r.mb)));

console.log('\n--- out-of-sample: the rows the model never saw ---');
const outs = FX.MB_ROWS.filter(r => !r.fitted);
ok('there are out-of-sample rows at all', outs.length === 2,
   'a model with no degrees of freedom left has not been tested');
const app = outs.find(r => /app/.test(r.who));
ok("the app's own tune is an exact hit", printsAs(FX.mbOf(app), app.mb),
   FX.mbOf(app).toFixed(4) + ' vs ' + app.mb);
const def = outs.find(r => /default/.test(r.who));
ok("the game's default tune is within one rounding step", near(FX.mbOf(def), def.mb, 0.015),
   FX.mbOf(def).toFixed(4) + ' vs ' + def.mb +
   ' — the one row taken at a different ride height and pressure, both of which ' +
   'live inside the axle constants');

console.log('\n--- MB is the REAR share, which inverts every candidate model ---');
/* MEASURE.md Phase 1 listed five candidates and all five were written
   F/(F+R). The list was the right shape upside down. */
const base = { arF: 30, arR: 30, spF: 468.1, spR: 374.9 };
ok('stiffening the REAR bar raises MB',
   FX.mbOf(Object.assign({}, base, { arR: 50 })) > FX.mbOf(base),
   FX.mbOf(base).toFixed(3) + ' -> ' + FX.mbOf(Object.assign({}, base, { arR: 50 })).toFixed(3));
ok('stiffening the FRONT bar lowers it',
   FX.mbOf(Object.assign({}, base, { arF: 50 })) < FX.mbOf(base));
ok('stiffening the FRONT spring lowers it',
   FX.mbOf(Object.assign({}, base, { spF: 608.1 })) < FX.mbOf(base),
   '608 lb/in reads ' + FX.mbOf(Object.assign({}, base, { spF: 608.1 })).toFixed(3));
ok('softening the FRONT spring raises it',
   FX.mbOf(Object.assign({}, base, { spF: 328.1 })) > FX.mbOf(base));

console.log('\n--- models this data rules out, and must keep ruling out ---');
/* The same-ratio pair is the reading that did it: 20/40 and 32.5/65 hold the
   same 1:2 front-to-rear ratio at near-double magnitude. They print 0.54 and
   0.56, so MB depends on the SIZE of the bars and not only their ratio. */
const lo = FX.MB_ROWS.find(r => r.arF === 20 && r.arR === 40);
const hi = FX.MB_ROWS.find(r => r.arF === 32.5 && r.arR === 65);
ok('the same-ratio pair exists in the fixtures', !!lo && !!hi);
ok('...and the two readings differ', lo.mb !== hi.mb,
   '20/40 -> ' + lo.mb + ', 32.5/65 -> ' + hi.mb + ' at the same 1:2 ratio');
ok('so no pure-ratio model can fit', Math.abs(lo.mb - hi.mb) > 0.005,
   'any model of arF/arR alone predicts one value for both');

/* Bars-only and springs-only each nail one row and miss another, in opposite
   directions — which is exactly why two whole-tune snapshots could not choose
   between them and a one-variable sweep could. */
const barsOnly = r => r.arR / (r.arF + r.arR);
const springsOnly = r => r.spR / (r.spF + r.spR);
ok('bars-only is dead', fitted.some(r => !printsAs(barsOnly(r), r.mb)),
   'fails on ' + fitted.filter(r => !printsAs(barsOnly(r), r.mb)).length + ' of ' + fitted.length + ' rows');
ok('springs-only is dead', fitted.some(r => !printsAs(springsOnly(r), r.mb)),
   'fails on ' + fitted.filter(r => !printsAs(springsOnly(r), r.mb)).length + ' of ' + fitted.length + ' rows');

console.log('\n--- what the coefficients mean ---');
ok('one bar point is worth about 6.7 lb/in of spring',
   near(1 / FX.MB_MODEL.ws, 6.7, 0.3), (1 / FX.MB_MODEL.ws).toFixed(1) + ' lb/in');
ok('the axle constants are large', FX.MB_MODEL.tF + FX.MB_MODEL.tR > 100,
   'tF ' + FX.MB_MODEL.tF + ' + tR ' + FX.MB_MODEL.tR);
ok('and rear-biased', FX.MB_MODEL.tR > FX.MB_MODEL.tF,
   'which is why equal bars with a front-stiff spring pair still reads above 0.5');

console.log('\n--- the number the app will print, and the one it got wrong ---');
/* compute() used to say "+/-0.5 ARB per 1% of shift" in three places. The
   measured sensitivity is an order of magnitude away from that, so C4 replaced
   the rule with the two-reading calibration and quotes the figures below.
   Those render paths are asserted in modes.test.js and locked.test.js; this
   file stays clear of index.html on purpose, since a test that imported the app
   would be checking the app against itself. */
const appTune = { arF: 31.30, arR: 30.10, spF: 468.1, spR: 374.9 };
const per10 = FX.mbOf(Object.assign({}, appTune, { arR: appTune.arR + 10 })) - FX.mbOf(appTune);
ok('sensitivity is about 0.0153 of MB per 10 points of rear bar',
   near(per10, 0.0153, 0.001), per10.toFixed(4) + ' per 10 points');

/* Solve for the rear bar that lands on the bottom of the app's own target
   band, which its own tune misses. */
let needed = appTune.arR;
while (FX.mbOf(Object.assign({}, appTune, { arR: needed })) < 0.55 && needed < 500) needed += 0.1;
const delta = needed - appTune.arR;
ok('closing the 0.51 -> 0.55 gap needs about +27 rear bar, not +2',
   near(delta, 27, 2), '+' + delta.toFixed(1) + ' rear');
ok('...which the ARB slider can actually reach', needed <= 65,
   'lands at ' + needed.toFixed(1) + ' against a measured maximum of 65');

console.log('\n--- the fixture carries the corrected arithmetic, not the first guess ---');
/* An earlier version of the fixture said 0.028 per 10 points and +14 rear.
   Both were eyeballed off two rows while the solved model sat directly above
   them. A user following +14 would have stopped at about 0.53 believing they
   had complied. */
const src = fs.readFileSync(
  path.join(__dirname, 'data', 'balance-mb-solved-gr86-2026-08-12.json'), 'utf8');
ok('the corrected per-10 figure is recorded', /0\.0153 per 10 points/.test(src));
ok('the corrected bar delta is recorded', /\+27 rear bar/.test(src));
ok('and the error is recorded rather than quietly fixed',
   /CORRECTED 2026-08-12/.test(src) && /\+14/.test(src));

console.log('\n--- what is still owed ---');
ok('the coefficients are one car and the fixture says so',
   /stillOwed/.test(src) && /second car/.test(src),
   'structure should generalise because it is roll stiffness; the three ' +
   'coefficients should not, because they are the car');

console.log('\n--- the second car: does the STRUCTURE hold? ---');
/* 2023 Civic Type R, A 700, AWD-swapped. The point of this block is that the
   GR86's coefficients are NOT used anywhere in it — this car gets its own
   lumped constants, because springs were held so the spring term and the axle
   constant cannot be separated. What is being tested is the FORM. */
{
  const R = FX.CIVIC_ROWS;
  const row = n => R.find(r => r.who === (n === 0 ? "the game's default bars" : 'bar row ' + n));

  ok('four rows measured on the second car', R.length === 4, R.length);

  /* Prediction 1, made before the data: equal bars will not read 0.500. */
  ok('equal bars do NOT read 0.500', row(1).mb !== 0.50, '30/30 reads ' + row(1).mb);

  /* Prediction 2, the one that kills every pure-ratio model. Identical 1:2 at
     near-double magnitude must give the SAME answer if MB is a pure ratio. */
  const pairA = row(2), pairB = row(3);
  ok('the same-ratio pair is genuinely the same ratio',
     Math.abs((pairA.arR / pairA.arF) - (pairB.arR / pairB.arF)) < 0.01,
     pairA.arR / pairA.arF + ' vs ' + pairB.arR / pairB.arF);
  ok('and it SPLITS, so a pure ratio is dead here too', pairA.mb !== pairB.mb,
     pairA.mb + ' vs ' + pairB.mb);
  ok('at near-double magnitude', pairB.arR / pairA.arR > 1.5,
     (pairB.arR / pairA.arR).toFixed(2) + 'x');

  /* Prediction 3: the direction that inverted every candidate model. This car
     is stiffer at the FRONT on both bar and spring, so a REAR-share model
     requires it to read below 0.5. */
  const d = FX.CIVIC.defaultTune;
  ok('the car is front-stiffer at both bar and spring',
     d.arF > d.arR && d.spF > d.spR, d.arF + '/' + d.arR + '  ' + d.spF + '/' + d.spR);
  ok('and it reads BELOW 0.5, as a rear-share model requires', row(0).mb < 0.50,
     row(0).mb);
}

console.log('\n--- what the readout pins, and what it does not ---');
{
  const region = FX.civicRegion();
  ok('a consistent lumped solve exists at all', region.length > 0, region.length + ' (A,B) pairs');

  const shares = region.map(r => r.share), sums = region.map(r => r.sum);
  const sSpread = Math.max(...shares) - Math.min(...shares);
  const mSpread = Math.max(...sums) / Math.min(...sums) - 1;

  /* The whole lesson of the two-decimal problem in one pair of assertions. */
  ok('the SHARE is pinned tight', sSpread < 0.005,
     Math.min(...shares).toFixed(4) + ' .. ' + Math.max(...shares).toFixed(4));
  ok('the SCALE is not', mSpread > 0.20,
     'A+B spans ' + Math.min(...sums) + ' .. ' + Math.max(...sums) +
     ', ' + (mSpread * 100).toFixed(0) + '%');
  ok('so a single (A,B) pair would be quoting noise', region.length > 50);

  /* Two cars, both sitting below their own front weight distribution. */
  const civicShare = shares.reduce((a, b) => a + b, 0) / shares.length;
  const gr86Share = (FX.MB_MODEL.ws * 468.1 + FX.MB_MODEL.tF) /
    (FX.MB_MODEL.ws * 468.1 + FX.MB_MODEL.tF + FX.MB_MODEL.ws * 374.9 + FX.MB_MODEL.tR);
  ok('the more front-heavy car has the higher front share',
     civicShare > gr86Share,
     'Civic ' + civicShare.toFixed(3) + ' at 57% front, GR86 ' +
     gr86Share.toFixed(3) + ' at 54%');
  ok('and both sit below their own front weight distribution',
     civicShare < 0.57 && gr86Share < 0.54,
     'by ' + ((0.57 - civicShare) * 100).toFixed(1) + ' and ' +
     ((0.54 - gr86Share) * 100).toFixed(1) + ' points');
}

console.log('\n--- the row nobody fitted to is the row that mattered ---');
/* Rows 1 and 2 are two equations in two unknowns and CANNOT fail. Row 3
   agreeing therefore looks like confirmation and is nearly free. The only row
   able to falsify anything was the default-bar reading, taken before the sweep
   started and fitted to nothing. */
{
  const tidy = { A: 225, B: 215 };   // the exact solve off rows 1 and 2 alone
  const fitted = FX.CIVIC_ROWS.filter(r => r.fitted);
  const free = FX.CIVIC_ROWS.find(r => !r.fitted);

  ok('exactly one row was left out of sample', 
     FX.CIVIC_ROWS.filter(r => !r.fitted).length === 1, free.who);
  ok('the tidy solve reproduces every fitted row',
     fitted.every(r => Math.round(FX.lumpedMb(r, tidy) * 100) / 100 === r.mb));
  ok('and misses the one it was not fitted to',
     Math.round(FX.lumpedMb(free, tidy) * 100) / 100 !== free.mb,
     'predicts ' + FX.lumpedMb(free, tidy).toFixed(4) + ', measured ' + free.mb);
  ok('the honest region excludes it',
     !FX.civicRegion().some(r => r.A === tidy.A && r.B === tidy.B));
}

console.log('\n--- bars move braking; they do not move grip ---');
{
  const P = FX.CIVIC_ROWS.map(r => r.panel).filter(Boolean);
  ok('every row carries panel figures', P.length === 4, P.length);
  const b60 = P.map(p => p.sixtyZero);
  ok('60-0 moves with the bars', Math.max(...b60) - Math.min(...b60) > 0.5,
     Math.min(...b60) + ' .. ' + Math.max(...b60) + ' ft');
  ok('by more than a rounding step on a 0.1 ft readout',
     (Math.max(...b60) / Math.min(...b60) - 1) > 0.01,
     ((Math.max(...b60) / Math.min(...b60) - 1) * 100).toFixed(1) + '%');
  /* Rows 1 and 2 carry the same TOTAL bar and still differ, so it is not
     simply total roll stiffness. Four points is not a model — this exists to
     stop S4 being run without holding the bars. */
  const r1 = FX.CIVIC_ROWS.find(r => r.who === 'bar row 1');
  const r2 = FX.CIVIC_ROWS.find(r => r.who === 'bar row 2');
  ok('same total bar, different braking — distribution matters',
     r1.arF + r1.arR === r2.arF + r2.arR && r1.panel.sixtyZero !== r2.panel.sixtyZero,
     'both total ' + (r1.arF + r1.arR) + ': ' + r1.panel.sixtyZero + ' vs ' + r2.panel.sixtyZero);
  ok('lateral G does not move at all, so S5 keeps its no',
     new Set(P.map(p => p.lateralG60)).size === 1 &&
     new Set(P.map(p => p.lateralG120)).size === 1,
     P[0].lateralG60 + ' / ' + P[0].lateralG120 + ' on every row');
}
