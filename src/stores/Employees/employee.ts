import {defineStore} from 'pinia';
import type {Employee} from "@/models";
import {
  addEmployee,
  deleteEmployee,
  getEmployees,
  updateEmployee
} from '@/services/employeeService';

export const useEmployeeStore = defineStore('employee', {
  state: () => ({
    employees: [] as Employee[],
  }),
  actions: {
    async fetchEmployees() {
      this.employees = getEmployees();
    },
    async addEmployee(employee: Omit<Employee, 'id'>) {
      const newEmployee = addEmployee(employee);
      this.employees.push(newEmployee);
    },
    async updateEmployee(updatedEmployee: Employee) {
      updateEmployee(updatedEmployee);
      const index = this.employees.findIndex((employee) => employee.id === updatedEmployee.id);
      if (index !== -1) {
        this.employees[index] = updatedEmployee;
      }
    },
    async deleteEmployee(employeeId: string) {
      deleteEmployee(employeeId);
      this.employees = this.employees.filter((employee) => employee.id !== employeeId);
    },
  },
});
