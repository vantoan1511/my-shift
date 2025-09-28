export interface Branch {
  id: string;
  name: string;
}

export interface Employee {
  id: string;
  name: string;
  phone: string;
  availability: string[];
}

export interface Shift {
  id: string;
  name: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  requiredEmployees: number;
}

export interface Schedule extends Shift {
  branchId: string;
  shiftId: string;
  assignedEmployees: string[];
  order: number;
}
