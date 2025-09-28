import type {Employee, Schedule} from '@/models';

const timeToMinutes = (time: string): number => {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
};

const isTimeOverlap = (start1: string, end1: string, start2: string, end2: string): boolean => {
  const s1 = timeToMinutes(start1);
  const e1 = timeToMinutes(end1);
  const s2 = timeToMinutes(start2);
  const e2 = timeToMinutes(end2);
  return Math.max(s1, s2) < Math.min(e1, e2);
};

export const generateRecommendations = (
  Schedules: Schedule[],
  employees: Employee[]
): Schedule[] => {
  const recommendedShifts = JSON.parse(JSON.stringify(Schedules)) as Schedule[];

  const employeeShiftCounts: { [employeeId: string]: number } = {};
  employees.forEach(e => employeeShiftCounts[e.id] = 0);
  recommendedShifts.forEach(shift => {
    shift.assignedEmployees.forEach(employeeId => {
      employeeShiftCounts[employeeId]++;
    });
  });

  const shiftsToAssign = recommendedShifts.filter(
    shift => shift.assignedEmployees.length < shift.requiredEmployees
  ).sort((a, b) => a.requiredEmployees - b.requiredEmployees); // Prioritize shifts with fewer required employees

  shiftsToAssign.forEach(shift => {
    const availableEmployees = employees.filter(employee => {
      if (!employee.availability.includes(shift.shiftId) || shift.assignedEmployees.includes(employee.id)) {
        return false;
      }

      // Check for overlapping shifts on the same day in other branches
      const employeeShiftsOnSameDay = recommendedShifts.filter(s =>
        s.dayOfWeek === shift.dayOfWeek && s.assignedEmployees.includes(employee.id)
      );

      return !employeeShiftsOnSameDay.some(s => isTimeOverlap(s.startTime, s.endTime, shift.startTime, shift.endTime));
    });

    availableEmployees.sort((a, b) => employeeShiftCounts[a.id] - employeeShiftCounts[b.id]);

    const needed = shift.requiredEmployees - shift.assignedEmployees.length;
    const employeesToAssign = availableEmployees.slice(0, needed);

    employeesToAssign.forEach(employee => {
      shift.assignedEmployees.push(employee.id);
      employeeShiftCounts[employee.id]++;
    });
  });

  return recommendedShifts;
};
