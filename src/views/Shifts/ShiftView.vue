<script lang="ts" setup>
import {computed, onMounted, ref} from "vue";
import type {Shift} from "@/models";
import {useShiftStore} from "@/stores/Shifts/shift.ts";
import {useBranchStore} from "@/stores/Branches/branch.ts";
import {useScheduleStore} from "@/stores/schedule.ts";
import ShiftForm from "@/components/Shifts/ShiftForm.vue";
import type {SortableEvent} from "vue-draggable-next";
import {VueDraggableNext} from 'vue-draggable-next';

const shiftStore = useShiftStore();
const branchStore = useBranchStore();
const scheduleStore = useScheduleStore();
const showForm = ref(false);
const selectedShift = ref<Shift | null>(null);
const showApplyToBranchModal = ref(false);
const selectedBranchToApply = ref<string | null>(null);

const shiftsByDay = computed(() => {
  const shifts: { [key: string]: Shift[] } = {
    Monday: [], Tuesday: [], Wednesday: [], Thursday: [], Friday: [], Saturday: [], Sunday: [],
  };
  shiftStore.shifts.forEach(shift => {
    if (shifts[shift.dayOfWeek]) {
      shifts[shift.dayOfWeek].push(shift);
    }
  });
  return shifts;
});

const openShiftForm = (shift: Shift | null) => {
  selectedShift.value = shift;
  showForm.value = true;
};

const onFormClose = () => {
  showForm.value = false;
  selectedShift.value = null;
};

const onDrop = (event: SortableEvent) => {
  const toDay = event.to.parentElement?.querySelector('h2')?.textContent;
  const shiftId = (event.item as HTMLElement).dataset.id;

  if (toDay && shiftId) {
    const shift = shiftStore.shifts.find(s => s.id === shiftId);
    if (shift && shift.dayOfWeek !== toDay) {
      shiftStore.updateShift({...shift, dayOfWeek: toDay});
    }
  }
};

const applyToBranch = () => {
  if (selectedBranchToApply.value) {
    scheduleStore.applyTemplateToBranch(selectedBranchToApply.value, shiftStore.shifts);
    showApplyToBranchModal.value = false;
  }
};

onMounted(() => {
  shiftStore.fetchShifts();
  branchStore.fetchBranches();
});
</script>

<template>
  <div>
    <Card>
      <template #title>
        <div class="flex justify-between items-center">
          <h1 class="text-2xl">Shift Templates</h1>
          <div class="flex gap-2">
            <Button icon="pi pi-check" label="Apply to Branch"
                    severity="success"
                    @click="showApplyToBranchModal = true"/>
            <Button icon="pi pi-plus" label="Add Shift" @click="openShiftForm(null)"/>
          </div>
        </div>
      </template>
      <template #content>
        <div class="grid grid-cols-1 md:grid-cols-7 gap-4">
          <div v-for="(shifts, day) in shiftsByDay" :key="day"
               class="p-4 bg-surface-100 rounded-lg">
            <h2 class="text-lg font-bold mb-2 text-center text-primary">{{ day }}</h2>
            <VueDraggableNext :list="shifts" class="min-h-[100px] flex flex-col gap-2"
                              group="shifts"
                              @end="onDrop">
              <Card v-for="shift in shifts" :key="shift.id" :data-id="shift.id"
                    class="cursor-pointer"
                    @click="openShiftForm(shift)">
                <template #title>
                  <div class="flex justify-between items-center text-base">
                    <span>{{ shift.name }}</span>
                  </div>
                </template>
                <template #content>
                  <div class="text-sm">
                    <div>{{ shift.startTime }} - {{ shift.endTime }}</div>
                    <div>Required: {{ shift.requiredEmployees }}</div>
                  </div>
                </template>
              </Card>
            </VueDraggableNext>
          </div>
        </div>
      </template>
    </Card>

    <ShiftForm :shift="selectedShift" :visible="showForm" @close="onFormClose"/>

    <Dialog :style="{ width: '25rem' }" :visible="showApplyToBranchModal" header="Apply to Branch"
            modal pt:mask:class="backdrop-blur-sm">
      <div class="flex items-center gap-2 mb-8">
        <label for="branch">Branch</label>
        <Select v-model="selectedBranchToApply" :options="branchStore.branches"
                class="w-full" optionLabel="name" optionValue="id"
                placeholder="Select a branch"/>
      </div>
      <div class="flex justify-end gap-2">
        <Button label="Cancel" severity="secondary" @click="showApplyToBranchModal = false"/>
        <Button label="Apply" @click="applyToBranch"/>
      </div>
    </Dialog>
  </div>
</template>

<style scoped>

</style>
