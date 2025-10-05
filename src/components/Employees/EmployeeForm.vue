<script lang="ts" setup>
import {computed, ref, watchEffect} from "vue";
import {useEmployeeStore} from "@/stores/Employees/employee.ts";
import type {Employee} from "@/models";
import {useShiftStore} from "@/stores/Shifts/shift.ts";
import {useI18n} from "vue-i18n";
import {PrimeIcons} from "@primevue/core/api";

const {t} = useI18n();
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

const shiftsSortedByOrder = computed(() => {
  return [...shiftStore.shifts].sort((a, b) => a.order - b.order);
});

const shiftsGroupedByDayOfWeek = computed(() => {
  const grouped: { [key: string]: typeof shiftStore.shifts } = {
    Monday: [],
    Tuesday: [],
    Wednesday: [],
    Thursday: [],
    Friday: [],
    Saturday: [],
    Sunday: []
  };
  shiftsSortedByOrder.value.forEach(shift => {
    if (!grouped[shift.dayOfWeek]) {
      grouped[shift.dayOfWeek] = [];
    }
    grouped[shift.dayOfWeek].push(shift);
  });
  return grouped;
})

const handleClose = () => {
  emit('close');
};
</script>

<template>
  <Dialog :header="employee ? t('edit_employee') : t('add_employee')" :style="{ minWidth: '35rem' }"
          :visible="props.visible" modal pt:mask:class="backdrop-blur"
          @update:visible="handleClose">
    <form id="employee-form" @submit.prevent="saveEmployee">
      <div class="flex flex-row gap-6 mt-4">
        <div class="flex flex-col gap-2">
          <h3 class="text-lg font-bold">{{ t('employee_info') }}</h3>
          <Divider type="dashed"/>
          <div class="flex flex-col gap-2">
            <label for="employeeName">{{ t('employee_name') }}</label>
            <InputText id="employeeName" v-model="employeeName" class="w-full"
                       placeholder="Nguyễn Văn A"
                       required/>
          </div>
          <div class="flex flex-col gap-2">
            <label for="employeePhone">{{ t('employee_phone') }}</label>
            <InputMask id="employeePhone" v-model="employeePhone" class="w-full"
                       mask="999-999-9999"
                       placeholder="999 999 9999"/>
          </div>
        </div>


        <div class="flex flex-col gap-2">
          <h3 class="text-lg font-bold">{{ t('availability') }}</h3>
          <Divider type="dashed"/>
          <div
            class="flex flex-col gap-4 max-h-60 overflow-y-auto p-2 rounded-lg">
            <div v-for="(shifts, day) in shiftsGroupedByDayOfWeek" :key="day"
                 class="grid grid-cols-5 items-center p-2 rounded">
              <h4 class="font-semibold">
                {{ t(String(day).toLowerCase()) }}
              </h4>
              <div class="col-span-4">
                <SelectButton v-model="employeeAvailability" :options="shifts"
                              aria-labelledby="multiple" multiple optionLabel="name"
                              optionValue="id"/>
              </div>
            </div>
          </div>
        </div>
      </div>
    </form>
    <template #footer>
      <Button :icon="PrimeIcons.TIMES" :label="t('cancel')" severity="secondary" type="button"
              @click="handleClose"/>
      <Button :icon="PrimeIcons.CHECK" :label="t('save')" form="employee-form" type="submit"/>
    </template>
  </Dialog>
</template>

<style scoped>

</style>
