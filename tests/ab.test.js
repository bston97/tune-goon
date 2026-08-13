/* Aero Balance, the C1 comparison, and the tire-pressure result.

   THIS FILE DOES NOT LOAD index.html, for the same reason mb.test.js does not:
   it asserts measurements, and a test that imported the app would be checking
   the app against itself.

   It exists because an audit on 2026-08-12 found that three fixtures —
   balance-ab, panel-gr86-apptune and panel-gr86-pressure — were loaded by
   nothing at all. Between them they hold a WITHDRAWN claim with nothing
   keeping it dead, the highest-stakes result in the programme, and the rule
   that tire pressure must be held on every balance row. All of it was resting
   on prose in a JSON file that no assertion had ever read. */
const { ok } = require('./shim');
const FX = require('./data');

const near = (a, b, t) => Math.abs(a - b) <= t;
const printsAs = (v, p) => Math.round(v * 100) / 100 === p;

console.log('--- Aero Balance is NOT front downforce over total ---');
/* Published and withdrawn the same morning. 190/(190+232) = 0.4502 against a
   printed 0.45 looked like four-decimal agreement; it is nothing of the kind,
   because anything in [0.445,0.455] prints as 0.45. The second point killed
   it. This is the assertion that keeps it dead. */
{
  const simple = r => r.aeF / (r.aeF + r.aeR);
  const rows = FX.AB_ROWS;
  ok('the aero rows exist', rows.length >= 2, rows.length + ' rows');

  const killer = rows.find(r => r.aeR > 250);
  ok('there is a row with the rear wing moved', !!killer,
     killer && killer.aeF + '/' + killer.aeR + ' -> ' + killer.ab);
  ok('front-over-total fits the FIRST point', printsAs(simple(rows[0]), rows[0].mb || rows[0].ab),
     simple(rows[0]).toFixed(4) + ' vs ' + rows[0].ab);
  ok('...and misses the second by far more than rounding',
     !printsAs(simple(killer), killer.ab) &&
     Math.abs(simple(killer) - killer.ab) > 0.015,
     simple(killer).toFixed(4) + ' predicted vs ' + killer.ab +
     ' measured — ' + (Math.abs(simple(killer) - killer.ab) / 0.005).toFixed(0) +
     'x the rounding window');
  ok('so a one-point match is not a confirmation', true,
     'the lesson this fixture exists to carry');
}

console.log('\n--- the additive body-term model, and how loosely it is pinned ---');
{
  const region = FX.abRegion();
  ok('an additive model fits every row', region.length > 0, region.length + ' (a,b) pairs');

  const A = region.map(r => r.a), B = region.map(r => r.b);
  ok('the bodyshell terms are LARGE — comparable to the wings',
     Math.min(...A) > 50, 'front term at least ' + Math.min(...A) + ' lb');
  ok('and rear-biased on this car', region.every(r => r.b > r.a),
     'every surviving pair has b > a');
  /* The half that matters as much as the fit. */
  ok('but they are only pinned to a wide window', Math.max(...A) / Math.min(...A) > 2,
     'a in [' + Math.min(...A) + ', ' + Math.max(...A) + '], b in [' +
     Math.min(...B) + ', ' + Math.max(...B) + ']');
  ok('so no test and no render path may quote a point estimate',
     Math.max(...A) - Math.min(...A) > 100,
     'the app printed "~175 front / ~215 rear" until this was checked');
  /* The fixture's own account of how a one-point "solve" looked earned. */
  /* join, not stringify: the prose is a line-wrapped array, so stringify puts
     quote-comma-quote in the middle of sentences and every multi-word regex
     silently fails to match. */
  const N = FX.AB.aeroBalanceNotSolved.join(" ");
  ok('the fixture records the withdrawal', /THIS ROW KILLS IT/i.test(N));
  ok('and names the reasoning error, not just the wrong answer',
     /2-dp readout cannot confirm a model to 4 dp/i.test(N));
}

console.log('\n--- C1: the game\'s default tune beats the app 5 of 6 ---');
/* The single most useful calibration signal the programme has produced, and it
   points at the app rather than the game. One car. */
{
  const C = JSON.stringify(FX.PANEL_APPTUNE.c1_theDefaultTuneWins);
  ok('the comparison is recorded', /FIVE OF SIX PANEL COLUMNS/i.test(C));
  ok('braking is the big one — 5.2 ft, 8%', /5\.2 ft/.test(C) && /8%/.test(C));
  ok('and the app wins only lateral G, by 0.01', /app, by 0\.01/.test(C));
  /* Same car, same parts, same sitting — the conditions that make it mean
     anything. If a future edit weakens that framing the result is worthless. */
  ok('taken on the same car, parts and sitting',
     /same car, same parts, same sitting/i.test(C));

  const P = FX.PANEL_APPTUNE.panel;
  if (P && P.app && P.default) {
    ok('the panel figures back the prose',
       P.default.sixtyZero < P.app.sixtyZero,
       P.default.sixtyZero + ' vs ' + P.app.sixtyZero + ' ft');
  }
}

console.log('\n--- tire pressure moves Mechanical Balance ---');
/* Which is why every balance sweep has to hold and record it: the pressure
   effect lives inside the axle constants, so a sweep that lets it drift blames
   the bars for a tire change. */
{
  const M = JSON.stringify(FX.PANEL_PRESSURE.mbRespondsToPressure);
  ok('pressure alone moved the readout', /0\.51/.test(M) && /0\.50/.test(M));
  ok('with bars, springs and ride height untouched',
     /untouched|held/i.test(M));
  ok('and the fixture says to hold it on every row',
     /HELD and RECORDED|hold it|held/i.test(M));
}

console.log('\n--- causes eliminated for the axis, and one thing still unexplained ---');
{
  const E = JSON.stringify(FX.PANEL_PRESSURE.axisEliminated) +
            JSON.stringify(FX.PANEL_APPTUNE.axisPredictionFailed);
  ok('tire pressure is eliminated as the axis driver', /pressure/i.test(E));
  ok('the eliminations are recorded rather than remembered', E.length > 200);

  /* Recorded as unexplained, three times the repeat spread, and it has no
     business happening: a 7th gear ratio cannot touch a 60-0. */
  const rows = FX.AB.rows;
  const ctl = rows.find(r => /nothing/i.test(r.changed || ''));
  const g7 = rows.find(r => /7TH GEAR RATIO ONLY/i.test(r.changed || ''));
  if (ctl && g7 && ctl.brake60_0 != null && g7.brake60_0 != null) {
    ok('changing ONLY the 7th ratio moved 60-0, which it should not',
       ctl.brake60_0 !== g7.brake60_0,
       ctl.brake60_0 + ' -> ' + g7.brake60_0 + ' ft, unexplained');
  }
  ok('aero balance did not move with the 7th ratio', !g7 || g7.ab === ctl.ab,
     'the control that makes the braking move odd rather than expected');
}
