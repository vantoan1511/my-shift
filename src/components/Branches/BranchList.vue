<script lang="ts" setup>
import {useBranchStore} from "@/stores/Branches/branch.ts";
import {onMounted, ref} from "vue";
import type {Branch} from "@/models";
import BranchForm from "@/components/Branches/BranchForm.vue";

const branchStore = useBranchStore();
const showForm = ref(false);
const selectedBranch = ref<Branch | null>(null);

const openForm = (branch: Branch | null) => {
  selectedBranch.value = branch;
  showForm.value = true;
};

const deleteBranch = (branchId: string) => {
  branchStore.deleteBranch(branchId);
};

const onFormClose = () => {
  showForm.value = false;
  selectedBranch.value = null;
};

onMounted(() => {
  branchStore.fetchBranches();
});
</script>

<template>
  <Card>
    <template #title>
      <div class="flex justify-between items-center">
        <h2 class="text-2xl">Branches</h2>
        <Button icon="pi pi-plus" label="Add Branch" @click="openForm(null)"/>
      </div>
    </template>
    <template #content>
      <DataTable :paginator="true" :rows="10" :value="branchStore.branches"
                 responsiveLayout="scroll">
        <Column :sortable="true" field="name" header="Name"></Column>
        <Column header="Actions" style="width: 10rem">
          <template #body="slotProps">
            <div class="flex gap-2">
              <Button class="p-button-rounded p-button-success" icon="pi pi-pencil"
                      @click="openForm(slotProps.data)"/>
              <Button class="p-button-rounded p-button-danger" icon="pi pi-trash"
                      @click="deleteBranch(slotProps.data.id)"/>
            </div>
          </template>
        </Column>
        <template #empty>
          No branches found.
        </template>
      </DataTable>
    </template>
  </Card>
  <BranchForm :branch="selectedBranch" :visible="showForm" @close="onFormClose"/>
</template>

<style scoped>

</style>
