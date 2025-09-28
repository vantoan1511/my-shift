<script lang="ts" setup>
import {ref, watchEffect} from "vue";
import {useEmployeeStore} from "@/stores/Employees/employee.ts";
import type {Employee} from "@/models";
import {useShiftStore} from "@/stores/Shifts/shift.ts";
import {useI18n} from "vue-i18n";

const { t } = useI18n();
const props = defineProps<{ employee: Employee | null, visible: boolean }>();
const emit = defineEmits(['close']);

const employeeStore = useEmployeeStore();
const shiftStore = useShiftStore();

const employeeName = ref('');
const employeePhone = ref('');
const employeeAvailability = ref<string[]>([]);

watchEffect(() => {
  if (props.visible && shiftStore.shifts.length === 0) {
    shiftStore.fetchShifts();
  }

  if (props.employee) {
    employeeName.value = props.employee.name;
    employeePhone.value = props.employee.phone;
    employeeAvailability.value = [...props.employee.availability]; // Use spread to avoid modifying prop directly
  } else {
    employeeName.value = '';
    employeePhone.value = '';
    employeeAvailability.value = [];
  }
});

const saveEmployee = () => {
  if (props.employee) {
    employeeStore.updateEmployee({
      ...props.employee,
      name: employeeName.value,
      phone: employeePhone.value,
      availability: employeeAvailability.value
    });
  } else {
    employeeStore.addEmployee({
      name: employeeName.value,
      phone: employeePhone.value,
      availability: employeeAvailability.value
    });
  }
  emit('close');
};

const handleClose = () => {
  emit('close');
};
</script>

<template>
  <Dialog :header="employee ? t('edit_employee') : t('add_employee')" :style="{ width: '35rem' }"
          :visible="props.visible"
          modal @update:visible="handleClose">
    <form id="employee-form" @submit.prevent="saveEmployee">
      <div class="flex flex-col gap-6 mt-4">
        <div class="flex flex-col gap-2">
          <label for="employeeName">{{ t('employee_name') }}</label>
          <InputText id="employeeName" v-model="employeeName" class="w-full" required/>
        </div>
        <div class="flex flex-col gap-2">
          <label for="employeePhone">{{ t('employee_phone') }}</label>
          <InputMask id="employeePhone" v-model="employeePhone" class="w-full"
                     mask="999 999 9999"
                     placeholder="999 999 9999"/>
        </div>
        <div class="flex flex-col gap-2">
          <h3 class="text-lg font-bold">{{ t('availability') }}</h3>
          <div
            class="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-60 overflow-y-auto p-2 rounded">
            <div v-for="shift in shiftStore.shifts" :key="shift.id" class="flex items-center">
              <Checkbox v-model="employeeAvailability" :inputId="shift.id" :value="shift.id"/>
              <label :for="shift.id" class="ml-2 text-sm">{{ shift.name }} ({{ t(shift.dayOfWeek.toLowerCase()) }})</label>
            </div>
          </div>
        </div>
      </div>
    </form>
    <template #footer>
      <Button :label="t('cancel')" severity="secondary" type="button" @click="handleClose"/>
      <Button form="employee-form" :label="t('save')" type="submit"/>
    </template>
  </Dialog>
</template>

<style scoped>

</style>
