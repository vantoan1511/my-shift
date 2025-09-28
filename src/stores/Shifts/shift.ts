import {defineStore} from 'pinia';
import type {Shift} from '@/models';
import {addShift, deleteShift, getShifts, updateShift} from '@/services/shiftService';

export const useShiftStore = defineStore('shift', {
  state: () => ({
    shifts: [] as Shift[],
  }),
  actions: {
    async fetchShifts() {
      this.shifts = getShifts();
    },
    async addShift(shift: Omit<Shift, 'id' | 'order'>) {
      const order = this.shifts.filter(s => s.dayOfWeek === shift.dayOfWeek).length;
      const newShiftData = {...shift, order};
      const newShift = addShift(newShiftData);
      this.shifts.push(newShift);
    },
    async updateShift(updatedShift: Shift) {
      updateShift(updatedShift);
      const index = this.shifts.findIndex((shift) => shift.id === updatedShift.id);
      if (index !== -1) {
        this.shifts[index] = updatedShift;
      }
    },
    async deleteShift(shiftId: string) {
      deleteShift(shiftId);
      this.shifts = this.shifts.filter((shift) => shift.id !== shiftId);
    },
  },
});
