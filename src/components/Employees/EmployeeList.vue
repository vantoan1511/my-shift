<script lang="ts" setup>
import {useEmployeeStore} from "@/stores/Employees/employee.ts";
import {onMounted, ref} from "vue";
import type {Employee} from "@/models";
import EmployeeForm from "@/components/Employees/EmployeeForm.vue";

const employeeStore = useEmployeeStore();
const showForm = ref(false);
const selectedEmployee = ref<Employee | null>(null);

const openForm = (employee: Employee | null) => {
  selectedEmployee.value = employee;
  showForm.value = true;
};

const deleteEmployee = (employeeId: string) => {
  employeeStore.deleteEmployee(employeeId);
};

const onFormClose = () => {
  showForm.value = false;
  selectedEmployee.value = null;
};

onMounted(() => {
  employeeStore.fetchEmployees();
});
</script>

<template>
  <Card>
    <template #title>
      <div class="flex justify-between items-center">
        <h2 class="text-2xl">Employees</h2>
        <Button icon="pi pi-plus" label="Add Employee" @click="openForm(null)"/>
      </div>
    </template>
    <template #content>
      <DataTable :paginator="true" :rows="10" :value="employeeStore.employees"
                 responsiveLayout="scroll">
        <Column :sortable="true" field="name" header="Name"></Column>
        <Column field="phone" header="Phone"></Column>
        <Column header="Actions" style="width: 10rem">
          <template #body="slotProps">
            <div class="flex gap-2">
              <Button class="p-button-rounded p-button-success" icon="pi pi-pencil"
                      @click="openForm(slotProps.data)"/>
              <Button class="p-button-rounded p-button-danger" icon="pi pi-trash"
                      @click="deleteEmployee(slotProps.data.id)"/>
            </div>
          </template>
        </Column>
        <template #empty>
          No employees found.
        </template>
      </DataTable>
    </template>
  </Card>
  <EmployeeForm :visible="showForm" :employee="selectedEmployee" @close="onFormClose"/>
</template>

<style scoped>

</style>
