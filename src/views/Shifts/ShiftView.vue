<script lang="ts" setup>
import {computed, onMounted, ref} from "vue";
import type {Shift} from "@/models";
import {useShiftStore} from "@/stores/Shifts/shift.ts";
import {useBranchStore} from "@/stores/Branches/branch.ts";
import {useScheduleStore} from "@/stores/schedule.ts";
import ShiftForm from "@/components/Shifts/ShiftForm.vue";
import type {SortableEvent} from "vue-draggable-next";
import {VueDraggableNext} from 'vue-draggable-next';
import {useI18n} from "vue-i18n";
import {PrimeIcons} from "@primevue/core/api";

const {t} = useI18n();
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
  for (const day in shifts) {
    shifts[day].sort((a, b) => a.order - b.order);
  }
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
  const newDay = (event.to as HTMLElement).dataset.day;
  const oldDay = (event.from as HTMLElement).dataset.day;
  const shiftId = (event.item as HTMLElement).dataset.id;

  if (toDay && shiftId && newDay && oldDay && newDay !== oldDay) {
    const shift = shiftStore.shifts.find(s => s.id === shiftId);
    if (shift) {
      const updatedShift = {...shift, dayOfWeek: newDay, order: shiftsByDay.value[newDay].length};
      shiftStore.updateShift(updatedShift);
    }
  }
};

const onShiftOrderChange = (event: {
  moved?: { element: Shift, newIndex: number, oldIndex: number }
}, day: string) => {
  if (event.moved) {
    const shifts = shiftsByDay.value[day];
    shifts.forEach((shift, index) => {
      if (shift.order !== index) {
        const updatedShift = {...shift, order: index};
        shiftStore.updateShift(updatedShift);
      }
    })
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
          <h1 class="text-2xl">{{ t('shift_templates') }}</h1>
          <div class="flex gap-2">
            <Button :label="t('apply_to_branch')" icon="pi pi-check"
                    severity="success"
                    @click="showApplyToBranchModal = true"/>
            <Button :label="t('add_shift')" icon="pi pi-plus" @click="openShiftForm(null)"/>
          </div>
        </div>
      </template>
      <template #content>
        <div class="grid grid-cols-1 md:grid-cols-7 gap-4">
          <div v-for="(shifts, day) in shiftsByDay" :key="day"
               class="p-4 bg-surface-100 rounded-lg">
            <h2 class="text-lg font-bold mb-2 text-center text-primary">
              {{ t(String(day).toLowerCase()) }}
            </h2>
            <VueDraggableNext :animation="150" :data-day="day" :group="{ name: 'shifts' }"
                              :list="shifts"
                              class="min-h-[100px] flex flex-col gap-2"
                              ghost-class="ghost"
                              @change="(event) => onShiftOrderChange(event, String(day))"
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
                    <div>{{ t('required_employees') }}: {{ shift.requiredEmployees }}</div>
                  </div>
                </template>
              </Card>
            </VueDraggableNext>
          </div>
        </div>
      </template>
    </Card>

    <ShiftForm :shift="selectedShift" :visible="showForm" @close="onFormClose"/>

    <Dialog :header="t('apply_to_branch')" :style="{ width: '25rem' }"
            :visible="showApplyToBranchModal" modal
            pt:mask:class="backdrop-blur-sm"
            @update:visible="showApplyToBranchModal = false">
      <div class="flex items-center gap-2 mb-8">
        <label for="branch">{{ t('branch') }}</label>
        <Select v-model="selectedBranchToApply" :options="branchStore.branches"
                :placeholder="t('select_a_branch')" class="w-full" optionLabel="name"
                optionValue="id"/>
      </div>
      <div class="flex justify-end gap-2">
        <Button :icon="PrimeIcons.TIMES" :label="t('cancel')" severity="secondary"
                @click="showApplyToBranchModal = false"/>
        <Button :icon="PrimeIcons.CHECK" :label="t('apply')" autofocus @click="applyToBranch"/>
      </div>
    </Dialog>
  </div>
</template>

<style scoped>
</style>
