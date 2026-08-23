import { formatTime } from './time';

export type AutoSlot = {
  slotTime: string;
  capacity: number;
  availableSeats: number;
};

export const generateAutoSlots = (
  start: Date,
  end: Date,
  durationMinutes: number,
  capacity: string | number
): AutoSlot[] => {
  const generated: AutoSlot[] = [];
  let current = new Date(start);
  const endBoundary = new Date(end);
  const capNum = parseInt(String(capacity), 10) || 1;

  while (current < endBoundary) {
    const next = new Date(current.getTime() + durationMinutes * 60000);
    if (next > endBoundary) break;

    const slotStr = `${formatTime(current)} - ${formatTime(next)}`;
    generated.push({
      slotTime: slotStr,
      capacity: capNum,
      availableSeats: capNum,
    });

    current = next;
  }
  return generated;
};
