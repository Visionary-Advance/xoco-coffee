// Create a utility function to check if shop is open
export function isShopOpen() {
  const now = new Date();
  const currentHour = now.getHours();
  const currentDay = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
  
  // Define your business hours
  const businessHours = {
    // Monday - Friday: 7 AM to 8 PM
    1: { open: 7, close: 13 },
    2: { open: 7, close: 13 },
    3: { open: 7, close: 13 },
    4: { open: 7, close: 13 },
    5: { open: 7, close: 13 },
    // Saturday: 8 AM to 9 PM
    6: { open: 8, close: 13 },
    
   
  };
  
  const todayHours = businessHours[currentDay];
  
  // Check if current time is within business hours
  return currentHour >= todayHours.open && currentHour < todayHours.close;
}

export function getShopStatus() {
  const isOpen = isShopOpen();
  const now = new Date();
  const currentDay = now.getDay();
  
  const businessHours = {
    1: { open: 7, close: 1 },
    2: { open: 7, close: 1 },
    3: { open: 7, close: 1 },
    4: { open: 7, close: 1 },
    5: { open: 7, close: 1 },
    6: { open: 8, close: 2 },
    
  };
  
  const todayHours = businessHours[currentDay];
  
  return {
    isOpen,
    openTime: `${todayHours.open}:00`,
    closeTime: `${todayHours.close}`,
    message: isOpen 
      ? "We're currently open!" 
      : `We accept online orders from ${todayHours.open}AM to ${todayHours.close}PM`
  };
}