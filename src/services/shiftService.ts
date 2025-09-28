import type {Shift} from '@/models';

const SHIFTS_STORAGE_KEY = 'shifts';

export const getShifts = (): Shift[] => {
  const shiftsJson = localStorage.getItem(SHIFTS_STORAGE_KEY);
  return shiftsJson ? JSON.parse(shiftsJson) : [];
};

export const addShift = (shift: Omit<Shift, 'id'>): Shift => {
  const shifts = getShifts();
  const newShift = {...shift, id: crypto.randomUUID()};
  localStorage.setItem(SHIFTS_STORAGE_KEY, JSON.stringify([...shifts, newShift]));
  return newShift;
};

export const updateShift = (updatedShift: Shift): void => {
  const shifts = getShifts();
  const shiftIndex = shifts.findIndex((shift) => shift.id === updatedShift.id);
  if (shiftIndex !== -1) {
    shifts[shiftIndex] = updatedShift;
    localStorage.setItem(SHIFTS_STORAGE_KEY, JSON.stringify(shifts));
  }
};

export const deleteShift = (shiftId: string): void => {
  const shifts = getShifts();
  const updatedShifts = shifts.filter((shift) => shift.id !== shiftId);
  localStorage.setItem(SHIFTS_STORAGE_KEY, JSON.stringify(updatedShifts));
};
