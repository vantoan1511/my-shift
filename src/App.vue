<script lang="ts" setup>
import {usePrimeVue} from "primevue";
import {ref} from "vue";
import {useRouter} from "vue-router";
import {useBranchStore} from "@/stores/Branches/branch.ts";
import {useEmployeeStore} from "@/stores/Employees/employee.ts";
import {useShiftStore} from "@/stores/Shifts/shift.ts";
import LanguageSwitcher from "@/components/LanguageSwitcher.vue";

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

const exportData = () => {
  const data = {
    branches: branchStore.branches,
    employees: employeeStore.employees,
    shifts: shiftStore.shifts,
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
      };
      reader.readAsText(file);
    }
  };
  input.click();
};

const items = ref([
  {
    label: 'Branches',
    icon: 'pi pi-building',
    route: '/branches'
  },
  {
    label: 'Employees',
    icon: 'pi pi-users',
    route: '/employees'
  },
  {
    label: 'Shift Templates',
    icon: 'pi pi-calendar',
    route: '/shifts'
  },
  {
    label: 'Branch Shifts',
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
            <span>{{ item.label }}</span>
          </a>
        </router-link>
      </template>
      <template #end>
        <div class="flex items-center gap-2">
          <Button icon="pi pi-upload" label="Import" text @click="importData"/>
          <Button icon="pi pi-download" label="Export" text @click="exportData"/>
          <LanguageSwitcher />
        </div>
      </template>
    </Menubar>
    <ProgressBar v-if="loading" mode="indeterminate" style="height: .25em"/>
    <main class="p-4">
      <RouterView/>
    </main>
    <Toast/>
    <ConfirmDialog/>
  </div>
</template>

<style scoped>
</style>
