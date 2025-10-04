<script lang="ts" setup>
import {usePrimeVue} from "primevue";
import {ref} from "vue";
import {useRouter} from "vue-router";
import {useBranchStore} from "@/stores/Branches/branch.ts";
import {useEmployeeStore} from "@/stores/Employees/employee.ts";
import {useShiftStore} from "@/stores/Shifts/shift.ts";
import LanguageSwitcher from "@/components/LanguageSwitcher.vue";
import {useI18n} from "vue-i18n";
import {useScheduleStore} from "@/stores/schedule.ts";

const {t} = useI18n();
const PrimeVue = usePrimeVue();
const loading = ref(false);
const router = useRouter();

PrimeVue.config.ripple = true;

router.beforeEach(() => {
  loading.value = true;
});

router.afterEach(() => {
  loading.value = false;
});

const branchStore = useBranchStore();
const employeeStore = useEmployeeStore();
const shiftStore = useShiftStore();
const scheduleStore = useScheduleStore();

const exportData = () => {
  const data = {
    branches: branchStore.branches,
    employees: employeeStore.employees,
    shifts: shiftStore.shifts,
    schedules: scheduleStore.schedules
  };
  const dataStr = JSON.stringify(data, null, 2);
  const blob = new Blob([dataStr], {type: 'application/json'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'shift-manager-data.json';
  a.click();
  URL.revokeObjectURL(url);
};

const importData = () => {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'application/json';
  input.onchange = (e) => {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const data = JSON.parse(e.target?.result as string);
        if (data.branches) {
          branchStore.branches = data.branches;
          localStorage.setItem('branches', JSON.stringify(data.branches));
        }
        if (data.employees) {
          employeeStore.employees = data.employees;
          localStorage.setItem('employees', JSON.stringify(data.employees));
        }
        if (data.shifts) {
          shiftStore.shifts = data.shifts;
          localStorage.setItem('shifts', JSON.stringify(data.shifts));
        }
        if (data.schedules) {
          scheduleStore.schedules = data.schedules;
          localStorage.setItem('schedules', JSON.stringify(data.schedules));
        }
      };
      reader.readAsText(file);
    }
  };
  input.click();
};

const items = ref([
  {
    label: 'branches',
    icon: 'pi pi-building',
    route: '/branches'
  },
  {
    label: 'employees',
    icon: 'pi pi-users',
    route: '/employees'
  },
  {
    label: 'shift_templates',
    icon: 'pi pi-calendar',
    route: '/shifts'
  },
  {
    label: 'schedule',
    icon: 'pi pi-calendar-plus',
    route: '/schedule'
  }
]);
</script>

<template>
  <div class="card">
    <Menubar :model="items">
      <template #start>
        <router-link to="/">
          <span class="text-lg font-bold mr-4">My Shift</span>
        </router-link>
      </template>
      <template #item="{item, props}">
        <router-link v-slot="{href, navigate}" :to="item.route" custom>
          <a v-ripple :href="href" v-bind="props.action" @click="navigate">
            <span :class="item.icon"/>
            <span>{{ t(item.label as string) }}</span>
          </a>
        </router-link>
      </template>
      <template #end>
        <div class="flex items-center gap-2">
          <Button :label="t('import')" icon="pi pi-download" text @click="importData"/>
          <Button :label="t('export')" icon="pi pi-upload" text @click="exportData"/>
          <LanguageSwitcher/>
        </div>
      </template>
    </Menubar>
    <ProgressBar v-if="loading" mode="indeterminate" style="height: .25em"/>
    <main class="p-4">
      <RouterView class=" animate-ease-in-out animate-fadeinleft animate-duration-500"/>
    </main>
    <Toast/>
    <ConfirmDialog/>
  </div>
</template>

<style scoped>
</style>
