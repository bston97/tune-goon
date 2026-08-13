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
   'structure should generalise because it is load transfer; the three ' +
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

console.log('\n--- M9: does the spring-to-bar exchange rate transfer? ---');
/* Two spring rows on the Civic at bars held 30/30, so ws, tF and tR can all
   float. The question is whether ws is a GAME constant — if it is, the model
   has two per-car unknowns instead of three and the app's two-reading
   calibration becomes exact rather than approximate. */
{
  const pred = FX.CIVIC.springRows.prediction.join(' ');
  ok('the prediction was written down before the reading',
     /STATED BEFORE THE READING/.test(pred));

  const S = FX.CIVIC.springRows.rows;
  const soft = S.find(r => r.spF < 600), stiff = S.find(r => r.spF > 800);
  ok('a softer front spring RAISES MB', soft.mb > 0.49, soft.spF + ' -> ' + soft.mb);
  ok('a stiffer front spring LOWERS it', stiff.mb < 0.49, stiff.spF + ' -> ' + stiff.mb);
  ok('both landed inside the predicted window',
     soft.mb >= 0.52 && soft.mb <= 0.53 && stiff.mb >= 0.45 && stiff.mb <= 0.46,
     soft.mb + ' and ' + stiff.mb);
  /* The spring slider moves in 0.5 steps, so the targets were not hit exactly
     and do not need to be — only recorded exactly. */
  ok('the recorded rates are what the screen showed, not what was asked for',
     soft.spF === 492.0 && stiff.spF === 914.0, soft.spF + ' / ' + stiff.spF);

  /* Over the +/-30% window the linear model still solves, and 0.150 is inside
     the resulting band. That was the answer until the extremes were taken. */
  const W = FX.wsWindow(FX.CIVIC_NARROW);
  const lo = Math.min(...W), hi = Math.max(...W);
  ok('inside a +/-30% spring window the linear model still solves', W.length > 0,
     'ws in [' + lo.toFixed(3) + ', ' + hi.toFixed(3) + ']');
  ok("and the GR86's 0.150 sits inside it", lo <= 0.150 && hi >= 0.150);
  ok('but never tightly enough to call settled', (hi - lo) / 0.150 > 0.15,
     'spans ' + ((hi - lo) / 0.150 * 100).toFixed(0) + '% of the value');
}

console.log('\n--- and then the extremes killed the linear spring term ---');
/* The wide sweep was taken to narrow the exchange rate and instead falsified
   the term it was measuring. At bars held 30/30 with the rear spring fixed,
   MB = R/(F+R) with F linear in spF REQUIRES (1-MB)/MB to be a straight line
   in spF — a test needing no knowledge of ws, tF or tR. */
{
  const all = FX.CIVIC_ALL.filter(r => r.arF === 30 && r.arR === 30);
  ok('there are five spring points at bars 30/30', all.length === 5, all.length);
  ok('spanning 5x rather than the 1.9x that fitted',
     Math.max(...all.map(r => r.spF)) / Math.min(...all.map(r => r.spF)) > 4.5,
     (Math.max(...all.map(r => r.spF)) / Math.min(...all.map(r => r.spF))).toFixed(2) + 'x');

  ok('no joint solve exists across the full span at all',
     FX.wsWindow(FX.CIVIC_ALL).length === 0);

  const P = FX.springExponents(all);
  ok('a sub-linear spring term does fit', P.length > 0,
     'p in [' + Math.min(...P).toFixed(2) + ', ' + Math.max(...P).toFixed(2) + ']');
  ok('and LINEAR is excluded outright', !P.includes(1),
     'p = 1 is not in the feasible set');
  ok('square root is allowed', P.includes(0.5),
     'suspension frequency goes as sqrt(k), which is the obvious reading');
  ok('but two-thirds is not, so it is not a free-for-all',
     !P.some(v => Math.abs(v - 0.67) < 0.005));

  /* Why nobody caught it: neither earlier data set had the lever to see it. */
  /* The comparison has to use the GR86's own bars-held rows, or it is not the
     same test — springExponents assumes the bars are constant down the column. */
  const grHeld = FX.MB_ROWS.filter(r => r.fitted && r.arF === 30 && r.arR === 30);
  const gr = grHeld.map(r => r.spF);
  ok("the GR86's bars-held springs only spanned 1.85x",
     Math.max(...gr) / Math.min(...gr) < 2,
     gr.slice().sort((a, b) => a - b).join(' / ') + '  = ' +
     (Math.max(...gr) / Math.min(...gr)).toFixed(2) + 'x');
  const grP = FX.springExponents(grHeld);
  ok('over which EVERY exponent fits, so it could not discriminate',
     grP.includes(1) && grP.includes(0.5) && grP.length > 10,
     grP.length + ' exponents from ' + Math.min(...grP) + ' to ' + Math.max(...grP));

  ok('so the solved model is a LOCAL linearisation, not a wrong one',
     /LOCAL LINEARISATION/.test(FX.CIVIC.theLinearSpringTermIsFALSIFIED.join(' ')));
  ok('and the fixture says so where tier 0 can find it',
     /FALSIFIED/.test(Object.keys(FX.CIVIC).join(' ')));
}

console.log('\n--- which is why the two-reading calibration was the right call ---');
/* C4 shipped a local-slope measurement rather than a per-car constant, for the
   wrong reason (coefficients vary by car). It survives for a better one: a
   local slope is what you measure on a curve. A shipped sensitivity NUMBER
   would have been invalidated by this sweep. */
ok('the app measures a local slope rather than quoting a constant',
   /two-reading calibration/.test(FX.CIVIC.whichVindicatesTheAppsGUIDANCE.join(' ')));

console.log('\n--- the false rejection that a coarse grid nearly produced ---');
/* An integer grid on tF/tR reported ws in [0.106, 0.148] and excluded 0.150.
   That was the grid stepping over a 7-point window, not a measurement. This
   asserts the exact method disagrees with the coarse one, so nobody
   reintroduces the shortcut. */
{
  const coarse = [];
  for (let ws = 0.02; ws <= 0.40; ws += 0.001) {
    let hit = false;
    for (let tF = -100; tF <= 400 && !hit; tF += 1)
      for (let tR = -100; tR <= 400 && !hit; tR += 1)
        if (FX.CIVIC_NARROW.every(r => Math.round(
          ((r.arR + ws * r.spR + tR) /
           (r.arF + ws * r.spF + tF + r.arR + ws * r.spR + tR)) * 100) / 100 === r.mb)) hit = true;
    if (hit) coarse.push(ws);
  }
  ok('the coarse grid really does exclude 0.150',
     !coarse.some(w => Math.abs(w - 0.150) < 0.0005),
     'top of its range ' + Math.max(...coarse).toFixed(3));
  ok('and the exact method does not', FX.tRwindow(FX.CIVIC_NARROW, 0.150, 113) !== null);
  ok('the near-miss is recorded rather than quietly corrected',
     /grid artifact/.test(FX.CIVIC.theFalseRejectionIAlmostPublished.join(' ')));
  ok('with the tell that should have caught it sooner',
     /resolution limit/.test(FX.CIVIC.theFalseRejectionIAlmostPublished.join(' ')));
}

console.log('\n--- P7: the CIVIC\'S kit is an aero part (see the withdrawal below) ---');
/* Preview only, from the same upgrade-screen A/B. The point of this block is
   the SHAPE of the change, not the magnitudes: grip that appears at 120 mph
   and barely at 60, paid for in straight-line speed, is downforce. */
{
  const W = FX.CIVIC.widebodyAB, b = W.baseline, w = W.widebody;
  ok('the kit was previewed, not bought', W.installed === false);
  ok('front % is recorded as unread rather than guessed', w.fw === null);

  const g60 = w.lateralG60 - b.lateralG60, g120 = w.lateralG120 - b.lateralG120;
  ok('lateral G rises', g60 > 0 && g120 > 0,
     '+' + g60.toFixed(2) + ' at 60, +' + g120.toFixed(2) + ' at 120');
  ok('and rises MUCH harder at 120 than at 60, which is downforce not track',
     g120 > g60 * 2, (g120 / g60).toFixed(1) + 'x');
  ok('aero balance shifts hard rearward', b.ab - w.ab > 0.10,
     b.ab + ' -> ' + w.ab);
  ok('and it is paid for in a straight line',
     w.zeroHundred > b.zeroHundred && w.topSpeed < b.topSpeed,
     ((w.zeroHundred - b.zeroHundred) * 60).toFixed(0) + ' frames on 0-100');
  ok('far too much loss for the weight it adds', w.wt - b.wt <= 5,
     '+' + (w.wt - b.wt) + ' lb cannot cost 52 frames — it is drag');
  ok('the fixture calls it a downforce kit', /downforce kit/i.test(
     W.itIsAnAEROPART.join(' ')));

  ok('and it COSTS PI rather than buying it', w.pi < b.pi,
     b.pi + ' -> ' + w.pi + ', a 17-point drop');

  /* The trap worth pinning: this looks like an M10 answer and is not. */
  ok('it is explicitly rejected as an M10 discriminator',
     /M10 STILL WANTS REAR TRACK WIDTH ALONE/i.test(
       W.notADiscriminatorForM10.join(' ')));
}

console.log('\n--- S5 sharpened: lateral G answers to parts, never to the tune ---');
{
  const tuneRows = FX.CIVIC_ALL.map(r => r.panel).filter(Boolean);
  ok('every tune row on this car reads the same lateral G',
     new Set(tuneRows.map(p => p.lateralG60)).size === 1 &&
     new Set(tuneRows.map(p => p.lateralG120)).size === 1,
     tuneRows.length + ' rows, all ' + tuneRows[0].lateralG60 + ' / ' + tuneRows[0].lateralG120);
  ok('spanning the spring slider end to end',
     Math.max(...FX.CIVIC_ALL.map(r => r.spF)) /
     Math.min(...FX.CIVIC_ALL.map(r => r.spF)) > 4.5);
  ok('yet a body kit moves it',
     FX.CIVIC.widebodyAB.widebody.lateralG120 !== tuneRows[0].lateralG120);
  ok('so the readout is responsive, just not to roll stiffness',
     /responds to PARTS and refuses to respond to the TUNE/.test(
       FX.CIVIC.widebodyAB.lateralGRespondsToPARTSButNotToTUNE.join(' ')));
}

console.log('\n--- M10 ANSWERED: Mechanical Balance is load transfer ---');
/* Three states of one car, one width step at each end. The direction alone
   settles it, and the direction is not rounding-dependent. */
{
  const S = FX.CIVIC.m10Answered.states;
  ok('widening the FRONT raises MB', S.bothUpgraded > S.stockFront,
     S.stockFront + ' -> ' + S.bothUpgraded);
  ok('widening the REAR lowers it', S.bothUpgraded < S.stockRear,
     S.stockRear + ' -> ' + S.bothUpgraded);

  /* Score the three candidate forms on sign alone. K is unknown but positive,
     so only the exponent on track matters for the direction. */
  const mb = (Kf, Kr, tf, tr, e) => (Kr * Math.pow(tr, e)) /
    (Kf * Math.pow(tf, e) + Kr * Math.pow(tr, e));
  const check = e => {
    const Kf = 1, Kr = 1, w = 1.084;
    const both = mb(Kf, Kr, w, w, e);
    return mb(Kf, Kr, 1, w, e) < both && mb(Kf, Kr, w, 1, e) > both;
  };
  ok('roll stiffness (track squared) gets both signs wrong', !check(2));
  ok('track linear also gets both signs wrong', !check(1));
  ok('load transfer (track divides) gets both right', check(-1),
     'MB is the rear share of lateral LOAD TRANSFER');

  ok('the fixture states which form survived',
     /REAR AXLE'S SHARE OF LATERAL LOAD TRANSFER/.test(
       FX.CIVIC.m10Answered.MECHANICAL_BALANCE_IS_LOAD_TRANSFER.join(' ')));
}

console.log('\n--- and the tidy 8.42-vs-8.36 agreement is refused ---');
/* One free number per axle — how much the step widens that track — and the two
   came out 8.42% and 8.36%. That is a coincidence of three roundings, and the
   repo has now made this exact error often enough to test against it. */
{
  const f = m => 1 / m - 1;
  const rng = m => [f(m + 0.005), f(m - 0.005)];
  const S = FX.CIVIC.m10Answered.states;
  const [bLo, bHi] = rng(S.bothUpgraded);
  const [sLo, sHi] = rng(S.stockFront);
  const [rLo, rHi] = rng(S.stockRear);
  const alpha = [sLo / bHi, sHi / bLo], beta = [bLo / rHi, bHi / rLo];

  ok('the two implied widening factors overlap, which is the real check',
     Math.min(alpha[1], beta[1]) > Math.max(alpha[0], beta[0]),
     'front [' + ((alpha[0] - 1) * 100).toFixed(1) + '%, ' + ((alpha[1] - 1) * 100).toFixed(1) +
     '%], rear [' + ((beta[0] - 1) * 100).toFixed(1) + '%, ' + ((beta[1] - 1) * 100).toFixed(1) + '%]');
  ok('but the window is far too wide to quote a figure', alpha[1] / alpha[0] > 1.05,
     'the data says 4-13%, not 8.4%');
  ok('so the fixture refuses the point estimate rather than printing it',
     /AND THAT AGREEMENT IS NOT REAL/.test(
       FX.CIVIC.m10Answered.theQuantitativeCheckAndItsLIMIT.join(' ')));
  ok('and says why the DIRECTIONS are safe when the magnitudes are not',
     /not rounding-dependent/.test(
       FX.CIVIC.m10Answered.theQuantitativeCheckAndItsLIMIT.join(' ')));
}

console.log('\n--- the upgrade preview shows the DEFAULT tune, not the live one ---');
/* Left open when the Civic's numbers matched neither its default nor its live
   tune. The GR86 baseline closes it three ways at once, which makes every
   upgrade-screen A/B comparable to a default-tune reading. */
{
  const P = require('./data/parts-gr86-2026-08-12.json');
  const D = FX.DEFTUNE.readouts;
  ok('preview Mech. Balance matches the default tune', P.baseline.mb === D.mechBalance,
     P.baseline.mb + ' vs ' + D.mechBalance);
  ok('preview Aero Balance matches', P.baseline.ab === D.aeroBalance);
  ok('preview Aero Efficiency matches', P.baseline.aeroEff === D.aeroEfficiency);
  /* And the live tune at the time was nothing like the default, so this is not
     a coincidence of the two happening to agree. */
  const live = FX.CIVIC_ALL.find(r => r.spF > 1500);
  ok('while the live tune was far from default', live && live.mb !== D.mechBalance,
     'the sweep was sitting at MB ' + live.mb);
  ok('the one-step Civic discrepancy is recorded, not explained away',
     /not explained and it is not being explained away/.test(
       P.thePreviewSHOWSTHEDEFAULTTUNE.join(' ')));
  /* The GR86 baseline is a row, not yet a measurement — the stock halves are
     what make it one. Pinned so a later session does not read it as complete. */
  ok('and the file says what is still owed', /Second car for M10/.test(
     P.stillNeeded.join(' ')));
}

console.log('\n--- M10 CONFIRMED on the second car, both directions ---');
{
  const P = require('./data/parts-gr86-2026-08-12.json');
  const T = P.trackWidthAB, C = FX.CIVIC.m10Answered.states;
  ok('GR86: widening the FRONT raises MB', T.installed.mb > T.stockFront.mb,
     T.stockFront.mb + ' -> ' + T.installed.mb);
  ok('GR86: widening the REAR lowers it', T.installed.mb < T.stockRear.mb,
     T.stockRear.mb + ' -> ' + T.installed.mb);
  ok('the same two signs as the Civic',
     (C.bothUpgraded > C.stockFront) === (T.installed.mb > T.stockFront.mb) &&
     (C.bothUpgraded < C.stockRear) === (T.installed.mb < T.stockRear.mb));
  ok('and the same magnitudes, +0.02 front and -0.02 rear on both cars',
     Math.abs((T.installed.mb - T.stockFront.mb) - (C.bothUpgraded - C.stockFront)) < 1e-9 &&
     Math.abs((T.installed.mb - T.stockRear.mb) - (C.bothUpgraded - C.stockRear)) < 1e-9);
  /* The control that makes it a width result rather than an aero one. */
  ok('aero balance and efficiency do not move on any width row',
     T.stockFront.ab === T.installed.ab && T.stockRear.ab === T.installed.ab &&
     T.stockFront.aeroEff === T.installed.aeroEff);
  ok('so MB is load transfer on two cars, not one',
     /rear axle's share of lateral LOAD TRANSFER/.test(P.m10CONFIRMED.join(' ')));
  ok('and the 8.4% point estimate is refused again',
     /NOT QUOTABLE/.test(P.m10CONFIRMED.join(' ')));
}

console.log('\n--- P7 withdrawn: the widebody is per-kit, not a kind of part ---');
/* Published one commit earlier off the Civic alone. The GR86 reverses every
   sign that mattered. */
{
  const P = require('./data/parts-gr86-2026-08-12.json');
  const g = P.widebody, gb = P.baseline;
  const c = FX.CIVIC.widebodyAB;

  ok('the Civic kit RAISES lateral G',
     c.widebody.lateralG120 > c.baseline.lateralG120);
  ok('the GR86 kit LOWERS it', g.lateralG120 < gb.lateralG120,
     gb.lateralG120 + ' -> ' + g.lateralG120);
  ok('the Civic kit swings aero balance hard',
     Math.abs(c.widebody.ab - c.baseline.ab) > 0.10);
  /* One printing step. The 1e-9 slack is float noise, not measurement slack —
     0.45 - 0.44 evaluates to 0.010000000000000009. */
  ok('the GR86 kit barely moves it', Math.abs(g.ab - gb.ab) <= 0.01 + 1e-9,
     gb.ab + ' -> ' + g.ab + ', one printing step against the Civic\'s seventeen');
  ok('so no general statement about widebodies survives',
     /no general statement about 'widebodies' to be made/.test(
       P.widebodyIsPerKit.join(' ')));
  ok('the earlier claim is withdrawn IN PLACE rather than deleted',
     /WITHDRAWN AS A GENERAL CLAIM/.test(c.itIsAnAEROPART.join(' ')) &&
     /downforce kit/.test(c.itIsAnAEROPART.join(' ')));
  /* The number that would explain it was not legible and was not invented. */
  ok('the GR86 weight is recorded unread, not guessed', g.wt === null && g.fw === null);
  ok('and the mechanism it would settle is stated as unconfirmed',
     /UNCONFIRMED/.test(P.widebodyIsPerKit.join(' ')));
}
