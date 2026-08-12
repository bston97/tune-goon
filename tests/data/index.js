/* Loader for measured fixtures.
   ------------------------------------------------------------------
   Rule from BACKLOG.md's promotion order: a measurement becomes a fixture
   file FIRST, then a test asserts the fixture independently of compute(),
   and only then may compute() change. This module is the "load the fixture"
   step, shared so two test files can never again carry two different values
   for the same reading — which is exactly the defect E2 records.

   THE AXIS MAXIMUM IS DELIBERATELY UNRESOLVED. `readings.axisMax` is null
   in the GR86 fixture because the number was read twice, 1.3% apart, and
   nobody knows which reading was the mistake. Until it is settled:

     - axis(fallback) returns the caller's own historical literal and prints
       one UNRESOLVED line, so the suite stays green and usable as a gate.
     - The moment `axisMax` is filled in, BOTH callers switch to it and
       whichever assertion was tuned to the other value fails loudly.

   That failure is the point. It is how the reading gets promoted into the
   code instead of sitting in a JSON file nobody read. */
const fs = require('fs');
const path = require('path');

const load = name => JSON.parse(
  fs.readFileSync(path.join(__dirname, name + '.json'), 'utf8'));

const GR86 = load('gearing-gr86-2026-07-31');

let warned = false;
/* Returns the confirmed axis maximum, or the caller's historical value if it
   is still unresolved. `who` names the caller so the notice says where the
   stale literal lives. */
function axis(fallback, who) {
  const confirmed = GR86.readings.axisMax;
  if (confirmed != null) return confirmed;
  if (!warned) {
    console.log('   [UNRESOLVED] axis maximum not yet re-read — see BACKLOG.md E2. ' +
      'Candidates ' + GR86.readings.axisMaxCandidates.map(c => c.value).join(' / ') + '.');
    warned = true;
  }
  console.log('   [UNRESOLVED] ' + who + ' is using its historical value ' + fallback + '.');
  return fallback;
}

/* k = axisMax * fit * topRatio — the one piece of the gearing model that was
   properly verified. Kept here so both callers derive it the same way; the
   top ratio comes from the fixture's own held ratios, never a literal. */
const k = axisMax => axisMax * GR86.readings.fit * GR86.held.ratios[GR86.held.ratios.length - 1];

module.exports = { GR86, axis, k };
