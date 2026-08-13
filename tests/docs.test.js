/* The documents are not allowed to teach a claim the measurements withdrew.

   This file exists because prose lagging the fixtures is THE recurring failure
   of this project. It has been caught twice by human review — a paragraph
   teaching a sensitivity figure the fixture had already corrected, and another
   still arguing a question that had been settled the same evening. Both were
   found by someone happening to look. This makes it automatic.

   The rule it enforces: a withdrawn claim may appear in a document ONLY inside
   a passage that marks it withdrawn. Deleting the claim is not required and is
   usually wrong — watching a sound argument fail is the lesson. What is
   forbidden is a document stating it as though it still held.

   Adding to this file is part of withdrawing a claim, not a separate chore. */
const fs = require('fs');
const path = require('path');
const { ok } = require('./shim');

const ROOT = path.join(__dirname, '..');
const DOCS = ['MODEL.md', 'CLAUDE.md', 'TESTS.md', 'MEASURE.md', 'BACKLOG.md'];
const text = f => fs.readFileSync(path.join(ROOT, f), 'utf8');

/* A claim is "live" in a document if it appears outside any withdrawal marker.
   Rather than parse structure, check whether the sentence containing it also
   carries one of the words this repo uses when it retires something. */
/* The vocabulary this repo actually uses when it retires something. Extend it
   when a new form shows up rather than working around it — a claim marked in
   words nobody listed reads as live to this checker and as dead to a human,
   which is the worst of both. */
const RETIRED = /withdraw|superseded|falsifi|discredit|retired|no longer|was wrong|not real|refused|corrected|answered|settled|overturn|inverted|CONTRADICTED|~~/i;

function liveMentions(doc, pattern, unless) {
  const src = text(doc);
  const hits = [];
  /* Split into blocks rather than lines, and read a block together with its
     NEIGHBOURS. This repo's convention puts the retirement notice either
     directly above the passage it governs (a "*** WITHDRAWN ***" header) or
     directly below it (an "> Answered" note), and both are separate
     paragraphs. Checking a block in isolation flags text a human would read as
     plainly marked. The cost is that a stale claim sitting next to an
     unrelated withdrawal is missed; that is the better error to make, because
     a checker nobody can satisfy gets deleted. */
  const blocks = src.split(/\n\s*\n/);
  blocks.forEach((block, i) => {
    if (!pattern.test(block)) return;
    const ctx = [blocks[i - 1], block, blocks[i + 1]].filter(Boolean).join('\n');
    if (RETIRED.test(ctx)) return;
    /* `unless` is for blocks that state the CORRECTED version — a document
       explaining what the old figure was replaced by necessarily contains the
       old wording, and forbidding that would forbid explaining the fix. */
    if (unless && unless.test(ctx)) return;
    hits.push(block.slice(0, 90).replace(/\n/g, ' '));
  });
  return hits;
}

/* Each entry: what was withdrawn, the pattern that would catch it being taught
   again, and the date it died. Keep the reason — a bare regex list rots. */
const WITHDRAWN = [
  { what: 'the linear-in-spring Mechanical Balance term',
    why: 'falsified over a 5x spring range; feasible exponents are 0.45-0.61 and p=1 is excluded',
    pattern: /linear in (?:the )?spring|spring term is linear/i,
    unless: /sub-linear|non-linear|not linear/i },

  { what: 'Mechanical Balance as a share of ROLL STIFFNESS',
    why: 'it is the rear share of lateral LOAD TRANSFER — track divides, confirmed on two cars',
    pattern: /share of roll stiffness/i },

  { what: '"the widebody is a downforce kit"',
    why: 'per-kit: the GR86 Rocket Bunny loses grip and 40 PI where the Civic kit gains grip',
    pattern: /widebody is (?:a |an )?(?:downforce|aero) (?:kit|part)/i },

  { what: 'SPREAD[7] as this app\'s invented ratio set',
    why: 'it is now the game\'s measured race box, 4.17 through 0.85 at fd 3.63',
    pattern: /2\.92\s*\/\s*2\.05\s*\/\s*1\.60/ },

  { what: 'the +/-0.5 ARB per 1% Mechanical Balance rule',
    why: 'out by roughly 10x; replaced with the two-reading calibration',
    pattern: /0\.5 ARB per 1%/i },

  { what: 'the 0.028-per-10-points MB sensitivity',
    why: 'arithmetic error; the model gives 0.0153 per 10 points and +27 rear bar',
    pattern: /0\.028 per 10/i },

  { what: 'the axis maximum as a single global truth',
    why: 'k = axis x fit x topRatio is the invariant; the axis alone is chart furniture',
    pattern: /157 (?:is|as) the (?:correct|right|real) (?:axis|reading)/i },

  { what: 'the aero sliders as a settable percentage',
    why: 'the game takes POUNDS and the two ends have different ranges',
    pattern: /% of range.{0,40}aero|aero.{0,40}% of range/i,
    unless: /% of travel|pounds|C3/i }
];

console.log('--- no document teaches a withdrawn claim ---');
WITHDRAWN.forEach(w => {
  const bad = [];
  DOCS.forEach(d => liveMentions(d, w.pattern, w.unless).forEach(b => bad.push(d + ': "' + b + '"')));
  ok('withdrawn — ' + w.what, bad.length === 0,
     bad.length ? bad.join('  |  ') + '   (' + w.why + ')' : undefined);
});

console.log('\n--- the working model exists and is wired in ---');
const model = text('MODEL.md');
ok('MODEL.md exists and is substantial', model.length > 4000, model.length + ' chars');
ok('CLAUDE.md points at it', /MODEL\.md/.test(text('CLAUDE.md')));
ok('it defines its confidence rungs', /MEASURED/.test(model) && /ASSUMED/.test(model) &&
   /HYPOTHESIS/.test(model) && /ONE CAR/.test(model));
ok('it says the fixtures win when they disagree',
   /the fixture wins/i.test(model));
ok('it carries the honest list of what is still assumed',
   /still ASSUMED/i.test(model));
/* The two things most likely to be acted on wrongly if they went stale. */
ok('it records MB as load transfer', /share of lateral LOAD TRANSFER/i.test(model));
ok('it records the widebody as per-kit', /PER-KIT/i.test(model));
ok('it flags Top Speed as contradicted and unrun',
   /CONTRADICTED/.test(model) && /S1/.test(model));
ok('it names the gating matrix as the top unmeasured risk',
   /gating matrix/i.test(model));

console.log('\n--- claims that must stay dead in the app itself ---');
const app = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
ok('no "% of range" on the aero sliders', !/aeF[^\n]*% of range/.test(app));
ok('no +/-0.5 ARB per 1% rule', !/ARB per 1% of shift/.test(app));
ok('nothing calls SPREAD the game\'s default ratios',
   !/game's default ratios/.test(app));
ok('the app still asks for the top ratio', /id="topratio"/.test(app));

console.log('\n--- the catalogue and the coverage report agree ---');
/* status.js has its own case list; TESTS.md is the catalogue. They drift. */
const status = fs.readFileSync(path.join(__dirname, 'status.js'), 'utf8');
const ids = [...status.matchAll(/\['([A-Z]\d+)',/g)].map(m => m[1]);
const tests = text('TESTS.md');
const missing = ids.filter(id => !new RegExp('\\b' + id + '\\b').test(tests));
ok('every case in status.js appears in TESTS.md', missing.length === 0,
   missing.join(', '));
ok('status.js carries a reasonable number of cases', ids.length > 25, ids.length + ' cases');
