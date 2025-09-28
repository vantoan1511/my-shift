import * as XLSX from 'xlsx';
import type {Branch, Employee, Schedule} from '@/models';

export const exportBranchShiftsToExcel = (branches: Branch[], branchShifts: Schedule[], employees: Employee[]) => {
  const wb = XLSX.utils.book_new();
  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  branches.forEach(branch => {
    const shiftsForBranch = branchShifts.filter(bs => bs.branchId === branch.id);
    if (shiftsForBranch.length === 0) return;

    const shiftNames = [...new Set(shiftsForBranch.map(s => s.name))].sort();
    const data: (string | undefined)[][] = [
      ['Shift', ...daysOfWeek]
    ];

    shiftNames.forEach(shiftName => {
      const row: (string | undefined)[] = [shiftName];
      daysOfWeek.forEach(day => {
        const shiftsForDay = shiftsForBranch.filter(s => s.name === shiftName && s.dayOfWeek === day);
        if (shiftsForDay.length > 0) {
          const assignedEmployeeNames = shiftsForDay
            .flatMap(s => s.assignedEmployees)
            .map(employeeId => {
              const employee = employees.find(e => e.id === employeeId);
              return employee ? employee.name : '';
            })
            .join(', ');
          row.push(assignedEmployeeNames);
        } else {
          row.push(undefined);
        }
      });
      data.push(row);
    });

    const ws = XLSX.utils.aoa_to_sheet(data);
    XLSX.utils.book_append_sheet(wb, ws, branch.name);
  });

  XLSX.writeFile(wb, 'BranchShifts.xlsx');
};
