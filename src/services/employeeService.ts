import type {Employee} from '@/models';

const EMPLOYEES_STORAGE_KEY = 'employees';

export const getEmployees = (): Employee[] => {
  const employeesJson = localStorage.getItem(EMPLOYEES_STORAGE_KEY);
  return employeesJson ? JSON.parse(employeesJson) : [];
};

export const addEmployee = (employee: Omit<Employee, 'id'>): Employee => {
  const employees = getEmployees();
  const newEmployee = {...employee, id: crypto.randomUUID()};
  localStorage.setItem(EMPLOYEES_STORAGE_KEY, JSON.stringify([...employees, newEmployee]));
  return newEmployee;
};

export const updateEmployee = (updatedEmployee: Employee): void => {
  const employees = getEmployees();
  const employeeIndex = employees.findIndex((employee) => employee.id === updatedEmployee.id);
  if (employeeIndex !== -1) {
    employees[employeeIndex] = updatedEmployee;
    localStorage.setItem(EMPLOYEES_STORAGE_KEY, JSON.stringify(employees));
  }
};

export const deleteEmployee = (employeeId: string): void => {
  const employees = getEmployees();
  const updatedEmployees = employees.filter((employee) => employee.id !== employeeId);
  localStorage.setItem(EMPLOYEES_STORAGE_KEY, JSON.stringify(updatedEmployees));
};
