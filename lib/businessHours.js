// Xocolate Coffee Co. Online Ordering Hours (Pacific Time)
// In-store hours are 6 AM - 2 PM (Mon-Fri) / 7 AM - 3 PM (Sat), but the
// online ordering window is intentionally narrower: 7 AM - 1 PM, Mon-Sat.

// MANUAL KILL SWITCH: set to true to turn OFF online ordering entirely,
// regardless of the time of day. The menu still displays, but every
// "Add to Cart" button is disabled and a banner explains ordering is paused.
// Flip back to false to resume normal hours-based ordering.
const ONLINE_ORDERING_DISABLED = true;

const ORDERING_PAUSED_MESSAGE =
  "Online ordering is temporarily unavailable. Please order in store — thanks for your patience!";

const PACIFIC_TZ = 'America/Los_Angeles';

function getPacificNow() {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: PACIFIC_TZ,
    weekday: 'short',
    hour: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(new Date());

  const weekdayMap = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
  const hour = parseInt(parts.find(p => p.type === 'hour').value, 10);
  const day = weekdayMap[parts.find(p => p.type === 'weekday').value];
  return { hour, day };
}

const ONLINE_ORDER_HOURS = {
  0: null,                                                       // Sunday - Closed
  1: { open: 7, close: 13, openStr: '7 AM', closeStr: '1 PM' },
  2: { open: 7, close: 13, openStr: '7 AM', closeStr: '1 PM' },
  3: { open: 7, close: 13, openStr: '7 AM', closeStr: '1 PM' },
  4: { open: 7, close: 13, openStr: '7 AM', closeStr: '1 PM' },
  5: { open: 7, close: 13, openStr: '7 AM', closeStr: '1 PM' },
  6: { open: 7, close: 13, openStr: '7 AM', closeStr: '1 PM' },
};

export function isShopOpen() {
  if (ONLINE_ORDERING_DISABLED) return false;
  const { hour, day } = getPacificNow();
  const todayHours = ONLINE_ORDER_HOURS[day];
  if (!todayHours) return false;
  return hour >= todayHours.open && hour < todayHours.close;
}

export function getShopStatus() {
  const isOpen = isShopOpen();
  const { day } = getPacificNow();
  const todayHours = ONLINE_ORDER_HOURS[day];

  if (ONLINE_ORDERING_DISABLED) {
    return {
      isOpen: false,
      openTime: null,
      closeTime: null,
      message: ORDERING_PAUSED_MESSAGE,
    };
  }

  if (!todayHours) {
    return {
      isOpen: false,
      openTime: null,
      closeTime: null,
      message: "Online ordering is closed on Sundays. See you Monday at 7 AM!"
    };
  }

  return {
    isOpen,
    openTime: todayHours.openStr,
    closeTime: todayHours.closeStr,
    message: isOpen
      ? "We're currently accepting online orders!"
      : `We accept online orders from ${todayHours.openStr} to ${todayHours.closeStr}`
  };
}
