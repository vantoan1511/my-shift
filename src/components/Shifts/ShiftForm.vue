<script lang="ts" setup>
import {PrimeIcons} from "@primevue/core/api";
import type {Shift} from "@/models";
import {useShiftStore} from "@/stores/Shifts/shift.ts";
import {ref, watchEffect} from "vue";
import {useScheduleStore} from "@/stores/schedule.ts";
import {format, parse} from "date-fns";
import {useI18n} from "vue-i18n";

const {t} = useI18n();
const props = defineProps<{ shift: Shift | null, visible: boolean }>();
const emit = defineEmits(['close']);

const shiftStore = useShiftStore();
const branchShiftStore = useScheduleStore();

const shiftName = ref('');
const dayOfWeek = ref('');
const startTime = ref<Date | null>(null);
const endTime = ref<Date | null>(null);
const requiredEmployees = ref(1);

const days = ref([
  {name: t('monday'), code: 'Monday'},
  {name: t('tuesday'), code: 'Tuesday'},
  {name: t('wednesday'), code: 'Wednesday'},
  {name: t('thursday'), code: 'Thursday'},
  {name: t('friday'), code: 'Friday'},
  {name: t('saturday'), code: 'Saturday'},
  {name: t('sunday'), code: 'Sunday'}
]);

watchEffect(() => {
  if (props.shift) {
    shiftName.value = props.shift.name;
    dayOfWeek.value = props.shift.dayOfWeek;
    startTime.value = parse(props.shift.startTime, 'HH:mm', new Date());
    endTime.value = parse(props.shift.endTime, 'HH:mm', new Date());
    requiredEmployees.value = props.shift.requiredEmployees;
  } else {
    shiftName.value = '';
    dayOfWeek.value = '';
    startTime.value = null;
    endTime.value = null;
    requiredEmployees.value = 1;
  }
});

const saveShift = () => {
  if (!startTime.value || !endTime.value) {
    // Or handle this error more gracefully
    return;
  }
  const formattedStartTime = format(startTime.value, 'HH:mm');
  const formattedEndTime = format(endTime.value, 'HH:mm');

  if (props.shift) {
    shiftStore.updateShift({
      ...props.shift,
      name: shiftName.value,
      dayOfWeek: dayOfWeek.value,
      startTime: formattedStartTime,
      endTime: formattedEndTime,
      requiredEmployees: requiredEmployees.value,
    });
  } else {
    shiftStore.addShift({
      name: shiftName.value,
      dayOfWeek: dayOfWeek.value,
      startTime: formattedStartTime,
      endTime: formattedEndTime,
      requiredEmployees: requiredEmployees.value,
    });
  }
  emit('close');
};

const deleteShift = () => {
  if (props.shift) {
    shiftStore.deleteShift(props.shift.id);
    branchShiftStore.deleteBranchShiftsByShiftId(props.shift.id);
    emit('close');
  }
};

const handleClose = () => {
  emit('close');
}
</script>

<template>
  <Dialog :header="shift ? t('edit_shift') : t('add_shift')" :style="{ width: '30rem' }"
          :visible="props.visible"
          modal
          @update:visible="handleClose">
    <form id="shift-form" @submit.prevent="saveShift">
      <div class="flex flex-col gap-6 mt-4">
        <div class="flex flex-col gap-2">
          <label for="shiftName">{{ t('shift_name') }}</label>
          <InputText id="shiftName" v-model="shiftName" class="w-full" required/>
        </div>
        <div class="flex flex-col gap-2">
          <label for="dayOfWeek">{{ t('day_of_week') }}</label>
          <Select id="dayOfWeek" v-model="dayOfWeek" :highlight-on-select="false" :options="days"
                  checkmark class="w-full" option-label="name" option-value="code"
                  placeholder="Select a day" required/>
        </div>
        <div class="flex flex-col gap-2">
          <label for="startTime">{{ t('start_time') }}</label>
          <DatePicker id="startTime" v-model="startTime" hour-format="12" required showIcon
                      timeOnly/>
        </div>
        <div class="flex flex-col gap-2">
          <label for="endTime">{{ t('end_time') }}</label>
          <DatePicker id="endTime" v-model="endTime" hour-format="12" required showIcon timeOnly/>
        </div>
        <div class="flex flex-col gap-2">
          <label for="requiredEmployees">{{ t('required_employees') }}</label>
          <InputNumber id="requiredEmployees" v-model="requiredEmployees" :min="1" required/>
        </div>
      </div>
    </form>
    <template #footer>
      <Button v-if="props.shift" :icon="PrimeIcons.TRASH" :label="t('delete')" severity="danger"
              type="button"
              variant="text"
              @click="deleteShift"/>
      <Button :icon="PrimeIcons.TIMES" :label="t('cancel')" severity="secondary" type="button"
              @click="handleClose"/>
      <Button :icon="PrimeIcons.CHECK" :label="t('save')" form="shift-form" type="submit"/>
    </template>
  </Dialog>
</template>

<style scoped>

</style>
