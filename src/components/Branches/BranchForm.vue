<script lang="ts" setup>
import type {Branch} from "@/models";
import {ref, watchEffect} from "vue";
import {useBranchStore} from "@/stores/Branches/branch.ts";
import {useI18n} from "vue-i18n";

const { t } = useI18n();
const props = defineProps<{ branch: Branch | null, visible: boolean }>();
const emit = defineEmits(['close']);

const branchStore = useBranchStore();
const branchName = ref('');

watchEffect(() => {
  if (props.branch) {
    branchName.value = props.branch.name;
  } else {
    branchName.value = '';
  }
});

const saveBranch = () => {
  if (props.branch) {
    branchStore.updateBranch({...props.branch, name: branchName.value});
  } else {
    branchStore.addBranch({name: branchName.value});
  }
  emit('close');
};

const handleClose = () => {
  emit('close');
};
</script>

<template>
  <Dialog :header="branch ? t('edit_branch') : t('add_branch')" :style="{ width: '30rem' }"
          :visible="props.visible"
          modal
          @update:visible="handleClose">
    <form id="branch-form" @submit.prevent="saveBranch">
      <div class="flex flex-col gap-2 mt-4">
        <label for="branchName">{{ t('branch_name') }}</label>
        <InputText id="branchName" v-model="branchName" class="w-full" required/>
      </div>
    </form>
    <template #footer>
      <Button :label="t('cancel')" severity="secondary" type="button" @click="handleClose"/>
      <Button form="branch-form" :label="t('save')" type="submit"/>
    </template>
  </Dialog>
</template>

<style scoped>

</style>
