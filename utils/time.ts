export const formatTime = (dateObj: Date): string =>
  dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
