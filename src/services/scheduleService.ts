import type {Schedule, Shift} from '@/models';

const BRANCH_SHIFTS_STORAGE_KEY = 'branchShifts';

export const getSchedules = (): Schedule[] => {
  const branchShiftsJson = localStorage.getItem(BRANCH_SHIFTS_STORAGE_KEY);
  return branchShiftsJson ? JSON.parse(branchShiftsJson) : [];
};

export const createBranchShift = (branchShift: Omit<Schedule, 'id'>): Schedule => {
  const branchShifts = getSchedules();
  const newBranchShift = {...branchShift, id: crypto.randomUUID()};
  localStorage.setItem(BRANCH_SHIFTS_STORAGE_KEY, JSON.stringify([...branchShifts, newBranchShift]));
  return newBranchShift;
};

export const updateBranchShift = (updatedBranchShift: Schedule): void => {
  const branchShifts = getSchedules();
  const branchShiftIndex = branchShifts.findIndex((branchShift) => branchShift.id === updatedBranchShift.id);
  if (branchShiftIndex !== -1) {
    branchShifts[branchShiftIndex] = updatedBranchShift;
    localStorage.setItem(BRANCH_SHIFTS_STORAGE_KEY, JSON.stringify(branchShifts));
  }
};

export const deleteBranchShift = (branchShiftId: string): void => {
  const branchShifts = getSchedules();
  const updatedBranchShifts = branchShifts.filter((branchShift) => branchShift.id !== branchShiftId);
  localStorage.setItem(BRANCH_SHIFTS_STORAGE_KEY, JSON.stringify(updatedBranchShifts));
};

export const deleteBranchShiftsByShiftId = (shiftId: string): void => {
  const branchShifts = getSchedules();
  const updatedBranchShifts = branchShifts.filter((branchShift) => branchShift.shiftId !== shiftId);
  localStorage.setItem(BRANCH_SHIFTS_STORAGE_KEY, JSON.stringify(updatedBranchShifts));
};

export const applyTemplateToBranch = (branchId: string, shifts: Shift[]): void => {
  const branchShifts = getSchedules();
  const newBranchShifts = shifts
    .filter(shift => {
      return !branchShifts.some(branchShift => branchShift.shiftId === shift.id && branchShift.branchId === branchId);
    })
    .map(shift => ({
      ...shift,
      id: crypto.randomUUID(),
      branchId,
      shiftId: shift.id,
      assignedEmployees: [],
    }));
  const updatedBranchShifts = [...branchShifts, ...newBranchShifts];
  localStorage.setItem(BRANCH_SHIFTS_STORAGE_KEY, JSON.stringify(updatedBranchShifts));
};
