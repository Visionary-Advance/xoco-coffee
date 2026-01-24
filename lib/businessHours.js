// Xocolate Coffee Co. Business Hours
// Monday-Friday: 6 AM - 2 PM
// Saturday: 7 AM - 3 PM
// Sunday: Closed

export function isShopOpen() {
  const now = new Date();
  const currentHour = now.getHours();
  const currentDay = now.getDay(); // 0 = Sunday, 1 = Monday, etc.

  // Define business hours (24-hour format)
  const businessHours = {
    0: null, // Sunday - Closed
    1: { open: 6, close: 14 },  // Monday: 6 AM - 2 PM
    2: { open: 6, close: 14 },  // Tuesday: 6 AM - 2 PM
    3: { open: 6, close: 14 },  // Wednesday: 6 AM - 2 PM
    4: { open: 6, close: 14 },  // Thursday: 6 AM - 2 PM
    5: { open: 6, close: 14 },  // Friday: 6 AM - 2 PM
    6: { open: 7, close: 15 },  // Saturday: 7 AM - 3 PM
  };

  const todayHours = businessHours[currentDay];

  // Closed on Sunday
  if (!todayHours) {
    return false;
  }

  // Check if current time is within business hours
  return currentHour >= todayHours.open && currentHour < todayHours.close;
}

export function getShopStatus() {
  const isOpen = isShopOpen();
  const now = new Date();
  const currentDay = now.getDay();

  const businessHours = {
    0: null, // Sunday - Closed
    1: { open: 6, close: 14, openStr: '6 AM', closeStr: '2 PM' },
    2: { open: 6, close: 14, openStr: '6 AM', closeStr: '2 PM' },
    3: { open: 6, close: 14, openStr: '6 AM', closeStr: '2 PM' },
    4: { open: 6, close: 14, openStr: '6 AM', closeStr: '2 PM' },
    5: { open: 6, close: 14, openStr: '6 AM', closeStr: '2 PM' },
    6: { open: 7, close: 15, openStr: '7 AM', closeStr: '3 PM' },
  };

  const todayHours = businessHours[currentDay];

  // Sunday
  if (!todayHours) {
    return {
      isOpen: false,
      openTime: null,
      closeTime: null,
      message: "We're closed on Sundays. See you Monday at 6 AM!"
    };
  }

  return {
    isOpen,
    openTime: todayHours.openStr,
    closeTime: todayHours.closeStr,
    message: isOpen
      ? "We're currently open!"
      : `We accept online orders from ${todayHours.openStr} to ${todayHours.closeStr}`
  };
}
