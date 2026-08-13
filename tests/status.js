/* Measurement coverage reporter.
   ------------------------------------------------------------------
     node tests/status.js

   Not a test — `run.js` only collects *.test.js. This answers one question:
   which cases in TESTS.md have real numbers behind them, and which are still
   design. It counts filled versus empty readings in tests/data/ rather than
   trusting anyone's memory, because "is it all configured" is exactly the kind
   of claim that drifts from the truth between sessions.

   A template file (…-TEMPLATE.json) is scaffolding, not data — it is reported
   separately and never counted as coverage. */
const fs = require('fs');
const path = require('path');

const DIR = path.join(__dirname, 'data');

/* The catalogue, in TESTS.md order. `fixture` is the filename stem a real
   measurement would land in; null means nothing has been built for it yet. */
const CASES = [
  ['R1', 'Do the app spring rates fit the car slider range?', 'ranges'],
  ['R2', 'Does the part tier move the range or only unlock?', 'ranges'],
  ['R3', 'Are the other sliders universal?',                  'ranges'],
  ['R5', 'What happens at the boundary?',                     'ranges'],
  ['P1', 'The gating matrix (settles A1 + E4)',               'parts'],
  ['P2', 'Does a part change the stat block?',                'parts'],
  ['P3', 'What does tire compound buy?',                      'parts'],
  ['P4', 'What does tire width buy?',                         'parts'],
  ['P7', 'What does a full widebody conversion change?',      'parts'],
  ['G1', 'Axis maximum, read cold (settles E2)',              'gearing'],
  ['G4', 'SPREAD ratios for 4,5,6,8,9,10 gears',              null],
  ['G5', 'Speed constant on a second car',                    null],
  ['M1', 'Is MB 0.500 at equal bars?',                        'balance'],
  ['M2', 'Same-ratio pair — pure ratio or additive term?',    'balance'],
  ['M3', 'Do springs enter MB?',                              'balance'],
  ['M5', 'arF sweep — shape of the front term',               'balance'],
  ['M7', 'MB on three more cars — does the car enter?',       'balance'],
  ['M9', 'Split the Civic\'s lumped constants (2 spring rows)', 'balance'],
  ['A1', 'AB at equal sliders',                               'balance'],
  ['A3', 'Aero floor and ceiling — is the target reachable?', 'balance'],
  ['S0', 'The repeat check — this session\'s own noise floor', 'panel'],
  ['S1', 'What does Top Speed respond to?',                   'panel'],
  ['S2', '0-60 factor sweep',                                 'panel'],
  ['S3', 'Traction-limited or power-limited?',                'panel'],
  ['S4', 'Brake balance and pressure vs stopping distance',   'panel'],
  ['S5', 'Does lateral G respond to the tune?',               'panel'],
  ['S7', 'Caster: the game says 5.0, we say 6.5, forums 7.0', 'panel'],
  ['C1', 'Discipline signatures vs the default tune',         'panel'],
  ['D3', 'AWD centre split',                                  'panel'],
  ['T1', 'Tire pressure vs tire temperature',                 null],
  ['T2', 'Camber vs contact-patch temperature',               null],
  ['T3', 'Diff lock vs per-wheel speed',                      null],
  ['T6', 'The MB target band, once M is solved',              null],
  ['V3', 'Blind test on cars never used in fitting',          null],
];

/* Walk any nested structure and count leaves that look like a reading slot:
   null (empty) versus a number or non-empty string (filled). Keys starting
   with `_` are notes; PROVENANCE holds the "which car, which day" fields that
   describe a measurement rather than being one.

   Walk the WHOLE object, not just `rows`. The first version stopped at `rows`
   and reported the GR86 gearing fixture as complete while `readings.axisMax`
   — the single unresolved number the whole gear model hangs off, and the
   entire reason that file exists — sat null two levels down. A coverage
   report that misses the thing being waited on is worse than none. */
const PROVENANCE = new Set(['car', 'class', 'pi', 'date', 'screen', 'build',
  'held', 'baseline', 'notes', 'varied', 'case', 'readout', 'purpose',
  'changed', 'part', 'change', 'tune', 'name', 'id', 'options', 'prediction',
  'vmetaLo', 'vmetaHi', 'usedBy', 'impliedK', 'value']);

function count(node, out) {
  if (node == null) { out.empty++; return out; }
  if (Array.isArray(node)) { node.forEach(v => count(v, out)); return out; }
  if (typeof node === 'object') {
    for (const k of Object.keys(node)) {
      if (k.startsWith('_') || k.endsWith('Note') || PROVENANCE.has(k)) continue;
      count(node[k], out);
    }
    return out;
  }
  if (typeof node === 'string' && node.trim() === '') out.empty++;
  else out.filled++;
  return out;
}

const files = fs.existsSync(DIR)
  ? fs.readdirSync(DIR).filter(f => f.endsWith('.json')) : [];
const real = files.filter(f => !/TEMPLATE/i.test(f));
const templates = files.filter(f => /TEMPLATE/i.test(f));

const stems = {};
for (const f of real) {
  const stem = f.split('-')[0];
  const j = JSON.parse(fs.readFileSync(path.join(DIR, f), 'utf8'));
  const c = count(j, { filled: 0, empty: 0 });
  (stems[stem] = stems[stem] || []).push({ f, ...c });
}

console.log('\n=== measurement coverage ===\n');
console.log('  ' + 'case'.padEnd(6) + 'question'.padEnd(52) + 'status');
console.log('  ' + '-'.repeat(76));

let designed = 0, landing = 0, measured = 0;
for (const [id, q, stem] of CASES) {
  let status;
  if (!stem) { status = 'design only — no fixture built'; designed++; }
  else if (!stems[stem]) {
    status = 'template ready, no data (' + stem + '-*.json)'; landing++;
  } else {
    const tot = stems[stem].reduce((a, b) =>
      ({ filled: a.filled + b.filled, empty: a.empty + b.empty }),
      { filled: 0, empty: 0 });
    status = tot.filled + ' readings in ' + stems[stem].length + ' file(s)' +
      (tot.empty ? ', ' + tot.empty + ' still empty' : ', complete');
    measured++;
  }
  console.log('  ' + id.padEnd(6) + q.slice(0, 50).padEnd(52) + status);
}

console.log('\n  ' + '-'.repeat(76));
console.log('  ' + measured + ' case(s) with data · ' + landing +
  ' with somewhere to type · ' + designed + ' still design only');
console.log('\n  templates: ' + (templates.length ? templates.join(', ') : 'none'));
console.log('  measured:  ' + (real.length ? real.join(', ') : 'none') + '\n');

if (!measured)
  console.log('  Nothing has been measured yet. Every number in the app is ' +
    'still a house heuristic\n  or FH4-era carry-over — see CLAUDE.md\'s tier ' +
    'list. The suite being green proves\n  structure, not calibration.\n');
