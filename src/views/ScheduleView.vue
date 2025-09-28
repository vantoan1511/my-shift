<script lang="ts" setup>
import {computed, onMounted, ref, watch} from "vue";
import {useBranchStore} from "@/stores/Branches/branch.ts";
import {useScheduleStore} from "@/stores/schedule.ts";
import {useEmployeeStore} from "@/stores/Employees/employee.ts";
import type {Schedule} from "@/models";
import {VueDraggableNext} from "vue-draggable-next";
import {generateRecommendations} from "@/services/recommendationService.ts";
import {exportBranchShiftsToExcel} from "@/services/exportService.ts";
import ScheduleForm from "@/components/ScheduleForm.vue";
import {useI18n} from "vue-i18n";

const {t} = useI18n();
const branchStore = useBranchStore();
const branchShiftStore = useScheduleStore();
const employeeStore = useEmployeeStore();

const selectedBranchId = ref<string | null>(localStorage.getItem('selectedBranchId') || null);

watch(selectedBranchId, (newValue) => {
  if (newValue) {
    localStorage.setItem('selectedBranchId', newValue);
  } else {
    localStorage.removeItem('selectedBranchId');
  }
});

const showEditBranchShiftModal = ref(false);
const selectedBranchShiftToEdit = ref<Schedule | null>(null);
const showNewBranchShiftModal = ref(false);
const showRecommendationDialog = ref(false);
const recommendedShifts = ref<Schedule[]>([]);

const openNewBranchShiftModal = () => {
  showNewBranchShiftModal.value = true;
};

const onNewBranchShiftModalClose = () => {
  showNewBranchShiftModal.value = false;
};

const shiftsByDay = computed(() => {
  const shifts: { [key: string]: Schedule[] } = {
    Monday: [], Tuesday: [], Wednesday: [], Thursday: [], Friday: [], Saturday: [], Sunday: [],
  };
  const filteredShifts = selectedBranchId.value
    ? branchShiftStore.schedules.filter(shift => shift.branchId === selectedBranchId.value)
    : [];
  filteredShifts.forEach(shift => {
    if (shifts[shift.dayOfWeek]) {
      shifts[shift.dayOfWeek].push(shift);
    }
  });

  for (const day in shifts) {
    shifts[day].sort((a, b) => a.order - b.order);
  }

  return shifts;
});

const recommendedShiftsByBranchAndDay = computed(() => {
  const grouped: { [branchId: string]: { [day: string]: Schedule[] } } = {};
  branchStore.branches.forEach(branch => {
    grouped[branch.id] = {
      Monday: [], Tuesday: [], Wednesday: [], Thursday: [], Friday: [], Saturday: [], Sunday: [],
    };
  });

  recommendedShifts.value.forEach(shift => {
    if (grouped[shift.branchId] && grouped[shift.branchId][shift.dayOfWeek]) {
      grouped[shift.branchId][shift.dayOfWeek].push(shift);
    }
  });

  for (const branchId in grouped) {
    for (const day in grouped[branchId]) {
      grouped[branchId][day].sort((a, b) => a.order - b.order);
    }
  }
  return grouped;
});

const openEditBranchShiftModal = (branchShift: Schedule) => {
  selectedBranchShiftToEdit.value = branchShift;
  showEditBranchShiftModal.value = true;
};

const onEditBranchShiftModalClose = () => {
  showEditBranchShiftModal.value = false;
  selectedBranchShiftToEdit.value = null;
};

const getEmployee = (employeeId: string) => {
  return employeeStore.employees.find(e => e.id === employeeId);
};

const getEmployeeInitials = (employeeId: string) => {
  const employee = getEmployee(employeeId);
  const nameParts = employee ? employee.name.split(' ') : [];
  return nameParts.map(part => part.charAt(0).toUpperCase())[nameParts.length - 1]
};

const onShiftDragEnd = (event: { to: Element; from: Element; item: HTMLElement; }) => {
  const shiftId = event.item.dataset.shiftId;
  const newDay = (event.to as HTMLElement).dataset.day;
  const oldDay = (event.from as HTMLElement).dataset.day;

  if (shiftId && newDay && oldDay && newDay !== oldDay) {
    const shift = branchShiftStore.schedules.find(s => s.id === shiftId);
    if (shift) {
      const updatedShift = {...shift, dayOfWeek: newDay, order: shiftsByDay.value[newDay].length};
      branchShiftStore.updateSchedule(updatedShift);
    }
  }
};

const onShiftOrderChange = (event: {
  moved: { element: Schedule, newIndex: number }
}, day: string) => {
  if (event.moved) {
    const shifts = shiftsByDay.value[day];
    shifts.forEach((shift, index) => {
      if (shift.order !== index) {
        const updatedShift = {...shift, order: index};
        branchShiftStore.updateSchedule(updatedShift);
      }
    });
  }
};

const exportShifts = () => {
  exportBranchShiftsToExcel(branchStore.branches, branchShiftStore.schedules, employeeStore.employees);
};

const openRecommendationDialog = () => {
  recommendedShifts.value = generateRecommendations(branchShiftStore.schedules, employeeStore.employees);
  showRecommendationDialog.value = true;
};

const closeRecommendationDialog = () => {
  showRecommendationDialog.value = false;
  recommendedShifts.value = [];
};

const acceptRecommendation = () => {
  recommendedShifts.value.forEach(shift => {
    branchShiftStore.updateSchedule(shift);
  });
  closeRecommendationDialog();
};

onMounted(() => {
  branchStore.fetchBranches();
  branchShiftStore.fetchSchedules();
  employeeStore.fetchEmployees();
});
</script>


<template>
  <div>
    <Card class="mb-4">
      <template #title>
        <div class="flex justify-between items-center">
          <h1 class="text-2xl">{{ t('schedule') }}</h1>
          <div class="flex items-center gap-2">
            <Button @click="openNewBranchShiftModal">{{ t('new_shift') }}</Button>
            <Button severity="secondary" @click="exportShifts">{{ t('export_to_excel') }}</Button>
            <Button severity="contrast" @click="openRecommendationDialog">{{
                t('recommendation')
              }}
            </Button>
            <Select v-model="selectedBranchId" :options="branchStore.branches"
                    :placeholder="t('select_a_branch')"
                    class="w-full md:w-auto"
                    optionLabel="name" optionValue="id"/>
          </div>
        </div>
      </template>
    </Card>

    <div v-if="!selectedBranchId"
         class="text-center p-4 border rounded-lg bg-surface-100">
      <p>{{ t('please_select_a_branch') }}</p>
    </div>
    <div v-else class="grid grid-cols-1 md:grid-cols-7 gap-4 bg-surface-100 rounded-lg">
      <div v-for="(shifts, day) in shiftsByDay" :key="day"
           class="p-4 border-surface-200 rounded-lg">
        <h2 class="text-lg font-bold mb-2 text-center text-primary">
          {{ t(String(day).toLowerCase()) }}
        </h2>
        <VueDraggableNext :animation="150" :data-day="day" :group="{ name: 'shifts' }"
                          :list="shifts"
                          class="flex flex-col gap-2 min-h-[50px]"
                          ghost-class="ghost"
                          @change="(event) => onShiftOrderChange(event, String(day))"
                          @end="onShiftDragEnd">
          <div v-for="shift in shifts" :key="shift.id" :data-shift-id="shift.id">
            <Card class="cursor-grab" @click="openEditBranchShiftModal(shift)">
              <template #title>
                <div class="flex justify-between items-center text-base">
                  <span>{{ shift.name }}</span>
                </div>
              </template>
              <template #subtitle>
                <div class="flex items-center gap-2">
                  <span>{{ shift.startTime }} - {{ shift.endTime }}</span><i
                  class="pi pi-clock"></i>
                </div>
              </template>
              <template #content>
                <div class="flex flex-col gap-2">
                  <Tag
                    :severity="shift.assignedEmployees.length >= shift.requiredEmployees ? 'success' : 'warn'">
                    {{ shift.assignedEmployees.length }} / {{ shift.requiredEmployees }}
                    {{ t('assigned') }}
                  </Tag>
                  <div v-if="shift.assignedEmployees.length > 0" class="mt-2">
                    <AvatarGroup>
                      <Avatar v-for="employeeId in shift.assignedEmployees" :key="employeeId"
                              :label="getEmployeeInitials(employeeId)" shape="circle"
                              size="normal"/>
                    </AvatarGroup>
                  </div>
                </div>
              </template>
            </Card>
          </div>
        </VueDraggableNext>
        <div v-if="shifts.length === 0"
             class="text-center text-sm text-surface-500 mt-4">
          {{ t('no_shifts') }}
        </div>
      </div>
    </div>

    <ScheduleForm :branch-id="selectedBranchId" :visible="showNewBranchShiftModal"
                  @close="onNewBranchShiftModalClose"/>
    <ScheduleForm :schedule="selectedBranchShiftToEdit" :visible="showEditBranchShiftModal"
                  @close="onEditBranchShiftModalClose"/>

    <Dialog :visible="showRecommendationDialog" header="Shift Assignment Recommendation" modal
            style="width: 80vw"
            @update:visible="closeRecommendationDialog">
      <TabView>
        <TabPanel v-for="branch in branchStore.branches" :key="branch.id" :header="branch.name"
                  :value="branch.id">
          <div class="grid grid-cols-1 md:grid-cols-7 gap-4 bg-surface-100 rounded-lg p-4">
            <div v-for="(shifts, day) in recommendedShiftsByBranchAndDay[branch.id]" :key="day"
                 class="p-4 border-surface-200 rounded-lg">
              <h2 class="text-lg font-bold mb-2 text-center">{{ t(String(day).toLowerCase()) }}</h2>
              <div class="flex flex-col gap-2 min-h-[50px]">
                <div v-for="shift in shifts" :key="shift.id">
                  <Card>
                    <template #title>
                      <div class="flex justify-between items-center text-base">
                        <span>{{ shift.name }}</span>
                      </div>
                    </template>
                    <template #subtitle>
                      <div class="flex items-center gap-2">
                        <span>{{ shift.startTime }} - {{ shift.endTime }}</span>
                        <i class="pi pi-clock"></i>
                      </div>
                    </template>
                    <template #content>
                      <div class="flex flex-col gap-2">
                        <Tag
                          :severity="shift.assignedEmployees.length >= shift.requiredEmployees ? 'success' : 'warn'">
                          {{ shift.assignedEmployees.length }} / {{ shift.requiredEmployees }}
                          Assigned
                        </Tag>
                        <div v-if="shift.assignedEmployees.length > 0" class="mt-2">
                          <AvatarGroup>
                            <Avatar v-for="employeeId in shift.assignedEmployees" :key="employeeId"
                                    :label="getEmployeeInitials(employeeId)" shape="circle"
                                    size="normal"/>
                          </AvatarGroup>
                        </div>
                      </div>
                    </template>
                  </Card>
                </div>
              </div>
              <div v-if="shifts.length === 0"
                   class="text-center text-sm text-surface-500 mt-4">
                {{ t('no_shifts') }}
              </div>
            </div>
          </div>
        </TabPanel>
      </TabView>
      <template #footer>
        <Button :label="t('cancel')" severity="secondary" @click="closeRecommendationDialog"/>
        <Button label="Accept" @click="acceptRecommendation"/>
      </template>
    </Dialog>
  </div>
</template>

<style scoped>
.ghost {
  opacity: 0.5;
}
</style>
