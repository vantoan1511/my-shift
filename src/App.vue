<script lang="ts" setup>
import {usePrimeVue} from "primevue";
import {ref} from "vue";
import {useRouter} from "vue-router";

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

const importData = () => {
}

const exportData = () => {
}

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
