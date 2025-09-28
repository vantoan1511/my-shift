import {defineStore} from 'pinia';
import type {Schedule, Shift} from '@/models';
import {
  applyTemplateToBranch,
  createBranchShift,
  deleteBranchShift,
  deleteBranchShiftsByShiftId,
  getSchedules,
  updateBranchShift
} from '@/services/scheduleService.ts';

export const useScheduleStore = defineStore('schedule', {
  state: () => ({
    schedules: [] as Schedule[],
  }),
  actions: {
    async fetchSchedules() {
      this.schedules = getSchedules();
    },
    createBranchShift: async function (branchShift: Omit<Schedule, 'id'>) {
      const newBranchShift = createBranchShift(branchShift);
      this.schedules.push(newBranchShift);
    },
    async updateSchedule(updatedSchedule: Schedule) {
      updateBranchShift(updatedSchedule);
      const index = this.schedules.findIndex((schedule) => schedule.id === updatedSchedule.id);
      if (index !== -1) {
        this.schedules[index] = updatedSchedule;
      }
    },
    async deleteBranchShift(branchShiftId: string) {
      deleteBranchShift(branchShiftId);
      this.schedules = this.schedules.filter((schedule) => schedule.id !== branchShiftId);
    },
    async deleteBranchShiftsByShiftId(shiftId: string) {
      deleteBranchShiftsByShiftId(shiftId);
      this.schedules = this.schedules.filter((schedule) => schedule.shiftId !== shiftId);
    },
    async applyTemplateToBranch(branchId: string, shifts: Shift[]) {
      applyTemplateToBranch(branchId, shifts);
      await this.fetchSchedules();
    },
  },
});
