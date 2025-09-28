<script lang="ts" setup>
import {computed, ref, watchEffect} from "vue";
import {type SelectChangeEvent, useConfirm, useToast} from "primevue";
import type {Schedule, Shift} from "@/models";
import {useScheduleStore} from "@/stores/schedule.ts";
import {useEmployeeStore} from "@/stores/Employees/employee.ts";
import {useShiftStore} from "@/stores/Shifts/shift.ts";
import {useI18n} from "vue-i18n";

const {t} = useI18n();
const props = defineProps<{
  schedule?: Schedule | null,
  visible: boolean,
  branchId?: string | null
}>();
const emit = defineEmits(['close']);

const scheduleStore = useScheduleStore();
const employeeStore = useEmployeeStore();
const shiftStore = useShiftStore();
const toast = useToast();
const confirm = useConfirm();

const header = computed(() => props.schedule ? t('edit_shift') : t('add_shift'));
const shiftId = ref<string | null>(null);
const shiftName = ref('');
const dayOfWeek = ref('');
const startTime = ref('');
const endTime = ref('');
const requiredEmployees = ref(1);
const assignedEmployees = ref<string[]>([]);
const employeeToAssign = ref('');

const days = ref([
  {name: t('monday'), code: 'Monday'},
  {name: t('tuesday'), code: 'Tuesday'},
  {name: t('wednesday'), code: 'Wednesday'},
  {name: t('thursday'), code: 'Thursday'},
  {name: t('friday'), code: 'Friday'},
  {name: t('saturday'), code: 'Saturday'},
  {name: t('sunday'), code: 'Sunday'}
]);

const availableShifts = computed(() => {
  const distinctShifts = new Map<string, Shift>();
  shiftStore.shifts.forEach(shift => {
    if (!distinctShifts.has(shift.name)) {
      distinctShifts.set(shift.name, shift);
    }
  });
  return Array.from(distinctShifts.values());
});

watchEffect(() => {
  if (props.visible) {
    if (employeeStore.employees.length === 0) {
      employeeStore.fetchEmployees();
    }
    if (shiftStore.shifts.length === 0) {
      shiftStore.fetchShifts();
    }
  }

  if (props.schedule) {
    shiftName.value = props.schedule.name;
    dayOfWeek.value = props.schedule.dayOfWeek;
    startTime.value = props.schedule.startTime;
    endTime.value = props.schedule.endTime;
    requiredEmployees.value = props.schedule.requiredEmployees;
    assignedEmployees.value = [...props.schedule.assignedEmployees];
    shiftId.value = props.schedule.shiftId;
  } else {
    shiftName.value = '';
    dayOfWeek.value = '';
    startTime.value = '';
    endTime.value = '';
    requiredEmployees.value = 1;
    assignedEmployees.value = [];
    shiftId.value = null;
  }
});

const onShiftSelect = (event: SelectChangeEvent) => {
  const selectedShift = shiftStore.shifts.find(s => s.id === event.value);
  if (selectedShift) {
    shiftName.value = selectedShift.name;
    startTime.value = selectedShift.startTime;
    endTime.value = selectedShift.endTime;
    requiredEmployees.value = selectedShift.requiredEmployees;
  }
};
const getAvailableEmployees = computed(() => {
  if (!shiftId.value) return [];
  return employeeStore.employees.filter(employee => {
    return employee.availability.includes(shiftId.value!) && !assignedEmployees.value.includes(employee.id);
  });
});

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

const assignEmployee = (employeeId: string) => {
  const newSchedule: Omit<Schedule, 'id'> = {
    name: shiftName.value,
    dayOfWeek: dayOfWeek.value,
    startTime: startTime.value,
    endTime: endTime.value,
    requiredEmployees: requiredEmployees.value,
    assignedEmployees: assignedEmployees.value,
    branchId: props.branchId!,
    shiftId: shiftId.value!,
    order: props.schedule?.order ?? 0,
  };

  const employeeAssignedShifts = scheduleStore.schedules.filter(shift =>
    shift.assignedEmployees && shift.assignedEmployees.includes(employeeId)
  );

  for (const existingShift of employeeAssignedShifts) {
    if (props.schedule && existingShift.id === props.schedule.id) continue;
    if (existingShift.dayOfWeek === newSchedule.dayOfWeek && existingShift.branchId !== newSchedule.branchId) {
      if (isTimeOverlap(existingShift.startTime, existingShift.endTime, newSchedule.startTime, newSchedule.endTime)) {
        toast.add({
          severity: 'error',
          summary: 'Scheduling Conflict',
          detail: `Employee is already assigned to a conflicting shift at another branch.`,
          life: 5000
        });
        return;
      }
    }
  }

  if (!assignedEmployees.value.includes(employeeId)) {
    assignedEmployees.value.push(employeeId);
  }
};

const unassignEmployee = (employeeId: string) => {
  assignedEmployees.value = assignedEmployees.value.filter(id => id !== employeeId);
};

const handleAssignEmployee = () => {
  if (employeeToAssign.value) {
    assignEmployee(employeeToAssign.value);
    employeeToAssign.value = '';
  }
};

const saveSchedule = () => {
  if (props.schedule) {
    scheduleStore.updateSchedule({
      ...props.schedule,
      name: shiftName.value,
      dayOfWeek: dayOfWeek.value,
      startTime: startTime.value,
      endTime: endTime.value,
      requiredEmployees: requiredEmployees.value,
      assignedEmployees: assignedEmployees.value,
    });
  } else {
    const shiftsForDay = scheduleStore.schedules.filter(
      (shift) => shift.branchId === props.branchId && shift.dayOfWeek === dayOfWeek.value
    );
    const order = shiftsForDay.length;

    scheduleStore.createBranchShift({
      name: shiftName.value,
      dayOfWeek: dayOfWeek.value,
      startTime: startTime.value,
      endTime: endTime.value,
      requiredEmployees: requiredEmployees.value,
      assignedEmployees: assignedEmployees.value,
      branchId: props.branchId!,
      shiftId: shiftId.value!,
      order,
    });
  }
  emit('close');
};

const deleteSchedule = () => {
  if (props.schedule) {
    confirm.require({
      message: 'Are you sure you want to delete this branch shift?',
      header: 'Confirmation',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        scheduleStore.deleteBranchShift(props.schedule!.id);
        toast.add({
          severity: 'success',
          summary: 'Deleted',
          detail: 'Branch shift deleted',
          life: 3000
        });
        emit('close');
      }
    });
  }
};

const handleClose = () => {
  emit('close');
};

const getEmployee = (employeeId: string) => {
  return employeeStore.employees.find(e => e.id === employeeId);
};
</script>

<template>
  <Dialog :header="header" :style="{ width: '40rem' }" :visible="props.visible" modal
          @update:visible="handleClose">
    <form id="branch-shift-form" class="mb-4" @submit.prevent="saveSchedule">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
        <!-- Shift Details -->
        <div class="flex flex-col gap-6">
          <div v-if="!props.schedule" class="flex flex-col gap-2">
            <label for="shift">{{ t('shift_templates') }}</label>
            <Select id="shift" v-model="shiftId" :options="availableShifts" :placeholder="t('select_a_shift')"
                    optionLabel="name"
                    optionValue="id" @change="onShiftSelect"/>
          </div>

          <div class="flex flex-col gap-2">
            <label for="shiftName">{{ t('shift_name') }}</label>
            <InputText id="shiftName" v-model="shiftName" :disabled="!props.schedule" required/>
          </div>
          <div class="flex flex-col gap-2">
            <label for="dayOfWeek">{{ t('day_of_week') }}</label>
            <Select id="dayOfWeek" v-model="dayOfWeek" :options="days" :placeholder="t('select_a_day')"
                    optionLabel="name" optionValue="code"
                    required/>
          </div>
          <div class="flex flex-col gap-2">
            <label for="startTime">{{ t('start_time') }}</label>
            <InputMask id="startTime" v-model="startTime" :disabled="!props.schedule"
                       mask="99:99"
                       required/>
          </div>
          <div class="flex flex-col gap-2">
            <label for="endTime">{{ t('end_time') }}</label>
            <InputMask id="endTime" v-model="endTime" :disabled="!props.schedule" mask="99:99"
                       required/>
          </div>
          <div class="flex flex-col gap-2">
            <label for="requiredEmployees">{{ t('required_employees') }}</label>
            <InputNumber id="requiredEmployees" v-model="requiredEmployees"
                         :disabled="!props.schedule" :min="1"
                         required/>
          </div>
        </div>

        <!-- Employee Assignment -->
        <div class="flex flex-col gap-4">
          <div>
            <h3 class="font-bold mb-2">{{ t('assign_employee') }}</h3>
            <div class="flex items-center gap-2">
              <Select v-model="employeeToAssign" :options="getAvailableEmployees"
                      :placeholder="t('select_an_employee')" class="w-full"
                      optionLabel="name" optionValue="id"/>
              <Button :disabled="!employeeToAssign" icon="pi pi-plus" rounded severity="success"
                      size="small"
                      @click="handleAssignEmployee"/>
            </div>
          </div>
          <div class="flex-grow">
            <h3 class="font-bold mb-2">{{ t('assigned_employees') }} ({{
                assignedEmployees.length
              }})</h3>
            <div
              class="flex flex-col gap-2 p-2 rounded min-h-48 max-h-75 overflow-y-auto bg-surface-100">
              <div v-for="employeeId in assignedEmployees" :key="String(employeeId)"
                   class="flex items-center justify-between rounded p-1 bg-surface-0 shadow-sm">
                <div class="flex items-center gap-2">
                  <Avatar :label="getEmployee(employeeId)?.name?.charAt(0)" shape="circle"
                          size="normal"/>
                  <span class="text-sm">{{ getEmployee(employeeId)?.name }}</span>
                </div>
                <Button icon="pi pi-times" rounded severity="danger" size="small" text
                        @click="unassignEmployee(employeeId)"/>
              </div>
              <div v-if="assignedEmployees.length === 0"
                   class="text-center text-surface-500 dark:text-surface-400 mt-4">
                {{ t('no_employees_assigned') }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </form>
    <div class="flex justify-between">
      <Button v-if="props.schedule" :label="t('delete')" severity="danger" type="button"
              variant="outlined"
              @click="deleteSchedule"/>
      <div class="flex gap-2">
        <Button :label="t('cancel')" severity="secondary" type="button" @click="handleClose"/>
        <Button :label="t('save')" form="branch-shift-form" type="submit"/>
      </div>
    </div>
  </Dialog>
</template>

<style scoped>

</style>
