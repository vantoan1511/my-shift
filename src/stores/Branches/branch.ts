import {defineStore} from 'pinia';
import type {Branch} from '@/models';
import {addBranch, deleteBranch, getBranches, updateBranch} from '@/services/branchService';

export const useBranchStore = defineStore('branch', {
  state: () => ({
    branches: [] as Branch[],
  }),
  actions: {
    async fetchBranches() {
      this.branches = getBranches();
    },
    async addBranch(branch: Omit<Branch, 'id'>) {
      const newBranch = addBranch(branch);
      this.branches.push(newBranch);
    },
    async updateBranch(updatedBranch: Branch) {
      updateBranch(updatedBranch);
      const index = this.branches.findIndex((branch) => branch.id === updatedBranch.id);
      if (index !== -1) {
        this.branches[index] = updatedBranch;
      }
    },
    async deleteBranch(branchId: string) {
      deleteBranch(branchId);
      this.branches = this.branches.filter((branch) => branch.id !== branchId);
    },
  },
});
