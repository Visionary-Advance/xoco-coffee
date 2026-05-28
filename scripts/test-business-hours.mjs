// Standalone sanity-check for the online ordering gate.
// Run: `node scripts/test-business-hours.mjs`
//
// Stubs the global Date so we can ask: "at this Pacific wall-clock time,
// would the gate accept an order?" — without spinning up a server.

import { isShopOpen, getShopStatus } from '../lib/businessHours.js';

const RealDate = Date;

// Build a Date that, when formatted in America/Los_Angeles, shows the given
// wall-clock time. We do this by picking a UTC instant and verifying.
function pacificDate(year, month, day, hour, minute = 0) {
  // PDT is UTC-7, PST is UTC-8. Try PDT first; if the formatted hour doesn't
  // match, fall back to PST.
  for (const offset of [7, 8]) {
    const candidate = new RealDate(Date.UTC(year, month - 1, day, hour + offset, minute));
    const fmtHour = new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/Los_Angeles',
      hour: '2-digit',
      hourCycle: 'h23',
    }).formatToParts(candidate).find(p => p.type === 'hour').value;
    if (parseInt(fmtHour, 10) === hour) return candidate;
  }
  throw new Error(`Could not construct Pacific ${year}-${month}-${day} ${hour}:${minute}`);
}

function withClock(fixedDate, fn) {
  globalThis.Date = class extends RealDate {
    constructor(...args) {
      if (args.length === 0) return new RealDate(fixedDate.getTime());
      return new RealDate(...args);
    }
    static now() { return fixedDate.getTime(); }
  };
  try { return fn(); } finally { globalThis.Date = RealDate; }
}

const cases = [
  // [label, pacific date, expected isOpen]
  ['Mon 06:30 PT — before window',     pacificDate(2026, 6, 1,  6, 30), false],
  ['Mon 07:00 PT — window opens',      pacificDate(2026, 6, 1,  7,  0), true ],
  ['Mon 10:00 PT — mid window',        pacificDate(2026, 6, 1, 10,  0), true ],
  ['Mon 12:59 PT — last minute',       pacificDate(2026, 6, 1, 12, 59), true ],
  ['Mon 13:00 PT — window closes',     pacificDate(2026, 6, 1, 13,  0), false],
  ['Mon 14:00 PT — afternoon',         pacificDate(2026, 6, 1, 14,  0), false],
  ['Sat 09:00 PT — open',              pacificDate(2026, 6, 6,  9,  0), true ],
  ['Sat 13:00 PT — closed',            pacificDate(2026, 6, 6, 13,  0), false],
  ['Sun 10:00 PT — Sunday closed',     pacificDate(2026, 5, 31, 10, 0), false],
  // Winter PST sanity check
  ['Wed 07:30 PST (Jan) — open',       pacificDate(2026, 1, 14,  7, 30), true ],
  ['Wed 14:30 PST (Jan) — closed',     pacificDate(2026, 1, 14, 14, 30), false],
];

let pass = 0, fail = 0;
for (const [label, date, expected] of cases) {
  const actual = withClock(date, () => isShopOpen());
  const ok = actual === expected;
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${label}  → isShopOpen=${actual} (expected ${expected})`);
  ok ? pass++ : fail++;
}

console.log('\nSample status messages:');
for (const [label, date] of [
  ['Mon 10:00 PT', pacificDate(2026, 6, 1, 10, 0)],
  ['Mon 15:00 PT', pacificDate(2026, 6, 1, 15, 0)],
  ['Sun 10:00 PT', pacificDate(2026, 5, 31, 10, 0)],
]) {
  const status = withClock(date, () => getShopStatus());
  console.log(`  ${label}: ${JSON.stringify(status)}`);
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail === 0 ? 0 : 1);
