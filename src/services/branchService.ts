import type {Branch} from '@/models';

const BRANCHES_STORAGE_KEY = 'branches';

export const getBranches = (): Branch[] => {
  const branchesJson = localStorage.getItem(BRANCHES_STORAGE_KEY);
  return branchesJson ? JSON.parse(branchesJson) : [];
};

export const addBranch = (branch: Omit<Branch, 'id'>): Branch => {
  const branches = getBranches();
  const newBranch = {...branch, id: crypto.randomUUID()};
  localStorage.setItem(BRANCHES_STORAGE_KEY, JSON.stringify([...branches, newBranch]));
  return newBranch;
};

export const updateBranch = (updatedBranch: Branch): void => {
  const branches = getBranches();
  const branchIndex = branches.findIndex((branch) => branch.id === updatedBranch.id);
  if (branchIndex !== -1) {
    branches[branchIndex] = updatedBranch;
    localStorage.setItem(BRANCHES_STORAGE_KEY, JSON.stringify(branches));
  }
};

export const deleteBranch = (branchId: string): void => {
  const branches = getBranches();
  const updatedBranches = branches.filter((branch) => branch.id !== branchId);
  localStorage.setItem(BRANCHES_STORAGE_KEY, JSON.stringify(updatedBranches));
};
