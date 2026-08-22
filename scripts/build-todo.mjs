// Rewrite the "## Board" section of TODO.md, in place.
//
//   Run: node scripts/build-todo.mjs   (or: npm run todo)
//
// Ported from personal-wiki's scripts/build-todo.mjs, which does the same job
// against a wiki. Two deliberate differences:
//
//   - **No `content/` sweep.** That repo sweeps its published pages for open
//     items; this one has no pages, so TODO.md is the only source and the
//     script only builds the board.
//   - **`place` means game / desk / neither**, not phone / PC. The split that
//     matters here is whether FH6 has to be open — which is the difference
//     between a five-minute job and a session.
//
// Everything is derived: counts are read out of the file, never typed, because
// a hand-maintained count silently goes wrong and then the board lies.
import fs from 'node:fs';

const TODO = 'TODO.md';
const REPO_URL = 'https://github.com/bston97/forza-tune-goon';

// ── Cards ────────────────────────────────────────────────────────────────────
// id, heading (must match a ## or ### in TODO.md exactly), lane, owner, place,
// topic, note
const CARDS = [
  ['MEAS-1', 'The measurement queue', 'blocked', 'you', 'game', 'Measurement', '**Start here.** Six queued readings, cheapest first. Items 1–3 are under half an hour together'],
  ['PARTS-1', 'Parts and the gating matrix', 'blocked', 'you', 'game', 'Measurement', '**Highest-risk unmeasured thing in the app** — it decides which sliders get shown at all. Needs the TUNING menu after installing, not the upgrade preview'],
  ['PANEL-1', 'What the Performance panel can settle', 'blocked', 'you', 'game', 'Measurement', '`S1` is the one that matters — three withdrawn app features ride on what Top Speed actually responds to'],
  ['RANGE-1', 'Slider ranges', 'blocked', 'you', 'game', 'Measurement', 'Never measured. An asymmetric spring clamp would destroy the F/R ratio silently, on a screen the app cannot see'],
  ['GEAR-1', 'Gearing — the tables still invented', 'blocked', 'you', 'game', 'Measurement', '`SPREAD[7]` is measured; the other six gear counts are house tables feeding real per-gear speeds'],
  ['BAL-1', 'Balance — the third car and the coefficients', 'blocked', 'you', 'game', 'Measurement', 'Structure holds on two cars. The coefficients are per-car and the spring term is a local linearisation'],
  ['DRIVE-1', 'Telemetry and driving', 'backlog', 'you', 'game', 'Measurement', 'The only group that genuinely needs laps. Fixed route, best-of-5, all five recorded'],
  ['APP-1', 'The game default beats our tune', 'waiting', 'both', 'game', 'App defects', '**The most important unresolved result in the programme, and it points at the app.** One car — needs a second before it is general'],
  ['DEBT-1', 'Known debt', 'ready', 'me', 'na', 'Docs & debt', 'Recorded so it is not rediscovered. None of it changes a number the app prints'],
  ['GH-1', 'GitHub repo files', 'ready', 'both', 'desk', 'Repo hygiene', '`.gitattributes` done. CI is the highest-value one left — the run-the-tests discipline currently depends on remembering'],
  ['TEST-1', 'Generative test plan', 'backlog', 'me', 'na', 'Testing', 'Structural cover is good; calibration cover only exists where a fixture exists'],
  ['DISC-1', 'Discipline naming and circuit vs sprint', 'blocked', 'you', 'game', 'App defects', 'Step one is a screen check, not an edit. Rename labels freely; renaming keys costs a three-store migration'],
  ['LIB-1', 'Library cull, then two tunes per keeper', 'blocked', 'you', 'game', 'Garage & rosters', 'Deletes are unrecoverable — localStorage, one device, no undo. Do `FAM-1`\'s naming rule first'],
  ['FAM-1', 'Nameplate families — many builds, never a best', 'waiting', 'you', 'desk', 'Garage & rosters', 'The app already refuses to rank. Mostly a naming convention plus a guard against regressing it'],
  ['ROSTER-1', 'The garage rosters', 'blocked', 'you', 'game', 'Garage & rosters', 'Mitsubishis are 13 builds across 7 cars. GT-R counts still to be filled from the garage'],
  ['RENAME-1', 'Finish the repo rename', 'blocked', 'you', 'desk', 'Repo hygiene', 'Code and docs all say forza-tune-goon; the remote is still tune-goon. Two minutes, and it is the only thing left from that job'],
];

const LANES = [
  ['ready', 'Ready — I can start these now', 'No input needed. Say the ID and it gets built.'],
  ['blocked', 'Blocked — needs you at a screen I cannot see', 'A readout, a tuning menu, a garage screen, or a settings page only you can open.'],
  ['waiting', 'Waiting on a decision or a fact only you have', 'Answerable without measuring anything.'],
  ['backlog', 'Backlog — real work, no urgency', 'Mixed ownership. Pick one and it moves to Ready.'],
  ['ongoing', 'Ongoing — never closes', 'Fills up from use. Should not hold anything open.'],
];

const PLACES = [
  ['game', 'In the game', 'FH6 has to be open — a tuning menu, the Performance panel, the garage or the upgrade shop.'],
  ['desk', 'At the repo', 'The editor, GitHub, or a decision. No game needed.'],
  ['na', 'Neither — mine or automatic', 'I do these, or a script does. Listed so the board stays complete.'],
];

const OWNER = { me: 'Claude', you: '**Boston**', both: 'Either' };

function anchorize(h) {
  return h.toLowerCase()
    .replace(/[`*_[\]().,:/'’]/g, '')
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/ /g, '-');
}

/** Count open `- [ ]` items per heading, and record each heading's anchor. */
function scan(text) {
  const counts = {}, anchors = {};
  let sub = null;
  for (const line of text.split('\n')) {
    const m = /^(#{2,4})\s+(.*)$/.exec(line);
    if (m) {
      if (m[1].length <= 3) {
        sub = m[2];
        anchors[sub] = anchorize(sub);
        if (!(sub in counts)) counts[sub] = 0;
      }
      continue;
    }
    if (sub && /^\s*- \[ \]/.test(line)) counts[sub] = (counts[sub] || 0) + 1;
  }
  return { counts, anchors };
}

function table(rows, counts, anchors, show) {
  const head = { lane: 'Lane', place: 'Where', topic: 'Topic' }[show];
  const laneTitle = Object.fromEntries(LANES.map(([k, t]) => [k, t]));
  const placeTitle = Object.fromEntries(PLACES.map(([k, t]) => [k, t]));
  const out = [
    `| ID | Card | Items | Owner | ${head} | Note |`,
    '| :--- | :--- | ---: | :--- | :--- | :--- |',
  ];
  for (const [cid, h, lane, own, place, topic, note] of rows) {
    const extra = { lane: laneTitle[lane], place: placeTitle[place], topic }[show];
    out.push(`| \`${cid}\` | [${h}](#${anchors[h]}) | ${counts[h] || 0} | ${OWNER[own]} | ${extra} | ${note} |`);
  }
  return out;
}

function board(text) {
  const { counts, anchors } = scan(text);
  const missing = CARDS.filter((c) => !(c[1] in anchors)).map((c) => c[1]);
  if (missing.length) {
    console.error(`heading not found in ${TODO}: ${JSON.stringify(missing)}`);
    process.exit(1);
  }
  const n = (rows) => rows.reduce((a, c) => a + (counts[c[1]] || 0), 0);
  const total = n(CARDS);

  const o = ['## Board', '',
    `**Every open item, as cards.** ${total} items across ${CARDS.length} areas, so the board is one row ` +
    'per area with the detail underneath — tap a card to jump to its items.', '',
    '**Cards have stable IDs.** Say "do PARTS-1" and I will pick it up without ' +
    'you describing it again. IDs do not change when the board is reordered.', '',
    '**Three views of the same cards**, because the useful sort depends on what ' +
    'you are asking:', '',
    '- **[By what\'s blocking it](#view-1--by-lane)** — the default. What can move right now.',
    '- **[By where you have to be](#view-2--by-place)** — the in-game bucket is the one to open with FH6 running.',
    '- **[By topic](#view-3--by-topic)** — which subjects are piling up.', '',
    '**Owner** is who a card is actually waiting on: `Claude` means nothing ' +
    'blocks me, **Boston** means I genuinely cannot do it, `Either` means it ' +
    'needs a conversation first.', '',
    '> [!note] Every card is also a GitHub issue',
    `> One issue per card, labelled \`topic:\`, \`place:\`, \`owner:\` and \`lane:\`, each linking back to its section here. **[Open issues](${REPO_URL}/issues)** · **[the in-game bucket](${REPO_URL}/issues?q=is%3Aopen+label%3Aplace%3Agame)**`,
    '>',
    '> **This file stays the source of truth.** The issues are the tracker — a ' +
    'place to filter, sort and see what changed. The reasoning lives here, and ' +
    'answers get written here or in the doc the item points at, never in an ' +
    'issue thread. If the two ever disagree, this file is right.', '',
    '---', ''];

  for (const [key, title, blurb, rows] of [
    ['lane', 'View 1 — by lane', null, null],
  ]) void key, title, blurb, rows;

  o.push('### View 1 — by lane', '');
  for (const [key, title, blurb] of LANES) {
    const rows = CARDS.filter((c) => c[2] === key);
    o.push(`#### ${title}`, '', `${blurb} **${n(rows)} items, ${rows.length} cards.**`, '',
      ...table(rows, counts, anchors, 'place'), '');
  }
  o.push('---', '', '### View 2 — by place', '');
  for (const [key, title, blurb] of PLACES) {
    const rows = CARDS.filter((c) => c[4] === key);
    o.push(`#### ${title}`, '', `${blurb} **${n(rows)} items, ${rows.length} cards.**`, '',
      ...table(rows, counts, anchors, 'lane'), '');
  }
  o.push('---', '', '### View 3 — by topic', '');
  for (const topic of [...new Set(CARDS.map((c) => c[5]))].sort()) {
    const rows = CARDS.filter((c) => c[5] === topic);
    o.push(`#### ${topic}`, '', `**${n(rows)} items, ${rows.length} cards.**`, '',
      ...table(rows, counts, anchors, 'lane'), '');
  }
  return { text: o.join('\n'), total };
}

function replaceSection(text, heading, replacement) {
  const start = text.indexOf(heading);
  if (start === -1) {
    console.error(`section not found in ${TODO}: ${heading}`);
    process.exit(1);
  }
  const after = text.indexOf('\n## ', start + heading.length);
  if (after === -1) {
    console.error(`no section follows ${heading} — refusing to write to end of file`);
    process.exit(1);
  }
  return text.slice(0, start) + replacement + '\n' + text.slice(after + 1);
}

// ⚠ Normalise line endings first. The working copy is Windows; every heading
// regex fails on a trailing '\r', and the board then finds none of its headings
// and refuses to write. Silent-looking, total, and invisible until you diff.
let raw = fs.readFileSync(TODO, 'utf8');
const usesCRLF = raw.includes('\r\n');
let text = raw.replace(/\r\n/g, '\n');

const bd = board(text);
text = replaceSection(text, '## Board', bd.text + '\n---\n');
fs.writeFileSync(TODO, usesCRLF ? text.replace(/\n/g, '\r\n') : text, 'utf8');
console.log(`board: ${bd.total} items across ${CARDS.length} cards`);
